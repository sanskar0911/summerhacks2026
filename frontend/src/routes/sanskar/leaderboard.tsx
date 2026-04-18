import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Star, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Zap, 
  Award,
  ChevronRight,
  TrendingDown
} from "lucide-react";

export const Route = createFileRoute("/sanskar/leaderboard")({
  component: LeaderboardPage,
});

const FIXED_FREELANCERS = [
  { id: 'f-1', name: "Sanskar Gharal", email: "sanskar@agentos.ai", rating: 5.0, completedJobs: 154, skills: ["Agentic AI", "Senior Architecture", "Fullstack"], status: 'ELITE', bio: "Global lead architect for the AgentOS Nexus." },
  { id: 'f-2', name: "Kunal (AI Architect)", email: "kunal@nexus.ai", rating: 5.0, completedJobs: 452, skills: ["Neural Systems", "LLM Ops", "React"], status: 'LEGENDARY', bio: "Neural integration specialist." },
  { id: 'f-3', name: "Aisha Khan", email: "aisha@web3.io", rating: 4.9, completedJobs: 89, skills: ["Web3", "Solidity", "React"], status: 'ELITE', bio: "Blockchain systems engineer." },
  { id: 'f-4', name: "Leo Da Silva", email: "leo@rust.dev", rating: 4.9, completedJobs: 112, skills: ["Rust", "Systems Design", "Wasm"], status: 'PRO', bio: "Systems performance expert." },
  { id: 'f-5', name: "Mei Ling", email: "mei@ai.research", rating: 5.0, completedJobs: 45, skills: ["ML Researcher", "Python", "PyTorch"], status: 'EXPERT', bio: "Autonomous model architect." }
];

const FIXED_CLIENTS = [
  { id: 'c-1', name: "Global Vertex", projectsPosted: 142, budgetSpent: 8500000, rating: 4.9, trust: 5.0 },
  { id: 'c-2', name: "Vortex Systems", projectsPosted: 210, budgetSpent: 12500000, rating: 5.0, trust: 4.9 },
  { id: 'c-3', name: "CyberLayer Labs", projectsPosted: 67, budgetSpent: 4200000, rating: 4.8, trust: 4.7 },
  { id: 'c-4', name: "MetaNode Group", projectsPosted: 34, budgetSpent: 2100000, rating: 4.7, trust: 4.6 },
  { id: 'c-5', name: "Alpha Solutions", projectsPosted: 89, budgetSpent: 3200000, rating: 4.8, trust: 4.8 }
];

function LeaderboardPage() {
  const data = { freelancers: FIXED_FREELANCERS, clients: FIXED_CLIENTS };
  const user = { name: "Sanskar Gharal", email: "sanskar@agentos.ai" }; // Hardcoded demo user identification

  const getRankBadge = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  const isCurrentUser = (f: any) => f.email === user.email;

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-widest text-yellow-500">
          <Trophy className="h-3 w-3" /> Global Hall of Fame
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight">The <span className="text-gradient-primary">Elite Nexus</span></h1>
            <p className="text-muted-foreground font-medium text-lg">Top 5 performing freelancers and highest-spending clients globally.</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-6 py-4 rounded-[1.5rem]">
             <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Elite Talent</div>
                <div className="text-xl font-black text-white">5 Ranked</div>
             </div>
             <div className="h-8 w-px bg-white/10" />
             <div className="text-left">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Clients</div>
                <div className="text-xl font-black text-cool">5 Global</div>
             </div>
          </div>
        </div>
      </header>

      {/* FEATURED TOP TALENT HERO */}
      {data?.freelancers && data.freelancers.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative group overflow-hidden rounded-[3rem] p-10 border ${isCurrentUser(data.freelancers[0]) ? 'border-primary shadow-glow-primary/40' : 'border-primary/20'} bg-[#0f1115] shadow-2xl`}
        >
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 h-96 w-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-all duration-700" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-success/10 blur-[100px] rounded-full pointer-events-none" />

          {isCurrentUser(data.freelancers[0]) && (
             <div className="absolute top-8 left-8 bg-gradient-brand text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest z-20 shadow-lg border border-white/20">
                You Are Currently Ranked #1
             </div>
          )}

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="relative">
              <div className="h-48 w-48 rounded-[3rem] bg-gradient-primary p-1 shadow-2xl scale-110">
                <div className="h-full w-full rounded-[2.8rem] bg-[#0f1115] flex items-center justify-center overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.freelancers[0].name}`} alt="Top talent" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-yellow-500 text-black px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-4 border-[#0f1115]">
                {getRankBadge(0)}
              </div>
            </div>

            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white">{data.freelancers[0].name}</h2>
                  <div className="bg-success/20 border border-success/30 p-1.5 rounded-full">
                    <Award className="h-5 w-5 text-success" />
                  </div>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                  {data.freelancers[0].skills.map((s: string) => (
                    <span key={s} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/5">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Rating</div>
                  <div className="text-2xl font-black text-yellow-500 flex items-center justify-center lg:justify-start gap-2">
                    <Star className="h-5 w-5 fill-yellow-500" /> {data.freelancers[0].rating}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Projects</div>
                  <div className="text-2xl font-black text-white">{data.freelancers[0].completedJobs}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Market Status</div>
                  <div className="text-2xl font-black text-success uppercase tracking-tighter">{data.freelancers[0].status}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Response Signal</div>
                  <div className="text-2xl font-black text-primary">12m</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-glow-primary hover:scale-[1.02] active:scale-95 transition-all">
                  Initiate Secure Hire
                </button>
                <div className="flex items-center gap-3 px-6 py-5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Currently analyzing high-yield technical signals</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      <div className="grid lg:grid-cols-2 gap-10">
        {/* TOP FREELANCERS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Top Global Freelancers
            </h2>
          </div>

          <div className="space-y-4">
            {data?.freelancers.slice(1).map((f, i) => {
              const rankIndex = i + 1; // Start from #2
              const current = isCurrentUser(f);
              return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`group glass-strong rounded-[2rem] p-6 border ${current ? 'border-primary bg-primary/5' : 'border-white/5'} hover:bg-white/[0.08] transition-all relative overflow-hidden`}
              >
                {current && <div className="absolute top-4 left-6 text-[8px] font-black uppercase tracking-widest text-primary">Your Dynamic Rank</div>}
                
                <div className="absolute top-0 right-0 p-4 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                  {getRankBadge(rankIndex)}
                </div>
                
                <div className="flex items-center gap-6">
                  <div className={`h-16 w-16 rounded-2xl ${current ? 'bg-gradient-brand' : 'bg-gradient-primary'} p-0.5 shadow-lg`}>
                    <div className="h-full w-full rounded-[0.9rem] bg-[#0f1115] flex items-center justify-center overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${f.name}`} alt={f.name} className="h-full w-full object-cover" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                       <h3 className="text-xl font-bold tracking-tight">{f.name}</h3>
                       {current && <Zap className="h-3 w-3 text-primary fill-primary" />}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {f.skills.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 bg-white/5 rounded border border-white/10">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                  <div className="space-y-0.5 text-center">
                    <div className="text-xs font-black text-primary flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-primary" /> {f.rating}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">Rating</div>
                  </div>
                  <div className="space-y-0.5 text-center">
                    <div className="text-xs font-black text-white">{f.completedJobs}</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">Jobs</div>
                  </div>
                  <div className="space-y-0.5 text-center">
                    <div className={`text-xs font-black ${current ? 'text-primary' : 'text-success'}`}>{f.status}</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">Status</div>
                  </div>
                </div>

                <button className={`w-full mt-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all group-hover:shadow-glow-primary`}>
                  {current ? "Review Profile Metrics" : "Hire This Talent"}
                </button>
              </motion.div>
              );
            })}
          </div>
        </section>

        {/* TOP CLIENTS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" /> High-Budget Clients
            </h2>
          </div>

          <div className="space-y-4">
            {data?.clients.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group glass-strong rounded-[2rem] p-6 border border-white/5 hover:bg-white/[0.08] transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                  {getRankBadge(i)}
                </div>

                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-cool p-0.5 shadow-lg">
                    <div className="h-full w-full rounded-[0.9rem] bg-[#0f1115] flex items-center justify-center text-xl font-black text-white">
                      {c.name[0]}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-bold tracking-tight">{c.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actively Hiring</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                  <div className="space-y-0.5 text-center">
                    <div className="text-xs font-black text-white">{c.projectsPosted}</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">Projects</div>
                  </div>
                  <div className="space-y-0.5 text-center">
                    <div className="text-xs font-black text-success">₹{(c.budgetSpent / 1000).toFixed(1)}L</div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">Volume</div>
                  </div>
                  <div className="space-y-0.5 text-center">
                    <div className="text-xs font-black text-primary flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-primary" /> {c.rating}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-muted-foreground">Trust</div>
                  </div>
                </div>

                <button className="w-full mt-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                  View Active Jobs
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      {/* PROTOCOL: PATH TO ELITE WORKFLOW */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
           <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Nexus Protocol</h2>
           <h3 className="text-3xl font-bold tracking-tight">The Path to Elite Status</h3>
           <p className="text-muted-foreground text-sm font-medium">Follow the autonomous pipeline to climb the global rankings.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
           {/* Connecting Line (Desktop) */}
           <div className="hidden md:block absolute top-[60px] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
           
           {[
              { 
                step: "01", 
                title: "Identity Verification", 
                desc: "Complete your neural profile and synchronize your core skills with the AgentOS registry.",
                icon: Users,
                color: "bg-primary/20 text-primary"
              },
              { 
                step: "02", 
                title: "Skill Calibration", 
                desc: "Undergo AI-driven code audits and market feasibility scans to verify your technical density.",
                icon: Zap,
                color: "bg-cool/20 text-cool"
              },
              { 
                step: "03", 
                title: "Market Dominance", 
                desc: "Execute high-value proposals and maintain a 99% trust rating to reach the Elite Roster.",
                icon: Trophy,
                color: "bg-yellow-500/20 text-yellow-500"
              }
           ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="glass-strong rounded-[2.5rem] p-8 border border-white/10 relative group hover:bg-white/5 transition-all text-center lg:text-left"
              >
                 <div className="absolute top-6 right-8 text-4xl font-black text-white/5 group-hover:text-primary/10 transition-colors">{s.step}</div>
                 <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${s.color} mb-6 mx-auto lg:mx-0 shadow-lg`}>
                    <s.icon className="h-7 w-7" />
                 </div>
                 <h4 className="text-lg font-black mb-3 text-white tracking-tight">{s.title}</h4>
                 <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{s.desc}</p>
              </motion.div>
           ))}
        </div>
      </section>
    </div>
  );
}
