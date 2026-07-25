# Judge Demo Guide

## Demo Goal

Show that CodeQuity is not only a pitch. It is an end-to-end workflow where AI diligence and Casper proof rails govern milestone funding.

Target demo length: 3 to 5 minutes.

## Demo Narrative

Use this script:

> CodeQuity lets investors fund startups in milestones. The AI agent evaluates startup traction, Casper Wallet signs the capital movement, and the round page shows the proof trail. Founders unlock capital by shipping, not by sending another pitch deck.

## Pre-Demo Checklist

Before recording or presenting:

- Confirm the frontend opens at `https://launchpad.codequity.live`.
- Confirm backend health endpoint is live if available.
- Confirm Supabase has a seeded startup.
- Confirm seeded startup has `wallet_pubkey`.
- Confirm demo investor is approved.
- Confirm demo investor has `wallet_pubkey`.
- Confirm Casper Wallet is installed and unlocked.
- Confirm Casper Wallet is on testnet.
- Confirm the wallet has testnet CSPR.
- Confirm escrow account opens: https://testnet.cspr.live/account/0202adeeff8bbd3af398698d1ffcbe0e4220e1199bfa2840108f4a0046c1dc5bbd02
- Confirm demo protocol/startup account opens: https://testnet.cspr.live/account/02034c0d05bc3b5fdb3f661a085d331895a37060982de4c61117487c2de521456b82
- Confirm escrow contract opens: https://testnet.cspr.live/contract/hash-c489f547dc4a855d7a9361cbaf649af8d9c17528a1fa072bbd0c6bb12b008765
- Confirm SAFE contract opens: https://testnet.cspr.live/contract/hash-14ac3b8892224dd8aa829b02460d53e3f3e0d569b859e5225edf83d14f9d9188
- Confirm at least one round has a visible deposit deploy hash.
- Confirm at least one startup has visible AI agent output.

## Recommended Demo Data

Create or verify:

- Startup A: high score, ready for milestone release.
- Startup B: lower score, not ready for release.
- Investor A: approved and wallet-linked.
- Round A: two milestones, one eligible.
- Round B: below threshold to show the gate works.

## Step-by-Step Demo

### 1. Landing Page

Show:

- Product positioning.
- "Milestone-backed capital on Casper."
- Launch app entry point.

Say:

> CodeQuity is a funding launchpad where capital unlocks when traction is proven.

### 2. Startup Profile

Open a startup detail page.

Show:

- Company information.
- Traction score.
- Casper wallet readiness.
- Raise readiness panel.
- AI due diligence report.

Say:

> The investor is not reading a static pitch deck. They are seeing the current state of the startup, the proof quality, and the AI-generated diligence record.

### 3. Create Funding Round

Open round creation.

Show:

- Startup selection.
- CSPR amount.
- Milestone thresholds.
- Release percentages.
- Payment summary.

Say:

> The investor defines what success means before funds move. Every release condition is explicit.

### 4. Casper Wallet Signature

Connect or use the already connected wallet.

Show:

- Wallet public key.
- Signature/deploy action.
- Success state.

Say:

> Casper Wallet signs the capital commitment, creating the proof rail for this funding round.

### 5. Round Detail Page

Open the new or seeded round.

Show:

- Milestone tracker.
- Casper Proof Rail.
- Deposit deploy hash.
- Escrow mode.
- Agent public key or escrow reference.
- Release status.

Say:

> This is the investor-grade record. The judge can see what was committed, what is eligible, and where the Casper proof lives.

### 6. AI Evaluation

Run or show the latest AI evaluation.

Show:

- Score.
- Verdict.
- Explanation.
- Green flags.
- Red flags.

Say:

> The AI agent produces an inspectable decision. It does not silently move money. The reasoning is visible before release.

### 7. Milestone Release

If the score is eligible, trigger release.

Show:

- Eligibility threshold.
- Wallet signing.
- Release hash.
- Milestone marked released.

Say:

> Capital unlocks because the milestone condition is met. Casper gives us the transaction proof; CodeQuity gives us the workflow and intelligence layer.

## What Judges Should Notice

- Casper is visible in the product through wallet signing and proof rails.
- AI is tied to the release workflow.
- The business model is clear.
- The UI handles investor, founder, and admin workflows.
- The product can be sold to accelerators, grant programs, and funds.

## Backup Plan

If live wallet signing fails:

1. Use a seeded round with existing deploy hashes.
2. Show the Casper Proof Rail.
3. Explain the wallet mismatch or testnet failure clearly.
4. Continue with AI evaluation and milestone state.

If backend AI scoring fails:

1. Use the latest persisted `agent_outputs` record.
2. Show the saved score, memo, and reasoning.
3. Explain that outputs are durable records, not temporary chat text.

## Closing Line

> CodeQuity turns early-stage funding into a programmable, auditable system: AI verifies progress, Casper records the proof, and founders unlock capital by executing.
