"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Fingerprint,
  Wallet,
  ShieldAlert,
  LogOut,
  CheckCircle,
  Copy,
  Terminal,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const supabase = getSupabase();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [casperKey, setCasperKey] = useState("");
  const [role, setRole] = useState("founder"); // founder | investor
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    async function checkUser() {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setUser(user);

      // Load saved local preferences
      const savedKey = localStorage.getItem("casper_public_key") || "";
      const savedRole = localStorage.getItem("user_role") || "founder";
      setCasperKey(savedKey);
      setRole(savedRole);
      setLoading(false);
    }

    checkUser();
  }, [supabase, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);

    // Validate Casper Key length if present
    if (casperKey && casperKey.length !== 66) {
      setSaveStatus("Error: Casper Public Key must be exactly 66 hex characters (starts with 01 or 02).");
      setSaving(false);
      return;
    }

    localStorage.setItem("casper_public_key", casperKey);
    localStorage.setItem("user_role", role);

    setTimeout(() => {
      setSaveStatus("Success: Profile settings saved successfully.");
      setSaving(false);
    }, 800);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#000000] text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#45f798]" />
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 selection:bg-accent selection:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <User className="h-8 w-8 text-[#45f798]" />
            Profile Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your user session, protocol role, and Casper network identities.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-9 items-center justify-center gap-2 rounded-sm border border-red-500/20 bg-red-500/10 px-4 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Disconnect Account
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Identity Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1F1F1F] border border-border text-lg font-mono text-white">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Active Identity</p>
                <h3 className="font-bold text-white max-w-[180px] truncate" title={user.email}>
                  {user.email?.split("@")[0]}
                </h3>
              </div>
            </div>

            <div className="border-t border-[#1F1F1F] pt-4 space-y-3">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <Mail className="h-3.5 w-3.5 text-zinc-600" /> Email Address
                </span>
                <p className="text-sm text-white font-mono break-all bg-[#030303] border border-[#1F1F1F] px-2.5 py-1.5 rounded-sm">
                  {user.email}
                </p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <Fingerprint className="h-3.5 w-3.5 text-zinc-600" /> Identity ID
                </span>
                <div className="flex items-center gap-1.5 bg-[#030303] border border-[#1F1F1F] px-2.5 py-1.5 rounded-sm">
                  <p className="text-xs text-zinc-400 font-mono truncate flex-1">
                    {user.id}
                  </p>
                  <button
                    onClick={() => copyToClipboard(user.id)}
                    className="text-zinc-500 hover:text-white transition-colors"
                    title="Copy ID"
                  >
                    {copied ? (
                      <CheckCircle className="h-3.5 w-3.5 text-[#45f798]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form & Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-5 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#1F1F1F] pb-3">
              <Terminal className="h-5 w-5 text-[#45f798]" /> Protocol Identity Preferences
            </h2>

            {saveStatus && (
              <div
                className={`flex items-start gap-2.5 rounded-sm border p-3.5 text-xs ${
                  saveStatus.startsWith("Success")
                    ? "border-[#45f798]/30 bg-[#45f798]/5 text-[#45f798]"
                    : "border-red-500/30 bg-red-500/5 text-red-400"
                }`}
              >
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{saveStatus}</span>
              </div>
            )}

            {/* Casper Key Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-[#45f798]" /> Casper Public Key (Hex)
                </label>
                <span className="text-[10px] text-zinc-600 font-mono">Length: {casperKey.length}/66</span>
              </div>
              <input
                type="text"
                placeholder="02034c0d05bc3b5fdb3f661a085d331895a37060982de4c61117487c2de521456b82"
                value={casperKey}
                onChange={(e) => setCasperKey(e.target.value.trim())}
                className="w-full bg-[#030303] border border-[#1F1F1F] rounded-sm py-2.5 px-3 text-sm text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-[#45f798] transition-colors"
              />
              <p className="text-[10px] text-zinc-500 leading-normal">
                This public key will be automatically populated as your signer address across launchpad deployments and round transactions.
              </p>
            </div>

            {/* Role Config Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Select Dashboard View Mode
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setRole("founder")}
                  className={`border rounded-md p-4 cursor-pointer transition-all duration-200 ${
                    role === "founder"
                      ? "border-[#45f798] bg-[#45f798]/5"
                      : "border-[#1F1F1F] bg-[#030303] hover:border-zinc-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white">Startup Founder</span>
                    <div
                      className={`h-3 w-3 rounded-full border ${
                        role === "founder" ? "bg-[#45f798] border-[#45f798]" : "border-zinc-700"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Deploy escrow rounds, manage your milestone releases, and claim verified capital pools.
                  </p>
                </div>

                <div
                  onClick={() => setRole("investor")}
                  className={`border rounded-md p-4 cursor-pointer transition-all duration-200 ${
                    role === "investor"
                      ? "border-[#45f798] bg-[#45f798]/5"
                      : "border-[#1F1F1F] bg-[#030303] hover:border-zinc-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white">Venture Investor</span>
                    <div
                      className={`h-3 w-3 rounded-full border ${
                        role === "investor" ? "bg-[#45f798] border-[#45f798]" : "border-zinc-700"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Browse active traction opportunities, deposit escrow funds, and verify milestone releases.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] text-xs font-bold text-black hover:bg-[#63ffab] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Preferences"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
