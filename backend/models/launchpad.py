from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class MilestoneCreate(BaseModel):
    threshold_score: int = Field(..., ge=0, le=100, description="Traction score threshold (0–100)")
    release_percent: float = Field(..., ge=0, le=100, description="Percent of escrow to release")


class FundingRoundCreate(BaseModel):
    startup_id: str
    investor_id: str
    amount_cspr: float = Field(..., gt=0)
    milestones: List[MilestoneCreate]


class MilestoneResponse(BaseModel):
    id: str
    funding_round_id: str
    milestone_index: int
    threshold_score: int
    release_percent: float
    released_at: Optional[datetime] = None
    tx_hash: Optional[str] = None


class FundingRoundResponse(BaseModel):
    id: str
    startup_id: str
    investor_id: str
    amount_cspr: float
    escrow_contract_uref: str
    safe_nft_mint_hash: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None


class EvaluateResponse(BaseModel):
    released: bool
    current_score: int
    round_id: str
    milestones_released: List[str] = []
    message: str


class OnChainTransactionResponse(BaseModel):
    id: str
    funding_round_id: Optional[str] = None
    transaction_hash: str
    block_hash: Optional[str] = None
    contract_uref: str
    amount_motes: Optional[float] = None
    action: str
    status: str
    casper_response: Optional[dict] = None
    created_at: datetime
