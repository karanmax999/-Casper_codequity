-- 202607010000_add_wallet_pubkey.sql
-- Add wallet_pubkey column to startups and investors tables

-- Add wallet_pubkey to startups
ALTER TABLE startups ADD COLUMN IF NOT EXISTS wallet_pubkey TEXT;

-- Add wallet_pubkey to investors
ALTER TABLE investors ADD COLUMN IF NOT EXISTS wallet_pubkey TEXT;

-- Create indexes for quick lookup (optional but useful)
CREATE INDEX IF NOT EXISTS idx_startups_wallet_pubkey ON startups(wallet_pubkey) WHERE wallet_pubkey IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_investors_wallet_pubkey ON investors(wallet_pubkey) WHERE wallet_pubkey IS NOT NULL;