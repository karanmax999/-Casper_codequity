-- Migration: 202607040000_add_investor_approval.sql

-- Add approval and auth linking columns
ALTER TABLE investors
  ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investors_user_id ON investors(user_id);
CREATE INDEX IF NOT EXISTS idx_investors_approved ON investors(approved);
