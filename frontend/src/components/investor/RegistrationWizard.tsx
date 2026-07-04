"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  Globe, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Landmark, 
  Compass, 
  Tag, 
  Terminal, 
  Check, 
  Activity,
  FileText,
  Lock,
  ChevronDown
} from "lucide-react";

// Local SVG definition to avoid version mismatch in lucide-react package exports
const Linkedin = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const stepsInfo = [
  { id: 1, title: "Identity", description: "Personal & firm details", icon: User },
  { id: 2, title: "Credentials", description: "Web & social presence", icon: Globe },
  { id: 3, title: "Thesis", description: "Check size & thesis focus", icon: Landmark },
  { id: 4, title: "Confirm", description: "Data sign-off & submit", icon: Terminal },
];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card rounded-2xl border border-[#45f798]/20 p-8 md:p-16 text-center max-w-2xl mx-auto relative overflow-hidden shadow-[0_0_60px_rgba(69,247,152,0.06)] bg-neutral-950/80"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#45f798]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          className="relative z-10 flex flex-col items-center gap-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#45f798] text-3xl drop-shadow-[0_0_15px_rgba(69,247,152,0.8)]">token</span>
            <span className="text-2xl font-bold font-space-grotesk text-white tracking-tighter">CodeQuity</span>
          </div>
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#45f798]/10 border border-[#45f798]/40 shadow-[0_0_40px_rgba(69,247,152,0.2)] backdrop-blur-sm relative">
            <div className="absolute inset-0 rounded-full border-2 border-[#45f798] opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
            <CheckCircle2 className="h-12 w-12 text-[#45f798]" />
          </div>
        </motion.div>
        
        <div className="relative z-10 space-y-4 max-w-md mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-space-grotesk font-bold text-white tracking-tight leading-tight">
            Application <span className="text-[#45f798] neon-text-glow">Received</span>
          </h2>
          <p className="text-zinc-400 font-mono text-sm leading-relaxed">
            Your investor credentials and thesis parameter mappings have been securely loaded into the queue. Manual identity verification will conclude in 24 hours.
          </p>
        </div>

        <div className="border border-white/5 bg-white/[0.01] rounded-xl p-4 mb-8 font-mono text-xs text-left max-w-sm mx-auto space-y-1 text-zinc-500 relative">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-[#45f798] uppercase">
            <Activity className="h-3 w-3 animate-pulse" /> Live Status
          </div>
          <p><span className="text-zinc-400">RECORD:</span> APPL_SUBMITTED_SECURE</p>
          <p><span className="text-zinc-400">FIRM:</span> {formData.company}</p>
          <p><span className="text-zinc-400">HASH:</span> sha256_e4b10fa2f9...</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(69,247,152,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/dashboard")}
          className="relative z-10 inline-flex h-14 items-center justify-center gap-3 rounded-lg bg-[#45f798] px-10 text-xs font-bold text-black uppercase tracking-[0.2em] transition-all hover:bg-[#63ffab] w-full max-w-xs font-heading"
        >
          Go to Command Center
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 30 : -30,
      opacity: 0,
    }),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 md:items-start w-full">
      
      {/* LEFT COLUMN: Vertical Timeline & Telemetry Stats */}
      <div className="md:col-span-5 space-y-8 flex flex-col justify-between self-stretch">
        
        {/* Branding Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold tracking-tight text-white leading-tight">
            Become an <br />
            <span className="text-[#45f798] text-glow-primary">Investor</span> Partner
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            Access institutional deal flow, track automated milestones via smart contracts, and fund the future of token equity.
          </p>
        </div>

        {/* Desktop Vertical Stepper */}
        <div className="hidden md:block relative pl-2 py-4">
          {/* Vertical Track Line */}
          <div className="absolute left-[25px] top-8 bottom-8 w-0.5 bg-neutral-800 z-0">
            <motion.div 
              className="absolute left-0 top-0 w-full bg-[#45f798] origin-top"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: (step - 1) / 3 }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%' }}
            />
          </div>

          <div className="space-y-8 relative z-10">
            {stepsInfo.map((item) => {
              const Icon = item.icon;
              const isCompleted = step > item.id;
              const isActive = step === item.id;

              return (
                <div key={item.id} className="flex items-start gap-4 group">
                  {/* Step Node Icon */}
                  <motion.div 
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      borderColor: isCompleted || isActive ? "#45f798" : "#262626",
                    }}
                    className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border-2 bg-neutral-950 transition-colors duration-300 relative`}
                  >
                    {isCompleted ? (
                      <Check className="h-4.5 w-4.5 text-[#45f798]" />
                    ) : (
                      <Icon className={`h-4 w-4 ${isActive ? "text-[#45f798] drop-shadow-[0_0_8px_rgba(69,247,152,0.8)]" : "text-zinc-500"}`} />
                    )}
                    
                    {isActive && (
                      <span className="absolute inset-0 rounded-full border border-[#45f798] opacity-60 animate-ping" style={{ animationDuration: '2s' }} />
                    )}
                  </motion.div>

                  {/* Step Description */}
                  <div className="space-y-0.5">
                    <p className={`text-sm font-bold tracking-tight transition-colors duration-300 font-space-grotesk ${
                      isActive ? "text-[#45f798]" : isCompleted ? "text-white" : "text-zinc-500"
                    }`}>
                      {item.title}
                    </p>
                    <p className={`text-xs font-mono transition-colors duration-300 ${
                      isActive ? "text-zinc-300" : "text-zinc-600"
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Statistics Widget */}
        <div className="border border-white/5 bg-white/[0.01] rounded-xl p-4 font-mono text-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#45f798] uppercase text-[10px] tracking-wider mb-1">
            <Activity className="h-3.5 w-3.5 animate-pulse text-[#45f798]" />
            Platform Telemetry
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 block uppercase">Escrow Volume</span>
              <span className="text-sm font-bold text-white font-heading">$142.5M</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 block uppercase">Builders</span>
              <span className="text-sm font-bold text-white font-heading">84+</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 block uppercase">Avg Yield</span>
              <span className="text-sm font-bold text-[#45f798] font-heading">18.4%</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: The Form Card */}
      <div className="md:col-span-7 w-full">
        
        {/* Mobile Mini Header Stepper */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Step {step} of 4: <span className="text-[#45f798]">{stepsInfo[step-1].title}</span>
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                  step >= i ? "bg-[#45f798]" : "bg-neutral-800"
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Wizard Glass Card container */}
        <div className="glass-card rounded-2xl border border-white/10 p-6 md:p-10 shadow-2xl relative overflow-hidden bg-neutral-950/80">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#45f798]/5 rounded-full blur-2xl pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait" custom={1}>
              <motion.div
                key={step}
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-5"
              >
                
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-lg text-white font-space-grotesk font-bold">Identity Configuration</h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">Please provide your primary verified identification details.</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-terminal-label text-zinc-400 uppercase tracking-widest text-[10px] font-bold flex items-center gap-1">
                        Full Name <span className="text-[#45f798]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          id="fullName" name="fullName" type="text" required
                          value={formData.fullName} onChange={handleChange}
                          className="w-full rounded-lg border border-white/10 bg-neutral-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 glow-input focus:border-[#45f798]/40 focus:ring-1 focus:ring-[#45f798]/20 focus:outline-none transition-colors font-mono"
                          placeholder="Jane Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-terminal-label text-zinc-400 uppercase tracking-widest text-[10px] font-bold flex items-center gap-1">
                        Work Email <span className="text-[#45f798]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          id="email" name="email" type="email" required
                          value={formData.email} onChange={handleChange}
                          className="w-full rounded-lg border border-white/10 bg-neutral-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 glow-input focus:border-[#45f798]/40 focus:ring-1 focus:ring-[#45f798]/20 focus:outline-none transition-colors font-mono"
                          placeholder="jane@apex.vc"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="company" className="text-terminal-label text-zinc-400 uppercase tracking-widest text-[10px] font-bold flex items-center gap-1">
                        Company / Firm <span className="text-[#45f798]">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <input
                          id="company" name="company" type="text" required
                          value={formData.company} onChange={handleChange}
                          className="w-full rounded-lg border border-white/10 bg-neutral-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 glow-input focus:border-[#45f798]/40 focus:ring-1 focus:ring-[#45f798]/20 focus:outline-none transition-colors font-mono"
                          placeholder="Apex Ventures"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: PROFESSIONAL DETAILS */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-lg text-white font-space-grotesk font-bold">Professional Credentials</h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">Verify your firm position and digital credentials.</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="jobTitle" className="text-terminal-label text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                        Job Title
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <input
                          id="jobTitle" name="jobTitle" type="text"
                          value={formData.jobTitle} onChange={handleChange}
                          className="w-full rounded-lg border border-white/10 bg-neutral-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 glow-input focus:border-[#45f798]/40 focus:ring-1 focus:ring-[#45f798]/20 focus:outline-none transition-colors font-mono"
                          placeholder="General Partner / Associate"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="website" className="text-terminal-label text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                        Firm Website
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Globe className="h-4 w-4" />
                        </div>
                        <input
                          id="website" name="website" type="url"
                          value={formData.website} onChange={handleChange}
                          className="w-full rounded-lg border border-white/10 bg-neutral-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 glow-input focus:border-[#45f798]/40 focus:ring-1 focus:ring-[#45f798]/20 focus:outline-none transition-colors font-mono"
                          placeholder="https://apex.vc"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="linkedin" className="text-terminal-label text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                        LinkedIn Profile
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Linkedin className="h-4 w-4" />
                        </div>
                        <input
                          id="linkedin" name="linkedin" type="url"
                          value={formData.linkedin} onChange={handleChange}
                          className="w-full rounded-lg border border-white/10 bg-neutral-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 glow-input focus:border-[#45f798]/40 focus:ring-1 focus:ring-[#45f798]/20 focus:outline-none transition-colors font-mono"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: THESIS & PARAMETERS */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-lg text-white font-space-grotesk font-bold">Investment Thesis</h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">Specify capital ranges and sectors of active allocation.</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="aum" className="text-terminal-label text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                        Assets Under Management (AUM)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 z-10">
                          <Landmark className="h-4 w-4" />
                        </div>
                        <Select 
                          value={formData.aum} 
                          onValueChange={(val) => handleSelectChange("aum", val)}
                        >
                          <SelectTrigger className="w-full rounded-lg border border-white/10 bg-neutral-900/50 pl-11 pr-4 py-6 text-sm text-white glow-input focus:border-[#45f798]/40 focus:ring-1 focus:ring-[#45f798]/20 focus:outline-none transition-colors font-mono text-left">
                            <SelectValue placeholder="Select Range..." />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-950 border border-white/10 text-white font-mono">
                            <SelectItem value="<1M" className="focus:bg-neutral-900 focus:text-white cursor-pointer hover:bg-neutral-900">&lt; $1M</SelectItem>
                            <SelectItem value="1M-10M" className="focus:bg-neutral-900 focus:text-white cursor-pointer hover:bg-neutral-900">$1M - $10M</SelectItem>
                            <SelectItem value="10M-50M" className="focus:bg-neutral-900 focus:text-white cursor-pointer hover:bg-neutral-900">$10M - $50M</SelectItem>
                            <SelectItem value="50M-100M" className="focus:bg-neutral-900 focus:text-white cursor-pointer hover:bg-neutral-900">$50M - $100M</SelectItem>
                            <SelectItem value="100M+" className="focus:bg-neutral-900 focus:text-white cursor-pointer hover:bg-neutral-900">$100M+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="checkSize" className="text-terminal-label text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                        Typical Check Size
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 z-10">
                          <Compass className="h-4 w-4" />
                        </div>
                        <Select 
                          value={formData.checkSize} 
                          onValueChange={(val) => handleSelectChange("checkSize", val)}
                        >
                          <SelectTrigger className="w-full rounded-lg border border-white/10 bg-neutral-900/50 pl-11 pr-4 py-6 text-sm text-white glow-input focus:border-[#45f798]/40 focus:ring-1 focus:ring-[#45f798]/20 focus:outline-none transition-colors font-mono text-left">
                            <SelectValue placeholder="Select typical size..." />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-950 border border-white/10 text-white font-mono">
                            <SelectItem value="<10k" className="focus:bg-neutral-900 focus:text-white cursor-pointer hover:bg-neutral-900">&lt; $10k</SelectItem>
                            <SelectItem value="10k-50k" className="focus:bg-neutral-900 focus:text-white cursor-pointer hover:bg-neutral-900">$10k - $50k</SelectItem>
                            <SelectItem value="50k-100k" className="focus:bg-neutral-900 focus:text-white cursor-pointer hover:bg-neutral-900">$50k - $100k</SelectItem>
                            <SelectItem value="100k-500k" className="focus:bg-neutral-900 focus:text-white cursor-pointer hover:bg-neutral-900">$100k - $500k</SelectItem>
                            <SelectItem value="500k+" className="focus:bg-neutral-900 focus:text-white cursor-pointer hover:bg-neutral-900">$500k+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="focus" className="text-terminal-label text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                        Investment Focus Sectors
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Tag className="h-4 w-4" />
                        </div>
                        <input
                          id="focus" name="focus" type="text"
                          value={formData.focus} onChange={handleChange}
                          className="w-full rounded-lg border border-white/10 bg-neutral-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 glow-input focus:border-[#45f798]/40 focus:ring-1 focus:ring-[#45f798]/20 focus:outline-none transition-colors font-mono"
                          placeholder="e.g. DeFi, Gaming, Layer-2, AI"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW & CONFIRM */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-lg text-white font-space-grotesk font-bold">Review & Cryptographic Sign-off</h3>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">Authorize profile telemetry deployment parameters.</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="notes" className="text-terminal-label text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                        Additional Notes / Request Details
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-3.5 pointer-events-none text-zinc-500">
                          <FileText className="h-4 w-4" />
                        </div>
                        <textarea
                          id="notes" name="notes" rows={3}
                          value={formData.notes} onChange={handleChange}
                          className="w-full rounded-lg border border-white/10 bg-neutral-900/50 pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 glow-input focus:border-[#45f798]/40 focus:ring-1 focus:ring-[#45f798]/20 focus:outline-none transition-colors font-mono"
                          placeholder="Anything else we should know?"
                        />
                      </div>
                    </div>

                    {/* Monospace Review Ticket */}
                    <div className="rounded-xl border border-white/5 bg-black/60 p-5 font-mono text-xs text-zinc-400 space-y-2 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/[0.02] rotate-45 pointer-events-none" />
                      
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-[#45f798] uppercase text-[10px] tracking-wider font-bold">
                        <span>[CONFIG_TICKET_DRAFT]</span>
                        <div className="flex items-center gap-1.5">
                          <Lock className="h-3 w-3" /> Secure Sync
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-x-2 gap-y-1.5">
                        <span className="col-span-4 text-zinc-500 uppercase tracking-wider text-[10px]">Full Name:</span>
                        <span className="col-span-8 text-white truncate">{formData.fullName || "-"}</span>

                        <span className="col-span-4 text-zinc-500 uppercase tracking-wider text-[10px]">Work Email:</span>
                        <span className="col-span-8 text-white truncate">{formData.email || "-"}</span>

                        <span className="col-span-4 text-zinc-500 uppercase tracking-wider text-[10px]">Company:</span>
                        <span className="col-span-8 text-white truncate">{formData.company || "-"}</span>

                        <span className="col-span-4 text-zinc-500 uppercase tracking-wider text-[10px]">AUM/Size:</span>
                        <span className="col-span-8 text-white truncate">{formData.aum || "-"} / {formData.checkSize || "-"}</span>

                        <span className="col-span-4 text-zinc-500 uppercase tracking-wider text-[10px]">Thesis Focus:</span>
                        <span className="col-span-8 text-white truncate">{formData.focus || "-"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-500/20 bg-red-950/20 p-4 text-xs font-mono text-red-400"
              >
                [ERROR]: {errorMsg}
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-4 pt-4 border-t border-white/5">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center justify-center rounded-lg border border-white/10 px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider hover:border-[#45f798]/30 hover:bg-white/[0.02] transition-all w-1/3 font-heading cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center rounded-lg bg-[#45f798] py-3.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-[#63ffab] transition-all disabled:opacity-50 font-heading cursor-pointer ${
                  step === 1 ? "w-full" : "flex-1"
                }`}
                style={{
                  boxShadow: "0 0 20px rgba(69,247,152,0.15)"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
                    Deploying Registration...
                  </>
                ) : step < 4 ? (
                  <>
                    Next Section <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Commit Application
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center text-[10px] font-mono text-zinc-600 pt-2">
              Data encrypted with TLS v1.3. Submission triggers automatic SEC rule-conformant routing.
            </p>
          </form>
        </div>
      </div>

    </div>
  );
}
