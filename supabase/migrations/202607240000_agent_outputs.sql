-- 202607240000_agent_outputs.sql
-- Durable AI agent proof records for startup scoring and round release decisions.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS agent_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    output_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_outputs_startup_type_created_at
    ON agent_outputs(startup_id, agent_type, created_at DESC);

ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view agent_outputs" ON agent_outputs;
CREATE POLICY "Public can view agent_outputs"
    ON agent_outputs FOR SELECT
    USING (true);

-- Inserts and updates are performed by the backend with the Supabase service role.
