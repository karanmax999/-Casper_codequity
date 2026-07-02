"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

function getSafeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing secure session...");

  useEffect(() => {
    let cancelled = false;

    async function completeAuth() {
      const supabase = getSupabase();
      if (!supabase) {
        router.replace("/sign-in?error=supabase_not_configured");
        return;
      }

      const url = new URL(window.location.href);
      const next = getSafeNext(url.searchParams.get("next"));
      const code = url.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace(next);
          return;
        }
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error) {
          window.history.replaceState(null, "", `${url.pathname}${url.search}`);
          router.replace(next);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(next);
        return;
      }

      if (!cancelled) {
        setStatus("Session could not be completed. Returning to sign in...");
      }
      router.replace("/sign-in?error=auth_callback");
    }

    completeAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md border border-border bg-card p-6">
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-accent">
          CodeQuity Launchpad
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Authenticating</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
