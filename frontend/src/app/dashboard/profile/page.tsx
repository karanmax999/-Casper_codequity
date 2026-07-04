import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";
import { WalletCards } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dashboard");
  }

  const { data: investor } = await supabase
    .from("investors")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!investor) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-2">
        <div className="rounded border border-[#1F1F1F] bg-[#0A0A0A] p-12 text-center">
          <p className="text-zinc-500 font-mono">You do not have an active investor profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      <section className="border-b border-[#1F1F1F] pb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
          <WalletCards className="h-3.5 w-3.5" />
          Investor Profile
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Profile & Wallet Settings
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
          Manage your personal details and connect your Casper testnet wallet public key to interact with on-chain escrows.
        </p>
      </section>

      <ProfileForm investor={investor} />
    </div>
  );
}
