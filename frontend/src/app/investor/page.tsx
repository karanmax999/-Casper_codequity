'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { Users, Loader2, ArrowUpRight } from 'lucide-react';
import { RoundCard } from '@/components/launchpad/RoundCard';

type Round = {
  id: string;
  startup_id: string;
  investor_id: string;
  amount_cspr: number;
  escrow_contract_uref: string;
  safe_nft_mint_hash: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  startup: {
    id: string;
    name: string;
    slug: string | null;
    logo_url: string | null;
    traction_score: number | null;
    wallet_pubkey: string | null;
  } | null;
  investor: {
    id: string;
    name: string;
    firm: string | null;
    wallet_pubkey: string | null;
  } | null;
  milestones: Array<{
    id: string;
    funding_round_id: string;
    milestone_index: number;
    threshold_score: number;
    release_percent: number;
    released_at: string | null;
    tx_hash: string | null;
  }>;
};

export default function InvestorLandingPage() {
  const supabase = getSupabase();
  const [loading, setLoading] = useState(true);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase client not available');
      setLoading(false);
      return;
    }
    const client = supabase;

    async function loadRounds() {
      try {
        const { data, error } = await client
          .from('funding_rounds')
          .select(`
            *,
            startup:startups(id, name, slug, logo_url, traction_score, wallet_pubkey),
            investor:investors(id, name, firm, wallet_pubkey),
            milestones(*)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRounds(data || []);
      } catch (err: any) {
        console.error('Failed to load rounds:', err);
        setError(err.message || 'Failed to load investment opportunities');
      } finally {
        setLoading(false);
      }
    }

    loadRounds();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#000000] text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#45f798]" />
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            Loading investment opportunities...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#000000] text-foreground">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-6">
            <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Loading Error</h3>
            <p className="text-xs text-zinc-500 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#000000] text-foreground">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-6">
            <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Active Opportunities</h3>
            <p className="text-xs text-zinc-500 mt-2">
              Check back soon for new investment opportunities on the CodeQuity Launchpad.
            </p>
            <Link
              href="/dashboard/investor/create-round"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-[#2A2A2A] px-3 text-xs font-semibold text-zinc-300 hover:border-[#45f798]/50 hover:text-[#45f798]"
            >
              Become an Investor
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-8">
      {/* Title Header */}
      <div className="border-b border-[#1F1F1F] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="h-6 w-6 text-[#45f798]" />
          Investment Opportunities
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Browse actively funding startups on the CodeQuity Launchpad
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 text-center">
        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Active Rounds</div>
          <div className="mt-1 truncate text-sm font-semibold text-white">{rounds.length}</div>
        </div>
        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Total Funding</div>
          <div className="mt-1 truncate text-sm font-semibold text-cta">
            {rounds.reduce((sum, round) => sum + round.amount_cspr, 0).toFixed(2)} CSPR
          </div>
        </div>
        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Avg. Traction Score</div>
          <div className="mt-1 truncate text-sm font-semibold text-white">
            {rounds.length > 0 ? (
              Math.round(
                (rounds.reduce((sum, round) => sum + (round.startup?.traction_score ?? 0), 0) / rounds.length) * 10
              ) / 10
            ) : 0
            }/100
          </div>
        </div>
        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Milestones Live</div>
          <div className="mt-1 truncate text-sm font-semibold text-white">
            {rounds.reduce((sum, round) => sum + (round.milestones?.length ?? 0), 0)}
          </div>
        </div>
      </div>

      {/* Investment Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rounds.map((round) => (
          <RoundCard key={round.id} round={round} />
        ))}
      </div>

      {/* Call to Action */}
      <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-8 text-center">
        <h3 className="text-lg font-bold text-white mb-4">
          Ready to deploy capital?
        </h3>
        <p className="text-sm text-zinc-400 mb-6">
          Connect your Casper Wallet and create score-gated funding rounds for promising startups.
        </p>
        <div className="flex justify-center">
          <Link
            href="/dashboard/investor/create-round"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-5 text-xs font-bold text-black transition-colors hover:bg-[#63ffab]"
          >
            Create Funding Round
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
