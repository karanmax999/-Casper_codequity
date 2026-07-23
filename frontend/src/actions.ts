"use server";

import { revalidatePath } from "next/cache";
import type { CreateLaunchpadRoundInput } from "@/types/launchpad";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const backendUrl =
  (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://backend.codequity.live"
  ).replace(/\/+$/, "");

function adminKey() {
  const key = process.env.ADMIN_API_KEY;
  if (!key) {
    throw new Error("ADMIN_API_KEY is not configured.");
  }
  return key;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server action error.";
}

async function apiError(response: Response, fallback: string) {
  const result = await response.json().catch(() => ({}));
  return result.detail || result.error || fallback;
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
  revalidatePath("/dashboard");
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
  try {
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

    let key: string;
    try {
      key = adminKey();
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }

    // Include the wallet signature in the request if available
    const payload = { ...finalInput };

    const response = await fetch(`${backendUrl}/api/launchpad/rounds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": key,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: result.detail || "Failed to create round." };
    }

    revalidatePath("/dashboard/rounds");
    revalidatePath("/dashboard");
    return { ok: true, data: { id: result.id } };
  } catch (error) {
    return { ok: false, error: `Create round failed before backend response: ${errorMessage(error)}` };
  }
}

export async function broadcastCasperDeploy(
  deployJson: Record<string, any>,
  options: { wait?: boolean; requireFinalized?: boolean; timeoutSeconds?: number } = {},
): Promise<ActionResult<{ deploy_hash: string; status: "pending" | "success" }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    let key: string;
    try {
      key = adminKey();
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }

    const response = await fetch(`${backendUrl}/api/launchpad/casper/deploy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": key,
      },
      body: JSON.stringify({
        deploy_json: deployJson,
        wait: options.wait ?? true,
        timeout_seconds: options.timeoutSeconds ?? 300,
      }),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: result.detail || "Casper deploy broadcast failed." };
    }

    if (!result.deploy_hash) {
      return { ok: false, error: "Casper RPC did not return a deploy hash." };
    }

    if (options.requireFinalized && result.status !== "success") {
      return {
        ok: false,
        error: `Casper deploy ${result.deploy_hash || ""} was accepted but not finalized yet. Please retry after it appears on the testnet explorer.`,
      };
    }

    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: `Casper deploy broadcast failed before backend response: ${errorMessage(error)}` };
  }
}

export async function getEvaluatePayload(roundId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    let key: string;
    try {
      key = adminKey();
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }

    // We reuse the evaluate endpoint but add a dry_run parameter
    const response = await fetch(`${backendUrl}/api/launchpad/rounds/${roundId}/evaluate?dry_run=true`, {
      method: "POST",
      headers: {
        "X-Admin-Key": key,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, error: await apiError(response, "Failed to fetch evaluation payload.") };
    }

    const result = await response.json().catch(() => ({}));
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: `Evaluation dry-run failed before backend response: ${errorMessage(error)}` };
  }
}

export async function runStartupEvaluation(
  startupId: string,
  roundId?: string,
): Promise<ActionResult<{ traction_score: number; score: any }>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    let key: string;
    try {
      key = adminKey();
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }

    const response = await fetch(`${backendUrl}/api/agents/score/startup/${startupId}`, {
      method: "POST",
      headers: {
        "X-Admin-Key": key,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, error: await apiError(response, "AI evaluation failed.") };
    }

    const result = await response.json().catch(() => ({}));
    revalidatePath(`/dashboard/startups/${startupId}`);
    if (roundId) {
      revalidatePath(`/dashboard/rounds/${roundId}`);
    }

    return {
      ok: true,
      data: {
        traction_score: Number(result.traction_score ?? result.score?.total ?? 0),
        score: result.score,
      },
    };
  } catch (error) {
    return { ok: false, error: `AI evaluation failed before backend response: ${errorMessage(error)}` };
  }
}

export async function evaluateRound(roundId: string, deployHash?: string): Promise<ActionResult<{ released: boolean; message?: string }>> {
  try {
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
      return { ok: false, error: errorMessage(error) };
    }

    const evaluateUrl = new URL(`${backendUrl}/api/launchpad/rounds/${roundId}/evaluate`);
    if (deployHash) {
      evaluateUrl.searchParams.set("deploy_hash", deployHash);
    }

    const response = await fetch(evaluateUrl.toString(), {
      method: "POST",
      headers: {
        "X-Admin-Key": key,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, error: await apiError(response, "Evaluation failed.") };
    }

    const result = await response.json().catch(() => ({}));
    revalidatePath("/");
    revalidatePath(`/dashboard/rounds/${roundId}`);
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: `Evaluation finalize failed before backend response: ${errorMessage(error)}` };
  }
}
