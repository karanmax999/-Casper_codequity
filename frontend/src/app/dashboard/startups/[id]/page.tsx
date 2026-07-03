import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Code2,
  Wallet,
  Calendar,
  Award,
  CircleDot,
  Globe,
  Users,
  DollarSign,
  TrendingUp,
  Hourglass,
  Scale,
  ShieldCheck,
  Layers,
  FileCheck,
  Server,
  FileText,
  AlertCircle,
  FileDown,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

type StartupRound = {
  id: string;
  amount_cspr: number;
  status: string;
  milestones?: Array<{
    id?: string;
    released_at?: string | null;
  }>;
};

type StartupProfile = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  description: string | null;
  github_url: string | null;
  website_url?: string | null;
  stage?: string | null;
  category?: string | null;
  traction_score: number | null;
  wallet_pubkey: string | null;
  created_at: string;
  founder_id?: string | null;
  legal_name?: string | null;
  incorporation_date?: string | null;
  incorporation_country?: string | null;
  employee_count_range?: string | null;
  business_model?: string | null;
  funding_stage?: string | null;
  last_funding_date?: string | null;
  total_funding_amount?: number | null;
  official_identifiers?: any;
  linkedin_company_url?: string | null;
  twitter_handle?: string | null;
  founder_linkedin_profiles?: any;
  tech_stack?: any;
  hosting_provider?: string | null;
  open_source_licenses?: string | null;
  arr?: number | null;
  mrr?: number | null;
  growth_rate_yoy?: number | null;
  runway_months?: number | null;
  customer_count?: number | null;
  data_quality_score?: number | null;
  last_enriched_at?: string | null;
  next_enrichment_scheduled_at?: string | null;
  verification_method?: string | null;
  verification_status?: string | null;
  verification_updated_at?: string | null;
  achievement_certificate_url?: string | null;
  funding_rounds?: StartupRound[];
};

type PageProps = { params: Promise<{ id: string }> };

export default async function StartupProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: startup } = await supabase
    .from("startups")
    .select(`
      id,
      name,
      slug,
      logo_url,
      description,
      github_url,
      website_url,
      stage,
      category,
      traction_score,
      wallet_pubkey,
      created_at,
      founder_id,
      legal_name,
      incorporation_date,
      incorporation_country,
      employee_count_range,
      business_model,
      funding_stage,
      last_funding_date,
      total_funding_amount,
      official_identifiers,
      linkedin_company_url,
      twitter_handle,
      founder_linkedin_profiles,
      tech_stack,
      hosting_provider,
      open_source_licenses,
      arr,
      mrr,
      growth_rate_yoy,
      runway_months,
      customer_count,
      data_quality_score,
      last_enriched_at,
      next_enrichment_scheduled_at,
      verification_method,
      verification_status,
      verification_updated_at,
      achievement_certificate_url,
      funding_rounds (
        id,
        amount_cspr,
        status,
        milestones (*)
      )
    `)
    .eq("id", id)
    .single();

  console.log("DEBUG_STARTUP_DATA:", JSON.stringify(startup, null, 2));

  if (!startup) {
    notFound();
  }

  // Fetch related tables separately to avoid join errors
  const [
    fundraisingRoundsResult,
    agentOutputsResult,
    tokensResult,
    founderResult
  ] = await Promise.all([
    supabase.from("fundraising_rounds").select("*").eq("startup_id", id),
    supabase.from("agent_outputs").select("*").eq("startup_id", id).order("created_at", { ascending: false }),
    supabase.from("tokens").select("*").eq("startup_id", id),
    startup.founder_id 
      ? supabase.from("founders").select("*").eq("user_id", startup.founder_id).maybe_single()
      : Promise.resolve({ data: null })
  ]);

  const fundraisingRounds = fundraisingRoundsResult.data || [];
  const agentOutputs = agentOutputsResult.data || [];
  const tokens = tokensResult.data || [];
  const founder = founderResult.data;

  const latestEvaluation = agentOutputs.length > 0 ? agentOutputs[0] : null;

  // Sum up traditional fundraising amounts if total_funding_amount is null
  const calculatedTotalFunding = fundraisingRounds.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const totalFunding = startup.total_funding_amount || calculatedTotalFunding || null;

  const profile = startup as StartupProfile;
  const rounds = profile.funding_rounds || [];
  
  const formattedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedIncorpDate = profile.incorporation_date
    ? new Date(profile.incorporation_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const formattedLastFundingDate = profile.last_funding_date
    ? new Date(profile.last_funding_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  const formattedVerificationDate = profile.verification_updated_at
    ? new Date(profile.verification_updated_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  const formatPercent = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    return `${val}%`;
  };

  const formatNumber = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    return new Intl.NumberFormat("en-US").format(val);
  };

  const renderTechStack = (stack: any) => {
    if (!stack) return <span className="text-sm text-zinc-500 italic">No tech stack listed</span>;
    let arr: string[] = [];
    if (Array.isArray(stack)) {
      arr = stack;
    } else if (typeof stack === "string") {
      arr = stack.split(",").map(s => s.trim());
    } else if (typeof stack === "object") {
      arr = Object.values(stack).map(s => String(s));
    }
    return (
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {arr.map((tech, i) => (
          <Badge key={i} className="bg-[#161616] border border-[#1F1F1F] text-zinc-400 font-mono text-[10px] hover:text-[#45f798] hover:border-[#45f798]/30 transition-colors">
            {tech}
          </Badge>
        ))}
      </div>
    );
  };

  const renderFounderSocials = (profiles: any) => {
    if (!profiles) return <span className="text-sm text-zinc-500 italic">No founder profiles linked</span>;
    let arr: string[] = [];
    if (Array.isArray(profiles)) {
      arr = profiles;
    } else if (typeof profiles === "string") {
      arr = profiles.split(",").map(s => s.trim());
    } else if (typeof profiles === "object") {
      arr = Object.values(profiles).map(s => String(s));
    }
    return (
      <div className="flex flex-col gap-1.5">
        {arr.map((url, i) => (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#45f798] hover:underline"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Founder Profile {arr.length > 1 ? `#${i + 1}` : ""}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        ))}
      </div>
    );
  };

  const renderIdentifiers = (ids: any) => {
    if (!ids) return <span className="text-sm text-zinc-500 italic">No official IDs listed</span>;
    if (typeof ids === "object") {
      return (
        <div className="space-y-1 mt-1 text-xs font-mono text-zinc-300">
          {Object.entries(ids).map(([key, val]) => (
            <div key={key} className="flex justify-between border-b border-[#1F1F1F]/40 py-1">
              <span className="text-zinc-500 uppercase tracking-wider">{key.replace(/_/g, " ")}:</span>
              <span className="text-zinc-300 font-bold">{String(val)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-xs font-mono text-zinc-300">{String(ids)}</span>;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 selection:bg-accent selection:text-black">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/startups"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white font-mono uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
      </div>

      {/* Main Profile Header */}
      <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#45f798]/5 rounded-full filter blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-5 z-10">
          <div className="h-16 w-16 rounded-md bg-[#161616] border border-[#262626] flex items-center justify-center text-zinc-400 overflow-hidden shrink-0">
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-zinc-500" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white uppercase tracking-wide">
                {profile.name}
              </h1>
              {profile.verification_status === "verified" && (
                <Badge className="bg-[#45f798]/10 border-[#45f798]/30 text-[#45f798] text-[9px] uppercase px-1.5 py-0 font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            
            <p className="text-xs font-mono text-zinc-500 mt-1">
              SLUG: {profile.slug || profile.name.toLowerCase().replace(/\s+/g, "-")}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {profile.stage && (
                <Badge className="bg-[#161616] border border-[#262626] text-zinc-400 font-mono text-[9px] uppercase">
                  Stage: {profile.stage}
                </Badge>
              )}
              {profile.category && (
                <Badge className="bg-[#161616] border border-[#262626] text-zinc-400 font-mono text-[9px] uppercase">
                  Category: {profile.category}
                </Badge>
              )}
              {profile.business_model && (
                <Badge className="bg-[#161616] border border-[#262626] text-zinc-400 font-mono text-[9px] uppercase">
                  Model: {profile.business_model}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#161616]/40 border border-[#262626]/60 rounded-lg p-3 z-10">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Traction Score:</span>
          <Badge className="bg-[#030303] border border-[#262626] text-[#45f798] px-3.5 py-1.5 text-base font-mono font-bold">
            {profile.traction_score ?? 0}/100
          </Badge>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column (2 Cols wide) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Protocol Details & Bio */}
          <Card className="border-[#1F1F1F] bg-[#0A0A0A] text-white">
            <CardHeader className="border-b border-[#1F1F1F] pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#45f798]" />
                Protocol Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500">Description</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {profile.description || "No description provided for this protocol profile."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-[#1F1F1F]/50">
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    Registered On
                  </h3>
                  <p className="text-sm text-zinc-300">{formattedDate}</p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-zinc-500" />
                    Source Code
                  </h3>
                  {profile.github_url ? (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[#45f798] hover:underline"
                    >
                      GitHub Repository
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">No Repository Linked</p>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-zinc-500" />
                    Website
                  </h3>
                  {profile.website_url ? (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[#45f798] hover:underline"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">No Website Linked</p>
                  )}
                </div>
              </div>

              {/* Casper Wallet */}
              <div className="pt-4 border-t border-[#1F1F1F]/50 space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-zinc-500" />
                  Casper Public Wallet Key
                </h3>
                {profile.wallet_pubkey ? (
                  <div className="flex items-center gap-2 bg-[#161616] border border-[#262626] rounded px-3 py-2 text-xs font-mono text-zinc-300 overflow-x-auto">
                    <span className="whitespace-nowrap break-all">{profile.wallet_pubkey}</span>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No wallet address registered for this protocol.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Due Diligence Report */}
          {latestEvaluation && (
            <Card className="border-[#1F1F1F] bg-[#0A0A0A] text-white relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${
                latestEvaluation.output_json?.verdict === "INVEST" 
                  ? "bg-[#45f798]" 
                  : latestEvaluation.output_json?.verdict === "HOLD" 
                  ? "bg-amber-400" 
                  : "bg-zinc-600"
              }`} />
              
              <CardHeader className="border-b border-[#1F1F1F] pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#45f798] animate-pulse" />
                    AI Agent Due Diligence Report
                  </CardTitle>
                  <Badge className={`font-mono text-[10px] px-2.5 py-0.5 uppercase font-bold border ${
                    latestEvaluation.output_json?.verdict === "INVEST"
                      ? "bg-[#45f798]/10 border-[#45f798]/30 text-[#45f798] shadow-[0_0_10px_rgba(69,247,152,0.15)]"
                      : latestEvaluation.output_json?.verdict === "HOLD"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400"
                  }`}>
                    Verdict: {latestEvaluation.output_json?.verdict || "HOLD"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Executive Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Executive Summary</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                    {latestEvaluation.output_json?.summary || "AI evaluation successfully completed. No written summary returned."}
                  </p>
                </div>

                {/* Score Dimension Breakdown */}
                {latestEvaluation.output_json?.dimensions && (
                  <div className="pt-4 border-t border-[#1F1F1F]/40 space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Traction Dimensions (0-20 per metric)</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(latestEvaluation.output_json.dimensions).map(([key, val]: [string, any]) => {
                        const score = Number(val) || 0;
                        const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-zinc-400 capitalize">{label}</span>
                              <span className="text-[#45f798] font-bold">{score}/20</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#161616] rounded-full overflow-hidden border border-[#1F1F1F]/80">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-[#45f798] rounded-full"
                                style={{ width: `${(score / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Flags Grid */}
                <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-[#1F1F1F]/40">
                  {/* Green Flags */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#45f798] flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Green Flags
                    </h4>
                    {latestEvaluation.output_json?.green_flags && latestEvaluation.output_json.green_flags.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-zinc-300 font-mono">
                        {latestEvaluation.output_json.green_flags.map((flag: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#45f798] font-bold">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No specific green flags highlighted.</p>
                    )}
                  </div>

                  {/* Red Flags */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Risk / Red Flags
                    </h4>
                    {latestEvaluation.output_json?.red_flags && latestEvaluation.output_json.red_flags.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-zinc-300 font-mono">
                        {latestEvaluation.output_json.red_flags.map((flag: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#45f798] italic flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        No critical red flags found.
                      </p>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {/* Financials & Traction */}
          <Card className="border-[#1F1F1F] bg-[#0A0A0A] text-white">
            <CardHeader className="border-b border-[#1F1F1F] pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#45f798]" />
                Financials & Market Traction
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Financial Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#161616]/50 border border-[#1F1F1F] p-4 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">ARR</span>
                  <span className="text-lg font-bold text-white font-mono">{formatCurrency(profile.arr)}</span>
                </div>
                <div className="bg-[#161616]/50 border border-[#1F1F1F] p-4 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">MRR</span>
                  <span className="text-lg font-bold text-white font-mono">{formatCurrency(profile.mrr)}</span>
                </div>
                <div className="bg-[#161616]/50 border border-[#1F1F1F] p-4 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">YoY Growth</span>
                  <span className="text-lg font-bold text-[#45f798] font-mono flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {formatPercent(profile.growth_rate_yoy)}
                  </span>
                </div>
                <div className="bg-[#161616]/50 border border-[#1F1F1F] p-4 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Runway</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {profile.runway_months ? `${profile.runway_months} Months` : "N/A"}
                  </span>
                </div>
              </div>

              {/* Traction details */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-[#1F1F1F]/50">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-[#1F1F1F]/40 pb-2">
                    <span className="text-zinc-500 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Customer Count</span>
                    <span className="font-mono font-semibold">{formatNumber(profile.customer_count)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-[#1F1F1F]/40 pb-2">
                    <span className="text-zinc-500 flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> Total Funding Raised</span>
                    <span className="font-mono font-semibold">{formatCurrency(totalFunding)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-[#1F1F1F]/40 pb-2">
                    <span className="text-zinc-500 flex items-center gap-1.5"><CircleDot className="h-3.5 w-3.5" /> Funding Stage</span>
                    <span className="font-mono font-semibold uppercase">{profile.funding_stage || (fundraisingRounds.length > 0 ? fundraisingRounds[fundraisingRounds.length - 1].round : "N/A")}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-[#1F1F1F]/40 pb-2">
                    <span className="text-zinc-500 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Last Funding Date</span>
                    <span className="font-mono font-semibold">{formattedLastFundingDate || (fundraisingRounds.length > 0 && fundraisingRounds[fundraisingRounds.length - 1].date ? new Date(fundraisingRounds[fundraisingRounds.length - 1].date).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A")}</span>
                  </div>
                </div>
              </div>

              {/* Fundraising Rounds Table */}
              {fundraisingRounds.length > 0 && (
                <div className="pt-4 border-t border-[#1F1F1F]/50 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500">Fundraising History</h4>
                  <div className="overflow-x-auto border border-[#1F1F1F] rounded-md">
                    <table className="min-w-full divide-y divide-[#1F1F1F] text-xs font-mono">
                      <thead className="bg-[#161616]">
                        <tr>
                          <th className="px-3 py-2 text-left text-zinc-500 uppercase font-semibold">Round</th>
                          <th className="px-3 py-2 text-left text-zinc-500 uppercase font-semibold">Amount</th>
                          <th className="px-3 py-2 text-left text-zinc-500 uppercase font-semibold">Date</th>
                          <th className="px-3 py-2 text-left text-zinc-500 uppercase font-semibold">Key Investors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F1F1F]/40 bg-black/20 text-white">
                        {fundraisingRounds.map((r, i) => (
                          <tr key={i} className="hover:bg-[#161616]/30 transition-colors">
                            <td className="px-3 py-2 text-zinc-300 font-bold uppercase">{r.round}</td>
                            <td className="px-3 py-2 text-white font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: r.currency || "USD", maximumFractionDigits: 0 }).format(r.amount)}</td>
                            <td className="px-3 py-2 text-zinc-400">{r.date ? new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}</td>
                            <td className="px-3 py-2 text-zinc-400">{r.investors?.join(", ") || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Token Profile */}
          {tokens.length > 0 && (
            <Card className="border-[#1F1F1F] bg-[#0A0A0A] text-white">
              <CardHeader className="border-b border-[#1F1F1F] pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                  <CircleDot className="h-4 w-4 text-[#45f798]" />
                  On-Chain Tokenomics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {tokens.map((token, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center border-b border-[#1F1F1F]/40 pb-2">
                      <span className="text-zinc-400 text-sm font-bold">{token.name} ({token.symbol})</span>
                      <Badge className="bg-[#161616] border border-[#1F1F1F] text-zinc-400 text-[10px] font-mono">
                        {token.chain}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Price (USD)</span>
                        <span className="text-white font-bold">{token.price_usd ? `$${token.price_usd}` : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">FDV</span>
                        <span className="text-white font-bold">{token.fdv ? `$${token.fdv.toLocaleString()}` : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Total Supply</span>
                        <span className="text-white font-bold">{token.total_supply ? token.total_supply.toLocaleString() : "N/A"}</span>
                      </div>
                    </div>
                    {token.contract_address && (
                      <div className="pt-2">
                        <span className="text-zinc-500 block uppercase tracking-wider text-[10px] font-mono mb-1">Contract Address</span>
                        <div className="bg-[#161616] border border-[#262626] rounded px-3 py-2 text-xs font-mono text-zinc-300">
                          {token.contract_address}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Founders & Leadership */}
          {founder && (
            <Card className="border-[#1F1F1F] bg-[#0A0A0A] text-white">
              <CardHeader className="border-b border-[#1F1F1F] pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#45f798]" />
                  Founders & Leadership
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center text-zinc-400 font-bold shrink-0">
                    {founder.full_name ? founder.full_name.split(" ").map((n: string) => n[0]).join("") : "FD"}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{founder.full_name || "Founder"}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{founder.bio || "No biography provided."}</p>
                    <div className="flex gap-3 pt-2">
                      {founder.linkedin_url && (
                        <a
                          href={founder.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-[#45f798] hover:underline font-mono"
                        >
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          LinkedIn Profile
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                      {founder.twitter_handle && (
                        <a
                          href={`https://x.com/${founder.twitter_handle.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-[#45f798] hover:underline font-mono"
                        >
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                          Twitter / X
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technology Profile */}
          <Card className="border-[#1F1F1F] bg-[#0A0A0A] text-white">
            <CardHeader className="border-b border-[#1F1F1F] pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#45f798]" />
                Technology Stack & Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 block">Core Tech Stack</span>
                {renderTechStack(profile.tech_stack)}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-[#1F1F1F]/50">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-zinc-500" />
                    Hosting Provider
                  </span>
                  <span className="text-sm text-zinc-300 font-mono">{profile.hosting_provider || "N/A"}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-zinc-500" />
                    Open Source Licenses
                  </span>
                  <span className="text-sm text-zinc-300 font-mono">{profile.open_source_licenses || "Proprietary"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Corporate Profile & Legal */}
          <Card className="border-[#1F1F1F] bg-[#0A0A0A] text-white">
            <CardHeader className="border-b border-[#1F1F1F] pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                <Scale className="h-4 w-4 text-[#45f798]" />
                Corporate & Corporate Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-[#1F1F1F]/40 pb-2">
                    <span className="text-zinc-500">Legal Entity Name</span>
                    <span className="text-zinc-300 font-semibold">{profile.legal_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-[#1F1F1F]/40 pb-2">
                    <span className="text-zinc-500">Incorporation Country</span>
                    <span className="text-zinc-300 font-semibold">{profile.incorporation_country || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-[#1F1F1F]/40 pb-2">
                    <span className="text-zinc-500">Incorporation Date</span>
                    <span className="text-zinc-300 font-semibold">{formattedIncorpDate || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-[#1F1F1F]/40 pb-2">
                    <span className="text-zinc-500">Team Size Range</span>
                    <span className="text-zinc-300 font-semibold font-mono">{profile.employee_count_range || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-start text-sm pb-2">
                    <span className="text-zinc-500 shrink-0">Founders Socials</span>
                    <span className="text-right">{renderFounderSocials(profile.founder_linkedin_profiles)}</span>
                  </div>
                </div>
              </div>

              {/* Official Identifiers */}
              <div className="pt-3 border-t border-[#1F1F1F]/50">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 block">Corporate Identifiers</span>
                {renderIdentifiers(profile.official_identifiers)}
              </div>

              {/* Digital Presence */}
              <div className="pt-3 border-t border-[#1F1F1F]/50 flex gap-4">
                {profile.twitter_handle && (
                  <a
                    href={`https://x.com/${profile.twitter_handle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#45f798] hover:underline"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    Twitter / X
                  </a>
                )}
                {profile.linkedin_company_url && (
                  <a
                    href={profile.linkedin_company_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#45f798] hover:underline"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn Company
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col wide) */}
        <div className="space-y-6">
          
          {/* Traction Score Radar/Meter */}
          <Card className="border-[#1F1F1F] bg-[#0A0A0A] text-white">
            <CardHeader className="border-b border-[#1F1F1F] pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#45f798]" />
                Traction Level
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="relative flex items-center justify-center">
                {/* Visual score circle */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-[#161616]"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-[#45f798] transition-all duration-1000 ease-in-out"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={351.8}
                    strokeDashoffset={351.8 - (351.8 * (profile.traction_score ?? 0)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold font-mono text-white">{profile.traction_score ?? 0}</span>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Score</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold font-mono text-zinc-200">
                  {(profile.traction_score ?? 0) >= 80 ? "EXCELLENT TRACTION" : (profile.traction_score ?? 0) >= 50 ? "HEALTHY GROWING" : "EARLY STAGE DEVELOPMENT"}
                </h4>
                <p className="text-[11px] text-zinc-500 max-w-[200px]">
                  Traction score is computed dynamically based on repository contributions, verified revenue targets, and customer retention.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Verification & Compliance */}
          <Card className="border-[#1F1F1F] bg-[#0A0A0A] text-white">
            <CardHeader className="border-b border-[#1F1F1F] pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#45f798]" />
                Investor Due Diligence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-mono uppercase">Status</span>
                  <Badge className={`font-mono text-[9px] px-2 py-0.5 uppercase font-bold border ${
                    profile.verification_status === "verified"
                      ? "bg-[#45f798]/10 border-[#45f798]/30 text-[#45f798]"
                      : profile.verification_status === "self_claimed"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400"
                  }`}>
                    {profile.verification_status ? profile.verification_status.replace("_", " ") : "Self Claimed"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-[#1F1F1F]/40 pt-2.5">
                  <span className="text-zinc-500 font-mono uppercase">Method</span>
                  <span className="text-zinc-300 font-semibold capitalize">{profile.verification_method ? profile.verification_method.replace(/_/g, " ") : "Not Evaluated"}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-[#1F1F1F]/40 pt-2.5">
                  <span className="text-zinc-500 font-mono uppercase">Last Audited</span>
                  <span className="text-zinc-300 font-mono">{formattedVerificationDate || "N/A"}</span>
                </div>

                {/* Data Quality Score Bar */}
                <div className="border-t border-[#1F1F1F]/40 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono uppercase">
                    <span className="text-zinc-500">Data Integrity</span>
                    <span className="text-[#45f798]">{profile.data_quality_score ?? 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#161616] rounded-full overflow-hidden border border-[#1F1F1F]">
                    <div
                      className="h-full bg-[#45f798] transition-all duration-1000"
                      style={{ width: `${profile.data_quality_score ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Certificate download */}
                {profile.achievement_certificate_url && (
                  <div className="border-t border-[#1F1F1F]/40 pt-3">
                    <a
                      href={profile.achievement_certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex h-9 items-center justify-center gap-1.5 rounded bg-[#161616] border border-[#262626] text-xs font-bold text-white hover:border-[#45f798]/50 hover:text-[#45f798] transition-colors"
                    >
                      <FileCheck className="h-4 w-4" />
                      View Certificate of Traction
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* On-Chain Rounds summary */}
          <Card className="border-[#1F1F1F] bg-[#0A0A0A] text-white">
            <CardHeader className="border-b border-[#1F1F1F] pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
                <Award className="h-4 w-4 text-[#45f798]" />
                On-Chain Rounds
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {rounds.length === 0 ? (
                <div className="text-center py-8">
                  <CircleDot className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">No active funding rounds registered.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rounds.map((round) => {
                    const releasedCount = round.milestones?.filter((m) => m.released_at).length || 0;
                    const totalMilestones = round.milestones?.length || 0;
                    return (
                      <Link
                        key={round.id}
                        href={`/dashboard/rounds/${round.id}`}
                        className="block rounded border border-[#1F1F1F] bg-[#161616]/50 p-3 hover:border-[#45f798]/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono">
                            {round.amount_cspr.toLocaleString()} CSPR
                          </span>
                          <Badge
                            variant={round.status === "active" ? "default" : "secondary"}
                            className="text-[9px] uppercase px-1.5 py-0"
                          >
                            {round.status}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span>Milestones:</span>
                          <span>
                            {releasedCount}/{totalMilestones} Released
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

