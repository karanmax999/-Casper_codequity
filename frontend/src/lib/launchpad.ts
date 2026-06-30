import { getSupabase } from "@/lib/supabase";
import type { LaunchpadInvestor, LaunchpadRound, LaunchpadStartup } from "@/types/launchpad";

export async function listLaunchpadRounds() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("funding_rounds")
    .select(`
      *,
      startup:startups(id, name, slug, logo_url, traction_score, wallet_pubkey),
      investor:investors(id, name, firm, wallet_pubkey),
      milestones(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch launchpad rounds:", error);
    return [];
  }

  return (data || []) as LaunchpadRound[];
}

export async function getLaunchpadRound(roundId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("funding_rounds")
    .select(`
      *,
      startup:startups(id, name, slug, logo_url, traction_score, wallet_pubkey),
      investor:investors(id, name, firm, wallet_pubkey),
      milestones(*),
      on_chain_transactions(*)
    `)
    .eq("id", roundId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch launchpad round:", error);
    return null;
  }

  return data as LaunchpadRound | null;
}

export async function listLaunchpadCreateOptions() {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      startups: [] as LaunchpadStartup[],
      investors: [] as LaunchpadInvestor[],
    };
  }

  const [startupsResult, investorsResult] = await Promise.all([
    supabase
      .from("startups")
      .select("id, name, slug, traction_score, wallet_pubkey")
      .order("name", { ascending: true }),
    supabase
      .from("investors")
      .select("id, name, firm, wallet_pubkey")
      .order("name", { ascending: true }),
  ]);

  if (startupsResult.error) {
    console.error("Failed to fetch startup options:", startupsResult.error);
  }
  if (investorsResult.error) {
    console.error("Failed to fetch investor options:", investorsResult.error);
  }

  return {
    startups: (startupsResult.data || []) as LaunchpadStartup[],
    investors: (investorsResult.data || []) as LaunchpadInvestor[],
  };
}
