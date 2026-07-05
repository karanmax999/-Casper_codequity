"use client";

import { useState, useTransition } from "react";
import { RadioTower } from "lucide-react";
import { broadcastCasperDeploy, getEvaluatePayload, evaluateRound } from "@/actions";
import {
  CASPER_CHAIN_NAME,
  getConnectedCasperPublicKey,
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
        const { DeployUtil, RuntimeArgs, CLValueBuilder, CLPublicKey } = (casperSDK.default || casperSDK);

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
        
        setMessage("Broadcasting signed release through backend...");
        const broadcastRes = await broadcastCasperDeploy(DeployUtil.deployToJson(signedDeploy), {
          wait: true,
          requireFinalized: true,
          timeoutSeconds: 300,
        });
        if (!broadcastRes.ok) {
          setMessage(`Casper RPC rejected the release deploy: ${broadcastRes.error}`);
          return;
        }

        const deployHash = broadcastRes.data.deploy_hash || signed.deployHashHex;
        setMessage(`Release confirmed on Casper Testnet (${shortHash(deployHash)}). Finalizing backend record...`);

        // 3. Submit deploy hash to backend to finalize release
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
