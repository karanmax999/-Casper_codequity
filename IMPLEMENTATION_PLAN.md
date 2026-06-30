# Codequity x Casper Launchpad: Implementation Plan

**Target**: Casper Agentic Buildathon 2026 - Qualification Round  
**Deadline**: July 8, 2026 (Extended)  
**Prize Pool**: $150,000 USD  
**Team**: Codequity (Karan)  
**Status**: Draft - Phase 0 in Progress

---

## 1. Executive Summary

Codequity is building an AI-Governed "Proof-of-Traction" Launchpad that automates milestone-based funding for startups. Using Casper Network's upgradeable smart contracts and the existing Codequity Terminal AI scoring engine, we enable trustless, on-chain escrow that releases funds automatically when a startup's Traction Score exceeds predefined thresholds.

**Primary Users**:
- Web3 grant foundations
- Angel investors & syndicates
- DAO treasuries

**USP**: Venture capital, but automated. Your Codequity Traction Score is the single source of truth for milestone funding—no human audits, no delays, no bias.

**Hackathon MVP**: One working end-to-end flow where an AI score triggers an on-chain CSPR release from an escrow contract on Casper Testnet.

---

## 2. Current State Analysis

### 2.1 Existing Infrastructure

#### Backend: `codequity-analytics/` (FastAPI Python)
- **AI Agents**:
  - `StartupScorerAgent`: Scores startups based on GitHub metrics, team, market (uses Anthropic Claude)
  - `InvestorMemoWriterAgent`: Generates investor memos
- **Data Connectors**: GitHub, CoinGecko, CryptoCompare, Etherscan, FRED, Yahoo Finance
- **Database**: Supabase PostgreSQL with tables:
  - `startups` (id, name, github_url, traction_score, ...)
  - `investors` (id, name, ...)
  - `agent_outputs` (id, startup_id, agent_type, output_json)
- **Automated Scoring**: Supabase trigger + Deno edge function (`score-startup`) auto-scores when `github_url` changes
- **API Endpoints**:
  - `POST /api/agents/score` - manual scoring
  - `POST /api/agents/memo` - memo generation
  - `GET /api/connectors/*` - external data

#### Frontend: `codequity-terminal-web/` (Next.js 16)
- Shell layout with IconRail, DetailPanel, RightPanel
- Pages: Dashboard, Startups, Investors, Portfolio
- Design system: Dark mode (OLED), Fira Code/Sans fonts, green accent (#22C55E)
- Supabase client for auth and data
- shadcn/ui components, Tailwind CSS v4

#### Database Schema Highlights
```sql
startups: id, name, github_url, traction_score (integer), created_at
investors: id, name, email, ...
agent_outputs: id, startup_id, agent_type, output_json, created_at
```

**Missing for Launchpad**:
- `funding_rounds` table (to track rounds & escrow contracts)
- `milestones` table (per-round release thresholds)
- `on_chain_transactions` table (audit trail)
- RLS policies for new tables
- API endpoints to create rounds and trigger releases

---

### 2.2 Technology Stack Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Smart Contracts | Odra (Rust/Wasm) | Casper-native, upgradeable, performant |
| Python-Casper Integration | Direct REST API + `requests` | No SDK dependency; full control; fastest for MVP |
| Signing | Ed25519 via `cryptography` library | Standard for Casper; secure |
| New Frontend | Next.js 16 (separate folder) | Reuse existing patterns; investor-specific UI |
| UI Library | shadcn/ui + Tailwind v4 | Consistent with existing design system |
| Database | Supabase PostgreSQL | Existing infrastructure; easy migrations |
| Backend Extension | Add to existing `codequity-analytics` | Avoid microservice complexity for MVP |
| x402/MCP | Postpone to post-hackathon | Core flow is priority; can add monetization later |

---

## 3. Project Vision

**For Investors**: A dashboard where you can see all your funded startups, view their real-time Codequity Traction Scores, and watch as funds are automatically released when milestones are hit—no chasing founders, no manual verification.

**For Startups**: A transparent, objective pathway to funding. Hit the score threshold, and the money is released instantly on-chain.

**For the Ecosystem**: Demonstrate that AI + blockchain can automate venture capital, reducing friction and increasing trust.

---

## 4. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Codequity Ecosystem                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ Existing ] fincept-qt (C++/Qt)    [ Existing ] codequity-web (Next.js)   │
│                                    [ Existing ] codequity-analytics (Python)│
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │ shares PostgreSQL (Supabase)
                               ▼
                    ┌─────────────────────────┐
                    │   Supabase PostgreSQL    │
                    │  - startups             │
                    │  - investors            │
                    │  - funding_rounds       │ ← NEW
                    │  - milestones           │ ← NEW
                    │  - on_chain_transactions│ ← NEW
                    └─────────────┬───────────┘
                                  │ RPC
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Casper Network (Testnet)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. EscrowVault Contract (Odra)                                            │
│     - Holds investor CSPR in purse                                         │
│     - milestones: Vec<{threshold, released, amount}>                       │
│     - release(i): transfers amount to startup, only by Codequity Agent    │
│                                                                             │
│  2. SAFEToken Contract (NFT)                                               │
│     - Represents the funding agreement (SAFE)                             │
│     - Metadata: round_id, investor, startup, terms_hash (IPFS)            │
└─────────────────────────────────────────────────────────────────────────────┘

Legend:
  ↔ = existing
  → = new
```

**Data Flow**:
1. Startup registers → gets scored → `traction_score` stored in `startups`
2. Investor creates funding round → backend deploys escrow + SAFE contracts → stores hashes
3. Codequity Agent monitors scores → when `score >= threshold` → calls `escrow.release(i)` → on-chain transaction
4. Transaction hash recorded in `on_chain_transactions` for audit
5. Frontend displays round status, milestone progress, explorer links

---

## 5. Phase-Wise Implementation Plan

### Phase 0: Analysis & Setup (0.5-1 day)

**Objectives**: Understand codebase, set up workspace, make key decisions.

**Tasks**:

1. **Explore Backend** (`codequity-analytics/`)
   - Read `app/agents/base_agent.py`, `app/agents/startup_scorer.py` (if exists)
   - Understand `StartupScorerAgent.run()` inputs/outputs
   - Check `app/main.py` router structure
   - Note environment variables: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, etc.
   - Identify how Supabase client is instantiated (likely `app/db/supabase.py`)

2. **Explore Frontend** (`codequity-terminal-web/`)
   - Review design system: `design-system/codequity-finance/MASTER.md`
   - Identify reusable components: Card, Button, Badge, Progress, Table
   - See how Supabase client is used (e.g., in `src/components/terminal/...`)
   - Understand shell layout patterns

3. **Create Project Scaffold**
```bash
mkdir -p casper_codequity/{contracts/src,contracts/tests,python-sdk,backend/routers,backend/models,backend/tests,frontend/src/{app,components,lib},supabase/migrations,scripts, docs}
```

4. **Set up development environments**
   - Rust + Odra: `cargo install odra`
   - Python venv: `python -m venv .venv && pip install fastapi uvicorn requests cryptography supabase`
   - Node: `npx create-next-app@latest frontend` (but we'll customize)
   - Casper testnet: Get faucet CSPR, install `casper-client` binary

5. **Make key decisions** (to be discussed with user):
   - **Auth for new endpoints**: Use existing Supabase JWT? Reuse existing auth middleware?
   - **Who can create rounds**: Admin-only initially? Or investor self-service?
   - **Agent key management**: Where store Ed25519 private key? (.env for now, Railway secrets later)
   - **Automation**: Polling vs webhook? Start with manual evaluate endpoint; add webhook later

**Deliverable**:
- `ANALYSIS.md` summarizing findings, assumptions, open questions
- Scaffolded directory structure
- Initial config files: `.env.example`, `requirements.txt`, `package.json`

---

### Phase 1: Smart Contracts (1-2 days)

**Objective**: Write, test, and deploy Odra contracts to Casper testnet.

#### 1.1 Set up Odra Project
```bash
cd casper_codequity/contracts
odra new escrow-vault
odra new safe-nft
```

#### 1.2 EscrowVault Contract

File: `contracts/escrow-vault/src/lib.rs`

```rust
use odra::prelude::*;

#[odra::module]
pub trait EscrowVault {
    fn init(
        &mut self,
        owner: PublicKey,
        milestones: Vec<Milestone>,
        initial_deposit: URef
    );

    fn deposit(&mut self, amount: URef);

    fn release(&mut self, milestone_index: u8);

    fn get_balance(&self) -> URef;

    fn can_release(&self, milestone_index: u8, current_score: u16) -> bool;

    fn get_milestone(&self, index: u8) -> Milestone;
}

#[derive(Clone, Copy, Eq, PartialEq, Debug)]
pub struct Milestone {
    pub threshold: u16,
    pub amount_percent: u8, // 0-100
    pub released: bool,
}

#[odra::storage]
pub struct EscrowVaultStorage {
    owner: Bucket<PublicKey>,
    milestones: Vector<Milestone>,
    balance: URef,
}
```

**Logic**:
- `init`: stores owner, milestones, sets balance to `initial_deposit`
- `deposit`: adds to balance (only owner can deposit more)
- `release`:
  1. Check `caller == owner`
  2. Check `!milestones[index].released`
  3. Check `current_score >= milestones[index].threshold` (pass as argument? Or read from external? Better: caller passes current_score; contract verifies)
  4. Calculate amount = `balance * milestones[index].amount_percent / 100`
  5. Transfer to caller's specified recipient (or startup's purse)
  6. Mark milestone as released
  7. Emit event `MilestoneReleased { index, amount, recipient }`

**Note**: On Casper, smart contracts cannot read external data (like startup scores) directly. The AI agent must pass the current score as an argument, and the contract verifies the milestone condition. The agent's signature ensures honesty (agent is the owner).

#### 1.3 SAFEToken Contract (NFT)

Simpler: use Casper's built-in NFT standards or a minimal custom.

```rust
use odra::prelude::*;

#[odra::module]
pub trait SAFEToken {
    fn init(
        &mut self,
        funding_round_id: String,
        investor: PublicKey,
        startup: PublicKey,
        terms_hash: String
    );

    fn mint(&mut self, to: PublicKey) -> U64; // token_id

    fn get_metadata(&self, token_id: U64) -> Metadata;

    fn transfer(&mut self, token_id: U64, to: PublicKey);
}

#[derive(Clone, Debug)]
pub struct Metadata {
    pub funding_round_id: String,
    pub investor: PublicKey,
    pub startup: PublicKey,
    pub terms_hash: String,
}

#[odra::storage]
pub struct SAFETokenStorage {
    owner: Bucket<PublicKey>,
    metadata: Mapping<U64, Metadata>,
    balances: Mapping<PublicKey, Vector<U64>>,
    total_supply: U64,
}
```

For MVP, mint the NFT to the investor and call it done. No transfers needed.

#### 1.4 Testing

Write unit tests in `contracts/escrow-vault/tests/lib.rs`:
- Test successful release
- Test duplicate release fails
- Test unauthorized release fails
- Test threshold condition

```bash
cd contracts/escrow-vault
odra test
```

#### 1.5 Deployment

Manual deploy scripts (`scripts/deploy_escrow.sh`):

```bash
#!/bin/bash
# Build
odra build --release
# Get contract wasm
CONTRACT_WASM=target/wasm32-unknown-unknown/release/escrow_vault.wasm
# Deploy (you'll need to craft the JSON with init args)
casper-client put-deploy \
  --node https://testnet.casper.network \
  --secret-key agent/secret_key.pem \
  --session-hash $(odra hash $CONTRACT_WASM) \
  --session-args '[{"name":"init","value":{...}}]' \
  --payment-amount 1000000000
```

Save the returned `contract_uref` (URef = contract hash). We'll store this in `funding_rounds.escrow_contract_uref`.

**Deliverable**:
- Compiling Odra contracts (Wasm binaries)
- Deployed contract URefs on testnet (environment variables: `ESCROW_CONTRACT_UREF`, `SAFE_CONTRACT_UREF` for demo)
- Test coverage (passing unit tests)

---

### Phase 2: Python-Casper Integration (1 day)

**Objective**: Build a Python module that can call `release_funds` on the deployed escrow contract.

#### 2.1 Create `casper_codequity/python-sdk/casper_client.py`

Key functions:

```python
import os
import json
import requests
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization

class CasperClient:
    def __init__(self, node_url: str, private_key_pem: str):
        self.node_url = node_url
        self.private_key = serialization.load_pem_private_key(
            private_key_pem.encode(),
            password=None
        )
        self.public_key = self.private_key.public_key()
        self.public_key_hex = self.public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        ).hex()

    def release_funds(
        self,
        contract_uref: str,
        milestone_index: int,
        recipient_pubkey: str,
        amount_motes: int = None  # Optional: if not set, contract calculates
    ) -> str:
        """
        Call escrow_vault.release(milestone_index) as the agent owner.
        Returns transaction hash.
        """
        # Build deploy JSON
        deploy = {
            "execution": {
                "payment": {
                    "amount": "1000000000",  # 1 CSPR in motes (1 CSPR = 1e9 motes)
                    "payment_udf": False
                },
                "session": {
                    "code": {
                        "uref": contract_uref,
                        "version": 1
                    },
                    "args": [
                        {
                            "name": "release",
                            "value": {
                                "key": "release_u8",
                                "value": milestone_index
                            }
                        }
                    ]
                }
            },
            "key": self.public_key_hex
        }

        # Sign deploy
        # For MVP: we can use simpler approach: send unsigned and rely on node's key?
        # No, need to sign. We'll sign the deploy hash with Ed25519
        # Casper uses `key` field for the public key, and expects signature in `sign` header?
        # Actually: https://Casper.network/docs/developers/udfs/reference/rpc-api/
        # The /put-deploy expects: {"deploy": { ... }, "signature": "..."}
        # We'll need to compute the hash of the deploy dict and sign it.

        # For simplicity in MVP, we might use a pre-funded agent key and use casper-client binary
        # via subprocess. But we want pure Python. Let's research proper signing later.
        # Given hackathon time, we can use a simpler method: use requests to send deploy,
        # and sign using Ed25519. There are examples online.

        response = requests.post(
            f"{self.node_url}/chains/main/put-deploy",
            json={"deploy": deploy, "signature": signature}
        )
        response.raise_for_status()
        result = response.json()
        return result["deploy_hash"]
```

**Note**: The exact Casper RPC payload for `put-deploy` is complex. For the hackathon, we might bypass custom signing by:
- Option A: Use `subprocess` to call the `casper-client` binary (simpler, less code)
- Option B: Use a Python Ed25519 implementation to sign the deploy hash correctly

I'll draft both approaches and choose based on time.

#### 2.2 Environment Configuration

Create `.env`:
```
CASPER_NODE_URL=https://testnet.casper.network
AGENT_PRIVATE_KEY_PATH=agent/secret_key.pem
ESCROW_CONTRACT_UREF=uref-...
SAFE_CONTRACT_UREF=uref-...
```

#### 2.3 Testing

Write `tests/test_casper_client.py`:

```python
def test_get_balance():
    client = CasperClient.from_env()
    balance = client.get_balance(contract_uref)
    assert balance >= 0

def test_release_funds_simulation():
    # Use a test escrow that we control
    # Should return a tx hash and contract event shows release
    pass
```

**Deliverable**: Python module `casper_client.py` with at least `get_balance()` working. `release_funds()` may use subprocess wrapper if signing proves complex.

---

### Phase 3: Database & Backend API (1-2 days)

#### 3.1 Database Migrations

Create `casper_codequity/supabase/migrations/202607010001_launchpad_tables.sql`:

```sql
-- Enable uuid extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: funding_rounds
CREATE TABLE funding_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    amount_cspr NUMERIC NOT NULL, -- in CSPR (not motes)
    escrow_contract_uref TEXT NOT NULL,
    safe_nft_mint_hash TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','defaulted')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: milestones
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funding_round_id UUID NOT NULL REFERENCES funding_rounds(id) ON DELETE CASCADE,
    milestone_index INTEGER NOT NULL,
    threshold_score INTEGER NOT NULL,
    release_percent NUMERIC NOT NULL CHECK (release_percent >= 0 AND release_percent <= 100),
    released_at TIMESTAMPTZ,
    tx_hash TEXT,
    UNIQUE(funding_round_id, milestone_index)
);

-- Table: on_chain_transactions
CREATE TABLE on_chain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funding_round_id UUID REFERENCES funding_rounds(id),
    transaction_hash TEXT NOT NULL,
    block_hash TEXT,
    contract_uref TEXT NOT NULL,
    amount_motes NUMERIC,
    action TEXT NOT NULL CHECK (action IN ('release_funds','create_escrow','mint_safe','deposit')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
    casper_response JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_funding_rounds_startup ON funding_rounds(startup_id);
CREATE INDEX idx_funding_rounds_investor ON funding_rounds(investor_id);
CREATE INDEX idx_milestones_round ON milestones(funding_round_id);
CREATE INDEX idx_transactions_round ON on_chain_transactions(funding_round_id);

-- RLS: Allow public read on funding_rounds and milestones for transparency
ALTER TABLE funding_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE on_chain_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view funding rounds" ON funding_rounds;
CREATE POLICY "Public can view funding rounds" ON funding_rounds FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view milestones" ON milestones;
CREATE POLICY "Public can view milestones" ON milestones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view on_chain_transactions" ON on_chain_transactions;
CREATE POLICY "Public can view on_chain_transactions" ON on_chain_transactions FOR SELECT USING (true);

-- Service role can do everything (default Supabase policy)
```

Apply migration:
```bash
cd codequity-analytics
supabase migration up
# Or: psql -f supabase/migrations/202607010001_launchpad_tables.sql
```

#### 3.2 Pydantic Models

Create `codequity-analytics/app/models/launchpad.py`:

```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MilestoneCreate(BaseModel):
    threshold_score: int = Field(..., ge=0, le=100)
    release_percent: float = Field(..., ge=0, le=100)

class FundingRoundCreate(BaseModel):
    startup_id: str
    investor_id: str
    amount_cspr: float = Field(..., gt=0)
    milestones: List[MilestoneCreate]

class FundingRoundResponse(BaseModel):
    id: str
    startup_id: str
    investor_id: str
    amount_cspr: float
    escrow_contract_uref: str
    safe_nft_mint_hash: Optional[str]
    status: str
    created_at: datetime

class MilestoneResponse(BaseModel):
    id: str
    milestone_index: int
    threshold_score: int
    release_percent: float
    released_at: Optional[datetime]
    tx_hash: Optional[str]

class OnChainTransaction(BaseModel):
    id: str
    transaction_hash: str
    action: str
    status: str
    created_at: datetime
```

#### 3.3 FastAPI Router

Create `codequity-analytics/app/routers/launchpad.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from supabase import create_client
import os
from ..models.launchpad import (
    FundingRoundCreate, FundingRoundResponse,
    MilestoneResponse, MilestoneCreate
)
from python_sdk.casper_client import CasperClient

router = APIRouter(prefix="/api/launchpad", tags=["launchpad"])

# Initialize Supabase client (reuse existing pattern)
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # service role for admin ops
)

# Initialize Casper client
casper_client = CasperClient(
    node_url=os.getenv("CASPER_NODE_URL"),
    private_key_pem=os.getenv("AGENT_PRIVATE_KEY")
)

@router.post("/rounds", response_model=FundingRoundResponse)
async def create_funding_round(
    round_data: FundingRoundCreate,
    background_tasks: BackgroundTasks
):
    """
    Create a new funding round:
    1. Validate startup and investor exist
    2. Deploy EscrowVault contract to Casper testnet
    3. Mint SAFE NFT
    4. Save round + milestones + on-chain tx hashes to DB
    """
    # 1. Validate startup/investor
    startup = supabase.table("startups").select("id,name").eq("id", round_data.startup_id).execute()
    if not startup.data:
        raise HTTPException(404, "Startup not found")
    investor = supabase.table("investors").select("id,name").eq("id", round_data.investor_id).execute()
    if not investor.data:
        raise HTTPException(404, "Investor not found")

    # 2. Deploy EscrowVault
    # Build init args: owner=agent_pubkey, milestones=[{threshold,percent,released=false}], initial_deposit amount
    escrow_uref = await deploy_escrow_contract(
        owner_pubkey=casper_client.public_key_hex,
        milestones=round_data.milestones,
        amount_cspr=round_data.amount_cspr
    )

    # 3. Mint SAFE NFT
    safe_nft_hash = await mint_safe_nft(
        round_id=str(uuid.uuid4()),  # temporary, will update after DB insert
        investor_pubkey=investor.data[0]["wallet_pubkey"],  # assume column exists
        startup_pubkey=startup.data[0]["wallet_pubkey"],
        terms_hash="Qm..."  # IPFS hash, could be empty for MVP
    )

    # 4. Save to DB
    round_insert = supabase.table("funding_rounds").insert({
        "startup_id": round_data.startup_id,
        "investor_id": round_data.investor_id,
        "amount_cspr": round_data.amount_cspr,
        "escrow_contract_uref": escrow_uref,
        "safe_nft_mint_hash": safe_nft_hash,
        "status": "active"
    }).execute()
    round_id = round_insert.data[0]["id"]

    # Insert milestones
    for idx, ms in enumerate(round_data.milestones):
        supabase.table("milestones").insert({
            "funding_round_id": round_id,
            "milestone_index": idx,
            "threshold_score": ms.threshold_score,
            "release_percent": ms.release_percent,
            "released_at": None,
            "tx_hash": None
        }).execute()

    # Record on_chain_transaction for contract deployment
    supabase.table("on_chain_transactions").insert({
        "funding_round_id": round_id,
        "transaction_hash": escrow_uref,  # actually deploy tx hash; we'll need to get it from casper_client.deploy()
        "contract_uref": escrow_uref,
        "action": "create_escrow",
        "status": "success",
        "casper_response": {}  # full response
    }).execute()

    return FundingRoundResponse(**round_insert.data[0])

@router.post("/rounds/{round_id}/evaluate")
async def evaluate_round(round_id: str):
    """
    Check current startup score and release any milestones whose thresholds are met.
    """
    # Get round + startup
    round_row = supabase.table("funding_rounds").select("*").eq("id", round_id).single().execute()
    if not round_row.data:
        raise HTTPException(404, "Funding round not found")
    round_id = round_row.data["id"]
    startup_id = round_row.data["startup_id"]

    # Get latest traction_score
    startup = supabase.table("startups").select("traction_score").eq("id", startup_id).single().execute()
    current_score = startup.data["traction_score"]

    # Get unreleased milestones
    milestones = supabase.table("milestones") \
        .select("*") \
        .eq("funding_round_id", round_id) \
        .eq("released_at", None) \
        .order("milestone_index") \
        .execute() \
        .data

    released_any = False
    for ms in milestones:
        if current_score >= ms["threshold_score"]:
            # Call release_funds on escrow contract
            try:
                tx_hash = casper_client.release_funds(
                    contract_uref=round_row.data["escrow_contract_uref"],
                    milestone_index=ms["milestone_index"],
                    recipient_pubkey=get_startup_pubkey(startup_id)  # need function
                )
                # Update milestone
                supabase.table("milestones") \
                    .update({"released_at": "now()", "tx_hash": tx_hash}) \
                    .eq("id", ms["id"]).execute()
                # Record transaction
                supabase.table("on_chain_transactions").insert({
                    "funding_round_id": round_id,
                    "transaction_hash": tx_hash,
                    "contract_uref": round_row.data["escrow_contract_uref"],
                    "action": "release_funds",
                    "status": "success"
                }).execute()
                released_any = True
            except Exception as e:
                # Log error, continue with other milestones
                supabase.table("on_chain_transactions").insert({
                    "funding_round_id": round_id,
                    "transaction_hash": None,
                    "contract_uref": round_row.data["escrow_contract_uref"],
                    "action": "release_funds",
                    "status": "failed",
                    "casper_response": {"error": str(e)}
                }).execute()

    if released_any:
        # Check if all milestones released → round completed
        remaining = supabase.table("milestones") \
            .select("id") \
            .eq("funding_round_id", round_id) \
            .eq("released_at", None) \
            .execute() \
            .data
        if not remaining:
            supabase.table("funding_rounds") \
                .update({"status": "completed"}) \
                .eq("id", round_id).execute()

    return {"released": released_any, "current_score": current_score, "round_id": round_id}

@router.get("/rounds", response_model=List[FundingRoundResponse])
async def list_rounds(startup_id: Optional[str] = None, investor_id: Optional[str] = None):
    query = supabase.table("funding_rounds").select("*")
    if startup_id:
        query = query.eq("startup_id", startup_id)
    if investor_id:
        query = query.eq("investor_id", investor_id)
    result = query.execute()
    return result.data

@router.get("/rounds/{round_id}/milestones", response_model=List[MilestoneResponse])
async def get_milestones(round_id: str):
    result = supabase.table("milestones") \
        .select("*") \
        .eq("funding_round_id", round_id) \
        .order("milestone_index") \
        .execute()
    return result.data

@router.get("/transactions", response_model=List[OnChainTransaction])
async def list_transactions(round_id: Optional[str] = None):
    query = supabase.table("on_chain_transactions").select("*")
    if round_id:
        query = query.eq("funding_round_id", round_id)
    result = query.order("created_at", desc=True).execute()
    return result.data
```

**Helper functions needed**:
- `deploy_escrow_contract()`: builds Wasm deploy, sends to Casper, returns URef
- `mint_safe_nft()`: similar
- `get_startup_pubkey(startup_id)`: fetch startup's wallet address from DB (need to add column `wallet_pubkey` to startups table)

#### 3.4 Integrate into main.py

In `codequity-analytics/app/main.py`:

```python
from fastapi import FastAPI
from .routers import launchpad

app = FastAPI()
app.include_router(launchpad.router)
```

---

### Phase 4: Investor Frontend (1-2 days)

#### 4.1 Project Setup

```bash
cd casper_codequity
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd frontend
npx shadcn-ui@latest init  # Choose: default style, base color: neutral, CSS variables: yes
```

Install additional shadcn components:
```bash
npx shadcn-ui@latest add card button badge progress table alert dialog
```

Copy design tokens from `../design-system/codequity-finance/MASTER.md` into `frontend/src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');

:root {
  --color-primary: #0F172A;
  --color-secondary: #1E293B;
  --color-cta: #22C55E;
  --color-background: #020617;
  --color-text: #F8FAFC;
  --font-heading: 'Fira Code', monospace;
  --font-body: 'Fira Sans', sans-serif;
}

body {
  background: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-body);
}
```

#### 4.2 Folder Structure

```
frontend/src/
├── app/
│   ├── (investor)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard: list of rounds
│   │   ├── rounds/
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Round detail + milestones
│   │   │       └── components/
│   │   │           └── MilestoneTracker.tsx
│   │   └── startups/
│   │       └── [id]/
│   │           └── page.tsx      # Startup profile + create round button
│   └── api/                      # Optional: route handlers to proxy backend
├── components/
│   ├── ui/                       # shadcn components (auto-generated)
│   ├── launchpad/
│   │   ├── RoundCard.tsx
│   │   ├── MilestoneTracker.tsx
│   │   └── ScoreGauge.tsx
│   ├── startups/
│   │   └── StartupCard.tsx
│   └── shared/
│       ├── CryptoAddress.tsx
│       └── OnChainBadge.tsx
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── api.ts                    # typed fetch to backend
└── types/
    └── launchpad.ts
```

#### 4.3 Key Components

**RoundCard** (`components/launchpad/RoundCard.tsx`):

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { milisecondsToDuration } from "@/lib/utils";

interface RoundCardProps {
  round: {
    id: string;
    startup: { name: string; logo_url?: string };
    amount_cspr: number;
    status: 'draft' | 'active' | 'completed' | 'defaulted';
    milestones: Array<{ threshold_score: number; release_percent: number; released_at?: string }>;
    current_score?: number;
  };
}

export function RoundCard({ round }: RoundCardProps) {
  const releasedCount = round.milestones.filter(m => m.released_at).length;
  const progress = (releasedCount / round.milestones.length) * 100;

  return (
    <Card className="bg-secondary border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-heading">{round.startup.name}</CardTitle>
          <Badge variant={round.status === 'active' ? 'default' : 'secondary'}>
            {round.status}
          </Badge>
        </div>
        <p className="text-2xl font-bold text-cta">{round.amount_cspr.toFixed(2)} CSPR</p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Milestones Released</span>
            <span>{releasedCount}/{round.milestones.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {round.current_score && (
          <p className="text-sm text-muted-foreground">
            Current Score: <span className="font-bold text-cta">{round.current_score}</span>
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <Button asChild size="sm">
            <a href={`/investor/rounds/${round.id}`}>View Details</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`https://testnet.casper.network/contract/${round.escrow_contract_uref}`} target="_blank">
              Explorer
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

**MilestoneTracker** (component for round detail page):

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Milestone {
  milestone_index: number;
  threshold_score: number;
  release_percent: number;
  released_at?: string;
  tx_hash?: string;
}

export function MilestoneTracker({ milestones, currentScore }: { milestones: Milestone[]; currentScore: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Index</TableHead>
          <TableHead>Threshold</TableHead>
          <TableHead>Release %</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tx Hash</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {milestones.map(ms => (
          <TableRow key={ms.milestone_index}>
            <TableCell>{ms.milestone_index + 1}</TableCell>
            <TableCell>{ms.threshold_score}</TableCell>
            <TableCell>{ms.release_percent}%</TableCell>
            <TableCell>
              <Badge variant={ms.released_at ? 'default' : currentScore >= ms.threshold_score ? 'secondary' : 'outline'}>
                {ms.released_at ? 'Released' : currentScore >= ms.threshold_score ? 'Ready' : 'Pending'}
              </Badge>
            </TableCell>
            <TableCell>
              {ms.tx_hash ? (
                <a href={`https://testnet.casper.network/deploy/${ms.tx_hash}`} target="_blank" className="text-cta hover:underline">
                  {ms.tx_hash.slice(0, 8)}...
                </a>
              ) : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

#### 4.4 Pages

**Dashboard** (`app/(investor)/page.tsx`):

```tsx
import { RoundCard } from "@/components/launchpad/RoundCard";
import { supabase } from "@/lib/supabase";

async function getRounds() {
  const { data } = await supabase
    .from('funding_rounds')
    .select(`
      *,
      startup:startups(name, logo_url),
      milestones(*)
    `)
    .order('created_at', { ascending: false });
  return data;
}

export default async function InvestorDashboard() {
  const rounds = await getRounds();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-heading mb-8">My Funding Rounds</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rounds?.map(round => (
          <RoundCard key={round.id} round={round} />
        ))}
      </div>
    </div>
  );
}
```

**Round Detail** (`app/(investor)/rounds/[id]/page.tsx`):

```tsx
import { notFound } from "next/navigation";
import { MilestoneTracker } from "@/components/launchpad/MilestoneTracker";
import { Button } from "@/components/ui/button";
import { executeEvaluate } from "@/lib/api";

export default async function RoundDetailPage({ params }: { params: { id: string } }) {
  const { data: round } = await supabase
    .from('funding_rounds')
    .select(`
      *,
      startup:startups(*),
      milestones(*)
    `)
    .eq('id', params.id)
    .single();

  if (!round) return notFound();

  const { data: startup } = await supabase
    .from('startups')
    .select('traction_score')
    .eq('id', round.startup_id)
    .single();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-heading mb-2">{round.startup.name}</h1>
        <p className="text-muted-foreground">
          Round Amount: <span className="font-bold text-cta">{round.amount_cspr} CSPR</span>
        </p>
        <p className="text-muted-foreground">
          Current Score: <span className="font-bold text-cta">{startup.traction_score}/100</span>
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-heading mb-4">Milestones</h2>
        <MilestoneTracker milestones={round.milestones} currentScore={startup.traction_score} />
      </div>

      <div className="flex gap-4">
        <Button onClick={async () => {
          'use server';
          await executeEvaluate(round.id);
          // Revalidate page to show updated milestones
        }}>
          Force Evaluate
        </Button>
        <Button variant="outline" asChild>
          <a href={`https://testnet.casper.network/contract/${round.escrow_contract_uref}`} target="_blank">
            View Escrow on Explorer
          </a>
        </Button>
      </div>
    </div>
  );
}
```

#### 4.5 API Route for Evaluate (Server Action)

Create `frontend/src/app/api/rounds/[id]/evaluate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  // Call backend API
  const response = await fetch(`${process.env.BACKEND_URL}/api/launchpad/rounds/${params.id}/evaluate`, {
    headers: {
      'Authorization': `Bearer ${process.env.BACKEND_API_KEY}` // or use Supabase JWT
    }
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

---

### Phase 5: End-to-End Integration & Testing (1 day)

**Tasks**:

1. **Create test data**:
   - Ensure at least one startup exists with `traction_score` (e.g., 85)
   - Create a test investor record with wallet_pubkey

2. **Run full flow manually**:
   - `POST /api/launchpad/rounds` with JSON payload
   - Verify:
     - 200 OK response with round ID
     - Escrow contract deployed (check testnet explorer)
     - SAFE NFT minted
     - DB rows inserted
   - `POST /api/launchpad/rounds/{id}/evaluate`
   - Verify transaction appears on explorer
   - Milestone status updated to `released`
   - On-chain tx recorded

3. **Write automated test** (pytest + E2E):
   ```python
   def test_full_flow():
       # 1. Create round
       round_resp = client.post("/api/launchpad/rounds", json={...})
       assert round_resp.status_code == 200
       round_id = round_resp.json()["id"]

       # 2. Evaluate
       eval_resp = client.post(f"/api/launchpad/rounds/{round_id}/evaluate")
       assert eval_resp.status_code == 200

       # 3. Check DB
       milestone = supabase.table("milestones").select("*").eq("funding_round_id", round_id).execute()
       assert milestone.data[0]["tx_hash"] is not None

       # 4. Check on-chain (optional, can be slow)
   ```

4. **Error scenario testing**:
   - Score below threshold → no release
   - Already released milestone → should fail gracefully
   - Casper node down → retry logic

5. **Verification scripts**:
   - `scripts/verify_deployed.py`: checks all contracts exist
   - `scripts/reset_testnet.py`: cleanup test data

**Deliverable**:
- Passing end-to-end test
- Test report with screenshots of transactions on testnet explorer
- Known issues document

---

### Phase 6: Hackathon Submission (0.5 day)

#### 6.1 Demo Video (2-3 minutes)

Script outline:
1. **Introduction** (15s): "Hi, we're Codequity. We automate venture capital using AI and blockchain."
2. **Problem** (30s): "Manual milestone audits are slow, biased, and expensive. Founders wait months for disbursements."
3. **Solution** (45s): Show:
   - Startup dashboard with Traction Score 85
   - Investor creates funding round with milestones (threshold 80, 90)
   - Escrow contract deployed (show explorer)
   - Click "Evaluate" → on-chain release transaction (show explorer)
   - Milestone marked released in UI
4. **Tech Stack** (20s): "Our AI engine calculates scores. Casper smart contracts hold funds. Python backend orchestrates. Next.js frontend for investors."
5. **Why Casper** (20s): "Upgradeable contracts, predictable gas, native RWA support—perfect for real-world finance."
6. **Call to Action** (10s): "Vote for us on CSPR.fans!"

Record with OBS or screen recorder. Edit to remove dead air.

#### 6.2 GitHub Repository

Structure:
```
casper_codequity/
├── README.md                 # comprehensive: overview, setup, demo, architecture diagram
├── contracts/
├── python-sdk/
├── backend/
├── frontend/
├── supabase/migrations/
├── scripts/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT.md
├── .env.example
├── requirements.txt
├── docker-compose.yml (optional)
└── LICENSE (MIT)
```

README must include:
- **Project name**: Codequity Launchpad
- **Description**: AI-governed milestone funding on Casper
- **Live demo**: (if we deploy somewhere, e.g., Railway)
- **Testnet explorer links**: show at least one successful transaction
- **Setup instructions**: step-by-step to run locally
- **Architecture diagram** (ASCII or mermaid)
- **Team**: Karan (Codequity)

#### 6.3 DoraHacks Submission

- Title: "Codequity Launchpad: AI-Governed Milestone Funding on Casper"
- Tags: Agentic AI, DeFi, Real-World Assets, Casper Network, Blockchain
- Submission type: Project (GitHub repo)
- Attach: Demo video (YouTube unlisted), repo link, testnet explorer link
- Description: Concise (500 chars) highlighting automation, trustlessness, and existing Codequity infrastructure

#### 6.4 Community Vote

- Post in Codequity Discord/WhatsApp/Telegram
- Provide link to CSPR.fans voting page
- Offer incentive (maybe airdrop of future tokens? Or just ask for support)
- Mobilize 500+ community members to vote

---

## 6. Database Schema Details (for Reference)

Full SQL to be added:

```sql
-- Add wallet_pubkey column to startups and investors if needed
ALTER TABLE startups ADD COLUMN IF NOT EXISTS wallet_pubkey TEXT;
ALTER TABLE investors ADD COLUMN IF NOT EXISTS wallet_pubkey TEXT;

-- (Then the tables from earlier)
-- ... (as shown in Phase 3)
```

---

## 7. API Specification Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/launchpad/rounds` | Create funding round + deploy contracts | Admin (Supabase JWT) |
| GET | `/api/launchpad/rounds` | List rounds (filter by startup/investor) | Public |
| GET | `/api/launchpad/rounds/{id}` | Get round with milestones | Public |
| POST | `/api/launchpad/rounds/{id}/evaluate` | Trigger score check & release | Admin |
| GET | `/api/launchpad/rounds/{id}/milestones` | List milestones | Public |
| GET | `/api/launchpad/transactions` | List on-chain txs | Public |
| POST | `/api/launchpad/webhook/score-update` | Called by Supabase when startup score changes | Secret signature |

---

## 8. Smart Contract ABIs (Conceptual)

### EscrowVault

State:
```
owner: PublicKey
milestones: Vec<Milestone> = [
  { threshold: u16, amount_percent: u8, released: bool },
  ...
]
balance: URef
```

Actions (entry points):
- `init(owner, milestones, initial_deposit)`
- `deposit(amount)`
- `release(milestone_index)`
- `get_balance() -> URef`
- `get_milestone(index) -> Milestone`

Events:
- `Deposited { from: PublicKey, amount: URef }`
- `MilestoneReleased { index: u8, amount: URef, to: PublicKey }`

### SAFEToken

State:
```
owner: PublicKey
metadata: Mapping<token_id: U64, Metadata>
balances: Mapping<PublicKey, Vec<U64>>
total_supply: U64
```

Metadata struct:
```
{
  funding_round_id: String,
  investor: PublicKey,
  startup: PublicKey,
  terms_hash: String
}
```

Actions:
- `init(funding_round_id, investor, startup, terms_hash)`
- `mint(to) -> token_id`
- `transfer(token_id, to)`

---

## 9. Environment Variables

**Backend (.env)**:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
CASPER_NODE_URL=https://testnet.casper.network
AGENT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
ESCROW_CONTRACT_UREF=...
SAFE_CONTRACT_UREF=...
BACKEND_API_KEY=... (optional for protecting admin endpoints)
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
BACKEND_URL=http://localhost:8000  # or deployed backend URL
```

---

## 10. Testing Strategy

| Level | Tool | Coverage |
|-------|------|----------|
| Unit (contracts) | `odra test` | Milestone release logic, deposit |
| Unit (Python) | pytest | `casper_client` functions, API route handlers (mocked) |
| Integration | pytest + live Casper testnet | Full flow: deploy → fund → release |
| E2E (Frontend) | Cypress or Playwright (optional) | Investor dashboard UI flows |
| Manual | Testnet explorer verification | Every transaction visible on chain |

**Testnet accounts**:
- Agent keypair (owner of contracts)
- Test startup wallet (recipient)
- Test investor wallet (funder)

Fund via faucet: `https://testnet-faucet.casper.network/`

---

## 11. Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Odra contract bugs | Medium | High | Extensive unit tests; start simple; use official examples |
| Casper RPC signing complex | High | Medium | Use subprocess wrapper with `casper-client` binary for MVP |
| Time shortage | High | High | Prioritize: escrow release > x402 > MCP; cut non-essential UI |
| Testnet instability | Medium | Medium | Use retries; log errors; have manual fallback demo video |
| Backend API auth issues | Low | Medium | Temporarily disable auth for MVP; use IP allowlist or simple API key |
| On-chain transaction delays | Low | Low | Casper has instant finality; but monitor for ~3s block time |

---

## 12. Post-Hackathon Roadmap

After July 7, regardless of result:

1. **Production smart contracts**:
   - Add upgrade mechanism (upgradeable contracts)
   - Multi-sig support for large rounds
   - Pause/emergency stop
2. **x402 monetization**:
   - Charge external agents per score lookup
   - Implement HTTP 402 in FastAPI
3. **MCP server**:
   - Expose scoring as MCP tool for Claude Desktop, Cursor, etc.
4. **Enhanced UI**:
   - Analytics dashboard for investors
   - Mobile responsiveness
   - Dark theme polish
5. **Legal**:
   - SAFE template review
   - Terms of service
   - Compliance with securities laws (if tokenized)
6. **On-chain oracle**:
   - Periodically hash scoring algorithm and anchor to Casper
   - Validator signature collection for attestation

---

## 13. Success Criteria

### Minimum (Qualify for Finals)

- [ ] One successful on-chain transaction on Casper testnet (release_funds)
- [ ] GitHub repository with complete, runnable code (MIT license)
- [ ] README with setup instructions and demo screenshots
- [ ] 2-minute demo video uploaded
- [ ] Submission on DoraHacks before deadline

### Stretch (Get to Top 3)

- [ ] Transaction traceable on testnet explorer (linked in submission)
- [ ] Multiple milestones demo
- [ ] User-friendly investor dashboard (not just API)
- [ ] Community vote campaign mobilizing 500+ votes
- [ ] Clean, professional code quality

---

## 14. Immediate Next Steps

1. **User approval**: Confirm plan and key decisions
2. **Create folder structure** inside `casper_codequity/`
3. **Set up Rust + Odra** and write EscrowVault contract (minimal viable)
4. **Deploy to testnet** manually to get URefs
5. **Write Python casper_client** (start with subprocess wrapper)
6. **Add database migrations** to `codequity-analytics`
7. **Implement FastAPI endpoints** (create_round, evaluate)
8. **Test end-to-end** with real testnet
9. **Build frontend** (Next.js) with RoundCard, Dashboard
10. **Record demo video** and submit

---

## Appendices

### A. Casper Testnet Resources

- Faucet: https://testnet-faucet.casper.network/
- Explorer: https://testnet.casper.network/ or https://cspr.live
- Node RPC: https://testnet.casper.network/rpc
- Documentation: https://docs.casper.network/

### B. Useful Commands

**Odra**:
```bash
odra build --release
odra test
odra new <contract_name>
```

**Casper client**:
```bash
casper-client get-balance --node https://testnet.casper.network --public-key <hex>
casper-client put-deploy --node ... --secret-key ... --session-hash ...
```

**Supabase**:
```bash
supabase db push  # apply migrations
supabase functions deploy score-startup
```

### C. Existing Code References

- Startup scoring agent: `codequity-analytics/app/agents/startup_scorer.py`
- Supabase client: `codequity-analytics/app/db/supabase.py`
- Frontend design: `design-system/codequity-finance/MASTER.md`
- Edge function: `supabase/functions/score-startup/index.ts`

---

**Document Version**: 0.1  
**Last Updated**: 2026-06-30  
**Author**: Claude (with Karan)