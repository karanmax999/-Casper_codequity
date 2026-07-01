"""
launchpad.py — FastAPI router for all Codequity Launchpad API endpoints.

Endpoints:
  POST /api/launchpad/rounds              - Create a new funding round
  GET  /api/launchpad/rounds              - List all rounds (filterable)
  GET  /api/launchpad/rounds/{id}         - Get round details + milestones
  POST /api/launchpad/rounds/{id}/evaluate - Evaluate score and release milestones
  GET  /api/launchpad/rounds/{id}/milestones - List milestones for a round
  GET  /api/launchpad/transactions        - List on-chain transactions
"""

import logging
import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from supabase import create_client, Client

from models.launchpad import (
    FundingRoundCreate,
    FundingRoundResponse,
    MilestoneResponse,
    EvaluateResponse,
    OnChainTransactionResponse,
)
from casper_client import casper_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/launchpad", tags=["launchpad"])


# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return create_client(url, key)


def require_admin_key(x_admin_key: str = Header(...)):
    """Simple API-key auth for admin-only write endpoints."""
    expected = os.getenv("ADMIN_API_KEY", "")
    if not expected:
        raise HTTPException(status_code=500, detail="ADMIN_API_KEY not configured on server")
    if x_admin_key != expected:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    return x_admin_key


# ---------------------------------------------------------------------------
# POST /api/launchpad/rounds — Create a funding round
# ---------------------------------------------------------------------------

@router.post("/rounds", response_model=FundingRoundResponse)
async def create_funding_round(
    data: FundingRoundCreate,
    _: str = Depends(require_admin_key),
    supabase: Client = Depends(get_supabase),
):
    """
    Create a funding round:
    1. Validate startup + investor exist
    2. Deploy EscrowVault (mock or live)
    3. Mint SAFE NFT (mock or live)
    4. Insert funding_round + milestones + on_chain_transactions rows
    """
    # Validate total milestone percentages
    total_pct = sum(m.release_percent for m in data.milestones)
    if abs(total_pct - 100.0) > 0.01:
        raise HTTPException(status_code=400, detail=f"Milestone release_percent must total 100 (got {total_pct})")

    # 1. Validate startup
    startup_res = supabase.table("startups").select("id, name, wallet_pubkey").eq("id", data.startup_id).maybe_single().execute()
    if not startup_res.data:
        raise HTTPException(status_code=404, detail="Startup not found")
    startup = startup_res.data

    # 2. Validate investor
    investor_res = supabase.table("investors").select("id, name, wallet_pubkey").eq("id", data.investor_id).maybe_single().execute()
    if not investor_res.data:
        raise HTTPException(status_code=404, detail="Investor not found")
    investor = investor_res.data

    # 3. Deploy EscrowVault
    try:
        deploy_tx_hash, contract_uref = casper_client.deploy_escrow_contract(
            owner_pubkey=casper_client.public_key_hex if not casper_client.mock else "mock-agent-pubkey",
            milestones=[m.model_dump() for m in data.milestones],
            amount_cspr=data.amount_cspr,
        )
    except Exception as exc:
        logger.error("EscrowVault deploy failed: %s", exc)
        raise HTTPException(status_code=502, detail=f"Failed to deploy escrow contract: {exc}")

    # 4. Mint SAFE NFT
    try:
        safe_tx_hash = casper_client.mint_safe_nft(
            round_id="pending",
            investor_pubkey=investor.get("wallet_pubkey") or "unknown",
            startup_pubkey=startup.get("wallet_pubkey") or "unknown",
        )
    except Exception as exc:
        logger.warning("SAFE NFT mint failed (non-critical): %s", exc)
        safe_tx_hash = None

    # 5. Insert funding_round
    round_insert = supabase.table("funding_rounds").insert({
        "startup_id": data.startup_id,
        "investor_id": data.investor_id,
        "amount_cspr": data.amount_cspr,
        "escrow_contract_uref": contract_uref,
        "safe_nft_mint_hash": safe_tx_hash,
        "status": "active",
    }).execute()

    if not round_insert.data:
        raise HTTPException(status_code=500, detail="Failed to insert funding round into database")

    round_row = round_insert.data[0]
    round_id = round_row["id"]

    # 6. Insert milestones
    milestone_rows = [
        {
            "funding_round_id": round_id,
            "milestone_index": idx,
            "threshold_score": m.threshold_score,
            "release_percent": m.release_percent,
            "released_at": None,
            "tx_hash": None,
        }
        for idx, m in enumerate(data.milestones)
    ]
    supabase.table("milestones").insert(milestone_rows).execute()

    # 7. Record the escrow deploy transaction
    supabase.table("on_chain_transactions").insert({
        "funding_round_id": round_id,
        "transaction_hash": deploy_tx_hash,
        "contract_uref": contract_uref,
        "action": "create_escrow",
        "status": "success",
        "casper_response": {"mock": casper_client.mock, "deploy_tx_hash": deploy_tx_hash},
    }).execute()

    if safe_tx_hash:
        supabase.table("on_chain_transactions").insert({
            "funding_round_id": round_id,
            "transaction_hash": safe_tx_hash,
            "contract_uref": contract_uref,
            "action": "mint_safe",
            "status": "success",
            "casper_response": {"mock": casper_client.mock},
        }).execute()

    logger.info("Created funding round %s (escrow=%s, mock=%s)", round_id, contract_uref, casper_client.mock)
    return FundingRoundResponse(**round_row)


# ---------------------------------------------------------------------------
# POST /api/launchpad/rounds/{round_id}/evaluate — Score check + release
# ---------------------------------------------------------------------------

@router.post("/rounds/{round_id}/evaluate", response_model=EvaluateResponse)
async def evaluate_round(
    round_id: str,
    _: str = Depends(require_admin_key),
    supabase: Client = Depends(get_supabase),
):
    """
    Evaluate a round's current startup score against unreleased milestones.
    For each milestone where score >= threshold: call release_funds on escrow,
    update the milestone record, and log the on-chain transaction.
    """
    # Fetch the round
    round_res = supabase.table("funding_rounds").select("*").eq("id", round_id).maybe_single().execute()
    if not round_res.data:
        raise HTTPException(status_code=404, detail="Funding round not found")
    round_row = round_res.data

    if round_row["status"] == "completed":
        return EvaluateResponse(
            released=False,
            current_score=0,
            round_id=round_id,
            message="Round is already completed.",
        )

    # Fetch startup traction score
    startup_res = supabase.table("startups").select("traction_score, wallet_pubkey").eq("id", round_row["startup_id"]).maybe_single().execute()
    if not startup_res.data:
        raise HTTPException(status_code=404, detail="Startup not found")
    current_score: int = startup_res.data.get("traction_score") or 0
    startup_pubkey: str = startup_res.data.get("wallet_pubkey") or "unknown"

    # Fetch unreleased milestones ordered by index
    milestones_res = supabase.table("milestones") \
        .select("*") \
        .eq("funding_round_id", round_id) \
        .is_("released_at", "null") \
        .order("milestone_index") \
        .execute()
    unreleased = milestones_res.data or []

    released_ids: List[str] = []

    for ms in unreleased:
        if current_score < ms["threshold_score"]:
            logger.debug(
                "Milestone %d skipped — score %d < threshold %d",
                ms["milestone_index"], current_score, ms["threshold_score"],
            )
            continue

        # Release this milestone
        try:
            tx_hash = casper_client.release_funds(
                contract_uref=round_row["escrow_contract_uref"],
                milestone_index=ms["milestone_index"],
                recipient_pubkey=startup_pubkey,
                current_score=current_score,
            )
        except Exception as exc:
            logger.error("release_funds failed for milestone %s: %s", ms["id"], exc)
            # Log failed tx and continue to next milestone
            supabase.table("on_chain_transactions").insert({
                "funding_round_id": round_id,
                "transaction_hash": "failed",
                "contract_uref": round_row["escrow_contract_uref"],
                "action": "release_funds",
                "status": "failed",
                "casper_response": {"error": str(exc)},
            }).execute()
            continue

        # Mark milestone as released
        supabase.table("milestones").update({
            "released_at": "now()",
            "tx_hash": tx_hash,
        }).eq("id", ms["id"]).execute()

        # Log successful transaction
        supabase.table("on_chain_transactions").insert({
            "funding_round_id": round_id,
            "transaction_hash": tx_hash,
            "contract_uref": round_row["escrow_contract_uref"],
            "action": "release_funds",
            "status": "success",
            "casper_response": {
                "mock": casper_client.mock,
                "milestone_index": ms["milestone_index"],
                "score": current_score,
            },
        }).execute()

        released_ids.append(ms["id"])
        logger.info(
            "Released milestone %d for round %s — tx=%s (mock=%s)",
            ms["milestone_index"], round_id, tx_hash, casper_client.mock,
        )

    # Check if all milestones are now released → mark round completed
    all_milestones_res = supabase.table("milestones") \
        .select("id") \
        .eq("funding_round_id", round_id) \
        .is_("released_at", "null") \
        .execute()

    if not (all_milestones_res.data or []):
        supabase.table("funding_rounds").update({"status": "completed"}).eq("id", round_id).execute()

    released = bool(released_ids)
    msg = (
        f"Released {len(released_ids)} milestone(s)." if released
        else f"No milestones ready. Current score {current_score} is below all remaining thresholds."
    )

    return EvaluateResponse(
        released=released,
        current_score=current_score,
        round_id=round_id,
        milestones_released=released_ids,
        message=msg,
    )


# ---------------------------------------------------------------------------
# GET /api/launchpad/rounds — List rounds
# ---------------------------------------------------------------------------

@router.get("/rounds", response_model=List[FundingRoundResponse])
async def list_rounds(
    startup_id: Optional[str] = None,
    investor_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("funding_rounds").select("*").order("created_at", desc=True)
    if startup_id:
        query = query.eq("startup_id", startup_id)
    if investor_id:
        query = query.eq("investor_id", investor_id)
    result = query.execute()
    return result.data or []


# ---------------------------------------------------------------------------
# GET /api/launchpad/rounds/{round_id} — Round detail
# ---------------------------------------------------------------------------

@router.get("/rounds/{round_id}", response_model=FundingRoundResponse)
async def get_round(round_id: str, supabase: Client = Depends(get_supabase)):
    res = supabase.table("funding_rounds").select("*").eq("id", round_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Funding round not found")
    return res.data


# ---------------------------------------------------------------------------
# GET /api/launchpad/rounds/{round_id}/milestones — List milestones
# ---------------------------------------------------------------------------

@router.get("/rounds/{round_id}/milestones", response_model=List[MilestoneResponse])
async def get_milestones(round_id: str, supabase: Client = Depends(get_supabase)):
    res = supabase.table("milestones") \
        .select("*") \
        .eq("funding_round_id", round_id) \
        .order("milestone_index") \
        .execute()
    return res.data or []


# ---------------------------------------------------------------------------
# GET /api/launchpad/transactions — List on-chain transactions
# ---------------------------------------------------------------------------

@router.get("/transactions", response_model=List[OnChainTransactionResponse])
async def list_transactions(
    round_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("on_chain_transactions") \
        .select("*") \
        .order("created_at", desc=True)
    if round_id:
        query = query.eq("funding_round_id", round_id)
    result = query.execute()
    return result.data or []
