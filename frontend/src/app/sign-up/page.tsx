"use client";

import { useSyncExternalStore } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { getSupabase } from "@/lib/supabase";

function subscribe() {
  return () => {};
}

function getClientRedirectTo() {
  return `${window.location.origin}/auth/callback?next=/dashboard`;
}

function getServerRedirectTo() {
  return null;
}

export default function SignUpPage() {
  const supabase = getSupabase();
  const redirectTo = useSyncExternalStore(subscribe, getClientRedirectTo, getServerRedirectTo);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {!supabase ? (
          <div className="border border-border bg-card p-6">
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-accent">
              Supabase required
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">Auth is not configured.</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
              Casper_codequity/frontend/.env.local, then restart the frontend.
            </p>
          </div>
        ) : redirectTo ? (
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google", "github"]}
            redirectTo={redirectTo}
            view="sign_up"
          />
        ) : (
          <div className="border border-border bg-card p-6">
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-accent">
              Preparing session
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">Loading secure redirect...</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The launchpad is preparing the correct callback for this environment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
