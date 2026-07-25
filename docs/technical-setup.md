# Technical Setup

## Prerequisites

- Node.js 20+
- npm
- Supabase project or Supabase CLI
- Casper Wallet browser extension
- Casper testnet account with faucet CSPR
- Optional: Rust, Odra, and Casper client for contract work

## Frontend Setup

```bash
cd Casper_codequity/frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_REDIRECT_ORIGIN=http://localhost:3000
NEXT_PUBLIC_CASPER_CHAIN_NAME=casper-test
NEXT_PUBLIC_CASPER_ESCROW_PUBLIC_KEY=your_testnet_escrow_public_key
```

For production:

```env
BACKEND_URL=https://backend.codequity.live
NEXT_PUBLIC_API_URL=https://backend.codequity.live
NEXT_PUBLIC_AUTH_REDIRECT_ORIGIN=https://launchpad.codequity.live
NEXT_PUBLIC_CASPER_CHAIN_NAME=casper-test
```

## Supabase Setup

Apply migrations from:

```text
supabase/migrations/
```

The demo requires these records:

- One startup with a valid Casper `wallet_pubkey`.
- One approved investor with a valid Casper `wallet_pubkey`.
- One round with at least two milestones.
- One `agent_outputs` record for visible AI proof.

## Casper Wallet Setup

1. Install Casper Wallet.
2. Switch to Casper Testnet.
3. Fund the wallet from the Casper testnet faucet.
4. Connect the wallet inside CodeQuity.
5. Confirm the public key is saved in the profile page.

Critical checks:

- Investor wallet must match the investor profile for round creation.
- Escrow wallet must match the configured escrow key for wallet release mode.
- Startup profile should contain a valid recipient public key.

## Contract Workspace

Contracts live in:

```text
contracts/
```

Important packages:

- `contracts/escrow-vault`
- `contracts/safe-token`

See:

```text
contracts/README.md
```

## Useful Commands

Frontend type/build checks:

```bash
cd Casper_codequity/frontend
npm run build
```

Contract notes:

```bash
cd Casper_codequity/contracts
cargo test
```

Database inspection helpers:

```bash
cd Casper_codequity/frontend
node query_db.js
node check_columns.js
```

## Production Configuration Checklist

Vercel/frontend:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `BACKEND_URL=https://backend.codequity.live`
- `NEXT_PUBLIC_API_URL=https://backend.codequity.live`
- `NEXT_PUBLIC_AUTH_REDIRECT_ORIGIN=https://launchpad.codequity.live`
- `NEXT_PUBLIC_CASPER_CHAIN_NAME=casper-test`
- `NEXT_PUBLIC_CASPER_ESCROW_PUBLIC_KEY`

Backend:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_API_KEY`
- `CASPER_NODE_URL=https://node.testnet.casper.network`
- `CASPER_ESCROW_PUBLIC_KEY`
- `AGENT_PRIVATE_KEY` or secure signing configuration
- LLM provider key for scoring/memo generation

Supabase Auth:

- Site URL: `https://launchpad.codequity.live`
- Redirect URL: `https://launchpad.codequity.live/auth/callback`

## Common Demo Failures

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| Wallet signature fails | Casper Wallet locked or wrong account | Unlock wallet and switch to required public key |
| Create round blocked | Startup or investor missing wallet | Add wallet key in profile/database |
| Release not eligible | Score below milestone threshold | Use seeded ready round or run AI evaluation |
| No AI proof shown | Missing `agent_outputs` record | Run score/memo action or seed demo data |
| Explorer link missing | Deploy hash not stored | Check signing/broadcast response and round record |
