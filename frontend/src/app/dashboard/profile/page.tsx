import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/profile/ProfileContent";

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

  const isUserAdmin = isAdmin(user.email);
  
  let role: "admin" | "investor" | "user" = "user";
  if (isUserAdmin) {
    role = "admin";
  } else if (investor) {
    role = "investor";
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <h1 className="text-2xl font-bold tracking-tight text-white mb-2">My Profile</h1>
      <ProfileContent user={{ id: user.id, email: user.email }} investor={investor} role={role} />
    </div>
  );
}
