import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { InvestorList } from "./InvestorList";

export const dynamic = "force-dynamic";

export default async function AdminInvestorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !isAdmin(user.email)) {
    redirect("/dashboard");
  }

  const { data: investors } = await supabase
    .from("investors")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      <section className="border-b border-[#1F1F1F] pb-8">
        <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Investor Applications
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
          Review and approve pending investor registrations.
        </p>
      </section>

      <InvestorList initialInvestors={investors || []} />
    </div>
  );
}
