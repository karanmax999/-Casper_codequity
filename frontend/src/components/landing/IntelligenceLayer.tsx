import { ShieldCheck, GitCommit, Network, TrendingUp, Cpu, BarChart } from "lucide-react";

export function IntelligenceLayer() {
  return (
    <section className="relative border-b border-white/5 bg-[#020504] px-5 py-24 md:py-32 md:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20 md:mb-28">
          <h2 className="font-space-grotesk text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            The Intelligence Layer
          </h2>
          <p className="mx-auto max-w-2xl text-base md:text-lg text-zinc-400 leading-relaxed">
            Objective traction scoring for Web3 rounds, built from developer activity, on-chain data, and market signals.
          </p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-center relative">
          
          {/* Animated Connecting Lines (Desktop Only) */}
          <div className="hidden lg:block absolute top-1/2 left-[25%] right-[25%] h-px -translate-y-1/2 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#45f798]/30 to-transparent" />
            <div className="absolute h-full w-[20%] bg-gradient-to-r from-transparent via-[#45f798] to-transparent animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDuration: '3s' }} />
          </div>

          {/* Left Column: Signal Inputs */}
          <div className="flex flex-col gap-4 relative z-10 w-full max-w-sm mx-auto lg:mx-0">
            {/* Input 1 */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-colors hover:bg-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-[#45f798]/10 border border-[#45f798]/20">
                  <GitCommit className="h-5 w-5 text-[#45f798]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">GitHub API</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Verified developer velocity</p>
                </div>
              </div>
            </div>

            {/* Input 2 */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-colors hover:bg-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Network className="h-5 w-5 text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">On-chain activity</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Smart contract interactions</p>
                </div>
              </div>
            </div>

            {/* Input 3 */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-colors hover:bg-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <TrendingUp className="h-5 w-5 text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Market signal</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Token metrics & volume</p>
                </div>
              </div>
            </div>

            {/* Input 4 */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-colors hover:bg-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <BarChart className="h-5 w-5 text-zinc-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">The Graph</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Subgraph data feeds</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: The Engine */}
          <div className="relative flex justify-center items-center py-10 lg:py-0 z-10">
            <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
              {/* Outer Glowing Ring */}
              <div className="absolute inset-0 rounded-full border border-[#45f798]/20 bg-[#45f798]/5 animate-[spin_10s_linear_infinite]" />
              
              {/* Middle Dashed Ring */}
              <div className="absolute inset-4 rounded-full border border-dashed border-[#45f798]/40 animate-[spin_15s_linear_infinite_reverse]" />
              
              {/* Inner Solid Ring */}
              <div className="absolute inset-10 rounded-full border border-[#45f798]/30 bg-[#020504] shadow-[0_0_40px_rgba(69,247,152,0.15)] flex flex-col items-center justify-center z-20">
                <Cpu className="h-8 w-8 text-[#45f798] mb-2" />
                <span className="font-space-grotesk text-[10px] font-bold text-white tracking-widest uppercase">Engine</span>
              </div>
            </div>
          </div>

          {/* Right Column: Investor Output Decision Card */}
          <div className="flex justify-center lg:justify-end z-10 w-full">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a1110] shadow-2xl overflow-hidden flex flex-col">
              
              {/* Top Section */}
              <div className="p-6 md:p-8 bg-gradient-to-b from-[#121c19] to-transparent text-center border-b border-white/5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">CodeQuity Score</p>
                <div className="font-space-grotesk text-5xl md:text-6xl font-black text-[#45f798] flex items-baseline justify-center gap-1">
                  87<span className="text-xl text-zinc-600 font-medium">/100</span>
                </div>
              </div>

              {/* Status Rows */}
              <div className="p-6 md:p-8 space-y-5">
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400 font-medium">Confidence</span>
                  <span className="text-sm text-white font-bold px-2.5 py-1 rounded-md bg-white/5">High</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400 font-medium">Risk</span>
                  <span className="text-sm text-white font-bold px-2.5 py-1 rounded-md bg-white/5">Low</span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-sm text-zinc-400 font-medium">Capital Release</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#45f798]" />
                    <span className="text-sm text-[#45f798] font-bold">Ready</span>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-[#45f798]/5 border-t border-[#45f798]/10 flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#45f798]" />
                <span className="text-xs font-bold text-[#45f798] uppercase tracking-wider">Trusted by Casper</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
