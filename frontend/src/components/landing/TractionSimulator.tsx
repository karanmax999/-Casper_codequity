"use client";

import { useState } from "react";
import { GitBranch, TrendingUp, CheckCircle2, Lock, Unlock } from "lucide-react";

export function TractionSimulator() {
  const [commits, setCommits] = useState(45);
  const [growth, setGrowth] = useState(12);
  const [milestones, setMilestones] = useState(2);

  const tractionScore = Math.min(100, Math.floor(30 + commits * 0.4 + growth * 1.5 + milestones * 8));
  const isUnlocked = tractionScore >= 80;
  const releaseAmount = isUnlocked ? Math.floor(50000 * (tractionScore / 100)) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white border border-zinc-200 flex flex-col md:flex-row mt-16">
      {/* Left Column: Inputs */}
      <div className="w-full md:w-[55%] p-8 md:p-12 bg-[#f8fafc]">
        <h3 className="text-2xl font-bold text-zinc-800 mb-8 font-space-grotesk">Simulate Traction</h3>
        
        <div className="space-y-10">
          {/* Commits Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-zinc-600 flex items-center gap-2">
                <GitBranch className="w-4 h-4" /> Weekly Commits
              </label>
              <span className="font-mono text-zinc-800 font-bold bg-white px-3 py-1 rounded border border-zinc-200 shadow-sm">{commits}</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={commits} 
              onChange={(e) => setCommits(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#123626]" 
            />
          </div>

          {/* Growth Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-zinc-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> WoW Growth
              </label>
              <span className="font-mono text-zinc-800 font-bold bg-white px-3 py-1 rounded border border-zinc-200 shadow-sm">{growth}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="50" 
              value={growth} 
              onChange={(e) => setGrowth(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#123626]" 
            />
          </div>

          {/* Milestones Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-zinc-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Milestones Met
              </label>
              <span className="font-mono text-zinc-800 font-bold bg-white px-3 py-1 rounded border border-zinc-200 shadow-sm">{milestones}/5</span>
            </div>
            <input 
              type="range" 
              min="0" max="5" 
              value={milestones} 
              onChange={(e) => setMilestones(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#123626]" 
            />
          </div>
        </div>
      </div>

      {/* Right Column: Outputs */}
      <div className="w-full md:w-[45%] p-8 md:p-12 bg-[#020504] text-white flex flex-col justify-center border-l border-white/5">
        <h3 className="text-[11px] font-bold text-zinc-500 mb-2 uppercase tracking-[0.2em]">Estimated Release Amount</h3>
        <div className="font-space-grotesk text-5xl md:text-6xl font-black text-white mb-10 flex items-center gap-3">
          {releaseAmount.toLocaleString()} <span className="text-xl text-zinc-600 font-bold">CSPR</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="bg-[#0a1110] p-5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-2">Traction Score</div>
            <div className={`text-3xl font-black font-space-grotesk ${isUnlocked ? "text-[#45f798]" : "text-amber-400"}`}>
              {tractionScore}<span className="text-sm text-zinc-600">/100</span>
            </div>
          </div>
          
          <div className="bg-[#0a1110] p-5 rounded-xl border border-white/5 shadow-inner">
            <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-2">Status</div>
            <div className="text-sm font-bold flex flex-col justify-center h-full pb-2">
              {isUnlocked ? (
                <div className="flex items-center gap-2 text-[#45f798]">
                  <Unlock className="w-4 h-4" /> <span>Unlocked</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400">
                  <Lock className="w-4 h-4" /> <span>Locked</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {!isUnlocked && (
           <div className="mt-6 text-xs text-zinc-500 font-medium">
             * Increase traction to hit the 80/100 threshold.
           </div>
        )}
      </div>
    </div>
  );
}
