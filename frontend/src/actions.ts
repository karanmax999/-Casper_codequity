'use server';

import { revalidatePath } from 'next/cache';

const BACKEND_URL = process.env.BACKEND_URL!;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY!;

export async function createFundingRound(data: any) {
  const response = await fetch(`${BACKEND_URL}/api/launchpad/rounds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': ADMIN_API_KEY,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || 'Failed to create round');
  }

  revalidatePath('/');
  revalidatePath('/admin/rounds/create');
  return result;
}

export async function evaluateRound(roundId: string) {
  const response = await fetch(`${BACKEND_URL}/api/launchpad/rounds/${roundId}/evaluate`, {
    method: 'POST',
    headers: {
      'X-Admin-Key': ADMIN_API_KEY,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || 'Evaluation failed');
  }

  revalidatePath(`/rounds/${roundId}`);
  return result;
}