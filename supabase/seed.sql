-- supabase/seed.sql
-- Seed data for Codequity Launchpad

-- Insert mock startups
INSERT INTO startups (id, name, slug, description, github_url, traction_score, wallet_pubkey)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111', 
        'EcoSphere Systems', 
        'ecosphere', 
        'AI-powered ecological data analytics and carbon credit verification platform.', 
        'https://github.com/ecosphere/analytics', 
        85, 
        '02034c0d05bc3b5fdb3f661a085d331895a37060982de4c61117487c2de521456b82'
    ),
    (
        '22222222-2222-2222-2222-222222222222', 
        'ZeroWaste Core', 
        'zerowaste', 
        'Decentralized supply chain optimization and resource allocation ledger.', 
        'https://github.com/zerowaste/core', 
        50, 
        '02034c0d05bc3b5fdb3f661a085d331895a37060982de4c61117487c2de521456b82'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert mock investors
INSERT INTO investors (id, name, firm, wallet_pubkey)
VALUES 
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
        'Alice Venture Partner', 
        'Genesis Capital', 
        '02034c0d05bc3b5fdb3f661a085d331895a37060982de4c61117487c2de521456b82'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
        'Bob Angel Investor', 
        'Cascade Syndicate', 
        '02034c0d05bc3b5fdb3f661a085d331895a37060982de4c61117487c2de521456b82'
    )
ON CONFLICT (id) DO NOTHING;
