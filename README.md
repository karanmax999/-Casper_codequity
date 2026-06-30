# Codequity x Casper Launchpad 🚀

[![Casper Network](https://img.shields.io/badge/Built%20on-Casper%20Network-red)](https://casper.network/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)

**Codequity x Casper Launchpad** is an AI-Governed "Proof-of-Traction" Launchpad designed to automate milestone-based funding for startups. Built on the **Casper Network** utilizing upgradeable smart contracts and the powerful **Codequity Terminal AI scoring engine**, this platform enables trustless, on-chain escrow that automatically releases funds when a startup's Traction Score exceeds predefined thresholds.

Venture capital, but automated. Your Codequity Traction Score is the single source of truth for milestone funding—no human audits, no delays, no bias.

## 🌟 Key Features

- **AI-Driven Traction Scoring**: Startups are scored by AI agents based on objective metrics (GitHub activity, market trends, team execution).
- **Automated Milestone Funding**: On-chain escrow contracts automatically release CSPR to startups the moment they hit the agreed-upon score thresholds.
- **Trustless Execution**: No intermediaries required. The rules are encoded on the Casper blockchain and triggered via signed verifications.
- **Investor & Startup Dashboards**: Complete visibility for both sides. Investors track their deployed capital; startups monitor their score and upcoming releases.

## 🏗️ Architecture

The ecosystem relies on an integrated architecture combining Web2 AI analytics with Web3 execution:

- **Smart Contracts (`/contracts`)**: Built using **Odra (Rust/Wasm)** for the Casper Network. Includes the `EscrowVault` for securely holding investor CSPR and managing milestone releases.
- **Backend Analytics (`/backend`)**: A **Python (FastAPI)** server hosting the Codequity AI agents. It interacts with the Casper Network via custom Python RPC integration, evaluates startup scores, and triggers the escrow contract.
- **Frontend Dashboard (`/frontend`)**: A modern **Next.js** application featuring a sleek, dark-mode (OLED) design system with `shadcn/ui` for startups and investors to interact with the protocol.
- **Database (`/supabase`)**: **Supabase PostgreSQL** storing startup data, investor profiles, funding rounds, and an audit trail of on-chain transactions.

## 📂 Project Structure

```text
Casper_codequity/
├── backend/            # FastAPI backend & AI Agents integration
├── frontend/           # Next.js web application for investors and startups
├── supabase/           # Database migrations and schema definitions
├── contracts/          # Odra smart contracts for Casper (EscrowVault, SAFE NFT)
├── IMPLEMENTATION.md   # Detailed technical documentation and roadmap
└── README.md           # You are here
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+) and **npm/pnpm**
- **Python** (v3.10+)
- **Rust** & **Odra** (for Casper Smart Contracts)
- **Supabase CLI**

### 1. Setup Database
```bash
cd supabase
supabase start
supabase migration up
```

### 2. Setup Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Smart Contracts
```bash
cd contracts
odra build
odra test
```

## 📜 Vision

Demonstrate that **AI + Blockchain** can fully automate venture capital operations. By removing human bottlenecks and subjective bias, we reduce friction and increase trust across the entire ecosystem.

---
*Developed for the Casper Agentic Buildathon 2026 by Codequity.*
