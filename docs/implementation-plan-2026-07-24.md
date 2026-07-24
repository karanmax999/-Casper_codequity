# CodeQuity Final Round Implementation Plan - 2026-07-24

## Current Baseline

The core final-round demo path is already functional:

1. Investor logs in.
2. Investor sees startup traction and round context.
3. Investor creates a CSPR-backed round.
4. Casper Wallet signs the deposit deploy.
5. Round appears with Casper deploy hash.
6. AI/backend evaluates startup score.
7. Score crossing a milestone unlocks release eligibility.
8. Investor or escrow wallet signs the release deploy.
9. Backend records release.
10. UI shows completed milestone and explorer reference.

The next sprint is not about proving the baseline flow exists. It is about making the project feel like a complete, judge-ready agentic venture protocol.

## North Star

CodeQuity should read as:

> An agentic venture protocol where AI continuously evaluates startup traction and Casper releases capital only when proof exists.

## Track 1 - Agent Proof Layer

Goal: Make the AI agent's decision visible, inspectable, and tied to each milestone release.

Tasks:

- [x] Add an "Agent Proof" panel to the round detail page.
- [x] Show latest score, verdict, explanation, green flags, red flags, and relevant signals.
- [x] Link agent proof to the round and startup using existing `agent_outputs` data where available.
- [x] Add empty/loading/error states for rounds without agent outputs.
- [x] Add "Run AI Evaluation" action where appropriate.
- [x] Persist evaluation result to Supabase and update startup `traction_score`.

Acceptance criteria:

- A judge can see why a milestone is or is not releasable.
- The release decision has a visible AI-generated explanation.
- The UI does not look like a static score badge.

## Track 2 - Casper Proof Rail

Goal: Make Casper usage impossible to miss.

Tasks:

- [x] Add a compact proof rail on round detail.
- [x] Show deposit deploy hash with testnet explorer link.
- [x] Show release deploy hashes with testnet explorer links.
- [x] Show SAFE NFT mint status and hash if available.
- [x] Show escrow mode: wallet escrow or contract escrow.
- [x] Show escrow account or contract reference.
- [x] Show agent public key / escrow public key in short form.

Acceptance criteria:

- Every on-chain action has a visible reference.
- The page clearly communicates that Casper Testnet is being used.
- Missing optional data shows as "Pending" or "Not configured", not broken UI.

## Track 3 - Founder Raise Readiness

Goal: Give founders a useful readiness dashboard, not just a profile page.

Tasks:

- [x] Add a "Raise Readiness" section to startup profile.
- [x] Show traction score, data quality score, verification status, GitHub signal summary, and funding readiness.
- [x] Add suggested milestone terms based on current score.
- [x] Add "What to improve next" recommendations.
- [x] Show whether startup has a valid Casper wallet.

Acceptance criteria:

- A founder can understand what blocks funding readiness.
- An investor can quickly see whether the startup is credible enough for a score-gated round.

## Track 4 - Investor Round Creation Polish

Goal: Make round creation feel deliberate, safe, and investor-grade.

Tasks:

- [x] Convert create-round form into a guided sequence or visibly grouped sections.
- [x] Add startup due diligence preview before payment signature.
- [x] Add clear payment summary before wallet signing.
- [x] Show escrow recipient, amount, chain, milestone thresholds, and release percentages.
- [x] Improve success state with link to the newly created round.
- [x] Improve wallet mismatch and invalid key errors.

Acceptance criteria:

- Investor knows exactly what they are signing.
- Success state sends user directly to the live round.
- Failed states are readable and recoverable.

## Track 5 - Agent Actions In Frontend

Goal: Surface existing backend agent endpoints as product features.

Existing backend endpoints:

- `POST /api/agents/score`
- `POST /api/agents/score/stream`
- `POST /api/agents/memo`
- `POST /api/agents/memo/stream`
- `POST /api/agents/enrich/{startup_id}`

Tasks:

- [x] Add "Run AI Score" button to startup detail.
- [x] Add "Generate Investor Memo" button to startup detail.
- [x] Add "Refresh External Signals" button for enrichment.
- [x] Add streaming UI states for agent work.
- [x] Save final score/memo output into Supabase.

Acceptance criteria:

- Agentic AI is visible in the product flow.
- The user can trigger the agent and see its output.
- Outputs become durable records, not one-off UI text.

## Track 6 - Production Configuration

Goal: Remove environment drift before final judging.

Canonical production URLs:

- Frontend: `https://launchpad.codequity.live`
- Backend: `https://backend.codequity.live`
- Terminal: `https://terminal.codequity.live`

Vercel variables to verify:

- [ ] `BACKEND_URL=https://backend.codequity.live`
- [ ] `NEXT_PUBLIC_API_URL=https://backend.codequity.live`
- [ ] `NEXT_PUBLIC_AUTH_REDIRECT_ORIGIN=https://launchpad.codequity.live`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `ADMIN_API_KEY` matches Railway exactly.
- [ ] `NEXT_PUBLIC_CASPER_CHAIN_NAME=casper-test`
- [ ] `NEXT_PUBLIC_CASPER_ESCROW_PUBLIC_KEY`

Railway variables to verify:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ADMIN_API_KEY`
- [ ] `CASPER_NODE_URL=https://node.testnet.casper.network`
- [ ] `CASPER_ESCROW_PUBLIC_KEY`
- [ ] `AGENT_PRIVATE_KEY`
- [ ] `ESCROW_CONTRACT_UREF`
- [ ] `SAFE_CONTRACT_UREF`
- [ ] At least one LLM key: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY`.

Supabase checks:

- [ ] Auth Site URL is `https://launchpad.codequity.live`.
- [ ] Redirect URL includes `https://launchpad.codequity.live/auth/callback`.
- [ ] Redirect URL includes `https://terminal.codequity.live/auth/callback`.
- [ ] `funding_rounds` has `investor_signature`.
- [ ] `funding_rounds` has `message_string`.
- [ ] Demo startup has valid `wallet_pubkey`.
- [ ] Demo investor has valid `wallet_pubkey` and `approved=true`.

## Track 7 - Final Demo Assets

Goal: Make submission easy for judges to understand and verify.

Tasks:

- [ ] Prepare one seeded demo startup.
- [ ] Prepare one seeded approved investor.
- [ ] Prepare one active round with two milestones.
- [ ] Prepare one round where current score is below threshold.
- [ ] Prepare one round where current score is ready for release.
- [ ] Collect Casper Testnet deploy links.
- [ ] Update README with architecture and demo flow.
- [ ] Add a concise limitations section.
- [ ] Record final demo video.

Acceptance criteria:

- A judge can run the demo without needing private context.
- README, UI, and video tell the same story.
- On-chain evidence is visible and clickable.

## Suggested Build Order

1. Agent Proof panel on round detail.
2. Casper Proof rail on round detail.
3. Startup Raise Readiness section.
4. AI score/memo/enrichment actions in startup profile.
5. Create-round UX polish.
6. Production config audit.
7. Final demo seed data and README/video.

## Definition Of Done

- `npm run build` passes for the frontend.
- Railway `/health` returns live Casper mode.
- `backend.codequity.live` is used everywhere production frontend calls backend.
- Round detail shows both agent reasoning and Casper proof.
- One full demo can be completed without touching the database mid-demo.
