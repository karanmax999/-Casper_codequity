"use server";

import { revalidatePath } from "next/cache";
import type { CreateLaunchpadRoundInput } from "@/types/launchpad";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.codequity.live";

function adminKey() {
  const key = process.env.ADMIN_API_KEY;
  if (!key) {
    throw new Error("ADMIN_API_KEY is not configured.");
  }
  return key;
}

export async function getMyInvestorRecord(): Promise<ActionResult<any>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("investors")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, data };
}

export async function updateInvestorProfile(input: any): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, error: "Not authenticated" };
  }

  const allowed = [
    "name", "firm", "job_title", "website", "linkedin", "aum", "check_size",
    "focus", "notes", "wallet_pubkey"
  ];
  
  const updates = Object.keys(input)
    .filter((k) => allowed.includes(k))
    .reduce((acc, key) => ({ ...acc, [key]: input[key] }), {});

  const { error, data } = await supabase
    .from("investors")
    .update(updates)
    .eq("user_id", user.id)
    .select();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return { ok: false, error: "Profile update failed. Ensure you have database permissions to update your own record." };
  }
  
  revalidatePath("/dashboard/profile");
  return { ok: true, data: undefined };
}

export async function approveInvestor(investorId: string): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || !isAdmin(user.email)) {
    return { ok: false, error: "Unauthorized" };
  }

  const { error, data } = await supabase
    .from("investors")
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq("id", investorId)
    .select();

  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/dashboard/admin/investors");
  return { ok: true, data: undefined };
}

export async function rejectInvestor(investorId: string): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || !isAdmin(user.email)) {
    return { ok: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("investors")
    .update({
      approved: false,
      reviewed_by: user.id
    })
    .eq("id", investorId);

  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/dashboard/admin/investors");
  return { ok: true, data: undefined };
}

export async function createFundingRound(input: CreateLaunchpadRoundInput): Promise<ActionResult<{ id: string }>> {
  const total = input.milestones.reduce((sum, milestone) => sum + milestone.release_percent, 0);
  if (Math.abs(total - 100) > 0.001) {
    return { ok: false, error: "Milestone release percentages must total 100." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  const isUserAdmin = isAdmin(user.email);
  let finalInput = { ...input };

  if (!isUserAdmin) {
    // Check if approved investor and has wallet
    const { data: investor, error } = await supabase
      .from("investors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !investor) {
      return { ok: false, error: "Investor record not found." };
    }
    if (!investor.approved) {
      return { ok: false, error: "Your investor application is still pending approval." };
    }
    if (!investor.wallet_pubkey) {
      return { ok: false, error: "You must add your Casper wallet public key in your profile before creating a round." };
    }
    
    // Override investor ID
    finalInput.investor_id = investor.id;
  }

  // Bypass Python backend and create round directly in Supabase
  const { data: roundData, error: roundError } = await supabase
    .from("funding_rounds")
    .insert({
      startup_id: finalInput.startup_id,
      investor_id: finalInput.investor_id,
      amount_cspr: finalInput.amount_cspr,
      contract_uref: "deploy-hash-simulated-casper-wallet"
    })
    .select("id")
    .single();

  if (roundError || !roundData) {
    return { ok: false, error: roundError?.message || "Failed to create round." };
  }

  // Insert milestones
  const milestonesToInsert = finalInput.milestones.map((m) => ({
    funding_round_id: roundData.id,
    threshold_score: m.threshold_score,
    release_percent: m.release_percent,
    released: false
  }));

  const { error: msError } = await supabase
    .from("milestones")
    .insert(milestonesToInsert);

  if (msError) {
    // Ideally rollback round creation here, but ignoring for prototype
    return { ok: false, error: msError.message };
  }

  revalidatePath("/dashboard/rounds");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: roundData.id } };
}

export async function evaluateRound(roundId: string): Promise<ActionResult<{ released: boolean; message?: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const isUserAdmin = isAdmin(user.email);
  if (!isUserAdmin) {
    const { data: investor } = await supabase.from("investors").select("id").eq("user_id", user.id).maybeSingle();
    if (!investor) return { ok: false, error: "Not an investor" };
    // Ownership check would happen here, but relying on backend for now as requested
  }

  let key: string;
  try {
    key = adminKey();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "ADMIN_API_KEY is not configured." };
  }

  const response = await fetch(`${backendUrl}/api/launchpad/rounds/${roundId}/evaluate`, {
    method: "POST",
    headers: {
      "X-Admin-Key": key,
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: result.detail || "Evaluation failed." };
  }

  revalidatePath("/");
  revalidatePath(`/dashboard/rounds/${roundId}`);
  return { ok: true, data: result };
}
