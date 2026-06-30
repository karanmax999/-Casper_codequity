"use client";

import { useState, useTransition } from "react";
import { RadioTower } from "lucide-react";
import { evaluateRound } from "@/actions";

export function EvaluateRoundButton({ roundId }: { roundId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            try {
              const result = await evaluateRound(roundId);
              setMessage(result.released ? "Milestone release recorded." : "No milestone is ready for release yet.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Evaluation failed.");
            }
          });
        }}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-[#45f798] px-4 text-xs font-bold text-black transition-colors hover:bg-[#63ffab] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RadioTower className="h-3.5 w-3.5" />
        {isPending ? "Evaluating..." : "Evaluate score release"}
      </button>
      {message && <p className="text-xs text-zinc-500">{message}</p>}
    </div>
  );
}
