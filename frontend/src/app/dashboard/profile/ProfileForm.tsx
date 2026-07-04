"use client";

import { useState } from "react";
import { updateInvestorProfile } from "@/actions";
import { Loader2, AlertCircle, Wallet } from "lucide-react";

export function ProfileForm({ investor }: { investor: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [walletPubkey, setWalletPubkey] = useState(investor.wallet_pubkey || "");

  const handleConnectWallet = async () => {
    const casperProvider = (window as any).CasperWalletProvider;
    if (!casperProvider) {
      alert("Casper Wallet extension is not installed. Please install it to connect.");
      window.open("https://casperwallet.io/download", "_blank");
      return;
    }

    try {
      const provider = casperProvider();
      const isConnected = await provider.requestConnection();
      if (isConnected) {
        const activeKey = await provider.getActivePublicKey();
        if (activeKey) {
          setWalletPubkey(activeKey);
        } else {
          alert("Could not retrieve active public key. Please unlock your Casper Wallet.");
        }
      } else {
        alert("Wallet connection request was rejected.");
      }
    } catch (err: any) {
      console.error("Casper Wallet Error:", err);
      alert(`Wallet Connection Error: ${err.message || err}`);
    }
  };

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
      job_title: data.job_title || null,
      website: data.website || null,
      linkedin: data.linkedin || null,
      aum: data.aum || null,
      check_size: data.check_size || null,
      focus: data.focus || null,
      notes: data.notes || null,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {!walletPubkey && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-500">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Missing Wallet Public Key</p>
            <p className="text-yellow-500/80 mt-1">
              You must connect your Casper Wallet to participate in or create on-chain funding rounds.
            </p>
          </div>
        </div>
      )}

      {walletPubkey && !investor.wallet_pubkey && (
        <div className="flex items-start gap-3 rounded-lg border border-[#45f798]/30 bg-[#45f798]/5 p-4 text-sm text-[#45f798]">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-[#45f798]" />
          <div>
            <p className="font-semibold text-white">Casper Wallet Connected</p>
            <p className="text-zinc-400 mt-1 text-xs">
              Please click the <strong className="text-[#45f798] font-bold">Save Changes</strong> button below to persist your wallet link.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label htmlFor="job_title" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Job Title
          </label>
          <input
            id="job_title"
            name="job_title"
            type="text"
            defaultValue={investor.job_title || ""}
            className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={investor.website || ""}
            className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
            placeholder="https://"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkedin" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            LinkedIn Profile
          </label>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            defaultValue={investor.linkedin || ""}
            className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="focus" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Investment Focus
          </label>
          <input
            id="focus"
            name="focus"
            type="text"
            defaultValue={investor.focus || ""}
            className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
            placeholder="e.g. DeFi, Web3 Infra"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="aum" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            AUM (Assets Under Management)
          </label>
          <input
            id="aum"
            name="aum"
            type="text"
            defaultValue={investor.aum || ""}
            className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
            placeholder="e.g. $50M"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="check_size" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Typical Check Size
          </label>
          <input
            id="check_size"
            name="check_size"
            type="text"
            defaultValue={investor.check_size || ""}
            className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
            placeholder="e.g. $250k - $1M"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="wallet_pubkey" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Casper Wallet Link
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="wallet_pubkey"
            name="wallet_pubkey"
            type="text"
            value={walletPubkey}
            readOnly
            className="h-10 flex-1 rounded-sm border border-[#2A2A2A] bg-[#080808]/50 px-3 text-xs font-mono text-zinc-400 outline-none cursor-not-allowed"
            placeholder="No wallet connected"
          />
          <button
            type="button"
            onClick={handleConnectWallet}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-[#45f798]/50 bg-black/40 hover:bg-[#45f798]/10 px-4 text-xs font-bold text-[#45f798] transition-all cursor-pointer hover:border-[#45f798]"
          >
            <Wallet className="h-4 w-4" />
            {walletPubkey ? "Reconnect Wallet" : "Connect Casper Wallet"}
          </button>
        </div>
        <p className="text-[10px] text-zinc-500">
          Connects via the Casper Wallet browser extension.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={investor.notes || ""}
          rows={3}
          className="w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 py-2 text-sm text-white outline-none focus:border-[#45f798]/50 resize-none"
          placeholder="Any other details about your investment thesis..."
        />
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
