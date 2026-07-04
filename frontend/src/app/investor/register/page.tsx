import { RegistrationWizard } from "@/components/investor/RegistrationWizard";
import Link from "next/link";

export default function InvestorRegistrationPage() {
  return (
    <div className="min-h-screen bg-background-pure py-12 px-margin-mobile md:px-margin-desktop relative overflow-x-hidden flex flex-col justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-20 z-0"></div>
      
      <div className="mx-auto w-full max-w-6xl relative z-10">
        <div className="text-center md:text-left mb-10 md:mb-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-neutral-900/50 hover:bg-neutral-900 hover:border-[#45f798]/30 transition-all group">
            <span className="material-symbols-outlined text-primary-container text-2xl group-hover:neon-text-glow transition-all">token</span>
            <span className="text-sm font-bold font-space-grotesk tracking-tight text-white">CodeQuity</span>
          </Link>
        </div>

        <RegistrationWizard />
      </div>
    </div>
  );
}
