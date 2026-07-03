"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  FileText,
  Code2,
  Wallet,
  Sparkles,
  Loader2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default function RegisterProtocol() {
  const supabase = getSupabase();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [tractionScore, setTractionScore] = useState(70);
  const [walletPubkey, setWalletPubkey] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setStatus(null);

    if (!name || !slug) {
      setStatus("Error: Protocol Name and Slug are required.");
      setSaving(false);
      return;
    }

    if (walletPubkey && walletPubkey.length !== 66 && walletPubkey.length !== 68) {
      setStatus("Error: Casper Public Key must be exactly 66 or 68 hex characters.");
      setSaving(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus("Error: You must be logged in to register a protocol.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("startups")
      .insert([
        {
          name,
          slug,
          description,
          github_url: githubUrl || null,
          traction_score: Number(tractionScore),
          wallet_pubkey: walletPubkey || null,
          founder_id: user.id,
        },
      ]);

    if (error) {
      setStatus(`Database Error: ${error.message}`);
      setSaving(false);
    } else {
      setSuccess(true);
      setStatus("Success: Protocol registered successfully!");
      setSaving(false);
      setTimeout(() => {
        router.push("/dashboard/startups");
      }, 1500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2 selection:bg-accent selection:text-black">
      {/* Header */}
      <div className="border-b border-[#1F1F1F] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-[#45f798]" />
          Register Protocol
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Create and launch your startup profile on the Casper traction launching network.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-5 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#1F1F1F] pb-3">
          <Sparkles className="h-5 w-5 text-[#45f798]" /> Startup Profile Information
        </h2>

        {status && (
          <div
            className={`flex items-start gap-2.5 rounded-sm border p-3.5 text-xs ${
              success
                ? "border-[#45f798]/30 bg-[#45f798]/5 text-[#45f798]"
                : "border-red-500/30 bg-red-500/5 text-red-400"
            }`}
          >
            {success ? <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" /> : <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />}
            <span>{status}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Protocol Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-zinc-400" /> Protocol Name *
            </label>
            <input
              type="text"
              placeholder="e.g. CasperGuard"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Auto generate slug
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
              }}
              required
              className="w-full bg-[#030303] border border-[#1F1F1F] rounded-sm py-2.5 px-3 text-sm text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-[#45f798] transition-colors"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              Slug Identifier *
            </label>
            <input
              type="text"
              placeholder="e.g. casperguard"
              value={slug}
              onChange={(e) => setSlug(e.target.value.trim().toLowerCase())}
              required
              className="w-full bg-[#030303] border border-[#1F1F1F] rounded-sm py-2.5 px-3 text-sm text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-[#45f798] transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Description
          </label>
          <textarea
            placeholder="Describe your protocol's vision, ecosystem, and traction milestones..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-[#030303] border border-[#1F1F1F] rounded-sm py-2.5 px-3 text-sm text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-[#45f798] transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GitHub Repository */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-zinc-400" /> GitHub Repository URL
            </label>
            <input
              type="url"
              placeholder="https://github.com/org/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value.trim())}
              className="w-full bg-[#030303] border border-[#1F1F1F] rounded-sm py-2.5 px-3 text-sm text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-[#45f798] transition-colors"
            />
          </div>

          {/* Initial Traction Score */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Initial Traction Score (1-100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={tractionScore}
              onChange={(e) => setTractionScore(Number(e.target.value))}
              className="w-full bg-[#030303] border border-[#1F1F1F] rounded-sm py-2.5 px-3 text-sm text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-[#45f798] transition-colors"
            />
          </div>
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-zinc-400" /> Casper Public Key (wallet_pubkey)
          </label>
          <input
            type="text"
            placeholder="02034c0d05bc3b5fdb3f661a085d331895a37060982de4c61117487c2de521456b82"
            value={walletPubkey}
            onChange={(e) => setWalletPubkey(e.target.value.trim())}
            className="w-full bg-[#030303] border border-[#1F1F1F] rounded-sm py-2.5 px-3 text-sm text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-[#45f798] transition-colors"
          />
          <p className="text-[10px] text-zinc-500 leading-normal">
            Must be a valid 66 or 68-character compressed public key.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] text-xs font-bold text-black hover:bg-[#63ffab] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register Protocol Profile"}
        </button>
      </form>
    </div>
  );
}
