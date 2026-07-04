import { ArrowRight, Rocket, ShieldCheck, Filter, Code2, Bell, Check, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function InvestorSection() {
  return (
    <section className="bg-[#020504] border-t border-white/10 py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-8 justify-between">
          
          {/* Left Column (50%) */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#45f798]/30 bg-[#45f798]/5 mb-8">
                <Rocket className="h-4 w-4 text-[#45f798]" />
                <span className="text-[#45f798] text-xs font-bold tracking-widest uppercase">For Investors</span>
              </div>
              
              {/* Heading */}
              <h2 className="font-space-grotesk text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6 max-w-lg">
                Back founders when traction is verified.
              </h2>
              
              {/* Subheading */}
              <p className="text-zinc-400 text-lg leading-relaxed max-w-md mb-10">
                Access vetted Web3 rounds where GitHub activity, product milestones, and growth signals are scored before capital is released.
              </p>
              
              {/* CTA Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-16 lg:mb-0">
                <Link
                  href="/investor/register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded border border-[#45f798]/50 bg-black/50 hover:bg-[#45f798]/10 px-8 text-sm font-bold text-[#45f798] transition-colors"
                >
                  Join as an Investor
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <ShieldCheck className="h-4 w-4" />
                  Built on Casper smart contracts.
                </div>
              </div>
            </div>

            {/* Bottom Feature Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 rounded-2xl border border-white/10 bg-[#0a1110] p-6 lg:mt-24 shadow-xl">
              <div className="md:pr-6 md:border-r border-white/5">
                <Filter className="h-5 w-5 text-[#45f798] mb-4" />
                <h4 className="text-sm font-bold text-white mb-2">Verified deal flow</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">Only protocols with real traction make the cut.</p>
              </div>
              <div className="md:px-6 md:border-r border-white/5">
                <Code2 className="h-5 w-5 text-[#45f798] mb-4" />
                <h4 className="text-sm font-bold text-white mb-2">Technical intelligence</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">AI-powered scoring on code, team, and on-chain data.</p>
              </div>
              <div className="md:pl-6">
                <Bell className="h-5 w-5 text-[#45f798] mb-4" />
                <h4 className="text-sm font-bold text-white mb-2">Automated updates</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">Real-time alerts when conditions are met.</p>
              </div>
            </div>
          </div>

          {/* Right Column (50%) - Flex Row of Timeline and Card */}
          <div className="w-full lg:w-1/2 flex flex-col md:flex-row gap-8 lg:gap-12 relative lg:pl-10">
            
            {/* Background Glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#45f798]/10 blur-[100px] pointer-events-none rounded-full" />

            {/* Timeline */}
            <div className="relative pt-4 w-full md:w-1/3 flex flex-col gap-16 md:gap-24 pl-6 md:pl-0">
              {/* Vertical Line */}
              <div className="absolute left-[11px] md:left-2 top-6 bottom-8 w-[1px] bg-gradient-to-b from-[#45f798]/50 via-[#45f798]/20 to-transparent" />
              
              {/* Node 1 */}
              <div className="relative z-10 flex flex-col gap-2">
                <div className="absolute -left-6 md:-left-5 top-1 h-2.5 w-2.5 rounded-full bg-[#45f798] ring-4 ring-[#45f798]/20" />
                <span className="font-space-grotesk text-[#45f798] font-bold text-sm tracking-widest">01</span>
                <h4 className="text-white font-bold text-base">Signals verified</h4>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-[200px]">GitHub activity, product milestones, and on-chain data are validated.</p>
              </div>

              {/* Node 2 */}
              <div className="relative z-10 flex flex-col gap-2">
                <div className="absolute -left-6 md:-left-5 top-1 h-2.5 w-2.5 rounded-full bg-[#45f798] ring-4 ring-[#45f798]/20" />
                <span className="font-space-grotesk text-[#45f798] font-bold text-sm tracking-widest">02</span>
                <h4 className="text-white font-bold text-base">Score threshold met</h4>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-[200px]">CodeQuity score clears the threshold across all key metrics.</p>
              </div>

              {/* Node 3 */}
              <div className="relative z-10 flex flex-col gap-2">
                <div className="absolute -left-6 md:-left-5 top-1 h-2.5 w-2.5 rounded-full bg-[#45f798] ring-4 ring-[#45f798]/20" />
                <span className="font-space-grotesk text-[#45f798] font-bold text-sm tracking-widest">03</span>
                <h4 className="text-white font-bold text-base">Capital released</h4>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-[200px]">Smart contracts execute and capital is released automatically.</p>
              </div>
            </div>

            {/* Investor Card */}
            <div className="w-full md:w-2/3 relative z-10">
              <div className="rounded-3xl border border-white/10 bg-[#0a1110] p-6 shadow-[0_0_50px_rgba(69,247,152,0.05)] flex flex-col h-full">
                
                {/* Card Header */}
                <div className="flex justify-between items-center mb-10">
                  <span className="text-white text-sm font-medium">Investor view</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#45f798] animate-pulse" />
                    <span className="text-xs text-[#45f798]">Live</span>
                  </div>
                </div>

                {/* Card Main Status */}
                <div className="flex flex-col items-center text-center mb-10">
                  <div className="flex items-center justify-center h-14 w-14 rounded-full border-[0.5px] border-[#45f798]/50 bg-[#45f798]/5 mb-5 shadow-[0_0_30px_rgba(69,247,152,0.15)]">
                    <Check className="h-8 w-8 text-[#45f798]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#45f798] mb-2">Release conditions met</h3>
                  <p className="text-zinc-400 text-xs">All key metrics are within<br />acceptable ranges.</p>
                </div>

                {/* Metrics Rows */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <Code2 className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm text-zinc-300">Code Quality Score</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-white font-bold">82/100</span>
                      <CheckCircle2 className="h-4 w-4 text-[#45f798]" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <Rocket className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm text-zinc-300">Developer Velocity</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-white font-bold">High</span>
                      <CheckCircle2 className="h-4 w-4 text-[#45f798]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm text-zinc-300">On-chain Activity</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-white font-bold">Strong</span>
                      <CheckCircle2 className="h-4 w-4 text-[#45f798]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-zinc-500 text-[16px]">group</span>
                      <span className="text-sm text-zinc-300">Community Growth</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-white font-bold">+38%</span>
                      <CheckCircle2 className="h-4 w-4 text-[#45f798]" />
                    </div>
                  </div>
                </div>

                {/* Bottom Button */}
                <button className="w-full mt-auto py-3 rounded-lg border border-[#45f798]/30 bg-[#121f18] text-[#45f798] text-sm font-bold transition-colors hover:bg-[#45f798]/20">
                  Conditions met
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
