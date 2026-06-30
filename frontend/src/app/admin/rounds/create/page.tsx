import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { listLaunchpadCreateOptions } from "@/lib/launchpad";
import { CreateRoundForm } from "@/components/launchpad/CreateRoundForm";

export const dynamic = "force-dynamic";

export default async function CreateRoundPage() {
  const { startups, investors } = await listLaunchpadCreateOptions();

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-[#45f798]">
        <ArrowLeft className="h-3.5 w-3.5" />
        Launchpad rounds
      </Link>

      <section className="max-w-5xl rounded-sm border border-[#1F1F1F] bg-[#0A0A0A]">
        <div className="border-b border-[#1F1F1F] p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin launchpad
          </div>
          <h1 className="mt-2 text-xl font-semibold text-white">Create score-gated funding round</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Select a startup, investor, CSPR amount, and score thresholds. The backend will create a round and placeholder chain records until Casper release is connected.
          </p>
        </div>
        <div className="p-5">
          <CreateRoundForm startups={startups} investors={investors} />
        </div>
      </section>
    </div>
  );
}
