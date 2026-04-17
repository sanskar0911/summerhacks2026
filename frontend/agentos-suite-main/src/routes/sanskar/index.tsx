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
  Rocket
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
      { title: "Control Center · AgentOS" },
      {
        name: "description",
        content: "Autonomous Business Operating System - AI-driven execution and market intelligence.",
      },
    ],
  }),
  component: Dashboard,
});

const agents = [
  {
    name: "Ops Agent",
    desc: "Drafts proposals, manages invoices and executes contracts.",
    icon: Briefcase,
    gradient: "bg-gradient-primary",
    to: "/sanskar/proposals",
    status: "Active",
    action: "Run Ops",
  },
  {
    name: "Lead Scout",
    desc: "Discovers high-value opportunities and matches you with global demand.",
    icon: Sparkles,
    gradient: "bg-gradient-cool",
    to: "/sanskar/opportunities",
    status: "Scanning…",
    action: "Find Leads",
  },
  {
    name: "Trend Radar",
    desc: "Detects market shifts and surfaces early-stage profit opportunities.",
    icon: Radar,
    gradient: "bg-gradient-warm",
    to: "/sanskar/insights",
    status: "Monitoring",
    action: "Scan Trends",
  },
  {
    name: "Comms Agent",
    desc: "Automates follow-ups, drafts replies, and tunes your professional tone.",
    icon: MessageSquare,
    gradient: "bg-gradient-primary",
    to: "/sanskar/proposals",
    status: "Ready",
    action: "Open Comms",
  },
];

function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const [statsRes, oppsRes] = await Promise.all([
        api.get("/stats"),
        api.get("/opportunities")
      ]);
      setStats(statsRes.data);
      setOpportunities(oppsRes.data.slice(0, 6));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const nextAction = {
    title: "Send Proposal to CyberNexus",
    reason: "Intelligence detected high-match (92%) opportunity. No leads scheduled for next week.",
    confidence: 94,
    link: "/sanskar/opportunities",
    icon: Rocket
  };

  const dashboardStats = [
    { label: "Monthly Earnings", value: stats?.totalRevenue?.replace('$', '₹') || "₹18,420", delta: "+24%", icon: DollarSign },
    { label: "Active Clients", value: stats?.activeClients || "7", delta: "+2", icon: Users },
    { label: "Pending Actions", value: stats?.pendingActions || "4", delta: "now", icon: Zap },
    { label: "Profit Projected", value: "₹45,000", delta: "Growth", icon: TrendingUp },
  ];

  const agentLogs = [
    { agent: "Lead Scout", msg: "Found 3 new high-value opportunities", time: "2m ago" },
    { agent: "Trend Radar", msg: "React + AI demand up 14% in Mumbai", time: "15m ago" },
    { agent: "Ops Agent", msg: "Drafted proposal for Fintech Startup", time: "1h ago" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* NEXT ACTION HERO - HACKATHON FOCUS */}
      <section className="relative">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-strong rounded-[2.5rem] p-8 md:p-12 border border-white/10 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 lg:p-12 hidden md:block opacity-20 group">
             <BrainOrb size={180} />
          </div>

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Zap className="h-3 w-3 fill-primary" />
              Intelligence Engine: Recommended Action
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Next Best Action: <br />
                <span className="text-gradient-primary">{nextAction.title}</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                {nextAction.reason}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
               <button 
                onClick={() => navigate({ to: nextAction.link as any })}
                className="group relative inline-flex items-center gap-3 bg-gradient-primary px-8 py-4 rounded-2xl text-primary-foreground font-bold shadow-glow-primary hover:brightness-110 transition-all active:scale-[0.98]"
               >
                  Execute with AgentOS <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
               </button>
               
               <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl glass border border-white/10 flex items-center justify-center font-bold text-lg text-primary">
                    {nextAction.confidence}%
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground leading-tight">
                    Intelligence <br /> Confidence
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* DASHBOARD STATS with INR Localization */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="glass rounded-3xl p-6 border border-white/5 group hover:bg-white/[0.08] transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                  {stat.delta}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-gradient-primary">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* AGENT ACTIVITY FEED */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                   <Activity className="h-3.5 w-3.5 text-primary" />
                   System Activity Logs
                </h3>
             </div>
             <div className="glass-strong rounded-3xl p-2 border border-white/5 space-y-1">
                {agentLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-glow-primary animate-pulse" />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                       <span className="text-sm font-semibold tracking-tight">{log.msg}</span>
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 border border-white/10">{log.agent}</span>
                         <span className="text-[10px] text-muted-foreground font-medium">{log.time}</span>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </section>

          {/* PERSONA SELECTION & AGENT CARDS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Specialized Agents</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {agents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <button
                    key={agent.name}
                    onClick={() => navigate({ to: agent.to as any })}
                    className="group glass rounded-[2rem] p-6 border border-white/5 hover:bg-white/[0.07] transition-all text-left relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={`h-14 w-14 rounded-2xl ${agent.gradient} flex items-center justify-center p-3.5 text-primary-foreground group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className="h-full w-full" />
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded-lg border border-primary/20">
                         {agent.status}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold tracking-tight">{agent.name}</h4>
                      <p className="mt-2 text-xs text-muted-foreground/80 leading-relaxed font-medium">
                        {agent.desc}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary group-hover:gap-3 transition-all">
                      {agent.action} <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* MARKET FEED & MONETIZATION */}
        <aside className="space-y-6">
           <div className="glass-strong rounded-3xl p-8 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Rocket className="h-20 w-20 text-primary rotate-45" />
              </div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Market Signal</h3>
                <div className="flex gap-1">
                   <div className="h-1 w-1 rounded-full bg-success animate-bounce" />
                   <div className="h-1 w-1 rounded-full bg-success animate-bounce [animation-delay:0.2s]" />
                   <div className="h-1 w-1 rounded-full bg-success animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
              <div className="space-y-6">
                {loading ? <div className="py-10 flex justify-center"><TypingDots /></div> : opportunities.slice(0, 3).map((opp, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                       <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{opp.match}% Match</span>
                       <span className="text-[10px] font-bold text-muted-foreground">{opp.pay || "₹15,000"}</span>
                    </div>
                    <div className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-1">{opp.title}</div>
                    <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{opp.company}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-primary mb-2">
                    <TrendingUp className="h-3 w-3" /> Growth Insight
                 </div>
                 <p className="text-[10px] leading-relaxed text-muted-foreground font-medium">
                    "Increase your hourly pricing by 18% based on recent market shifts in AI Product Design. Potential gain: <span className="text-foreground font-bold">₹8,500/mo</span>."
                 </p>
              </div>

              <button 
                onClick={() => navigate({ to: "/sanskar/opportunities" })}
                className="w-full mt-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-[0.98]"
              >
                Scan Global Market
              </button>
           </div>

           <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                 <span>AgentOS Fee Model</span>
                 <Target className="h-3 w-3 text-primary" />
              </div>
              <div className="flex items-end justify-between">
                 <div className="space-y-0.5">
                    <div className="text-2xl font-bold tracking-tight">₹500</div>
                    <div className="text-[10px] text-muted-foreground font-medium">Per automated deal</div>
                 </div>
                 <div className="text-[10px] text-right font-medium text-muted-foreground/60 leading-tight">
                    Estimated ROI <br /> <span className="text-primary font-bold">12.5x</span>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
