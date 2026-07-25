# Architecture

## System Summary

CodeQuity is built as a web launchpad with Supabase for application data, Casper Wallet for user signatures, Casper testnet for transaction proof, and an AI/backend layer for scoring and memo generation.

```text
Investor / Founder
      |
      v
Next.js Frontend
      |
      +-- Supabase Auth and Database
      |
      +-- Backend Agent/API Layer
      |
      +-- Casper Wallet Extension
              |
              v
        Casper Testnet
```

## Main Components

### Frontend

Location: `frontend/`

Responsibilities:

- Landing page and product narrative.
- Investor dashboard.
- Startup profile pages.
- Funding round creation.
- Casper Wallet connection and signing.
- Round detail pages with proof rails.
- In-app documentation.

Key technologies:

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Supabase client/server helpers.
- Casper JS SDK.

### Supabase

Location: `supabase/migrations/`

Responsibilities:

- Store startups.
- Store investors.
- Store funding rounds.
- Store milestones.
- Store agent outputs.
- Store wallet public keys.
- Enforce profile and approval rules.

Important tables include:

- `startups`
- `investors`
- `funding_rounds`
- `milestones`
- `agent_outputs`

### AI Agent/API Layer

Responsibilities:

- Score startups.
- Generate investor memos.
- Enrich startup data.
- Persist outputs into Supabase.
- Return score data used by the frontend release workflow.

Relevant endpoint families:

- `POST /api/agents/score`
- `POST /api/agents/score/stream`
- `POST /api/agents/memo`
- `POST /api/agents/memo/stream`
- `POST /api/agents/enrich/{startup_id}`

### Casper Wallet

Responsibilities:

- Connect the investor or escrow wallet.
- Sign CSPR deposit deploys.
- Sign milestone release deploys.
- Provide public keys for wallet validation.

The frontend validates that the connected wallet matches the required role before the user signs critical actions.

### Casper Proof Layer

Responsibilities:

- Provide transaction proof for deposits and releases.
- Support wallet escrow and contract escrow modes.
- Show deploy hashes and explorer references in the UI.
- Prepare the protocol for mainnet contract hardening.

Contract workspace:

- `contracts/escrow-vault`
- `contracts/safe-token`

Current Casper testnet references:

| Reference | Value | Explorer |
| --- | --- | --- |
| Escrow account | `0202adeeff8bbd3af398698d1ffcbe0e4220e1199bfa2840108f4a0046c1dc5bbd02` | [Open account](https://testnet.cspr.live/account/0202adeeff8bbd3af398698d1ffcbe0e4220e1199bfa2840108f4a0046c1dc5bbd02) |
| Demo protocol/startup account | `02034c0d05bc3b5fdb3f661a085d331895a37060982de4c61117487c2de521456b82` | [Open account](https://testnet.cspr.live/account/02034c0d05bc3b5fdb3f661a085d331895a37060982de4c61117487c2de521456b82) |
| Escrow contract | `hash-c489f547dc4a855d7a9361cbaf649af8d9c17528a1fa072bbd0c6bb12b008765` | [Open contract](https://testnet.cspr.live/contract/hash-c489f547dc4a855d7a9361cbaf649af8d9c17528a1fa072bbd0c6bb12b008765) |
| SAFE contract | `hash-14ac3b8892224dd8aa829b02460d53e3f3e0d569b859e5225edf83d14f9d9188` | [Open contract](https://testnet.cspr.live/contract/hash-14ac3b8892224dd8aa829b02460d53e3f3e0d569b859e5225edf83d14f9d9188) |

## Funding Round Lifecycle

```mermaid
sequenceDiagram
    participant I as Investor
    participant UI as Next.js Frontend
    participant W as Casper Wallet
    participant C as Casper Testnet
    participant DB as Supabase
    participant AI as AI Agent/API

    I->>UI: Select startup and create round
    UI->>DB: Load startup, investor, wallet readiness
    UI->>W: Request deposit signature
    W->>C: Broadcast signed deploy
    C-->>UI: Return deploy hash
    UI->>DB: Store round and deposit proof
    AI->>DB: Persist traction score and diligence output
    I->>UI: Evaluate milestone
    UI->>AI: Request latest score decision
    AI-->>UI: Score, verdict, reasoning
    UI->>W: Request release signature if eligible
    W->>C: Broadcast release deploy
    C-->>UI: Return release hash
    UI->>DB: Mark milestone released
```

## Trust Boundaries

CodeQuity has three important trust boundaries:

- The AI layer can explain and recommend, but the UI must show the reasoning and source context.
- The wallet signs final money-moving actions, so users see the transaction before submission.
- Casper provides durable transaction references for deposit and release events.

## What Is On-Chain vs Off-Chain

| Layer | Stored On-Chain | Stored Off-Chain |
| --- | --- | --- |
| Casper | Deploy hashes, transfer/release proof, contract state in contract mode | Full startup profile and AI memo |
| Supabase | None directly | App records, rounds, milestones, wallet keys, AI outputs |
| AI/API | None directly | Score, rationale, signals, reports |
| Frontend | None directly | User session state and UI workflow |

## Reliability Notes

- Wallet mismatch states are handled before signing.
- Missing startup wallet states block or warn in funding workflows.
- Milestone release requires score eligibility.
- Round detail surfaces missing proof as pending rather than broken.
- Demo should include seeded data so judges are not blocked by empty states.
