# Codequity Launchpad - Investor Portal

This is the investor-facing frontend for the Codequity x Casper Launchpad. It works in conjunction with the existing `codequity-analytics` FastAPI backend to display funding rounds, milestones, and on-chain transaction status.

## Features

- Dashboard of all funding rounds
- Round detail view with milestone tracker
- Admin interface to create new funding rounds
- Automatic score evaluation (via backend)
- Integration with Casper testnet explorer

## Tech Stack

- Next.js 16 (App Router, Server Components, Server Actions)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Supabase (direct data access)
- FastAPI backend (launchpad endpoints)

## Prerequisites

- Node.js 20+
- Python 3.11+ (backend)
- Supabase project with updated schema
- Casper testnet access (for backend integration)

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Initialize shadcn/ui

```bash
npx shadcn-ui@latest init
# Choose: default style, base color: neutral, CSS variables: yes
```

Then add required components:

```bash
npx shadcn-ui@latest add button card badge progress table input label
```

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BACKEND_URL=http://localhost:8000  # or your deployed backend URL
```

**Note**: The backend must have `ADMIN_API_KEY` set (see backend setup).

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Setup (codequity-analytics)

1. Apply the database migrations from `casper_codequity/supabase/migrations` to your Supabase project. You can use the Supabase CLI or run the SQL manually in the Supabase dashboard.

2. Add the following environment variables to `codequity-analytics/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_API_KEY=some_secret_key_for_admin_endpoints
# ... other existing vars like ANTHROPIC_API_KEY
```

3. Ensure the `launchpad` router is included in `app/main.py` (already done in this branch).

4. Start the backend:

```bash
cd codequity-analytics
uvicorn app.main:app --reload
```

The backend should now serve endpoints under `/api/launchpad`.

## Database Preparation

Before creating funding rounds:

- Ensure `startups` and `investors` records have a `wallet_pubkey` field populated with the Casper public key (hex string). This is required for contract interactions.
- The `traction_score` on startups should be maintained by the existing scoring agent.

## Admin Panel

Visit `/admin/rounds/create` (requires the admin API key to be set in backend). You need to be logged in? Actually the admin panel itself doesn't have auth; the server action uses the backend's admin key. So only trusted users should have access to this page in production (consider adding your own auth later).

## How It Works

1. Admin creates a funding round, selecting a startup and investor, setting amount and milestones.
2. Backend receives the request, validates, and (placeholder) deploys an EscrowVault contract and mints a SAFE NFT. In production, this will generate on-chain contracts.
3. The round appears in the dashboard.
4. The Codequity scoring agent periodically updates each startup's `traction_score`.
5. When the score exceeds a milestone threshold, an admin (or automated process) can click "Force Evaluate" to trigger release. The backend checks the score and marks the milestone as released, recording the on-chain transaction.
6. Milestones show as "Ready" when score >= threshold, and "Released" after transaction.

For the hackathon demo, you will manually trigger evaluation to show the on-chain transaction.

## Integrating with Casper (Teammate)

The following functions in `codequity-analytics/app/routers/launchpad.py` are placeholders and need implementation:

- `deploy_escrow_contract()` - deploy the EscrowVault Odra contract to Casper testnet, initialize with milestones, and return the contract URef.
- `mint_safe_nft()` - mint the SAFEToken NFT representing the funding agreement, return tx hash.

Also, `evaluate_round` currently marks milestones released with dummy tx hashes. Replace the dummy code with a call to `escrow_contract.release(milestone_index)` via the Casper RPC client.

The Python Casper client should be implemented in a new module (e.g., `casper_client.py`) with methods:
- `release_funds(contract_uref, milestone_index, recipient_pubkey) -> tx_hash`

## Testing

1. Create a test startup (via seed or directly in DB) with `wallet_pubkey` and a `traction_score` (e.g., 85).
2. Create a test investor with `wallet_pubkey`.
3. Create a funding round with milestones (e.g., threshold 80, 90).
4. Click "Force Evaluate" on the round detail page.
5. Verify the milestone status changes to "Released" and a transaction hash appears.
6. (In production) Check the transaction on Casper testnet explorer.

## Roadmap

- Add automated evaluation (cron or webhook on score change)
- Multi-signature escrow
- x402 monetization for score lookups
- MCP server for agent consumption
- On-chain oracle anchoring

## License

MIT

## Support

Contact: karan@codequity.live