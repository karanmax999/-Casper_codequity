import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { listLaunchpadCreateOptions } from "@/lib/launchpad";
import { CreateRoundForm } from "@/components/launchpad/CreateRoundForm";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CreateRoundPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email;
  const isUserAdmin = isAdmin(email);

  const { data: myInvestor } = await supabase
    .from("investors")
    .select("*")
    .eq("user_id", user?.id)
    .maybeSingle();

  if (!isUserAdmin) {
    if (!myInvestor || !myInvestor.approved) {
      redirect("/dashboard");
    }
  }

  const { startups, investors } = await listLaunchpadCreateOptions();

  // If not admin, restrict the investor list to just this investor
  const availableInvestors = isUserAdmin 
    ? investors 
    : investors.filter(inv => inv.id === myInvestor?.id);

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-[#45f798]">
        <ArrowLeft className="h-3.5 w-3.5" />
        Launchpad rounds
      </Link>

      <section className="max-w-5xl rounded-sm border border-[#1F1F1F] bg-[#0A0A0A]">
        <div className="border-b border-[#1F1F1F] p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
            {isUserAdmin ? (
              <><ShieldCheck className="h-3.5 w-3.5" /> Admin launchpad</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Investor Action</>
            )}
          </div>
          <h1 className="mt-2 text-xl font-semibold text-white">Create score-gated funding round</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Select a startup, CSPR amount, and score thresholds. Wallet public keys improve on-chain execution, but the flow lets you prepare and test launchpad rounds first.
          </p>
        </div>
        <div className="p-5">
          {!isUserAdmin && !myInvestor?.wallet_pubkey ? (
            <div className="rounded border border-orange-500/30 bg-orange-500/10 p-6 text-center">
              <p className="text-orange-400 font-bold mb-2">Wallet Required</p>
              <p className="text-sm text-zinc-400 mb-4">You must add your Casper wallet public key to your profile before creating a funding round.</p>
              <Link href="/dashboard/profile" className="inline-flex items-center justify-center rounded bg-orange-500/20 px-4 py-2 text-xs font-bold text-orange-400 hover:bg-orange-500/30">
                Go to Profile
              </Link>
            </div>
          ) : (
            <CreateRoundForm startups={startups} investors={availableInvestors} />
          )}
        </div>
      </section>
    </div>
  );
}
