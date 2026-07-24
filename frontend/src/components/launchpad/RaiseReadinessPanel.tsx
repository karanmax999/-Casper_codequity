import {
  AlertCircle,
  CheckCircle2,
  Code2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

type ReadinessProfile = {
  name: string;
  traction_score?: number | null;
  data_quality_score?: number | null;
  verification_status?: string | null;
  github_url?: string | null;
  wallet_pubkey?: string | null;
};

type AgentOutput = {
  output_json?: {
    total?: number;
    signals?: {
      github?: Record<string, unknown> | null;
    };
  } | null;
  created_at?: string | null;
} | null;

export function RaiseReadinessPanel({
  startup,
  latestEvaluation,
}: {
  startup: ReadinessProfile;
  latestEvaluation: AgentOutput;
}) {
  const score = Number(latestEvaluation?.output_json?.total ?? startup.traction_score ?? 0);
  const dataQuality = Number(startup.data_quality_score ?? 0);
  const walletReady = isValidCasperPublicKey(startup.wallet_pubkey);
  const verified = startup.verification_status === "verified";
  const githubSignals = latestEvaluation?.output_json?.signals?.github || null;
  const funding = fundingReadiness(score, dataQuality, walletReady, verified);
  const improvements = improvementList({ score, dataQuality, walletReady, verified, githubUrl: startup.github_url, latestEvaluation });
  const terms = suggestedMilestones(score);

  return (
    <section className="overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] text-white">
      <div className="flex flex-col gap-3 border-b border-[#1F1F1F] p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
            <Sparkles className="h-3.5 w-3.5" />
            Raise readiness
          </div>
          <h2 className="mt-2 text-xl font-semibold">Funding readiness for {startup.name}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            This view turns the profile into a funding checklist: proof quality, Casper wallet readiness, AI score, and suggested score-gated milestone terms.
          </p>
        </div>
        <span className={`inline-flex h-8 items-center gap-2 rounded-sm border px-3 text-[10px] font-bold uppercase tracking-[0.14em] ${funding.className}`}>
          {funding.ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {funding.label}
        </span>
      </div>

      <div className="grid gap-px bg-[#1F1F1F] lg:grid-cols-5">
        <ReadinessMetric icon={TrendingUp} label="Traction score" value={`${score}/100`} ok={score >= 60} />
        <ReadinessMetric icon={ShieldCheck} label="Data quality" value={`${dataQuality}/100`} ok={dataQuality >= 60} />
        <ReadinessMetric icon={ShieldCheck} label="Verification" value={formatStatus(startup.verification_status)} ok={verified} />
        <ReadinessMetric icon={Code2} label="GitHub signals" value={githubSummary(githubSignals, startup.github_url)} ok={Boolean(startup.github_url)} />
        <ReadinessMetric icon={Wallet} label="Casper wallet" value={walletReady ? "Ready" : "Missing"} ok={walletReady} />
      </div>

      <div className="grid gap-px bg-[#1F1F1F] lg:grid-cols-[1fr_1fr]">
        <div className="bg-[#0A0A0A] p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">Suggested milestone terms</div>
          <div className="mt-4 grid gap-3">
            {terms.map((term, index) => (
              <div key={`${term.threshold}-${term.release}`} className="flex items-center justify-between gap-4 border border-[#1F1F1F] bg-black px-3 py-2">
                <div>
                  <div className="text-sm font-semibold text-white">Milestone {index + 1}</div>
                  <div className="text-xs text-zinc-500">Release {term.release}% of escrow</div>
                </div>
                <div className="font-mono text-sm font-bold text-[#45f798]">{term.threshold}/100</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">What to improve next</div>
          <div className="mt-4 grid gap-2">
            {improvements.map((item) => (
              <div key={item} className="flex items-start gap-2 border border-[#1F1F1F] bg-black px-3 py-2 text-sm text-zinc-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#45f798]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReadinessMetric({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="min-w-0 bg-[#0A0A0A] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        {ok ? <CheckCircle2 className="h-4 w-4 text-[#45f798]" /> : <AlertCircle className="h-4 w-4 text-amber-300" />}
      </div>
      <div className="mt-3 truncate font-mono text-sm font-semibold text-zinc-200">{value}</div>
    </div>
  );
}

function fundingReadiness(score: number, dataQuality: number, walletReady: boolean, verified: boolean) {
  if (score >= 70 && dataQuality >= 60 && walletReady) {
    return {
      ready: true,
      label: verified ? "Ready for score-gated round" : "Ready, verification recommended",
      className: "border-[#45f798]/30 bg-[#45f798]/10 text-[#45f798]",
    };
  }

  if (score >= 50 && walletReady) {
    return {
      ready: false,
      label: "Close to raise-ready",
      className: "border-amber-300/30 bg-amber-300/10 text-amber-300",
    };
  }

  return {
    ready: false,
    label: "Not raise-ready yet",
    className: "border-zinc-700 bg-black text-zinc-400",
  };
}

function suggestedMilestones(score: number) {
  if (score >= 80) {
    return [
      { threshold: 85, release: 40 },
      { threshold: 90, release: 30 },
      { threshold: 95, release: 30 },
    ];
  }

  if (score >= 60) {
    return [
      { threshold: 70, release: 40 },
      { threshold: 80, release: 35 },
      { threshold: 90, release: 25 },
    ];
  }

  return [
    { threshold: 50, release: 30 },
    { threshold: 65, release: 35 },
    { threshold: 80, release: 35 },
  ];
}

function improvementList({
  score,
  dataQuality,
  walletReady,
  verified,
  githubUrl,
  latestEvaluation,
}: {
  score: number;
  dataQuality: number;
  walletReady: boolean;
  verified: boolean;
  githubUrl?: string | null;
  latestEvaluation: AgentOutput;
}) {
  const items: string[] = [];

  if (!walletReady) items.push("Add a valid Casper public wallet key before any investor can create a funded round.");
  if (!githubUrl) items.push("Connect a GitHub repository so the agent can evaluate developer velocity.");
  if (!latestEvaluation) items.push("Run an AI evaluation to create a durable startup scoring record.");
  if (score < 60) items.push("Raise traction score above 60 before pitching score-gated milestones.");
  if (dataQuality < 60) items.push("Improve profile data quality with team, traction, legal, and operating details.");
  if (!verified) items.push("Complete verification so investors can distinguish self-claimed data from checked proof.");

  return items.length > 0 ? items : ["Maintain weekly traction updates and prepare milestone thresholds for investor review."];
}

function githubSummary(signals: Record<string, unknown> | null, githubUrl?: string | null) {
  if (!githubUrl) return "Not linked";
  if (!signals) return "Linked, not scored";

  const stars = readSignal(signals, "stars");
  const forks = readSignal(signals, "forks");
  const commits = readSignal(signals, "recent_commits");
  const contributors = readSignal(signals, "contributors");
  const parts = [
    stars ? `${stars} stars` : null,
    forks ? `${forks} forks` : null,
    commits ? `${commits} commits` : null,
    contributors ? `${contributors} contributors` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : "Linked, awaiting signals";
}

function readSignal(signals: Record<string, unknown>, key: string) {
  const value = signals[key];
  return typeof value === "number" || typeof value === "string" ? String(value) : "";
}

function formatStatus(value?: string | null) {
  return value ? value.replace(/_/g, " ") : "Self claimed";
}

function isValidCasperPublicKey(value?: string | null) {
  return Boolean(value && /^(?:01[\da-f]{64}|02[\da-f]{66})$/i.test(value));
}
