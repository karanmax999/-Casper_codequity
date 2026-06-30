-- 202607010002_launchpad_tables.sql
-- Create funding_rounds, milestones, and on_chain_transactions tables

-- Enable uuid-ossp if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: funding_rounds
CREATE TABLE funding_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    amount_cspr NUMERIC NOT NULL,
    escrow_contract_uref TEXT NOT NULL,
    safe_nft_mint_hash TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
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
    action TEXT NOT NULL CHECK (action IN ('release_funds', 'create_escrow', 'mint_safe', 'deposit')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    casper_response JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_funding_rounds_startup ON funding_rounds(startup_id);
CREATE INDEX idx_funding_rounds_investor ON funding_rounds(investor_id);
CREATE INDEX idx_milestones_round ON milestones(funding_round_id);
CREATE INDEX idx_transactions_round ON on_chain_transactions(funding_round_id);
CREATE INDEX idx_transactions_contract ON on_chain_transactions(contract_uref);

-- Row Level Security
ALTER TABLE funding_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE on_chain_transactions ENABLE ROW LEVEL SECURITY;

-- Public read policies (for investor dashboard)
DROP POLICY IF EXISTS "Public can view funding_rounds" ON funding_rounds;
CREATE POLICY "Public can view funding_rounds" ON funding_rounds FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view milestones" ON milestones;
CREATE POLICY "Public can view milestones" ON milestones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view on_chain_transactions" ON on_chain_transactions;
CREATE POLICY "Public can view on_chain_transactions" ON on_chain_transactions FOR SELECT USING (true);

-- Service role can do everything (handled by Supabase default)