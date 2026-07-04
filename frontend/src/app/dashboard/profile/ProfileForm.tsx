"use client";

import { useState, useEffect } from "react";
import { updateInvestorProfile } from "@/actions";
import { Loader2, AlertCircle, Wallet, Copy, Check } from "lucide-react";

export function ProfileForm({ investor }: { investor: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [walletPubkey, setWalletPubkey] = useState(investor.wallet_pubkey || "");
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!walletPubkey) return;
    try {
      await navigator.clipboard.writeText(walletPubkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  useEffect(() => {
    // Instantly load cached wallet public key on mount to prevent reset on refresh
    const cachedPubkey = localStorage.getItem("casper_connected_pubkey");
    if (cachedPubkey && !walletPubkey) {
      setWalletPubkey(cachedPubkey);
    }

    const handleActiveKeyChanged = async (event: any) => {
      const isDisconnected = localStorage.getItem("casper_wallet_disconnected") === "true";
      if (isDisconnected) return;
      if (event.detail && event.detail.activeKey) {
        const activeKey = event.detail.activeKey;
        setWalletPubkey(activeKey);
        localStorage.setItem("casper_connected_pubkey", activeKey);
        if (activeKey !== investor.wallet_pubkey) {
          await updateInvestorProfile({ wallet_pubkey: activeKey });
        }
      }
    };

    const handleConnected = async (event: any) => {
      const isDisconnected = localStorage.getItem("casper_wallet_disconnected") === "true";
      if (isDisconnected) return;
      if (event.detail && event.detail.activeKey) {
        const activeKey = event.detail.activeKey;
        setWalletPubkey(activeKey);
        localStorage.setItem("casper_connected_pubkey", activeKey);
        if (activeKey !== investor.wallet_pubkey) {
          await updateInvestorProfile({ wallet_pubkey: activeKey });
        }
      }
    };

    const handleDisconnected = async () => {
      setWalletPubkey("");
      localStorage.removeItem("casper_connected_pubkey");
      if (investor.wallet_pubkey) {
        await updateInvestorProfile({ wallet_pubkey: null });
      }
    };

    // Register Casper Wallet custom event listeners
    window.addEventListener("casper-wallet:activeKeyChanged", handleActiveKeyChanged);
    window.addEventListener("casper-wallet:connected", handleConnected);
    window.addEventListener("casper-wallet:disconnected", handleDisconnected);

    const checkConnection = async () => {
      const isDisconnected = localStorage.getItem("casper_wallet_disconnected") === "true";
      if (isDisconnected) return;

      const casperProvider = (window as any).CasperWalletProvider;
      if (casperProvider) {
        try {
          const provider = casperProvider();
          const connected = await provider.isConnected();
          if (connected) {
            const activeKey = await provider.getActivePublicKey();
            if (activeKey) {
              setWalletPubkey(activeKey);
              localStorage.setItem("casper_connected_pubkey", activeKey);
              if (activeKey !== investor.wallet_pubkey) {
                await updateInvestorProfile({ wallet_pubkey: activeKey });
              }
            }
          }
        } catch (err) {
          console.error("Auto-connect check failed:", err);
        }
      }
    };

    // Immediate check
    checkConnection();

    // Poll for the provider in case it is injected asynchronously after mount
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).CasperWalletProvider) {
        checkConnection();
        clearInterval(interval);
      } else if (attempts >= 15) {
        clearInterval(interval);
      }
    }, 100);

    return () => {
      window.removeEventListener("casper-wallet:activeKeyChanged", handleActiveKeyChanged);
      window.removeEventListener("casper-wallet:connected", handleConnected);
      window.removeEventListener("casper-wallet:disconnected", handleDisconnected);
      clearInterval(interval);
    };
  }, [investor.wallet_pubkey, walletPubkey]);

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
          localStorage.setItem("casper_connected_pubkey", activeKey);
          localStorage.removeItem("casper_wallet_disconnected");
          
          // Auto-persist to DB immediately
          await updateInvestorProfile({ wallet_pubkey: activeKey });
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

  const handleDisconnectWallet = async () => {
    setWalletPubkey("");
    localStorage.removeItem("casper_connected_pubkey");
    localStorage.setItem("casper_wallet_disconnected", "true");
    
    // Auto-persist to DB immediately
    await updateInvestorProfile({ wallet_pubkey: null });
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

      {walletPubkey && (
        <div className="flex items-start gap-3 rounded-lg border border-[#45f798]/30 bg-[#45f798]/5 p-4 text-sm text-[#45f798]">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-[#45f798]" />
          <div>
            <p className="font-semibold text-white">
              {investor.wallet_pubkey === walletPubkey ? "Casper Wallet Linked" : "Linking Casper Wallet..."}
            </p>
            <p className="text-zinc-400 mt-1 text-xs">
              {investor.wallet_pubkey === walletPubkey 
                ? "Your Casper Wallet is successfully linked and saved to the database."
                : "Persisting your wallet public key to the database..."}
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
          <div className="relative flex-1">
            <input
              id="wallet_pubkey"
              name="wallet_pubkey"
              type="text"
              value={walletPubkey}
              readOnly
              className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808]/50 pl-3 pr-10 text-xs font-mono text-zinc-400 outline-none cursor-not-allowed"
              placeholder="No wallet connected"
            />
            {walletPubkey && (
              <button
                type="button"
                onClick={handleCopyAddress}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Copy Address"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#45f798]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
          {walletPubkey ? (
            <button
              type="button"
              onClick={handleDisconnectWallet}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-red-500/50 bg-black/40 hover:bg-red-500/10 px-4 text-xs font-bold text-red-400 transition-all cursor-pointer hover:border-red-500 shrink-0"
            >
              <Wallet className="h-4 w-4" />
              Disconnect Wallet
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnectWallet}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-[#45f798]/50 bg-black/40 hover:bg-[#45f798]/10 px-4 text-xs font-bold text-[#45f798] transition-all cursor-pointer hover:border-[#45f798] shrink-0"
            >
              <Wallet className="h-4 w-4" />
              Connect Casper Wallet
            </button>
          )}
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
