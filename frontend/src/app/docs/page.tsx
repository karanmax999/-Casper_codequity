"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CODEQUITY_ESCROW_PUBLIC_KEY,
  DEMO_PROTOCOL_PUBLIC_KEY,
  ESCROW_CONTRACT_UREF,
  SAFE_CONTRACT_UREF,
  csprAccountHref,
  csprContractHref,
} from "@/lib/casper-deployment";
import {
  ArrowRight,
  Banknote,
  BookOpen,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  FileCheck2,
  Layers3,
  Network,
  Search,
  ShieldCheck,
  TerminalSquare,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

type DocSection = {
  id: string;
  title: string;
  eyebrow: string;
  icon: LucideIcon;
  summary: string;
  body: string[];
  bullets?: string[];
  code?: string;
};

const sections: DocSection[] = [
  {
    id: "overview",
    title: "Overview",
    eyebrow: "Product",
    icon: BookOpen,
    summary: "CodeQuity turns startup funding into a proof-gated workflow.",
    body: [
      "Investors create CSPR-backed rounds, founders prove execution, and the AI layer evaluates whether the startup has crossed a milestone threshold.",
      "The important difference is that funding decisions are not buried in private updates. Score, reasoning, wallet readiness, and Casper proof are visible inside the product.",
    ],
    bullets: [
      "AI-governed traction scoring",
      "Casper Wallet deposit and release signatures",
      "Milestone tracker with release eligibility",
      "Founder raise readiness and investor due diligence",
    ],
  },
  {
    id: "demo-flow",
    title: "Demo Flow",
    eyebrow: "Judges",
    icon: Zap,
    summary: "A five-minute path that proves the product works end to end.",
    body: [
      "The best judging flow is landing page, startup profile, create round, Casper Wallet signature, round detail, AI proof, and milestone release.",
      "If testnet signing is slow during judging, use a seeded round with existing deploy hashes and explain the proof rail from the round detail page.",
    ],
    bullets: [
      "Show the one-line pitch from the landing page",
      "Open a startup profile and explain raise readiness",
      "Create or open a CSPR-backed round",
      "Show Casper Proof Rail and AI Agent Proof side by side",
      "Trigger or explain an eligible release",
    ],
  },
  {
    id: "architecture",
    title: "Architecture",
    eyebrow: "System",
    icon: Layers3,
    summary: "Next.js frontend, Supabase state, AI/backend actions, and Casper settlement.",
    body: [
      "The frontend owns the investor and founder workflows. Supabase stores startups, investors, rounds, milestones, wallet public keys, and durable agent outputs.",
      "The backend agent layer scores startups and generates memos. Casper Wallet signs money-moving deploys, and Casper testnet references are displayed back in the round proof rail.",
    ],
    code: `Investor / Founder
      |
      v
Next.js Launchpad
      |
      +-- Supabase: startups, investors, rounds, milestones
      +-- AI/API: score, memo, enrichment
      +-- Casper Wallet: deposit and release signatures
              |
              v
        Casper Testnet proof`,
  },
  {
    id: "casper",
    title: "Casper Proof Rail",
    eyebrow: "Blockchain",
    icon: Network,
    summary: "Casper is used where proof and settlement matter most.",
    body: [
      "CodeQuity uses Casper Wallet for investor and escrow signatures, testnet deploy hashes for deposit and release proof, and a contract workspace for score-gated escrow hardening.",
      "The UI makes Casper visible. A judge should not need to inspect logs to know which action touched the chain.",
    ],
    bullets: [
      "Deposit deploy hashes link to CSPR.live",
      "Release deploy hashes are shown per milestone",
      "Escrow mode is explicit: wallet or contract",
      "Startup recipient public key stays visible before signing",
    ],
  },
  {
    id: "ai-agent",
    title: "AI Agent Layer",
    eyebrow: "Intelligence",
    icon: Bot,
    summary: "AI output becomes funding context, not decorative copy.",
    body: [
      "The agent produces a traction score, verdict, explanation, green flags, red flags, and investor memo context. The result is persisted so the round can show why a milestone is eligible or blocked.",
      "This makes the AI decision inspectable. The product does not ask users to trust an invisible model.",
    ],
    bullets: [
      "Startup score",
      "Due diligence summary",
      "Green flags and red flags",
      "Signal interpretation",
      "Suggested next improvements",
    ],
  },
  {
    id: "business-model",
    title: "Business Model",
    eyebrow: "Revenue",
    icon: Banknote,
    summary: "CodeQuity monetizes the capital workflow, not attention.",
    body: [
      "The first customers are accelerators, ecosystem funds, hackathon organizers, grant programs, and angel syndicates. They already release money in stages and need a cleaner way to verify progress.",
      "Revenue expands from paid diligence into SaaS fund operations, success fees, APIs, and white-label launchpads.",
    ],
    bullets: [
      "0.5% to 2% success fee on released capital",
      "Monthly SaaS for accelerators and grant programs",
      "Paid AI diligence reports",
      "Usage-based score and memo APIs",
      "White-label launchpad deployments",
    ],
  },
  {
    id: "setup",
    title: "Setup",
    eyebrow: "Developer",
    icon: Code2,
    summary: "Run the frontend, connect Supabase, and prepare Casper testnet.",
    body: [
      "The frontend runs from the `frontend` directory. A complete demo requires Supabase environment variables, backend API URL, Casper chain name, and a configured escrow public key.",
      "Seed data matters for judging. Prepare one ready startup, one approved investor, one eligible round, and one round below threshold.",
    ],
    code: `cd Casper_codequity/frontend
npm install
npm run dev`,
  },
  {
    id: "reliability",
    title: "Reliability",
    eyebrow: "Readiness",
    icon: ShieldCheck,
    summary: "The submission should fail clearly and recoverably.",
    body: [
      "The demo must not depend on perfect live conditions. Wallet mismatch, missing wallet keys, backend delays, and testnet timing should produce readable states instead of dead ends.",
      "The strongest reliability signal is a seeded demo with saved agent outputs and existing Casper deploy hashes, plus live actions available when the environment is healthy.",
    ],
    bullets: [
      "Readable wallet mismatch errors",
      "Seeded round with deploy hashes",
      "Persisted AI output fallback",
      "Pending states for optional Casper fields",
      "Clear production environment checklist",
    ],
  },
];

const quickLinks = [
  { href: "/dashboard", label: "Dashboard", icon: TerminalSquare },
  { href: "/dashboard/startups", label: "Startups", icon: Database },
  { href: "/dashboard/admin/rounds/create", label: "Create Round", icon: Wallet },
  { href: "/how-it-works", label: "How It Works", icon: FileCheck2 },
];

const revenueRows = [
  ["Success fee", "Investors / funds", "0.5% to 2% of released milestone capital"],
  ["SaaS", "Accelerators / grant programs", "Monthly fund operations dashboard"],
  ["AI reports", "Investors / analysts", "Paid diligence reports or report credits"],
  ["API access", "Venture tools / agents", "Usage-based score and memo endpoints"],
  ["White-label", "Ecosystems / universities", "Setup fee plus subscription"],
];

const casperReferences = [
  {
    label: "Escrow account",
    value: CODEQUITY_ESCROW_PUBLIC_KEY,
    href: csprAccountHref(CODEQUITY_ESCROW_PUBLIC_KEY),
  },
  {
    label: "Demo protocol/startup account",
    value: DEMO_PROTOCOL_PUBLIC_KEY,
    href: csprAccountHref(DEMO_PROTOCOL_PUBLIC_KEY),
  },
  {
    label: "Escrow contract",
    value: ESCROW_CONTRACT_UREF,
    href: csprContractHref(ESCROW_CONTRACT_UREF),
  },
  {
    label: "SAFE contract",
    value: SAFE_CONTRACT_UREF,
    href: csprContractHref(SAFE_CONTRACT_UREF),
  },
];

const casperProofCards = [
  {
    label: "Escrow account",
    value: CODEQUITY_ESCROW_PUBLIC_KEY,
    shortValue: shortRef(CODEQUITY_ESCROW_PUBLIC_KEY),
    href: csprAccountHref(CODEQUITY_ESCROW_PUBLIC_KEY),
    note: "Wallet escrow recipient",
  },
  {
    label: "Demo account",
    value: DEMO_PROTOCOL_PUBLIC_KEY,
    shortValue: shortRef(DEMO_PROTOCOL_PUBLIC_KEY),
    href: csprAccountHref(DEMO_PROTOCOL_PUBLIC_KEY),
    note: "Seeded protocol/startup key",
  },
  {
    label: "Escrow contract",
    value: ESCROW_CONTRACT_UREF,
    shortValue: shortRef(ESCROW_CONTRACT_UREF),
    href: csprContractHref(ESCROW_CONTRACT_UREF),
    note: "Score-gated release contract",
  },
  {
    label: "SAFE contract",
    value: SAFE_CONTRACT_UREF,
    shortValue: shortRef(SAFE_CONTRACT_UREF),
    href: csprContractHref(SAFE_CONTRACT_UREF),
    note: "Funding agreement token rail",
  },
];

export default function DocumentationPage() {
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;

    return sections.filter((section) => {
      const haystack = [
        section.title,
        section.eyebrow,
        section.summary,
        ...section.body,
        ...(section.bullets ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [query]);

  return (
    <main className="min-h-screen bg-[#050606] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050606]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <TerminalSquare className="h-7 w-7 text-[#45f798]" />
            <div className="leading-none">
              <div className="text-sm font-black uppercase tracking-[0.16em] text-[#45f798]">CodeQuity</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">Documentation</div>
            </div>
          </Link>

          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search documentation..."
              className="h-10 w-full rounded-sm border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#45f798]/60"
            />
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-4 text-xs font-black text-black transition-colors hover:bg-[#66f4ff]"
          >
            Launch App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-[240px_1fr_220px] md:px-8">
        <aside className="hidden md:block">
          <nav className="sticky top-28 space-y-1">
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">Documentation</div>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <section.icon className="h-4 w-4 text-[#45f798]" />
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <section className="border-b border-white/10 pb-10">
            <div className="inline-flex items-center gap-2 rounded-sm border border-[#45f798]/30 bg-[#45f798]/10 px-3 py-1 text-xs font-bold text-[#45f798]">
              <CheckCircle2 className="h-4 w-4" />
              Casper Agentic Funding Protocol
            </div>
            <h1 className="mt-5 max-w-4xl font-space-grotesk text-4xl font-black tracking-tight text-white md:text-6xl">
              Documentation for AI-governed milestone capital.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">
              CodeQuity combines AI due diligence, milestone-based funding, and Casper proof rails so capital releases only when startup progress is visible and verifiable.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-sm border border-white/10 bg-white/[0.03] p-4 text-sm font-bold text-zinc-200 transition-colors hover:border-[#45f798]/40 hover:bg-[#45f798]/10"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-[#66f4ff]" />
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-[#45f798]" />
                </Link>
              ))}
            </div>
          </section>

          <div className="space-y-16 py-12">
            {filteredSections.length === 0 ? (
              <div className="rounded-sm border border-white/10 bg-white/[0.03] p-8 text-zinc-400">
                No documentation sections match "{query}".
              </div>
            ) : (
              filteredSections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#45f798]/30 bg-[#45f798]/10">
                      <section.icon className="h-5 w-5 text-[#45f798]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#66f4ff]">{section.eyebrow}</div>
                      <h2 className="font-space-grotesk text-2xl font-black text-white md:text-3xl">{section.title}</h2>
                    </div>
                  </div>

                  <p className="max-w-3xl text-base font-semibold leading-7 text-zinc-200">{section.summary}</p>

                  <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-400">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  {section.bullets && (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {section.bullets.map((bullet) => (
                        <div key={bullet} className="flex min-w-0 items-start gap-3 rounded-sm border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300 transition-colors hover:border-[#45f798]/30 hover:bg-[#45f798]/[0.06]">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#45f798]" />
                          <span className="min-w-0 break-words">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.id === "casper" && <CasperProofSummary />}

                  {section.code && (
                    <pre className="mt-6 overflow-x-auto rounded-sm border border-white/10 bg-[#0b1110] p-5 text-sm leading-7 text-zinc-300">
                      <code>{section.code}</code>
                    </pre>
                  )}
                </section>
              ))
            )}

            <section id="revenue-table" className="scroll-mt-28">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-amber-300/30 bg-amber-300/10">
                  <Banknote className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-300">Monetization</div>
                  <h2 className="font-space-grotesk text-2xl font-black text-white md:text-3xl">How CodeQuity Makes Money</h2>
                </div>
              </div>

              <div className="overflow-x-auto rounded-sm border border-white/10">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Stream</th>
                      <th className="px-4 py-3">Buyer</th>
                      <th className="px-4 py-3">Model</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {revenueRows.map(([stream, buyer, model]) => (
                      <tr key={stream} className="bg-white/[0.02] text-zinc-300">
                        <td className="px-4 py-4 font-bold text-white">{stream}</td>
                        <td className="px-4 py-4">{buyer}</td>
                        <td className="px-4 py-4">{model}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="casper-links" className="scroll-mt-28">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#66f4ff]/30 bg-[#66f4ff]/10">
                  <Network className="h-5 w-5 text-[#66f4ff]" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#66f4ff]">Testnet Proof</div>
                  <h2 className="font-space-grotesk text-2xl font-black text-white md:text-3xl">Live Casper References</h2>
                </div>
              </div>

              <div className="grid gap-3">
                {casperReferences.map((reference) => (
                  <a
                    key={reference.label}
                    href={reference.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group grid gap-2 rounded-sm border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-[#66f4ff]/40 hover:bg-[#66f4ff]/10 md:grid-cols-[220px_1fr_auto] md:items-center"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{reference.label}</span>
                    <span className="min-w-0 break-all font-mono text-xs text-zinc-300">{reference.value}</span>
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-[#66f4ff]">
                      Open
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 border-l border-white/10 pl-5">
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">On This Page</div>
            <div className="space-y-3 text-sm">
              {sections.slice(0, 7).map((section) => (
                <a key={section.id} href={`#${section.id}`} className="block text-zinc-500 transition-colors hover:text-[#45f798]">
                  {section.title}
                </a>
              ))}
              <a href="#revenue-table" className="block text-zinc-500 transition-colors hover:text-[#45f798]">
                Revenue Table
              </a>
              <a href="#casper-links" className="block text-zinc-500 transition-colors hover:text-[#45f798]">
                Casper Links
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CasperProofSummary() {
  return (
    <div className="mt-6 overflow-hidden rounded-sm border border-white/10 bg-[#080d0c]">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#66f4ff]">Live Testnet References</div>
        <p className="mt-1 text-sm text-zinc-500">
          Shortened for readability. Each row opens the exact CSPR.live account or contract page.
        </p>
      </div>

      <div className="grid gap-px bg-white/10 md:grid-cols-2">
        {casperProofCards.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            title={item.value}
            className="group min-w-0 bg-[#070908] p-4 transition-colors hover:bg-[#0d1714]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">{item.label}</div>
                <div className="mt-2 truncate font-mono text-sm font-semibold text-zinc-100">{item.shortValue}</div>
                <div className="mt-1 text-xs text-zinc-600">{item.note}</div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-[#66f4ff]/30 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#66f4ff] transition-colors group-hover:bg-[#66f4ff]/10">
                Open
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function shortRef(value: string) {
  if (value.length <= 22) return value;
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}
