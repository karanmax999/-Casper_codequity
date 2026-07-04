"use client";

import { useState } from "react";
import { approveInvestor, rejectInvestor } from "@/actions";
import { Check, X, Loader2 } from "lucide-react";

export function InvestorList({ initialInvestors }: { initialInvestors: any[] }) {
  const [tab, setTab] = useState<"pending" | "approved" | "all">("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = initialInvestors.filter(inv => {
    if (tab === "pending") return !inv.approved;
    if (tab === "approved") return inv.approved;
    return true;
  });

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    await approveInvestor(id);
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    await rejectInvestor(id);
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-[#1F1F1F] pb-4">
        {(["pending", "approved", "all"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-bold uppercase tracking-widest ${
              tab === t ? "text-[#45f798] border-b-2 border-[#45f798] pb-4 -mb-4" : "text-zinc-500 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-black/20 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Firm</th>
              <th className="px-6 py-4">AUM</th>
              <th className="px-6 py-4">Check Size</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-mono text-white">
                  <div>{inv.name}</div>
                  <div className="text-xs text-zinc-500">{inv.email}</div>
                </td>
                <td className="px-6 py-4">{inv.firm}</td>
                <td className="px-6 py-4">{inv.aum || "-"}</td>
                <td className="px-6 py-4">{inv.check_size || "-"}</td>
                <td className="px-6 py-4">
                  {inv.approved ? (
                    <span className="text-[#45f798] text-xs border border-[#45f798]/30 bg-[#45f798]/10 px-2 py-1 rounded">Approved</span>
                  ) : (
                    <span className="text-orange-400 text-xs border border-orange-400/30 bg-orange-400/10 px-2 py-1 rounded">Pending</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {!inv.approved && (
                    <button
                      onClick={() => handleApprove(inv.id)}
                      disabled={loadingId === inv.id}
                      className="inline-flex items-center gap-1 text-xs text-[#45f798] hover:bg-[#45f798]/10 px-2 py-1 rounded border border-[#45f798]/30 transition-colors disabled:opacity-50"
                    >
                      {loadingId === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Approve
                    </button>
                  )}
                  {inv.approved && (
                    <button
                      onClick={() => handleReject(inv.id)}
                      disabled={loadingId === inv.id}
                      className="inline-flex items-center gap-1 text-xs text-red-400 hover:bg-red-400/10 px-2 py-1 rounded border border-red-400/30 transition-colors disabled:opacity-50"
                    >
                      {loadingId === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No investors found for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
