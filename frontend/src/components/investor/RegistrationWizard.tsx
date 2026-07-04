"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type InvestorFormData = {
  fullName: string;
  email: string;
  company: string;
  jobTitle: string;
  website: string;
  linkedin: string;
  aum: string;
  checkSize: string;
  focus: string;
  notes: string;
};

export function RegistrationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<InvestorFormData>({
    fullName: "",
    email: "",
    company: "",
    jobTitle: "",
    website: "",
    linkedin: "",
    aum: "",
    checkSize: "",
    focus: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      nextStep();
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/investor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to submit registration");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center space-y-8 text-center py-16 px-8 relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#45f798]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="relative z-10 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#45f798] text-2xl drop-shadow-[0_0_15px_rgba(69,247,152,0.8)]">token</span>
            <span className="text-xl font-bold font-space-grotesk text-white tracking-tighter">CodeQuity</span>
          </div>
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#45f798]/10 border border-[#45f798]/50 shadow-[0_0_40px_rgba(69,247,152,0.3)] backdrop-blur-sm">
            <CheckCircle2 className="h-12 w-12 text-[#45f798]" />
          </div>
        </motion.div>
        
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold text-white tracking-tight">
            Application <span className="text-[#45f798] neon-text-glow">Received</span>
          </h2>
          <p className="text-zinc-400 font-mono text-sm max-w-md mx-auto leading-relaxed">
            Your investor profile is now securely logged. We'll verify your credentials within 24 hours. In the meantime, you can explore the ecosystem.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/dashboard")}
          className="relative z-10 mt-6 inline-flex h-14 items-center justify-center gap-3 rounded bg-[#45f798] px-10 text-xs font-bold text-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(69,247,152,0.4)] transition-all hover:bg-[#63ffab]"
        >
          Go to Command Center
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full">
      {/* Progress Indicator */}
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-1 items-center">
            <div
              className={`h-2 flex-1 rounded-full ${
                step >= i ? "bg-primary-container" : "bg-surface-container"
              } transition-colors duration-300`}
            />
            {i < 4 && <div className="w-2" />}
          </div>
        ))}
      </div>
      <div className="mb-8 text-center">
        <span className="text-terminal-label text-primary-container uppercase tracking-widest">
          Step {step} of 4
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={step}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl text-on-surface font-space-grotesk font-bold">Identity</h3>
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-terminal-label text-on-surface uppercase tracking-widest flex items-center gap-1">
                    Full Name <span className="text-primary-container">*</span>
                  </label>
                  <input
                    id="fullName" name="fullName" type="text" required
                    value={formData.fullName} onChange={handleChange}
                    className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-terminal-label text-on-surface uppercase tracking-widest flex items-center gap-1">
                    Work Email <span className="text-primary-container">*</span>
                  </label>
                  <input
                    id="email" name="email" type="email" required
                    value={formData.email} onChange={handleChange}
                    className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
                    placeholder="jane@fund.vc"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="company" className="text-terminal-label text-on-surface uppercase tracking-widest flex items-center gap-1">
                    Company / Firm <span className="text-primary-container">*</span>
                  </label>
                  <input
                    id="company" name="company" type="text" required
                    value={formData.company} onChange={handleChange}
                    className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
                    placeholder="Apex Ventures"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl text-on-surface font-space-grotesk font-bold">Professional Details</h3>
                <div className="space-y-2">
                  <label htmlFor="jobTitle" className="text-terminal-label text-on-surface uppercase tracking-widest">
                    Job Title
                  </label>
                  <input
                    id="jobTitle" name="jobTitle" type="text"
                    value={formData.jobTitle} onChange={handleChange}
                    className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
                    placeholder="Partner"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="website" className="text-terminal-label text-on-surface uppercase tracking-widest">
                    Firm Website
                  </label>
                  <input
                    id="website" name="website" type="url"
                    value={formData.website} onChange={handleChange}
                    className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="linkedin" className="text-terminal-label text-on-surface uppercase tracking-widest">
                    LinkedIn Profile
                  </label>
                  <input
                    id="linkedin" name="linkedin" type="url"
                    value={formData.linkedin} onChange={handleChange}
                    className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl text-on-surface font-space-grotesk font-bold">Investment Parameters</h3>
                <div className="space-y-2">
                  <label htmlFor="aum" className="text-terminal-label text-on-surface uppercase tracking-widest">
                    Assets Under Management (AUM)
                  </label>
                  <select
                    id="aum" name="aum"
                    value={formData.aum} onChange={handleChange}
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
                    id="checkSize" name="checkSize"
                    value={formData.checkSize} onChange={handleChange}
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
                <div className="space-y-2">
                  <label htmlFor="focus" className="text-terminal-label text-on-surface uppercase tracking-widest">
                    Investment Focus
                  </label>
                  <input
                    id="focus" name="focus" type="text"
                    value={formData.focus} onChange={handleChange}
                    className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
                    placeholder="e.g. DeFi, Gaming, L1/L2, AI (comma separated)"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl text-on-surface font-space-grotesk font-bold">Additional Notes & Review</h3>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-terminal-label text-on-surface uppercase tracking-widest">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes" name="notes" rows={4}
                    value={formData.notes} onChange={handleChange}
                    className="w-full rounded border border-outline-variant/30 bg-surface-container px-4 py-3 text-data-mono text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none placeholder:text-terminal-gray transition-colors"
                    placeholder="Anything else we should know?"
                  />
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-zinc-400 font-mono space-y-1">
                  <p><span className="text-white font-bold">Name:</span> {formData.fullName || "-"}</p>
                  <p><span className="text-white font-bold">Email:</span> {formData.email || "-"}</p>
                  <p><span className="text-white font-bold">Firm:</span> {formData.company || "-"}</p>
                  <p><span className="text-white font-bold">AUM:</span> {formData.aum || "-"}</p>
                  <p><span className="text-white font-bold">Check Size:</span> {formData.checkSize || "-"}</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {errorMsg && (
          <div className="rounded border border-error/30 bg-error-container/20 p-4 text-data-mono text-error">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center justify-center rounded border border-outline-variant/50 px-6 py-4 text-button-text text-on-surface transition-all hover:border-primary-container hover:text-primary-container w-1/3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center rounded bg-primary-container py-4 text-button-text text-background-pure uppercase tracking-wider neon-glow-btn hover:bg-primary transition-all disabled:opacity-50 disabled:shadow-none ${
              step === 1 ? "w-full" : "flex-1"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-background-pure" />
                Submitting...
              </>
            ) : step < 4 ? (
              <>
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
