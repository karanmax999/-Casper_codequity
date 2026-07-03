"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import {
  Building2,
  Search,
  Star,
  ExternalLink,
  Code2,
  Wallet,
  Loader2,
} from "lucide-react";

type Startup = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  github_url: string | null;
  traction_score: number | null;
  wallet_pubkey: string | null;
  category?: string | null;
  stage?: string | null;
};

export default function StartupsDirectory() {
  const router = useRouter();
  const supabase = getSupabase();
  const [loading, setLoading] = useState(true);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // ALL | WATCHLIST | RECENT

  useEffect(() => {
    if (!supabase) return;

    async function fetchStartups() {
      const { data } = await supabase!
        .from("startups")
        .select("id, name, slug, description, github_url, traction_score, wallet_pubkey, category, stage");
      
      if (data) {
        setStartups(data);
      }
      setLoading(false);
    }

    fetchStartups();
  }, [supabase]);

  // Handle mock watchlisting
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const toggleWatchlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredStartups = startups.filter((startup) => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (startup.description && startup.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.category && startup.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (startup.stage && startup.stage.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === "WATCHLIST") {
      return matchesSearch && watchlist.includes(startup.id);
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#000000] text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#45f798]" />
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Loading protocol directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 selection:bg-accent selection:text-black">
      {/* Title Header */}
      <div className="border-b border-[#1F1F1F] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider flex items-center gap-2">
          <Building2 className="h-6 w-6 text-[#45f798]" />
          Protocol Directory
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Browse global protocols or manage your registered startup profiles.
        </p>
      </div>

      {/* Filter and Tab Area */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Search by name, tagline, stage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#45f798] transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-[#0A0A0A] border border-[#1F1F1F] rounded-md p-1 font-mono text-[10px] font-bold text-zinc-400">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-sm transition-all ${
              activeTab === "ALL" ? "bg-[#1F1F1F] text-white" : "hover:text-white"
            }`}
          >
            ALL ({startups.length})
          </button>
          <button
            onClick={() => setActiveTab("WATCHLIST")}
            className={`px-3 py-1.5 rounded-sm transition-all ${
              activeTab === "WATCHLIST" ? "bg-[#1F1F1F] text-white" : "hover:text-white"
            }`}
          >
            WATCHLIST ({watchlist.length})
          </button>
        </div>
      </div>

      {/* Grid of Startup Cards */}
      {filteredStartups.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStartups.map((startup) => {
            const isWatchlisted = watchlist.includes(startup.id);
            return (
              <div
                key={startup.id}
                onClick={() => router.push(`/dashboard/startups/${startup.id}`)}
                className="group relative rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-5 hover:border-[#45f798]/50 transition-all flex flex-col justify-between h-[210px] cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#45f798] transition-colors">
                        {startup.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono mt-1 uppercase">
                        <span>{startup.category || "General"}</span>
                        <span>·</span>
                        <span>{startup.stage || "Early Stage"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => toggleWatchlist(startup.id, e)}
                        className="p-1 rounded bg-[#1F1F1F] border border-[#2A2A2A] text-zinc-500 hover:text-[#45f798] transition-colors"
                        title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        <Star className={`h-3.5 w-3.5 ${isWatchlisted ? "fill-[#45f798] text-[#45f798]" : ""}`} />
                      </button>
                      <span className="rounded bg-[#1F1F1F] border border-[#2A2A2A] px-2 py-0.5 font-mono text-[10px] font-bold text-[#45f798]">
                        {startup.traction_score}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {startup.description || "No description available for this protocol."}
                  </p>
                </div>

                <div className="border-t border-[#1F1F1F] pt-3 mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="max-w-[120px] truncate" title={startup.wallet_pubkey ?? undefined}>
                      {startup.wallet_pubkey ? `${startup.wallet_pubkey.substring(0, 8)}...` : "No Wallet Linked"}
                    </span>
                  </div>

                  {startup.github_url && (
                    <a
                      href={startup.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 hover:text-white transition-colors text-zinc-400"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      Repository
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-12 text-center">
          <Building2 className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Protocols Found</h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto">
            Try adjusting your search terms or register a new protocol to get started.
          </p>
        </div>
      )}
    </div>
  );
}
