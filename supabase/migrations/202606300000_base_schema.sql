-- 202606300000_base_schema.sql
-- Create base schema for startups and investors

-- Enable uuid-ossp if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: startups
CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT,
    logo_url TEXT,
    description TEXT,
    github_url TEXT,
    traction_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: investors
CREATE TABLE IF NOT EXISTS investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    firm TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
