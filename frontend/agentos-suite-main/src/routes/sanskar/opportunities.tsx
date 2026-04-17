import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { 
  Sparkles, 
  MapPin, 
  Search, 
  Filter, 
  ArrowRight, 
  Zap, 
  Activity, 
  Loader2, 
  TrendingUp,
  Cpu,
  Globe,
  Radar
} from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/sanskar/opportunities")({
  head: () => ({
    meta: [
      { title: "Market Radar · AgentOS" },
      { name: "description", content: "Global opportunity scanning and autonomous matching." },
    ],
  }),
  component: Opportunities,
});

function Opportunities() {
  const [opps, setOpps] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [locationType, setLocationType] = useState("All");
  const [labelType, setLabelType] = useState("All");
  const [categoryType, setCategoryType] = useState("All");
  const navigate = useNavigate();

  const fetchOpps = async () => {
    try {
      const res = await api.get("/opportunities");
      setOpps(res.data);
    } catch (err) {
      console.error('--- MARKET RADAR SIGNAL LOSS ---', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      await fetchOpps();
    } finally {
      setScanning(false);
    }
  };

  const handleGenerateProposal = (opp: any) => {
    localStorage.setItem("agentos_draft_context", JSON.stringify({
      title: opp.title,
      company: opp.company,
      description: opp.description,
      match: opp.score || opp.match,
      rate: opp.rate || opp.pay || "₹15,000"
    }));
    navigate({ to: "/sanskar/proposals" });
  };

  useEffect(() => {
    fetchOpps();
  }, []);

  const filteredOpps = opps.filter(o => {
    const matchesSearch = o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore = (o.score || o.match) >= minScore;
    const matchesLocation = locationType === "All" || 
                           (locationType === "Remote" ? o.location.toLowerCase().includes("remote") : !o.location.toLowerCase().includes("remote"));
    const matchesLabel = labelType === "All" || 
                        (labelType === "Freelance" ? o.label?.includes("Freelance") : o.label?.includes("Agency"));
    const matchesCategory = categoryType === "All" || o.category === categoryType;
    
    return matchesSearch && matchesScore && matchesLocation && matchesLabel && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        eyebrow="Lead Scout Agent"
        title="Market Radar"
        description="Scanning global demand for high-confidence matches. Integrated with AgentOS Execution Engine."
        actions={
          <button 
            disabled={scanning}
            onClick={handleScan}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-cool px-6 py-3 text-sm font-bold text-white shadow-glow-cool hover:brightness-110 active:scale-95 transition-all"
          >
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
            {scanning ? "Syncing Networks…" : "Initialize Deep Scan"}
          </button>
        }
      />

      {/* FILTER & STATS STRIP - ENHANCED COLOR SCHEME */}
      <div className="flex flex-col gap-6 glass-strong p-6 rounded-[2.5rem] border border-cool/20 shadow-glow-soft">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-cool group-focus-within:scale-110 transition-transform" />
            <input
              type="text"
              placeholder="Search market signals…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-cool/5 border border-cool/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cool/30 transition-all font-medium placeholder:text-cool/30"
            />
          </div>
          <div className="flex flex-wrap gap-2 uppercase text-[10px] font-bold tracking-[0.2em]">
             <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-cool/10 text-cool border border-cool/20">
                <Activity className="h-3.5 w-3.5" />
                {filteredOpps.length} Signals Active
             </div>
             <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-success/10 text-success border border-success/20">
                <TrendingUp className="h-3.5 w-3.5" />
                +14% Demand
             </div>
          </div>
        </div>

        {/* MULTI-CRITERIA FILTERS - COLORED THEME */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-cool ml-2">Min Match</label>
              <select 
                value={minScore} 
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full glass bg-cool/5 border border-cool/10 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none appearance-none cursor-pointer hover:bg-cool/10 transition-colors"
              >
                 <option value={0}>Any Score</option>
                 <option value={80}>80%+ Match</option>
                 <option value={90}>90%+ Match</option>
                 <option value={95}>95%+ Match</option>
              </select>
           </div>
           
           <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-cool ml-2">Domain</label>
              <select 
                value={categoryType} 
                onChange={(e) => setCategoryType(e.target.value)}
                className="w-full glass bg-cool/5 border border-cool/10 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none appearance-none cursor-pointer hover:bg-cool/10 transition-colors"
              >
                 <option value="All">All Domains</option>
                 <option value="Technical">Technical (AI/Dev)</option>
                 <option value="Non-Technical">Non-Tech (Services)</option>
              </select>
           </div>

           <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-cool ml-2">Location</label>
              <select 
                value={locationType} 
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full glass bg-cool/5 border border-cool/10 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none appearance-none cursor-pointer hover:bg-cool/10 transition-colors"
              >
                 <option value="All">All Locations</option>
                 <option value="Remote">Remote Only</option>
                 <option value="On-site">On-site / Hybrid</option>
              </select>
           </div>

           <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-cool ml-2">Contract</label>
              <select 
                value={labelType} 
                onChange={(e) => setLabelType(e.target.value)}
                className="w-full glass bg-cool/5 border border-cool/10 rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none appearance-none cursor-pointer hover:bg-cool/10 transition-colors"
              >
                 <option value="All">All Types</option>
                 <option value="Freelance">Freelance</option>
                 <option value="Agency">Agency / Full-time</option>
              </select>
           </div>
           
           <div className="flex items-end pb-0.5">
              <button 
                onClick={() => { setSearchTerm(""); setMinScore(0); setLocationType("All"); setLabelType("All"); setCategoryType("All"); }}
                className="w-full h-10 rounded-xl border border-cool/20 hover:bg-cool/10 text-cool text-[9px] font-bold uppercase tracking-widest transition-all"
              >
                Reset Radar
              </button>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[280px] rounded-[2.5rem] glass animate-pulse border border-white/5" />
          ))
        ) : filteredOpps.map((o, i) => (
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={i} 
            className="group relative glass-strong rounded-[2.5rem] p-8 border border-white/10 hover:bg-white/[0.08] transition-all flex flex-col justify-between"
          >
            {/* MATCH SCORE BADGE */}
            <div className={`absolute top-6 right-6 h-12 w-12 rounded-2xl border flex items-center justify-center text-sm font-bold shadow-lg ${
               (o.score || o.match) > 90 ? 'bg-success/10 border-success/30 text-success' : 'bg-primary/10 border-primary/30 text-primary'
            }`}>
              {(o.score || o.match)}%
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <Zap className="h-3 w-3 fill-primary" />
                    {o.label || (o.top_pick ? "🔥 Top Pick" : "Verified Signal")}
                 </div>
                 <h3 className="text-xl font-bold tracking-tight leading-tight group-hover:text-gradient-primary transition-all">
                   {o.title}
                 </h3>
                 <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                    <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> {o.company}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {o.location}</span>
                 </div>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed font-medium line-clamp-3">
                {o.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {(o.tags || o.required_skills || []).slice(0, 3).map((t: string) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Projected Rate</div>
                <div className="text-sm font-bold text-foreground">
                   {o.rate || o.pay || "₹15,000"}
                </div>
              </div>
              <button 
                onClick={() => handleGenerateProposal(o)}
                className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Draft Proposal <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* HOVER GLOW EFFECT */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
          </motion.article>
        ))}
      </div>

      {/* MONETIZATION TEASER FOR HACKATHON */}
      <section className="glass rounded-[2rem] p-8 border border-white/5 bg-gradient-to-br from-cool/10 to-transparent">
         <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-cool mb-4">
            <Cpu className="h-5 w-5" />
            AgentOS Network Intelligence
         </div>
         <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
               <h2 className="text-2xl font-bold tracking-tight leading-tight">
                  High-yield signals detected in your niche.
               </h2>
               <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Market analytics suggest a 22% increase in B2B service demand across Mumbai and Delhi. 
                  Initial targets prioritize <span className="text-foreground font-bold underline decoration-cool/40">Autonomous Systems</span> and <span className="text-foreground font-bold">Generative AI</span> workflows.
               </p>
            </div>
            <div className="flex gap-4">
               <div className="flex-1 glass p-5 rounded-2xl border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Match Avg.</div>
                  <div className="text-2xl font-bold tracking-tight text-gradient-cool">88.4%</div>
               </div>
               <div className="flex-1 glass p-5 rounded-2xl border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Profit Potential</div>
                  <div className="text-2xl font-bold tracking-tight text-gradient-cool">₹185k</div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
