import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { BrainOrb } from "../components/BrainOrb";
import { TypingDots } from "../components/TypingDots";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Control Center · AgentOS" },
      {
        name: "description",
        content:
          "Your AI-driven business control center. See the next best action, alerts, and live system state.",
      },
    ],
  }),
  component: Dashboard,
});

const agents = [
  {
    name: "Ops Agent",
    desc: "Generates proposals, manages invoices and parses contracts.",
    icon: Briefcase,
    gradient: "bg-gradient-primary",
    action: "Run Ops",
  },
  {
    name: "Lead Scout",
    desc: "Discovers opportunities and matches you with qualified clients.",
    icon: Sparkles,
    gradient: "bg-gradient-cool",
    action: "Find Leads",
  },
  {
    name: "Trend Radar",
    desc: "Detects market shifts and surfaces niche opportunities early.",
    icon: Radar,
    gradient: "bg-gradient-warm",
    action: "Scan Market",
  },
  {
    name: "Comms Agent",
    desc: "Drafts emails, suggests follow-ups, and tunes your tone.",
    icon: MessageSquare,
    gradient: "bg-gradient-primary",
    action: "Open Inbox",
  },
];

const stats = [
  { label: "Revenue this month", value: "$18,420", delta: "+24%", icon: DollarSign },
  { label: "Active clients", value: "7", delta: "+2", icon: Users },
  { label: "Pending actions", value: "4", delta: "now", icon: Zap },
  { label: "Opportunities", value: "12", delta: "fresh", icon: Activity },
];

const alerts = [
  {
    tone: "warning",
    title: "No leads scheduled for next week",
    body: "Lead Scout suggests outreach to 3 startups hiring React developers.",
  },
  {
    tone: "danger",
    title: "Client may churn — Northwind Co.",
    body: "Engagement dropped 60% over the last 14 days. Send check-in?",
  },
  {
    tone: "info",
    title: "You appear to be underpricing",
    body: "Market rate for your stack is 18% higher than your average invoice.",
  },
];

function Dashboard() {
  const { user } = useAuth();
  const profile = user?.profile;

  const freelancerStats = [
    { label: "Onboarding Status", value: user?.isOnboarded ? "Verified" : "Pending", delta: "active", icon: Zap },
    { label: "Availability", value: `${profile?.availability || 0}h/wk`, delta: profile?.jobType || "Freelance", icon: Activity },
    { label: "Base Rate", value: `$${profile?.expectedSalary || 0}`, delta: "per month", icon: DollarSign },
    { label: "Exp. Level", value: profile?.experienceLevel || "N/A", delta: `${profile?.yearsOfExperience || 0} years`, icon: Briefcase },
  ];

  return (
    <div className="space-y-10">
      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-3xl glass-strong p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gradient-brain opacity-30 blur-3xl"
        />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="shrink-0 flex lg:flex-col items-center lg:items-start gap-4">
            <div className="h-24 w-24 rounded-3xl bg-gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-glow-primary">
              {user?.name?.[0]}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Freelancer Identity
            </div>
            <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight leading-tight">
              Welcome, <span className="text-gradient-primary">{user?.name}</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
              {profile?.bio || "You haven't added a bio yet. Update your profile to stand out to clients."}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {profile?.skills?.map((skill: string) => (
                <span key={skill} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {freelancerStats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="glass rounded-2xl p-4 md:p-5 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-xl md:text-2xl font-semibold tracking-tight">
                  {s.value}
                </div>
                <div className="text-[10px] text-primary font-medium">{s.delta}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Placeholder Job Matching */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Recommended Jobs</div>
            <button className="text-xs text-primary font-medium hover:underline">View All</button>
          </div>
          
          {[
            { title: "Senior React Architect", company: "MetaScale", rate: "$120/hr", tags: ["React", "TypeScript"] },
            { title: "AI Integration Lead", company: "CyberNexus", rate: "$150/hr", tags: ["Python", "OpenAI"] },
            { title: "Product Designer", company: "Vivid UI", rate: "$90/hr", tags: ["Figma", "UI/UX"] },
          ].map((job, i) => (
            <div key={i} className="glass rounded-2xl p-5 group flex items-start gap-4 hover:bg-white/10 transition-all cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-lg font-bold">
                {job.company[0]}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{job.title}</h4>
                <div className="text-xs text-muted-foreground mt-1">{job.company} • {job.rate}</div>
                <div className="flex gap-2 mt-3">
                  {job.tags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors self-center" />
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 h-fit sticky top-24">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Readiness
          </h3>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Your profile is {(user?.isOnboarded ? 100 : 0)}% complete. 
            AI optimization is analyzing your bio to suggest better skill keywords.
          </p>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium">
                <span>Verification</span>
                <span>{user?.isOnboarded ? "100%" : "0%"}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary rounded-full transition-all duration-1000"
                  style={{ width: user?.isOnboarded ? "100%" : "0%" }}
                />
              </div>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors border border-white/5">
              Edit Professional Profile
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
