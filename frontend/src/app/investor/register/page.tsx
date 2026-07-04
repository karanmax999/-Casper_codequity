import { RegistrationWizard } from "@/components/investor/RegistrationWizard";
import Link from "next/link";

export default function InvestorRegistrationPage() {
  return (
    <div className="min-h-screen bg-background-pure py-12 px-margin-mobile md:px-margin-desktop relative overflow-x-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-30 z-0"></div>
      
      <div className="mx-auto max-w-3xl relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <span className="material-symbols-outlined text-primary-container text-3xl group-hover:neon-text-glow transition-all">token</span>
            <span className="text-headline-lg text-on-surface tracking-tighter">CodeQuity</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary-container/10 border border-primary-container/50 mb-6 mx-auto">
            <span className="material-symbols-outlined text-primary-container text-sm">rocket_launch</span>
            <span className="text-terminal-label text-primary-container uppercase tracking-widest">FOR INVESTORS</span>
          </div>
          <h1 className="text-headline-lg-mobile md:text-headline-xl text-on-surface">
            Become an <span className="text-primary-container neon-text-glow">Investor</span> Partner
          </h1>
          <p className="mt-4 text-data-mono text-on-surface-variant max-w-2xl mx-auto">
            Join the CodeQuity Launchpad ecosystem to access exclusive deal flow and automated milestone tracking.
          </p>
        </div>

        <div className="glass-card rounded-xl border border-primary-container/30 p-8 md:p-12 shadow-[0_0_40px_rgba(0,255,128,0.05)]">
          <RegistrationWizard />
        </div>
      </div>
    </div>
  );
}
