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
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Application Received</h2>
          <p className="mt-2 text-zinc-400 max-w-md">
            Thank you for applying to join the Codequity Launchpad. Our team will review your application and get back to you shortly.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-sm border border-border bg-[#0A0A0A] px-6 text-sm font-semibold text-white hover:border-accent/50 hover:text-accent"
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
          <label htmlFor="fullName" className="text-sm font-medium text-white">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="w-full rounded-sm border border-border bg-[#050606] px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
            placeholder="Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white">
            Work Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-sm border border-border bg-[#050606] px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
            placeholder="jane@fund.vc"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium text-white">
            Company / Firm <span className="text-red-500">*</span>
          </label>
          <input
            id="company"
            name="company"
            type="text"
            required
            className="w-full rounded-sm border border-border bg-[#050606] px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
            placeholder="Apex Ventures"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="jobTitle" className="text-sm font-medium text-white">
            Job Title
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            type="text"
            className="w-full rounded-sm border border-border bg-[#050606] px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
            placeholder="Partner"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="text-sm font-medium text-white">
            Firm Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            className="w-full rounded-sm border border-border bg-[#050606] px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="linkedin" className="text-sm font-medium text-white">
            LinkedIn Profile
          </label>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            className="w-full rounded-sm border border-border bg-[#050606] px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="aum" className="text-sm font-medium text-white">
            Assets Under Management (AUM)
          </label>
          <select
            id="aum"
            name="aum"
            className="w-full rounded-sm border border-border bg-[#050606] px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
          >
            <option value="">Select range...</option>
            <option value="<1M">&lt; $1M</option>
            <option value="1M-10M">$1M - $10M</option>
            <option value="10M-50M">$10M - $50M</option>
            <option value="50M-100M">$50M - $100M</option>
            <option value="100M+">$100M+</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="checkSize" className="text-sm font-medium text-white">
            Typical Check Size
          </label>
          <select
            id="checkSize"
            name="checkSize"
            className="w-full rounded-sm border border-border bg-[#050606] px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
          >
            <option value="">Select size...</option>
            <option value="<10k">&lt; $10k</option>
            <option value="10k-50k">$10k - $50k</option>
            <option value="50k-100k">$50k - $100k</option>
            <option value="100k-500k">$100k - $500k</option>
            <option value="500k+">$500k+</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="focus" className="text-sm font-medium text-white">
          Investment Focus
        </label>
        <input
          id="focus"
          name="focus"
          type="text"
          className="w-full rounded-sm border border-border bg-[#050606] px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
          placeholder="e.g. DeFi, Gaming, L1/L2, AI (comma separated)"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-white">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="w-full rounded-sm border border-border bg-[#050606] px-4 py-2 text-sm text-white focus:border-accent focus:outline-none"
          placeholder="Anything else we should know?"
        />
      </div>

      {errorMsg && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-sm bg-accent py-3 text-sm font-bold text-black hover:bg-[#63ffab] disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </button>
      
      <p className="text-center text-xs text-zinc-500">
        By submitting this form, you agree to our Privacy Policy and Terms of Service.
      </p>
    </form>
  );
}
