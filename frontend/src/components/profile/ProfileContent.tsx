"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, WalletCards, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "@/app/dashboard/profile/ProfileForm";

type Role = "admin" | "investor" | "user";

interface ProfileContentProps {
  user: { id: string; email?: string } | null;
  investor: any | null;
  role: Role;
}

export function ProfileContent({ user, investor, role }: ProfileContentProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Left Column: Sidebar Info */}
      <div className="md:col-span-4 space-y-6">
        <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Account Info</h2>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Email Address</p>
              <p className="font-mono text-sm text-zinc-300 truncate" title={user?.email}>{user?.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Role</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1F1F1F] border border-white/5">
                {role === "admin" && (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#a855f7]" />
                    <span className="text-[#a855f7]">Super Admin</span>
                  </>
                )}
                {role === "investor" && (
                  <>
                    <WalletCards className="w-3.5 h-3.5 text-[#45f798]" />
                    <span className="text-[#45f798]">Investor</span>
                  </>
                )}
                {role === "user" && (
                  <>
                    <span className="text-zinc-400">Standard User</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          {role === "admin" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white">Admin Tools</h2>
              <div className="space-y-2">
                <Link
                  href="/dashboard/admin/investors"
                  className="flex items-center justify-between p-2 rounded hover:bg-white/5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Review Investors <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dashboard/admin/rounds/create"
                  className="flex items-center justify-between p-2 rounded hover:bg-white/5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Create Round <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <hr className="border-white/5" />
            </div>
          )}

          {role === "user" && (
            <div className="space-y-4">
              <div className="rounded p-3 bg-[#45f798]/10 border border-[#45f798]/20">
                <p className="text-xs text-[#45f798] mb-2 leading-relaxed">
                  Unlock access to exclusive startup deal flow and on-chain escrow rounds.
                </p>
                <Link
                  href="/investor/register"
                  className="inline-flex w-full justify-center items-center gap-1 bg-[#45f798] hover:bg-[#63ffab] text-black px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                >
                  Apply Now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <hr className="border-white/5" />
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 bg-red-400/5 border border-red-400/20 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>

      {/* Right Column: Main Content */}
      <div className="md:col-span-8">
        {role === "investor" && investor && (
          <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Profile Settings</h2>
            <ProfileForm investor={investor} />
          </div>
        )}

        {role === "admin" && (
          <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <ShieldCheck className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-white font-medium">Administrator View</p>
            <p className="text-zinc-500 text-sm mt-2 max-w-sm mx-auto">
              You are viewing the dashboard as a platform administrator. Use the sidebar tools to manage the platform. Admin accounts do not have investor profiles.
            </p>
          </div>
        )}

        {role === "user" && (
          <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <WalletCards className="w-12 h-12 text-zinc-700 mb-4" />
            <p className="text-white font-medium mb-2">No Investor Profile Found</p>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
              You currently have a standard user account. To participate in funding rounds and view detailed startup financials, you need to apply as an investor.
            </p>
            <Link
              href="/investor/register"
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
            >
              Start Application
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
