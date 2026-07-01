#!/usr/bin/env bash
# get_contract_urefs.sh — Query deployed contract URefs after deploy processing
#
# Run this ~30 seconds after deploy_contracts.sh completes.
# It reads the deploy hashes from deployed_contracts.env and queries the
# Casper testnet to retrieve the resulting contract URefs.

set -euo pipefail

export PATH="$HOME/.cargo/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DEPLOYED_ENV="$SCRIPT_DIR/deployed_contracts.env"

if [[ ! -f "$DEPLOYED_ENV" ]]; then
  echo "ERROR: Run deploy_contracts.sh first"
  exit 1
fi

set -a; source "$DEPLOYED_ENV"; set +a

CASPER_NODE="${CASPER_NODE_URL:-https://node.testnet.cspr.cloud/rpc}"

echo "==> Querying deploy status..."
echo "    Escrow deploy: $ESCROW_DEPLOY_HASH"
echo "    SAFE deploy:   $SAFE_DEPLOY_HASH"

get_contract_hash() {
  local deploy_hash="$1"
  local label="$2"

  result=$(casper-client get-deploy \
    --node-address "$CASPER_NODE" \
    "$deploy_hash" 2>&1)

  status=$(echo "$result" | python3 -c "
import sys, json
c = sys.stdin.read()
idx = c.find('{')
d = json.loads(c[idx:])
results = d.get('result', {}).get('execution_results', [])
if results:
    r = results[0].get('result', {})
    if 'Success' in r:
        print('success:' + r['Success'].get('cost', ''))
    elif 'Failure' in r:
        print('failed:' + r['Failure'].get('error_message', ''))
    else:
        print('pending')
else:
    print('pending')
" 2>/dev/null || echo "error")

  echo "    $label status: $status"
}

get_contract_hash "$ESCROW_DEPLOY_HASH" "EscrowVault"
get_contract_hash "$SAFE_DEPLOY_HASH" "SAFEToken"

echo ""
echo "==> To get the contract package hash (URef), check the testnet explorer:"
echo "    https://testnet.cspr.live/deploy/$ESCROW_DEPLOY_HASH"
echo "    https://testnet.cspr.live/deploy/$SAFE_DEPLOY_HASH"
echo ""
echo "    Copy the 'contract_package_hash' values into backend/.env:"
echo "    ESCROW_CONTRACT_UREF=contract-package-..."
echo "    SAFE_CONTRACT_UREF=contract-package-..."
