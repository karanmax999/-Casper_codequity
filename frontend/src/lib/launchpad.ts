import { createClient } from "@/lib/supabase/server";
import type { LaunchpadAgentOutput, LaunchpadInvestor, LaunchpadRound, LaunchpadStartup } from "@/types/launchpad";

export async function listLaunchpadRounds() {
  const supabase = await createClient();

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
  const supabase = await createClient();

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

export async function getLatestStartupAgentProof(startupId?: string | null) {
  if (!startupId) return { proof: null, error: null };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_outputs")
    .select("id, startup_id, agent_type, output_json, created_at")
    .eq("startup_id", startupId)
    .eq("agent_type", "startup_scorer")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch startup agent proof:", error);
    return { proof: null, error: error.message };
  }

  return { proof: data as LaunchpadAgentOutput | null, error: null };
}

export async function listLaunchpadCreateOptions() {
  const supabase = await createClient();

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

export async function listOnChainTransactions(roundId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("on_chain_transactions")
    .select(`
      *,
      funding_round:funding_rounds(
        id,
        startup:startups(name)
      )
    `)
    .order("created_at", { ascending: false });

  if (roundId) {
    query = query.eq("funding_round_id", roundId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch on-chain transactions:", error);
    return [];
  }

  return data || [];
}
