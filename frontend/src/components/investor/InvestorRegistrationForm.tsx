"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Target } from "lucide-react";

export function InvestorRegistrationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/investor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to submit registration");
      }

      setSuccess(true);
      // Wait a bit, then could redirect
      // setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center p-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 border border-primary-container/50 shadow-[0_0_20px_rgba(0,255,128,0.2)]">
          <CheckCircle2 className="h-8 w-8 text-primary-container" />
        </div>
        <div>
          <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">Application Received</h2>
          <p className="mt-4 text-data-mono text-on-surface-variant max-w-md mx-auto">
            Thank you for applying to join the CodeQuity Launchpad. Our team will review your application and get back to you shortly.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="mt-6 inline-flex h-12 items-center justify-center rounded bg-surface-container border border-outline-variant/50 px-8 text-button-text text-on-surface uppercase tracking-wider hover:border-primary-container hover:text-primary-container transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-terminal-label text-on-surface uppercase tracking-widest flex items-center gap-1">
            Full Name <span className="text-primary-container">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
            placeholder="Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-terminal-label text-on-surface uppercase tracking-widest flex items-center gap-1">
            Work Email <span className="text-primary-container">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
            placeholder="jane@fund.vc"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="text-terminal-label text-on-surface uppercase tracking-widest flex items-center gap-1">
            Company / Firm <span className="text-primary-container">*</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
            placeholder="Apex Ventures"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="jobTitle" className="text-terminal-label text-on-surface uppercase tracking-widest">
            Job Title
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            type="text"
            className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
            placeholder="Partner"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="text-terminal-label text-on-surface uppercase tracking-widest">
            Firm Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkedin" className="text-terminal-label text-on-surface uppercase tracking-widest">
            LinkedIn Profile
          </label>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="aum" className="text-terminal-label text-on-surface uppercase tracking-widest">
            Assets Under Management (AUM)
          </label>
          <select
            id="aum"
            name="aum"
            className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors appearance-none"
          >
            <option value="" className="bg-surface-container text-terminal-gray">Select range...</option>
            <option value="<1M" className="bg-surface-container text-on-surface">&lt; $1M</option>
            <option value="1M-10M" className="bg-surface-container text-on-surface">$1M - $10M</option>
            <option value="10M-50M" className="bg-surface-container text-on-surface">$10M - $50M</option>
            <option value="50M-100M" className="bg-surface-container text-on-surface">$50M - $100M</option>
            <option value="100M+" className="bg-surface-container text-on-surface">$100M+</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="checkSize" className="text-terminal-label text-on-surface uppercase tracking-widest">
            Typical Check Size
          </label>
          <select
            id="checkSize"
            name="checkSize"
            className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors appearance-none"
          >
            <option value="" className="bg-surface-container text-terminal-gray">Select size...</option>
            <option value="<10k" className="bg-surface-container text-on-surface">&lt; $10k</option>
            <option value="10k-50k" className="bg-surface-container text-on-surface">$10k - $50k</option>
            <option value="50k-100k" className="bg-surface-container text-on-surface">$50k - $100k</option>
            <option value="100k-500k" className="bg-surface-container text-on-surface">$100k - $500k</option>
            <option value="500k+" className="bg-surface-container text-on-surface">$500k+</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="focus" className="text-terminal-label text-on-surface uppercase tracking-widest">
          Investment Focus
        </label>
        <input
          id="focus"
          name="focus"
          type="text"
          className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
          placeholder="e.g. DeFi, Gaming, L1/L2, AI (comma separated)"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-terminal-label text-on-surface uppercase tracking-widest">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
          placeholder="Anything else we should know?"
        />
      </div>

      {errorMsg && (
        <div className="rounded border border-error/30 bg-error-container/20 p-4 text-data-mono text-error">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded bg-primary-container py-4 text-button-text text-background-pure uppercase tracking-wider neon-glow-btn hover:bg-primary transition-all disabled:opacity-50 disabled:shadow-none"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-background-pure" />
            Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </button>
      
      <p className="text-center text-[11px] font-data-mono text-terminal-gray">
        By submitting this form, you agree to our <a href="#" className="text-primary-container hover:underline">Privacy Policy</a> and <a href="#" className="text-primary-container hover:underline">Terms of Service</a>.
      </p>
    </form>
  );
}
