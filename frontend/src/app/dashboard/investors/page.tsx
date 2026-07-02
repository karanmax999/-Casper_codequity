"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Users, Wallet, Loader2, ShieldCheck } from "lucide-react";

export default function InvestorsDirectory() {
  const supabase = getSupabase();
  const [loading, setLoading] = useState(true);
  const [investors, setInvestors] = useState<any[]>([]);

  useEffect(() => {
    if (!supabase) return;

    async function fetchInvestors() {
      const { data } = await supabase!
        .from("investors")
        .select("id, name, firm, wallet_pubkey");
      
      if (data) {
        setInvestors(data);
      }
      setLoading(false);
    }

    fetchInvestors();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#000000] text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#45f798]" />
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Loading investor pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 selection:bg-accent selection:text-black">
      {/* Title Header */}
      <div className="border-b border-[#1F1F1F] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="h-6 w-6 text-[#45f798]" />
          Investor Pipeline
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Browse verified capital providers and ecosystem syndicates.
        </p>
      </div>

      {investors.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {investors.map((investor) => (
            <div
              key={investor.id}
              className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-5 hover:border-zinc-500 transition-all flex flex-col justify-between h-[150px]"
            >
              <div>
                <h3 className="text-base font-bold text-white">
                  {investor.name}
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#45f798]" />
                  {investor.firm || "Independent Syndicate"}
                </p>
              </div>

              <div className="border-t border-[#1F1F1F] pt-3 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                <Wallet className="h-3.5 w-3.5 text-zinc-600" />
                <span className="truncate" title={investor.wallet_pubkey}>
                  {investor.wallet_pubkey || "No Signer Address Associated"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-12 text-center">
          <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Investors Registered</h3>
          <p className="text-xs text-zinc-500 mt-2">
            No capital partners are linked to the database yet.
          </p>
        </div>
      )}
    </div>
  );
}
