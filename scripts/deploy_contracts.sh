#!/usr/bin/env bash
# deploy_contracts.sh — Deploy EscrowVault and SAFEToken to Casper Testnet
#
# Prerequisites:
#   - Rust + wasm32-unknown-unknown target: rustup target add wasm32-unknown-unknown
#   - cargo-odra: cargo install cargo-odra
#   - casper-client CLI in PATH
#   - .env file with AGENT_PRIVATE_KEY_PATH set
#
# Usage:
#   ./scripts/deploy_contracts.sh
#   STARTUP_PUBKEY=01abc... ./scripts/deploy_contracts.sh

set -euo pipefail

export PATH="$HOME/.cargo/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONTRACTS_DIR="$ROOT_DIR/contracts"

# Load env
ENV_FILE="$ROOT_DIR/backend/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a; source "$ENV_FILE"; set +a
fi

CASPER_NODE="${CASPER_NODE_URL:-https://node.testnet.casper.network}"
KEY_PATH="${AGENT_PRIVATE_KEY_PATH:-$ROOT_DIR/agent/secret_key.pem}"
PAYMENT_AMOUNT="50000000000"  # 50 CSPR for contract deploys

# Startup wallet (required for EscrowVault init)
STARTUP_PUBKEY="${STARTUP_PUBKEY:-}"

if [[ -z "$STARTUP_PUBKEY" ]]; then
  echo "ERROR: Set STARTUP_PUBKEY env var to the startup's Casper wallet public key hex"
  exit 1
fi

if [[ "$STARTUP_PUBKEY" != account-hash-* ]]; then
  echo "==> Converting startup public key to account hash..."
  STARTUP_ACCOUNT_HASH=$(casper-client account-address --public-key "$STARTUP_PUBKEY")
else
  STARTUP_ACCOUNT_HASH="$STARTUP_PUBKEY"
fi
echo "    Startup Account Hash: $STARTUP_ACCOUNT_HASH"

if [[ ! -f "$KEY_PATH" ]]; then
  echo "ERROR: Agent key not found at $KEY_PATH"
  exit 1
fi

# Check if already deployed
ESCROW_ALREADY_DEPLOYED=false
SAFE_ALREADY_DEPLOYED=false

if [[ -n "${ESCROW_CONTRACT_UREF:-}" && "$ESCROW_CONTRACT_UREF" != "contract-package-"* && "$ESCROW_CONTRACT_UREF" != "" ]]; then
  ESCROW_ALREADY_DEPLOYED=true
fi
if [[ -n "${SAFE_CONTRACT_UREF:-}" && "$SAFE_CONTRACT_UREF" != "contract-package-"* && "$SAFE_CONTRACT_UREF" != "" ]]; then
  SAFE_ALREADY_DEPLOYED=true
fi

FORCE_DEPLOY="${FORCE_DEPLOY:-false}"

# ─── Build & Deploy EscrowVault ────────────────────────────────────────────

if [[ "$ESCROW_ALREADY_DEPLOYED" == "true" && "$FORCE_DEPLOY" != "true" ]]; then
  echo "==> EscrowVault is already deployed (UREF: $ESCROW_CONTRACT_UREF). Skipping build & deploy."
  ESCROW_DEPLOY_HASH="ALREADY_DEPLOYED"
else
  echo "==> Building EscrowVault..."
  cd "$CONTRACTS_DIR/escrow-vault"
  CARGO_TARGET_DIR=target cargo odra build

  ESCROW_WASM="$CONTRACTS_DIR/escrow-vault/wasm/EscrowVault.wasm"
  echo "EscrowVault Wasm: $ESCROW_WASM ($(du -sh "$ESCROW_WASM" | cut -f1))"

  echo ""
  echo "==> Deploying EscrowVault to $CASPER_NODE ..."
  echo "    Startup wallet: $STARTUP_PUBKEY"

  # Build milestones JSON (two milestones: 50% at score 60, 50% at score 80)
  ESCROW_RESULT=$(casper-client put-deploy \
    --node-address "$CASPER_NODE" \
    --secret-key "$KEY_PATH" \
    --session-path "$ESCROW_WASM" \
    --session-arg "startup:key='$STARTUP_ACCOUNT_HASH'" \
    --session-arg "milestones:byte_list='020000003c3200503200'" \
    --session-arg "odra_cfg_package_hash_key_name:string='escrow_vault'" \
    --session-arg "odra_cfg_allow_key_override:bool='true'" \
    --session-arg "odra_cfg_is_upgradable:bool='true'" \
    --session-arg "odra_cfg_is_upgrade:bool='false'" \
    --payment-amount "$PAYMENT_AMOUNT" \
    --chain-name casper-test \
    2>&1) || {
      echo "ERROR: casper-client put-deploy for EscrowVault failed with output:"
      echo "$ESCROW_RESULT"
      exit 1
    }

  ESCROW_DEPLOY_HASH=$(echo "$ESCROW_RESULT" | python3 -c "import sys,json; c=sys.stdin.read(); idx=c.find('{'); print(json.loads(c[idx:])['result']['deploy_hash'])" 2>/dev/null || echo "PARSE_ERROR")
  echo "    EscrowVault deploy hash: $ESCROW_DEPLOY_HASH"
  echo "    Explorer: https://testnet.cspr.live/deploy/$ESCROW_DEPLOY_HASH"
fi

# ─── Build & Deploy SAFEToken ──────────────────────────────────────────────

if [[ "$SAFE_ALREADY_DEPLOYED" == "true" && "$FORCE_DEPLOY" != "true" ]]; then
  echo "==> SAFEToken is already deployed (UREF: $SAFE_CONTRACT_UREF). Skipping build & deploy."
  SAFE_DEPLOY_HASH="ALREADY_DEPLOYED"
else
  echo "==> Building SAFEToken..."
  cd "$CONTRACTS_DIR/safe-token"
  CARGO_TARGET_DIR=target cargo odra build

  SAFE_WASM="$CONTRACTS_DIR/safe-token/wasm/SafeToken.wasm"
  echo "SAFEToken Wasm:   $SAFE_WASM   ($(du -sh "$SAFE_WASM" | cut -f1))"

  echo ""
  echo "==> Deploying SAFEToken to $CASPER_NODE ..."

  SAFE_RESULT=$(casper-client put-deploy \
    --node-address "$CASPER_NODE" \
    --secret-key "$KEY_PATH" \
    --session-path "$SAFE_WASM" \
    --session-arg "odra_cfg_package_hash_key_name:string='safe_token'" \
    --session-arg "odra_cfg_allow_key_override:bool='true'" \
    --session-arg "odra_cfg_is_upgradable:bool='true'" \
    --session-arg "odra_cfg_is_upgrade:bool='false'" \
    --payment-amount "$PAYMENT_AMOUNT" \
    --chain-name casper-test \
    2>&1) || {
      echo "ERROR: casper-client put-deploy for SAFEToken failed with output:"
      echo "$SAFE_RESULT"
      exit 1
    }

  SAFE_DEPLOY_HASH=$(echo "$SAFE_RESULT" | python3 -c "import sys,json; c=sys.stdin.read(); idx=c.find('{'); print(json.loads(c[idx:])['result']['deploy_hash'])" 2>/dev/null || echo "PARSE_ERROR")
  echo "    SAFEToken deploy hash: $SAFE_DEPLOY_HASH"
  echo "    Explorer: https://testnet.cspr.live/deploy/$SAFE_DEPLOY_HASH"
fi

# ─── Save output ───────────────────────────────────────────────────────────

OUTPUT_FILE="$ROOT_DIR/scripts/deployed_contracts.env"
# Read old hashes if exists
OLD_ESCROW_HASH=""
OLD_SAFE_HASH=""
if [[ -f "$OUTPUT_FILE" ]]; then
  OLD_ESCROW_HASH=$(grep "ESCROW_DEPLOY_HASH=" "$OUTPUT_FILE" | cut -d'=' -f2 || true)
  OLD_SAFE_HASH=$(grep "SAFE_DEPLOY_HASH=" "$OUTPUT_FILE" | cut -d'=' -f2 || true)
fi

FINAL_ESCROW_HASH="$ESCROW_DEPLOY_HASH"
if [[ "$ESCROW_DEPLOY_HASH" == "ALREADY_DEPLOYED" ]]; then
  FINAL_ESCROW_HASH="${OLD_ESCROW_HASH:-ALREADY_DEPLOYED}"
fi

FINAL_SAFE_HASH="$SAFE_DEPLOY_HASH"
if [[ "$SAFE_DEPLOY_HASH" == "ALREADY_DEPLOYED" ]]; then
  FINAL_SAFE_HASH="${OLD_SAFE_HASH:-ALREADY_DEPLOYED}"
fi

cat > "$OUTPUT_FILE" <<EOF
# Generated by deploy_contracts.sh on $(date -u)
ESCROW_DEPLOY_HASH=$FINAL_ESCROW_HASH
SAFE_DEPLOY_HASH=$FINAL_SAFE_HASH
# Add ESCROW_CONTRACT_UREF and SAFE_CONTRACT_UREF after the deploys process (~30s)
# Run: ./scripts/get_contract_urefs.sh to retrieve them
EOF

echo ""
echo "==> Done! Hashes saved to $OUTPUT_FILE"
echo ""
echo "Next: Wait ~30 seconds for deploys to process, then run:"
echo "  ./scripts/get_contract_urefs.sh"
echo "  → Copy ESCROW_CONTRACT_UREF into backend/.env"
