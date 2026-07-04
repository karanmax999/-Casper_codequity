"use client";

import { useState } from "react";
import { updateInvestorProfile } from "@/actions";
import { Loader2 } from "lucide-react";

export function ProfileForm({ investor }: { investor: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const result = await updateInvestorProfile({
      name: data.name,
      firm: data.firm,
      wallet_pubkey: data.wallet_pubkey || null,
    });

    if (result.ok) {
      setMessage("Profile updated successfully.");
    } else {
      setErrorMsg(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={investor.name || ""}
          required
          className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="firm" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Firm / Company
        </label>
        <input
          id="firm"
          name="firm"
          type="text"
          defaultValue={investor.firm || ""}
          required
          className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="wallet_pubkey" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Casper Wallet Public Key
        </label>
        <input
          id="wallet_pubkey"
          name="wallet_pubkey"
          type="text"
          defaultValue={investor.wallet_pubkey || ""}
          className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm font-mono text-white outline-none focus:border-[#45f798]/50"
          placeholder="01..."
        />
        <p className="text-xs text-zinc-500">
          Required to create funding rounds. Must be your Casper Testnet public key.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {message && (
        <div className="rounded border border-[#45f798]/30 bg-[#45f798]/10 p-4 text-sm text-[#45f798]">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-6 text-xs font-bold text-black transition-colors hover:bg-[#63ffab] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
