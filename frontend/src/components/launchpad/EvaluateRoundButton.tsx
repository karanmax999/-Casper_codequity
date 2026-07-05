"use client";

import { useState, useTransition } from "react";
import { RadioTower } from "lucide-react";
import { getEvaluatePayload, evaluateRound } from "@/actions";
import {
  CASPER_CHAIN_NAME,
  CASPER_RPC_URL,
  formatCasperRpcError,
  getAcceptedDeployHash,
  getConnectedCasperPublicKey,
  getDeployFailureMessage,
  hexToBytes,
  isValidCasperContractHash,
  shortHash,
  signDeployWithCasperWallet,
} from "@/lib/casper-wallet";

export function EvaluateRoundButton({ roundId }: { roundId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleEvaluate = async () => {
    setMessage(null);
    startTransition(async () => {
      try {
        // 1. Get the payload (dry_run)
        const payloadRes = await getEvaluatePayload(roundId);
        if (!payloadRes.ok) {
          setMessage(payloadRes.error);
          return;
        }

        const data = payloadRes.data;
        if (!data.contract_uref || data.milestone_index === null) {
          setMessage(data.message || "No milestone is ready for release yet.");
          return;
        }

        if (!isValidCasperContractHash(data.contract_uref)) {
          setMessage("This round does not have a valid Casper escrow contract hash. Configure ESCROW_CONTRACT_UREF with a deployed testnet contract before releasing funds.");
          return;
        }

        // 2. Request Casper Wallet Signature
        const casperSDK = require("casper-js-sdk");
        const { DeployUtil, RuntimeArgs, CLValueBuilder, CLPublicKey, CasperServiceByJsonRPC } = (casperSDK.default || casperSDK);

        const pubKey = await getConnectedCasperPublicKey();
        const senderKey = CLPublicKey.fromHex(pubKey!);

        const deployParams = new DeployUtil.DeployParams(senderKey, CASPER_CHAIN_NAME);

        const args = RuntimeArgs.fromMap({
          milestone_index: CLValueBuilder.u8(data.milestone_index),
          current_score: CLValueBuilder.u8(data.current_score),
        });

        // Use the raw hash without the "hash-" prefix
        const contractHash = hexToBytes(data.contract_uref.replace("hash-", ""));

        const session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
          contractHash,
          "release",
          args
        );

        const payment = DeployUtil.standardPayment(5000000000); // 5 CSPR gas for contract call

        const deploy = DeployUtil.makeDeploy(deployParams, session, payment);
        const signed = await signDeployWithCasperWallet(
          deploy,
          casperSDK.default || casperSDK,
          "Release signature was cancelled.",
          pubKey,
        );
        const signedDeploy = signed.deploy;
        const client = new CasperServiceByJsonRPC(CASPER_RPC_URL);
        
        setMessage("Broadcasting release to Casper Testnet...");
        let deployHash = signed.deployHashHex;
        try {
          const result = await client.deploy(signedDeploy, { checkApproval: true });
          deployHash = getAcceptedDeployHash(result, signed.deployHashHex);
          console.log("Broadcast successful, release deploy hash:", deployHash);
        } catch (broadcastErr: any) {
          console.error("Casper release deploy broadcast failed:", broadcastErr);
          setMessage(`Casper RPC rejected the release deploy: ${formatCasperRpcError(broadcastErr)}`);
          return;
        }

        setMessage(`Release deploy accepted (${shortHash(deployHash)}). Waiting for Casper finalization...`);
        try {
          const deployInfo = await client.waitForDeploy(deployHash, 120000);
          const failure = getDeployFailureMessage(deployInfo);
          if (failure) {
            setMessage(`Casper release deploy failed: ${failure}`);
            return;
          }
        } catch (waitErr: any) {
          console.error("Casper release deploy finalization failed:", waitErr);
          setMessage(`Could not confirm release deploy execution: ${formatCasperRpcError(waitErr)}`);
          return;
        }

        // 3. Submit deploy hash to backend to finalize release
        setMessage("Finalizing release on backend...");
        const finalRes = await evaluateRound(roundId, deployHash);
        if (!finalRes.ok) {
          setMessage(finalRes.error);
          return;
        }

        setMessage(finalRes.data.message || "Milestone release recorded and broadcasted.");
      } catch (err: any) {
        console.error("Release error:", err);
        setMessage(err.message || "An error occurred during release.");
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleEvaluate}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-[#45f798] px-4 text-xs font-bold text-black transition-colors hover:bg-[#63ffab] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RadioTower className="h-3.5 w-3.5" />
        {isPending ? "Evaluating..." : "Evaluate score release"}
      </button>
      {message && <p className="text-xs text-zinc-500">{message}</p>}
    </div>
  );
}
