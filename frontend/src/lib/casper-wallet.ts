"use client";

type CasperDeploySigningResult = {
  publicKeyHex: string;
  deploy: any;
  deployHashHex: string;
  signatureHex: string;
};

export async function signDeployWithCasperWallet(
  deploy: any,
  casperSDK: any,
  cancelledMessage: string,
  signingPublicKeyHex?: string,
): Promise<CasperDeploySigningResult> {
  const casperProvider = (window as any).CasperWalletProvider;
  if (!casperProvider) {
    throw new Error("Please install the Casper Wallet browser extension to sign the transaction.");
  }

  const { DeployUtil, CLPublicKey } = casperSDK;
  const provider = casperProvider();
  const isConnected = await provider.requestConnection();
  if (!isConnected) {
    throw new Error("Wallet connection rejected.");
  }

  const publicKeyHex = signingPublicKeyHex ?? (await provider.getActivePublicKey());
  const deployJson = DeployUtil.deployToJson(deploy);
  const signResult = await provider.sign(JSON.stringify(deployJson), publicKeyHex);

  if (signResult?.cancelled) {
    throw new Error(cancelledMessage);
  }

  const signedDeploy = DeployUtil.setSignature(
    deploy,
    getRawSignatureBytes(signResult),
    CLPublicKey.fromHex(publicKeyHex),
  );
  const parsedSignedDeploy = DeployUtil.deployFromJson(DeployUtil.deployToJson(signedDeploy)).unwrap();
  const latestApproval = parsedSignedDeploy.approvals[parsedSignedDeploy.approvals.length - 1];

  return {
    publicKeyHex,
    deploy: parsedSignedDeploy,
    deployHashHex: bytesToHex(parsedSignedDeploy.hash),
    signatureHex: latestApproval.signature,
  };
}

export async function getConnectedCasperPublicKey(): Promise<string> {
  const casperProvider = (window as any).CasperWalletProvider;
  if (!casperProvider) {
    throw new Error("Please install the Casper Wallet browser extension to sign the transaction.");
  }

  const provider = casperProvider();
  const isConnected = await provider.requestConnection();
  if (!isConnected) {
    throw new Error("Wallet connection rejected.");
  }

  return provider.getActivePublicKey();
}

function getRawSignatureBytes(signResult: any): Uint8Array {
  const signature = signResult?.signature;
  if (signature instanceof Uint8Array) {
    return signature;
  }

  if (Array.isArray(signature)) {
    return Uint8Array.from(signature);
  }

  if (Array.isArray(signature?.data)) {
    return Uint8Array.from(signature.data);
  }

  if (signature && typeof signature === "object") {
    const numericKeys = Object.keys(signature).filter((key) => /^\d+$/.test(key));
    if (numericKeys.length > 0) {
      const values = numericKeys
        .sort((left, right) => Number(left) - Number(right))
        .map((key) => signature[key]);

      if (values.every((value) => Number.isInteger(value))) {
        return Uint8Array.from(values);
      }
    }
  }

  const signatureHex =
    typeof signResult?.signatureHex === "string"
      ? signResult.signatureHex
      : typeof signature === "string"
        ? signature
        : "";

  if (signatureHex) {
    const normalized = normalizeHex(signatureHex);
    const rawHex =
      normalized.length === 130 && (normalized.startsWith("01") || normalized.startsWith("02"))
        ? normalized.slice(2)
        : normalized;
    return hexToBytes(rawHex);
  }

  throw new Error("Casper Wallet did not return a usable signature.");
}

function normalizeHex(value: string) {
  return value.startsWith("0x") ? value.slice(2) : value;
}

function hexToBytes(value: string) {
  if (value.length % 2 !== 0 || !/^[\da-f]+$/i.test(value)) {
    throw new Error("Casper Wallet returned an invalid signature.");
  }

  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
