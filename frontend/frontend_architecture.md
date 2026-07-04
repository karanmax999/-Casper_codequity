# CodeQuity Frontend Architecture Review

Based on a thorough review of your `frontend` directory, here is a complete breakdown of the CodeQuity casper  Next.js application architecture, routing, and design philosophy.

## 🏗️ Core Technology Stack
- **Framework:** Next.js 15+ (using the App Router)
- **Styling:** Tailwind CSS with a highly customized dark theme (`#020504` deep black, `#45f798` emerald green/neon).
- **Icons:** A mix of `lucide-react` (for sleek, modern SVG icons) and Google Material Symbols.
- **Animations:** `framer-motion` for scroll effects and smooth UI transitions.
- **Backend/Auth:** Supabase for authentication and database interactions (`@/lib/supabase/server`).

## 🗺️ Routing Structure (`src/app/`)

The application is split into three main conceptual areas:

### 1. Landing / Public Pages
- `page.tsx` (Root): The main landing page. It features the massive scroll-expansion hero video component, followed by a breakdown of the CodeQuity thesis, the **Traction Simulator**, the **Intelligence Layer**, and the **Investor Section**.
- `sign-in/` & `sign-up/`: Standard authentication flows to get users into the platform.
- `investor/register/`: Specific onboarding flow for investors.

### 2. The Dashboard (`/dashboard`)
This is the authenticated core of the platform. The dashboard dynamically renders different views based on user roles (`isAdmin`).
- **Admin View:** If the user is an admin, the dashboard becomes a "Command Center" showing active rounds, total capital tracked, and the ability to create new funding rounds (`/admin/rounds/create`).
- **Investor View:** For standard users, it acts as an "Investor Pipeline Seed", recommending top startups based on their `traction_score` and showing pipeline stats.

**Dashboard Sub-routes:**
- `/dashboard/startups` & `[id]`: Directory and details for startups raising capital.
- `/dashboard/investors`: Investor directory.
- `/dashboard/rounds/[id]`: Specific funding round details.
- `/dashboard/transactions`: On-chain transaction logs.
- `/dashboard/watchlist`: User-specific saved protocols.

### 3. API Routes (`/api`)
- Serverless functions powering specific backend integrations (e.g., `/api/investor/register`, `/api/fresh-startups`).

## 🎨 UI/UX Philosophy
The frontend heavily leans into a **"Web3 Premium"** aesthetic.
- **Glassmorphism:** Extensive use of `bg-white/[0.02]`, `backdrop-blur`, and subtle `border-white/10` to create depth.
- **Typography:** Uses a strict hierarchy of `Space Grotesk` (for punchy, futuristic headers), `Inter` (for readable body text), and `JetBrains Mono` (for technical data, scores, and code blocks).
- **Data Visualization:** Replaces standard text with visual "nodes", pipelines, and glowing rings to represent the automated nature of CodeQuity smart contracts.

## 🧩 Key Components (`src/components/`)
- **Landing Components:** `IntelligenceLayer.tsx`, `InvestorSection.tsx`, `TractionSimulator.tsx` (the highly polished sections we just built).
- **UI Components:** Reusable primitives, including the complex `scroll-expansion-hero.tsx` which handles the scroll-hijacking video reveal effect on the homepage.
- **Launchpad Components:** Specific UI cards for rendering funding rounds and startup data (`RoundCard.tsx`).

## 🔍 Code Quality & State
The codebase uses Server Components by default for fast loading and SEO, and explicitly opts into Client Components (`"use client"`) only when interactivity (like Framer Motion or React state) is required. Data fetching is securely handled server-side via Supabase before rendering the pages.
