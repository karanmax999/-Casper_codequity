"use server";

import { revalidatePath } from "next/cache";
import type { CreateLaunchpadRoundInput } from "@/types/launchpad";

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

export async function createFundingRound(input: CreateLaunchpadRoundInput) {
  const total = input.milestones.reduce((sum, milestone) => sum + milestone.release_percent, 0);
  if (Math.abs(total - 100) > 0.001) {
    throw new Error("Milestone release percentages must total 100.");
  }

  const response = await fetch(`${backendUrl}/api/launchpad/rounds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": adminKey(),
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.detail || "Failed to create round.");
  }

  revalidatePath("/");
  revalidatePath("/admin/rounds/create");
  return result;
}

export async function evaluateRound(roundId: string) {
  const response = await fetch(`${backendUrl}/api/launchpad/rounds/${roundId}/evaluate`, {
    method: "POST",
    headers: {
      "X-Admin-Key": adminKey(),
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.detail || "Evaluation failed.");
  }

  revalidatePath("/");
  revalidatePath(`/rounds/${roundId}`);
  return result;
}
