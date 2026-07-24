'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { Users, Loader2, RadioTower } from 'lucide-react';
import { CreateRoundForm } from '@/components/launchpad/CreateRoundForm';
import type { LaunchpadStartup, LaunchpadInvestor } from '@/types/launchpad';

export default function InvestorCreateRoundPage() {
  const supabase = getSupabase();
  const [loading, setLoading] = useState(true);
  const [startups, setStartups] = useState<LaunchpadStartup[]>([]);
  const [investors, setInvestors] = useState<LaunchpadInvestor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase client not available');
      setLoading(false);
      return;
    }
    const client = supabase;

    async function loadOptions() {
      try {
        // Load startups
        const { data: startupsData, error: startupsError } = await client
          .from('startups')
          .select('id, name, slug, logo_url, traction_score, data_quality_score, verification_status, github_url, category, stage, wallet_pubkey')
          .order('name', { ascending: true });

        if (startupsError) throw startupsError;

        // Load investors (only approved ones for regular users)
        const { data: authData } = await client.auth.getUser();
        const user = authData.user;
        let investorsQuery = client
          .from('investors')
          .select('id, name, firm, wallet_pubkey');

        if (user) {
          // Check if user is admin (simplified check)
          const isAdmin = user.email?.endsWith('@admin.com') || user.email === 'admin@codequity.live';

          if (!isAdmin) {
            // Regular users see only their own investor profile
            investorsQuery = investorsQuery.eq('user_id', user.id);
          }

          // Only show approved investors for regular users
          investorsQuery = investorsQuery.eq('approved', true);
        }

        const { data: investorsData, error: investorsError } = await investorsQuery
          .order('name', { ascending: true });

        if (investorsError) throw investorsError;

        setStartups(startupsData || []);
        setInvestors(investorsData || []);
      } catch (err: any) {
        console.error('Failed to load options:', err);
        setError(err.message || 'Failed to load investment options');
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#000000] text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#45f798]" />
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            Loading investment options...
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

  return (
    <div className="min-h-[70vh] bg-background">
      {/* Page Header */}
      <div className="border-b border-[#1F1F1F] pb-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="h-6 w-6 text-[#45f798]" />
            Create Funding Round
          </h1>
          <p className="text-sm text-zinc-500 max-w-2xl text-center">
            Deploy capital programmatically by creating score-gated funding rounds for startups in the CodeQuity ecosystem.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Instructions Card */}
        <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] mb-6">
          <div className="flex items-center gap-3 p-4">
            <RadioTower className="h-4 w-4 text-[#45f798]" />
            <div className="space-y-1">
              <h2 className="font-semibold text-white">How it works</h2>
              <p className="text-xs text-zinc-500">
                1. Select a startup and investor (or use your own investor profile)<br />
                2. Set the investment amount in CSPR<br />
                3. Define milestone thresholds based on traction scores<br />
                4. Authorize payment with your Casper Wallet<br />
                5. Funds are released automatically when milestones are met
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A]">
          <div className="p-6">
            <CreateRoundForm
              startups={startups}
              investors={investors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
