import { ArrowRight, BarChart3, FileSpreadsheet, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Deal Sourcing",
    desc: "Discover protocols before they hit consensus",
  },
  {
    icon: ShieldCheck,
    title: "Verified Technical Intelligence",
    desc: "GitHub, on-chain, and fundraising data all validated",
  },
  {
    icon: BarChart3,
    title: "Real-time Portfolio Monitoring",
    desc: "Track developer velocity, token metrics, and signals",
  },
  {
    icon: FileSpreadsheet,
    title: "Automated Investor Updates",
    desc: "Generate beautiful reports with live data",
  },
];

export function InvestorSection() {
  return (
    <section className="py-20 md:py-32 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
      <div className="mb-12 md:mb-16 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6 md:gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface-container border border-outline-variant/50 mb-4 md:mb-6">
            <span className="material-symbols-outlined text-primary-container text-sm">rocket_launch</span>
            <span className="text-terminal-label text-primary-container uppercase tracking-widest">FOR INVESTORS</span>
          </div>
          <h2 className="text-headline-lg-mobile md:text-headline-xl text-on-surface max-w-2xl">
            Invest in the <span className="text-primary-container neon-text-glow">future</span> of Web3
          </h2>
          <p className="mt-4 md:mt-6 text-data-mono text-on-surface-variant max-w-2xl">
            Get exclusive access to top-tier protocols, validated by our AI traction scoring and secured by Casper smart contracts.
          </p>
        </div>
        <Link
          href="/investor/register"
          className="w-full lg:w-auto justify-center bg-primary-container text-background-pure text-button-text px-8 py-4 rounded flex items-center gap-2 uppercase neon-glow-btn transition-all whitespace-nowrap h-fit"
        >
          Join as an Investor
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-center">
        <div className="flex flex-wrap md:flex-nowrap gap-4 w-full xl:w-3/4">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card rounded-xl p-5 hover:border-primary-container/50 transition-colors group relative overflow-hidden flex-1 min-w-[200px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col items-start text-left h-full justify-between gap-4">
                <feature.icon className="h-6 w-6 text-primary-container drop-shadow-[0_0_8px_rgba(0,255,128,0.5)]" />
                <div>
                  <h3 className="text-body-md font-bold text-on-surface mb-2">{feature.title}</h3>
                  <p className="text-[12px] font-mono text-terminal-gray leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Horizontal Mini Timeline */}
        <div className="w-full xl:w-1/4 flex items-center relative mt-8 xl:mt-0 pl-0 xl:pl-4">
          {/* Circuit line */}
          <div className="absolute left-8 right-8 top-8 h-[1px] bg-primary-container/30 z-0"></div>
          
          <div className="flex justify-between w-full relative z-10 px-8">
            {/* Step 02 */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_10px_#00FF80]"></div>
              <div className="text-primary-container font-mono text-lg font-bold">02</div>
              <div className="text-data-mono text-terminal-gray text-[10px] leading-tight max-w-[100px]">CodeQuity score becomes the trigger</div>
            </div>
            
            {/* Step 03 */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_10px_#00FF80]"></div>
              <div className="text-primary-container font-mono text-lg font-bold">03</div>
              <div className="text-data-mono text-terminal-gray text-[10px] leading-tight max-w-[100px]">Casper records the release</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
