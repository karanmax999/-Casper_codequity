"""
Launchpad API router: handles funding rounds, milestones, and on-chain transaction tracking.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, Header, BackgroundTasks
from pydantic import BaseModel, Field
from supabase import create_client, Client
import os

# Router definition
router = APIRouter(prefix="/api/launchpad", tags=["launchpad"])

# Supabase client (service role for admin operations)
def get_supabase() -> Client:
    return create_client(
        os.getenv("SUPABASE_URL", ""),
        os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    )

# Simple admin auth via API key
def verify_admin_key(x_admin_key: str = Header(..., alias="X-Admin-Key")) -> None:
    expected_key = os.getenv("ADMIN_API_KEY", "")
    if not expected_key or x_admin_key != expected_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")

# ==================== Pydantic Models ====================

class MilestoneCreate(BaseModel):
    threshold_score: int = Field(..., ge=0, le=100)
    release_percent: float = Field(..., ge=0, le=100)

class FundingRoundCreate(BaseModel):
    startup_id: str
    investor_id: str
    amount_cspr: float = Field(..., gt=0)
    milestones: List[MilestoneCreate]

class MilestoneResponse(BaseModel):
    id: str
    milestone_index: int
    threshold_score: int
    release_percent: float
    released_at: Optional[datetime]
    tx_hash: Optional[str]

class FundingRoundResponse(BaseModel):
    id: str
    startup_id: str
    investor_id: str
    amount_cspr: float
    escrow_contract_uref: str
    safe_nft_mint_hash: Optional[str]
    status: str
    created_at: datetime
    milestones: List[MilestoneResponse] = []

class OnChainTransaction(BaseModel):
    id: str
    funding_round_id: Optional[str]
    transaction_hash: str
    action: str
    status: str
    created_at: datetime

# ==================== Helper Functions ====================

async def deploy_escrow_contract(
    supabase: Client,
    owner_pubkey: str,
    milestones_data: List[MilestoneCreate],
    amount_cspr: float
) -> str:
    """
    Placeholder: Teammate will implement actual Casper deployment.
    For now, we return a dummy URef.
    """
    # TODO: Replace with actual Casper contract deployment
    # This should call the Python-Casper SDK to deploy EscrowVault
    dummy_uref = f"uref-{uuid.uuid4().hex[:16]}"
    return dummy_uref

async def mint_safe_nft(
    supabase: Client,
    round_id: str,
    investor_pubkey: str,
    startup_pubkey: str,
    terms_hash: str = ""
) -> str:
    """
    Placeholder: Teammate will implement SAFE NFT minting.
    Returns the transaction hash.
    """
    # TODO: Call Casper SAFEToken contract
    dummy_hash = f"hash-{uuid.uuid4().hex}"
    return dummy_hash

def get_startup_pubkey(supabase: Client, startup_id: str) -> str:
    resp = supabase.table("startups").select("wallet_pubkey").eq("id", startup_id).single().execute()
    if not resp.data or not resp.data.get("wallet_pubkey"):
        raise HTTPException(status_code=400, detail="Startup has no wallet_pubkey set")
    return resp.data["wallet_pubkey"]

def get_investor_pubkey(supabase: Client, investor_id: str) -> str:
    resp = supabase.table("investors").select("wallet_pubkey").eq("id", investor_id).single().execute()
    if not resp.data or not resp.data.get("wallet_pubkey"):
        raise HTTPException(status_code=400, detail="Investor has no wallet_pubkey set")
    return resp.data["wallet_pubkey"]

# ==================== API Endpoints ====================

@router.post("/rounds", response_model=FundingRoundResponse)
async def create_funding_round(
    body: FundingRoundCreate,
    background_tasks: BackgroundTasks,
    supabase: Client = Depends(get_supabase),
    _: None = Depends(verify_admin_key)
):
    """
    Create a new funding round with Casper escrow and SAFE NFT.
    Requires admin API key.
    """
    # Validate startup and investor exist
    startup = supabase.table("startups").select("id, name").eq("id", body.startup_id).execute()
    if not startup.data:
        raise HTTPException(404, "Startup not found")

    investor = supabase.table("investors").select("id, name").eq("id", body.investor_id).execute()
    if not investor.data:
        raise HTTPException(404, "Investor not found")

    # Get wallet pubkeys
    startup_pubkey = get_startup_pubkey(supabase, body.startup_id)
    investor_pubkey = get_investor_pubkey(supabase, body.investor_id)

    # Deploy EscrowVault contract
    escrow_uref = await deploy_escrow_contract(
        supabase=supabase,
        owner_pubkey=investor_pubkey,  # For now, investor is the owner; later it will be the Codequity Agent
        milestones_data=body.milestones,
        amount_cspr=body.amount_cspr
    )

    # Mint SAFE NFT
    safe_nft_hash = await mint_safe_nft(
        supabase=supabase,
        round_id=str(uuid.uuid4()),  # temporary; will be replaced after DB insert
        investor_pubkey=investor_pubkey,
        startup_pubkey=startup_pubkey,
        terms_hash=""  # TODO: generate or upload IPFS hash
    )

    # Insert funding round
    round_insert = supabase.table("funding_rounds").insert({
        "startup_id": body.startup_id,
        "investor_id": body.investor_id,
        "amount_cspr": body.amount_cspr,
        "escrow_contract_uref": escrow_uref,
        "safe_nft_mint_hash": safe_nft_hash,
        "status": "active"
    }).execute()
    round_record = round_insert.data[0]
    round_id = round_record["id"]

    # Insert milestones
    for idx, ms in enumerate(body.milestones):
        supabase.table("milestones").insert({
            "funding_round_id": round_id,
            "milestone_index": idx,
            "threshold_score": ms.threshold_score,
            "release_percent": ms.release_percent,
            "released_at": None,
            "tx_hash": None
        }).execute()

    # Record on_chain_transaction for escrow deployment
    supabase.table("on_chain_transactions").insert({
        "funding_round_id": round_id,
        "transaction_hash": escrow_uref,  # For now, use dummy; later real tx hash
        "contract_uref": escrow_uref,
        "action": "create_escrow",
        "status": "success",
        "casper_response": {"note": "demo mode"}
    }).execute()

    # Fetch round with milestones for response
    result = supabase.table("funding_rounds") \
        .select("*, milestones(*)") \
        .eq("id", round_id) \
        .single() \
        .execute()
    return result.data

@router.post("/rounds/{round_id}/evaluate")
async def evaluate_round(
    round_id: str,
    supabase: Client = Depends(get_supabase),
    _: None = Depends(verify_admin_key)
):
    """
    Check current startup score and release any milestones that meet thresholds.
    Requires admin API key.
    """
    # Get round
    round_row = supabase.table("funding_rounds").select("*").eq("id", round_id).single().execute()
    if not round_row.data:
        raise HTTPException(404, "Funding round not found")
    round_data = round_row.data
    startup_id = round_data["startup_id"]

    # Get latest traction_score
    startup = supabase.table("startups").select("traction_score").eq("id", startup_id).single().execute()
    if not startup.data:
        raise HTTPException(404, "Startup not found")
    current_score = startup.data["traction_score"]

    # Get unreleased milestones
    milestones = supabase.table("milestones") \
        .select("*") \
        .eq("funding_round_id", round_id) \
        .is_("released_at", None) \
        .order("milestone_index") \
        .execute() \
        .data

    released_any = False
    for ms in milestones:
        if current_score >= ms["threshold_score"]:
            # TODO: Call actual Casper release_funds via teammate's integration
            # For now, mark as released with dummy tx hash
            dummy_tx = f"tx-{uuid.uuid4().hex[:16]}"
            supabase.table("milestones") \
                .update({"released_at": datetime.utcnow().isoformat(), "tx_hash": dummy_tx}) \
                .eq("id", ms["id"]).execute()

            supabase.table("on_chain_transactions").insert({
                "funding_round_id": round_id,
                "transaction_hash": dummy_tx,
                "contract_uref": round_data["escrow_contract_uref"],
                "action": "release_funds",
                "status": "success"
            }).execute()
            released_any = True

    if released_any:
        # Check if all milestones released
        remaining = supabase.table("milestones") \
            .select("id") \
            .eq("funding_round_id", round_id) \
            .is_("released_at", None) \
            .execute() \
            .data
        if not remaining:
            supabase.table("funding_rounds") \
                .update({"status": "completed"}) \
                .eq("id", round_id).execute()

    return {"released": released_any, "current_score": current_score, "round_id": round_id}

@router.get("/rounds", response_model=List[FundingRoundResponse])
async def list_rounds(
    startup_id: Optional[str] = None,
    investor_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    """List funding rounds with optional filters."""
    query = supabase.table("funding_rounds").select("*, milestones(*)")
    if startup_id:
        query = query.eq("startup_id", startup_id)
    if investor_id:
        query = query.eq("investor_id", investor_id)
    result = query.order("created_at", desc=True).execute()
    return result.data

@router.get("/rounds/{round_id}", response_model=FundingRoundResponse)
async def get_round(round_id: str, supabase: Client = Depends(get_supabase)):
    """Get a specific funding round with milestones."""
    result = supabase.table("funding_rounds") \
        .select("*, milestones(*)") \
        .eq("id", round_id) \
        .single() \
        .execute()
    if not result.data:
        raise HTTPException(404, "Funding round not found")
    return result.data

@router.get("/transactions", response_model=List[OnChainTransaction])
async def list_transactions(
    round_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    """List on-chain transactions, optionally filtered by round."""
    query = supabase.table("on_chain_transactions").select("*")
    if round_id:
        query = query.eq("funding_round_id", round_id)
    result = query.order("created_at", desc=True).execute()
    return result.data

# Export router for inclusion in main FastAPI app
__all__ = ["router"]