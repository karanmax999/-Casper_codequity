"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, WalletCards } from "lucide-react";

export function AdminProfile({ email }: { email: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      <section className="border-b border-[#1F1F1F] pb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
          <WalletCards className="h-3.5 w-3.5" />
          Admin Profile
        </div>
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Administrator Account
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 bg-red-400/10 border border-red-400/30 hover:bg-red-400/20 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
          You are currently logged in with an Admin account. You can manage investors, create rounds on behalf of others, and oversee all transactions.
        </p>
      </section>

      <div className="rounded border border-[#1F1F1F] bg-[#0A0A0A] p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Email Address</p>
          <p className="font-mono text-sm text-white">{email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Role</p>
          <p className="text-sm font-bold text-[#45f798]">Super Admin</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Permissions</p>
          <div className="flex gap-2 flex-wrap mt-1">
             <span className="text-xs bg-[#1F1F1F] text-white px-2 py-1 rounded">Approve Investors</span>
             <span className="text-xs bg-[#1F1F1F] text-white px-2 py-1 rounded">Create Rounds</span>
             <span className="text-xs bg-[#1F1F1F] text-white px-2 py-1 rounded">Release Milestones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
