import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Briefcase,
  Radar,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Zap,
  Activity,
  ArrowUpRight,
  ChevronRight,
  Target,
  Rocket,
  Check,
  Loader2
} from "lucide-react";
import { BrainOrb } from "../../components/BrainOrb";
import { TypingDots } from "../../components/TypingDots";
import { useAuth } from "../../lib/auth";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";


export const Route = createFileRoute("/sanskar/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AgentOS" },
      {
        name: "description",
        content: "Autonomous Job Matching Platform - AI-driven career growth.",
      },
    ],
  }),
  component: Dashboard,
});
function Dashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchMatches = async () => {
    setAnalyzing(true);
    try {
      const [analysisRes, matchesRes] = await Promise.all([
        api.post("/analyze-profile").catch(() => ({ data: null })),
        api.get("/jobs/matches")
      ]);
      setAnalysis(analysisRes.data);
      setMatches(matchesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    try {
      await api.post("/applications", { opportunityId: jobId });
      setAppliedIds(prev => [...prev, jobId]);
    } catch (err) {
      console.error("Transmission Error", err);
    } finally {
      setApplyingId(null);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. AGENTOS ACTIVE STATUS BAR */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
               <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-success">AgentOS Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
               <TypingDots />
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Welcome back, {user?.name?.split(' ')[0] || 'Agent'}...</span>
            </div>
         </div>
      </div>

      {/* 2. NEXT BEST ACTION HERO */}
      <section className="relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-strong rounded-[2.5rem] p-8 md:p-14 border border-white/10 overflow-hidden bg-gradient-to-br from-[#12141d] to-[#0a0b0f]"
        >
          <div className="absolute top-0 right-0 p-12 lg:p-16 opacity-30">
             <BrainOrb size={300} speed={analyzing ? 4 : 1} />
          </div>

          <div className="relative z-10 max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Zap className="h-3 w-3 fill-primary" /> Intelligence Engine: Recommended Action
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1] text-white">
                Next Best Action: <br />
                <span className="text-gradient-primary">
                   {analyzing ? 'Scanning Roster...' : analysis ? 'Deploying Proposal Agent' : 'Syncing Market Intelligence...'}
                </span>
              </h1>
              <p className="text-muted-foreground text-lg font-medium max-w-xl">
                Aggregating signals from your active roster and market radar. High-yield opportunities detected in your current domain.
              </p>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <button 
                onClick={fetchMatches}
                disabled={analyzing}
                className="group inline-flex items-center gap-3 bg-gradient-primary px-8 py-4 rounded-2xl text-white font-bold uppercase tracking-widest text-xs shadow-glow-primary hover:brightness-110 active:scale-95 transition-all"
              >
                Execute with AgentOS <ArrowRight className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-4">
                 <div className="relative h-14 w-14">
                    <svg className="h-full w-full -rotate-90">
                       <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                       <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="150" strokeDashoffset={analyzing ? 150 : 20} className="text-primary transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">{analyzing ? '0%' : '82%'}</div>
                 </div>
                 <div className="text-[10px] items-start flex flex-col uppercase font-bold tracking-widest text-muted-foreground">
                    <span>Intelligence</span>
                    <span>Confidence</span>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
            { label: 'Monthly Earnings', val: '₹6,97,000', icon: DollarSign, color: 'text-primary', trend: '+24%', trendColor: 'text-success' },
            { label: 'Active Clients', val: '0', icon: Users, color: 'text-blue-400', trend: '+2', trendColor: 'text-success' },
            { label: 'Pending Actions', val: '0', icon: Zap, color: 'text-yellow-500', trend: 'now', trendColor: 'text-primary' },
            { label: 'Profit Projected', val: '₹45,000', icon: TrendingUp, color: 'text-purple-400', trend: 'Growth', trendColor: 'text-success' },
         ].map((m, i) => (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
               key={i} className="glass rounded-[2rem] p-6 border border-white/5 relative group hover:bg-white/5 transition-all"
            >
               <div className="flex justify-between items-start mb-6">
                  <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${m.color}`}>
                     <m.icon className="h-5 w-5" />
                  </div>
                  <div className={`text-[10px] font-bold ${m.trendColor} bg-white/5 px-2 py-1 rounded-lg`}>{m.trend}</div>
               </div>
               <div className="text-2xl font-black text-white mb-1">{m.val}</div>
               <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{m.label}</div>
            </motion.div>
         ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 4. ACTIVITY LOGS (Left Side) - 8 Cols */}
        <div className="lg:col-span-8 space-y-8">
           <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                 <Activity className="h-4 w-4 text-primary" />
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">System Activity Logs</h3>
              </div>
              <div className="glass-strong rounded-[2rem] p-4 divide-y divide-white/5 border border-white/10">
                 {[
                    { text: 'Found 3 new high-value opportunities', tag: 'LEAD SCOUT', time: '2m ago' },
                    { text: 'React + AI demand up 14% in Mumbai', tag: 'TREND RADER', time: '15m ago' },
                    { text: 'Drafted proposal for Fintech Startup', tag: 'OPS AGENT', time: '1h ago' }
                 ].map((log, i) => (
                    <div key={i} className="py-4 px-4 flex items-center justify-between group hover:bg-white/5 rounded-xl transition-all">
                       <div className="flex items-center gap-4">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-sm font-medium text-white/90">{log.text}</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="text-[9px] font-black tracking-widest px-2 py-1 bg-white/10 rounded-md text-muted-foreground">{log.tag}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{log.time}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           {/* 5. SPECIALIZED AGENTS GRID */}
           <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Specialized Agents</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                 {[
                    { name: 'Ops Agent', desc: 'Drafts proposals, manages invoices and executes contracts.', status: 'ACTIVE', icon: Briefcase, color: 'bg-blue-500/20 text-blue-400' },
                    { name: 'Lead Scout', desc: 'Discovers high-value opportunities and matches you with global demand.', status: 'SCANNING...', icon: Radar, color: 'bg-cool/20 text-cool' },
                    { name: 'Trend Radar', desc: 'Detects market shifts and surfaces early-stage profit opportunities.', status: 'MONITORING', icon: Target, color: 'bg-orange-500/20 text-orange-400' },
                    { name: 'Comms Agent', desc: 'Automates follow-ups, drafts replies, and tunes your professional tone.', status: 'READY', icon: MessageSquare, color: 'bg-purple-500/20 text-purple-400' }
                 ].map((agent, i) => (
                    <div key={i} className="glass-strong rounded-[2.5rem] p-8 border border-white/10 relative overflow-hidden group">
                       <div className="flex justify-between items-start mb-6">
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${agent.color} shadow-lg`}>
                             <agent.icon className="h-7 w-7" />
                          </div>
                          <div className="text-[9px] font-black px-3 py-1 bg-white/5 rounded-full border border-white/5 text-muted-foreground">{agent.status}</div>
                       </div>
                       <h4 className="text-xl font-bold mb-2 text-white">{agent.name}</h4>
                       <p className="text-xs text-muted-foreground font-medium mb-8 leading-relaxed">{agent.desc}</p>
                       <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                          Initialize Protocol <ArrowUpRight className="h-4 w-4" />
                       </button>
                    </div>
                 ))}
              </div>
           </section>
        </div>

        {/* 6. SIDE RADAR (Right Side) - 4 Cols */}
        <aside className="lg:col-span-4 space-y-8">
           <section className="glass-strong rounded-[2.5rem] p-8 border border-white/10 space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Market Signal</h3>
                 <Rocket className="h-4 w-4 text-primary" />
              </div>

              <div className="space-y-6">
                 {matches.slice(0, 3).map((job, i) => (
                    <div key={i} className="space-y-2 group cursor-pointer">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary underline decoration-primary/20">
                          <span>{job.score || 95}% Match</span>
                          <span className="text-white">{job.rate}</span>
                       </div>
                       <h5 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{job.title}</h5>
                       <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{job.company}</div>
                    </div>
                 ))}
              </div>

              <div className="pt-6 border-t border-white/5">
                 <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase mb-1">
                       <TrendingUp className="h-3 w-3" /> Growth Insight
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                       "Increase your hourly pricing by 18% based on recent market shifts in AI Product Design."
                    </p>
                 </div>
                 <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                    Scan Global Market
                 </button>
              </div>
           </section>

           <div className="glass rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AgentOS Fee Model</span>
                 <Target className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-end justify-between">
                 <div>
                    <div className="text-2xl font-black text-white">₹500</div>
                    <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">Per automated deal</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[9px] font-black text-success uppercase">Estimated ROI</div>
                    <div className="text-lg font-black text-white">12.5x</div>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
