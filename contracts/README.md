# Codequity Launchpad — Smart Contracts

Two Odra (Rust/Wasm) contracts deployed to Casper Network:

## Contracts

### 1. `escrow-vault/` — EscrowVault
Score-gated CSPR escrow. Holds investor funds and releases tranches when the Codequity AI agent provides proof that a startup's traction score has met a milestone threshold.

**Key entry points:**
| Function | Who calls | What it does |
|----------|-----------|--------------|
| `init(startup, milestones)` | Agent (deploy) | Initialises vault, stores milestone schedule |
| `deposit()` | Agent | Adds CSPR to the vault (payable) |
| `release(milestone_index, current_score)` | Agent | Verifies score on-chain, transfers tranche to startup |
| `can_release(milestone_index, current_score)` | Anyone | Read-only eligibility check |
| `get_milestones()` | Anyone | Returns milestone list with release status |

**Security:**
- Only the owner (agent wallet) can call `release` and `deposit`
- Contract re-verifies `current_score >= threshold` before any transfer — agent cannot lie
- Each milestone is one-shot: `released = true` prevents double-spend

---

### 2. `safe-token/` — SAFEToken
NFT representing a Simple Agreement for Future Equity. One token minted per funding round. Metadata (round ID, investor, startup, IPFS terms hash) is immutable after mint.

**Key entry points:**
| Function | Who calls | What it does |
|----------|-----------|--------------|
| `init()` | Agent (deploy) | Sets owner |
| `mint(round_id, investor, startup, terms_hash)` | Agent | Mints NFT; prevents duplicate per round |
| `transfer(token_id, to)` | Token holder or Agent | Legal assignment of SAFE |
| `get_metadata(token_id)` | Anyone | Returns on-chain SAFE metadata |
| `get_token_for_round(round_id)` | Anyone | Round UUID → token ID lookup |

---

## Building

### Prerequisites

```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Add Wasm target
rustup target add wasm32-unknown-unknown

# 3. Install cargo-odra
cargo install cargo-odra

# 4. (For deployment) Install casper-client
# macOS: brew install casper-client  OR download from https://github.com/casper-ecosystem/casper-client-rs
```

### Build both contracts

```bash
cd contracts

# Build EscrowVault
cd escrow-vault && cargo odra build --release

# Build SAFEToken
cd ../safe-token && cargo odra build --release
```

Wasm binaries are written to:
- `escrow-vault/target/wasm32-unknown-unknown/release/escrow_vault.wasm`
- `safe-token/target/wasm32-unknown-unknown/release/safe_token.wasm`

### Run tests (mock environment — no testnet needed)

```bash
cd contracts

# Test EscrowVault
cd escrow-vault && cargo test --features mock

# Test SAFEToken  
cd ../safe-token && cargo test --features mock
```

---

## Deploying to Casper Testnet

### 1. Generate an Ed25519 keypair (agent wallet)

```bash
casper-client keygen ./agent
# Creates agent/secret_key.pem and agent/public_key.pem
```

### 2. Fund the agent wallet

```bash
# Get the public key hex
casper-client account-address --public-key ./agent/public_key.pem

# Paste that address into the Casper Testnet Faucet:
# https://testnet.cspr.live/tools/faucet
# Request ≥ 200 CSPR (two contract deploys ≈ 100 CSPR each)
```

### 3. Set environment variables

```bash
cp backend/.env.example backend/.env
# Edit backend/.env:
#   AGENT_PRIVATE_KEY=<contents of agent/secret_key.pem, newlines as \n>
```

### 4. Deploy

```bash
STARTUP_PUBKEY=01<startup-pubkey-hex> ./scripts/deploy_contracts.sh
```

### 5. Get contract URefs

```bash
# Wait ~30 seconds then:
./scripts/get_contract_urefs.sh

# Copy ESCROW_CONTRACT_UREF into backend/.env
```

---

## Contract Architecture

```
Investor → [Agent] → EscrowVault.deposit()
                          │
                    CSPR locked in vault
                          │
Codequity API             │
(traction score)          │
       │                  │
       ▼                  │
[Agent checks score]      │
       │                  │
   score >= threshold     │
       │                  │
       ▼                  │
EscrowVault.release()─────┘
       │
       ▼
  Startup Wallet receives CSPR
       │
       ▼
on_chain_transactions logged in Supabase
       │
       ▼
Dashboard shows MilestoneReleased event + testnet explorer link
```

The agent is the **only trust boundary** — but the contract enforces the score check independently. Even if the agent is compromised, it cannot release funds to a wrong address (startup is set at deploy time and cannot be changed).
