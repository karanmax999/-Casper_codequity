export const CSPR_TESTNET_EXPLORER = "https://testnet.cspr.live";

export const CODEQUITY_ESCROW_PUBLIC_KEY =
  "0202adeeff8bbd3af398698d1ffcbe0e4220e1199bfa2840108f4a0046c1dc5bbd02";

export const DEMO_PROTOCOL_PUBLIC_KEY =
  "02034c0d05bc3b5fdb3f661a085d331895a37060982de4c61117487c2de521456b82";

export const ESCROW_CONTRACT_UREF =
  "hash-c489f547dc4a855d7a9361cbaf649af8d9c17528a1fa072bbd0c6bb12b008765";

export const SAFE_CONTRACT_UREF =
  "hash-14ac3b8892224dd8aa829b02460d53e3f3e0d569b859e5225edf83d14f9d9188";

export function csprAccountHref(publicKey: string) {
  return `${CSPR_TESTNET_EXPLORER}/account/${publicKey}`;
}

export function csprContractHref(contractHash: string) {
  return `${CSPR_TESTNET_EXPLORER}/contract/${contractHash}`;
}
