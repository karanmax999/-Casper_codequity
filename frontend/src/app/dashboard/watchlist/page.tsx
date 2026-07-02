"use client";

import { Star } from "lucide-react";
import Link from "next/link";

export default function WatchlistPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 py-2 selection:bg-accent selection:text-black">
      {/* Title Header */}
      <div className="border-b border-[#1F1F1F] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider flex items-center gap-2">
          <Star className="h-6 w-6 text-[#45f798]" />
          My Watchlist
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Monitor your favorited protocols and pre-seed opportunities.
        </p>
      </div>

      <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-12 text-center">
        <Star className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Watchlist is Empty</h3>
        <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Select protocols from the directory to track their traction scores and milestone escrows in real-time.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/startups"
            className="inline-flex h-9 items-center justify-center rounded-sm bg-[#45f798] px-5 text-xs font-bold text-black hover:bg-[#63ffab] transition-colors"
          >
            Browse Protocols
          </Link>
        </div>
      </div>
    </div>
  );
}
