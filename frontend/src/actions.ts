"use server";

import { revalidatePath } from "next/cache";
import type { CreateLaunchpadRoundInput } from "@/types/launchpad";

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

export async function createFundingRound(input: CreateLaunchpadRoundInput): Promise<ActionResult<{ id: string }>> {
  const total = input.milestones.reduce((sum, milestone) => sum + milestone.release_percent, 0);
  if (Math.abs(total - 100) > 0.001) {
    return { ok: false, error: "Milestone release percentages must total 100." };
  }

  let key: string;
  try {
    key = adminKey();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "ADMIN_API_KEY is not configured." };
  }

  const response = await fetch(`${backendUrl}/api/launchpad/rounds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": key,
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: result.detail || "Failed to create round." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/rounds/create");
  revalidatePath("/dashboard/transactions");
  return { ok: true, data: result };
}

export async function evaluateRound(roundId: string): Promise<ActionResult<{ released: boolean; message?: string }>> {
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
