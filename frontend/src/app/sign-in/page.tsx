"use client";

import { useSyncExternalStore, useState } from "react";
import { getAuthRedirectTo } from "@/lib/auth-redirect";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TerminalSquare, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

function subscribe() {
  return () => {};
}

function getClientRedirectTo() {
  return getAuthRedirectTo();
}

function getServerRedirectTo() {
  return null;
}

export default function SignInPage() {
  const supabase = getSupabase();
  const redirectTo = useSyncExternalStore(subscribe, getClientRedirectTo, getServerRedirectTo);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleOAuthLogin = async (provider: "github" | "google") => {
    if (!supabase || !redirectTo) return;
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] p-4 text-foreground selection:bg-accent selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] text-accent mb-2">
            <TerminalSquare className="h-6 w-6 text-[#45f798]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">CodeQuity Casper Launchpad</p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-6 shadow-2xl space-y-6">
          {!supabase ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#45f798]">
                <AlertCircle className="h-4 w-4" />
                Configuration Required
              </div>
              <p className="text-sm leading-6 text-zinc-400">
                Please add <code className="text-white bg-[#1F1F1F] px-1.5 py-0.5 rounded font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-white bg-[#1F1F1F] px-1.5 py-0.5 rounded font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment file, then restart the application.
              </p>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                    <input
                      type="email"
                      required
                      placeholder="founder@codequity.live"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full bg-[#030303] border border-[#1F1F1F] rounded-sm py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#45f798] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full bg-[#030303] border border-[#1F1F1F] rounded-sm py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#45f798] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] text-xs font-bold text-black hover:bg-[#63ffab] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign In with Email"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#1F1F1F]"></div>
                <span className="flex-shrink mx-4 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-[#1F1F1F]"></div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin("github")}
                  disabled={loading || !redirectTo}
                  className="flex h-10 items-center justify-center gap-2 rounded-sm border border-[#1F1F1F] bg-[#030303] text-xs font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={loading || !redirectTo}
                  className="flex h-10 items-center justify-center gap-2 rounded-sm border border-[#1F1F1F] bg-[#030303] text-xs font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.68 0-8.472-3.612-8.472-8.069 0-4.456 3.793-8.069 8.472-8.069 2.227 0 4.173.834 5.613 2.203l3.037-3.037C18.66 1.43 15.65 0 12.24 0 5.58 0 0 5.485 0 12.24s5.58 12.24 12.24 12.24c6.72 0 12.24-5.52 12.24-12.24 0-.825-.09-1.635-.255-2.42H12.24z" />
                  </svg>
                  Google
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-[#45f798] hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
