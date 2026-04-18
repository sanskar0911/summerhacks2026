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
  Radar,
  Check
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

  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const handleApply = async (opp: any) => {
    console.log(`[AGENT OS] Initializing application for signal: ${opp.title}`);
    setApplyingId(opp.id);
    
    try {
      const res = await api.post("/applications", { opportunityId: opp.id });
      console.log(`[AGENT OS] Signal accepted:`, res.data);
      setAppliedIds(prev => [...prev, opp.id]);
      
      // Store context for the proposal page
      const draftContext = {
        title: opp.title,
        clientEmail: res.data.clientEmail || "recruitment@agentos.ai",
        company: opp.company,
        description: opp.description || "",
        match: opp.score || 95,
        rate: opp.rate || "₹15,000"
      };
      
      localStorage.setItem('agentos_draft_context', JSON.stringify(draftContext));
      console.log(`[AGENT OS] Redirection context cached. Transitioning to Architecture phase.`);

      // Small delay for the "Check" animation before redirect
      setTimeout(() => {
        navigate({ to: "/sanskar/proposals" });
      }, 1500);
      
    } catch (err: any) {
      console.error("[AGENT OS] RECRUITMENT SIGNAL FAILURE:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        console.warn("[AGENT OS] AUTHENTICATION VOID: Redirecting to login.");
        navigate({ to: "/login" });
      }
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Lead Scout Agent</div>
          <h1 className="text-5xl font-black tracking-tight text-white mb-2">Market Radar</h1>
          <p className="text-muted-foreground max-w-xl font-medium text-lg leading-relaxed">Scanning global demand for high-confidence matches. Integrated with AgentOS Execution Engine.</p>
        </div>
        <button 
          disabled={scanning}
          onClick={handleScan}
          className="group flex items-center gap-3 bg-gradient-primary px-8 py-4 rounded-2xl text-white font-bold uppercase tracking-widest text-xs shadow-glow-primary hover:scale-[1.02] active:scale-95 transition-all"
        >
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4 animate-radar" />}
          {scanning ? "Syncing Networks…" : "Initialize Deep Scan"}
        </button>
      </div>

      {/* HORIZONTAL FILTER RIBBON (Screenshot Match) */}
      <section className="glass-strong rounded-[2.5rem] p-8 border border-white/10 bg-[#0f1117]">
         <div className="flex flex-col gap-8">
            {/* Top Row: Search & Status */}
            <div className="flex items-center justify-between gap-4">
               <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search market signals..."
                    className="w-full bg-white/5 border border-white/5 rounded-full py-5 pl-16 pr-8 text-white focus:border-primary/50 focus:bg-white/10 transition-all outline-none text-sm font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/5">
                     <Activity className="h-4 w-4 text-primary" />
                     <span className="text-[10px] font-black tracking-widest text-white uppercase">{filteredOpps.length} Signals Active</span>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-success/10 border border-success/10">
                     <TrendingUp className="h-4 w-4 text-success" />
                     <span className="text-[10px] font-black tracking-widest text-success uppercase">+14% Demand</span>
                  </div>
               </div>
            </div>

            {/* Bottom Row: Targeted Selects */}
            <div className="flex flex-wrap items-end gap-6 pt-4 border-t border-white/5">
               <div className="space-y-3 flex-1 min-w-[150px]">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Min Match</label>
                  <select 
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full glass-strong rounded-2xl p-4 border border-white/5 text-[11px] font-bold text-white bg-transparent outline-none cursor-pointer hover:bg-white/5 transition-all appearance-none"
                  >
                    <option value="0" className="bg-[#0f1117]">Any Score</option>
                    <option value="70" className="bg-[#0f1117]">70% +</option>
                    <option value="80" className="bg-[#0f1117]">80% +</option>
                    <option value="90" className="bg-[#0f1117]">90% +</option>
                    <option value="95" className="bg-[#0f1117]">Elite (95%+)</option>
                  </select>
               </div>
               <div className="space-y-3 flex-1 min-w-[150px]">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Domain</label>
                  <select 
                    value={categoryType}
                    onChange={(e) => setCategoryType(e.target.value)}
                    className="w-full glass-strong rounded-2xl p-4 border border-white/5 text-[11px] font-bold text-white bg-transparent outline-none cursor-pointer hover:bg-white/5 transition-all appearance-none"
                  >
                    <option value="All" className="bg-[#0f1117]">All Domains</option>
                    <option value="Technical" className="bg-[#0f1117]">Technical</option>
                    <option value="Non-Technical" className="bg-[#0f1117]">Non-Technical</option>
                  </select>
               </div>
               <div className="space-y-3 flex-1 min-w-[150px]">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Location</label>
                  <select 
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value)}
                    className="w-full glass-strong rounded-2xl p-4 border border-white/5 text-[11px] font-bold text-white bg-transparent outline-none cursor-pointer hover:bg-white/5 transition-all appearance-none"
                  >
                    <option value="All" className="bg-[#0f1117]">All Locations</option>
                    <option value="Remote" className="bg-[#0f1117]">Remote Only</option>
                    <option value="Office" className="bg-[#0f1117]">On-site / Office</option>
                  </select>
               </div>
               <div className="space-y-3 flex-1 min-w-[150px]">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Contract</label>
                  <select 
                    value={labelType}
                    onChange={(e) => setLabelType(e.target.value)}
                    className="w-full glass-strong rounded-2xl p-4 border border-white/5 text-[11px] font-bold text-white bg-transparent outline-none cursor-pointer hover:bg-white/5 transition-all appearance-none"
                  >
                    <option value="All" className="bg-[#0f1117]">All Types</option>
                    <option value="Freelance" className="bg-[#0f1117]">🔥 Freelance</option>
                    <option value="Agency" className="bg-[#0f1117]">🏢 Agency</option>
                  </select>
               </div>
               <button 
                onClick={() => { setSearchTerm(""); setMinScore(0); setLocationType("All"); setLabelType("All"); setCategoryType("All"); }}
                className="h-[52px] px-8 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-white/5 hover:text-white transition-all flex items-center justify-center"
               >
                  Reset Radar
               </button>
            </div>
         </div>
      </section>

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
              key={o.id || i} 
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

              <div className="mt-8 pt-6 border-t border-white/5 block">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Projected Rate</div>
                    <div className="text-sm font-bold text-foreground">
                      {o.rate || o.pay || "₹15,000"}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleGenerateProposal(o)}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    Draft <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                
                <button 
                  disabled={applyingId === o.id || appliedIds.includes(o.id)}
                  onClick={() => handleApply(o)}
                  className={`w-full py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 ${
                    appliedIds.includes(o.id) 
                      ? 'bg-success/20 text-success border border-success/30' 
                      : 'bg-gradient-cool text-white shadow-glow-cool hover:brightness-110 active:scale-[0.98]'
                  }`}
                >
                  {applyingId === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : appliedIds.includes(o.id) ? <Check className="h-4 w-4" /> : <Radar className="h-4 w-4" />}
                  {applyingId === o.id ? 'Connecting…' : appliedIds.includes(o.id) ? 'Signal Transmitted' : 'Apply for Role'}
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
