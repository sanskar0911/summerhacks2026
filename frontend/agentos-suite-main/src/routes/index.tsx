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
  return (
    <div className="space-y-10">
      {/* Hero — Next Action */}
      <section className="relative overflow-hidden rounded-3xl glass-strong p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gradient-brain opacity-30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-gradient-cool opacity-20 blur-3xl"
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="shrink-0 flex lg:flex-col items-center lg:items-start gap-4">
            <BrainOrb size={88} />
            <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
              <TypingDots className="text-primary" />
              <span className="shimmer-text">AgentOS thinking</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Next Action
            </div>
            <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight leading-tight">
              Send a proposal to a startup hiring{" "}
              <span className="text-gradient-primary">React developers</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
              Reasoning: No leads in pipeline for next week. A matching gig was posted
              4 hours ago with high alignment to your portfolio.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground">Confidence</div>
                <div className="relative h-1.5 w-40 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full"
                    style={{ width: "92%" }}
                  />
                </div>
                <div className="text-xs font-semibold">92%</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-medium text-primary-foreground glow-primary hover:brightness-110 transition">
                Execute Action
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium glass hover:bg-white/10 transition"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => {
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
                <div className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {s.value}
                </div>
                <div className="text-[11px] text-success font-medium">{s.delta}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Agents grid */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Agent Modules
            </div>
            <h3 className="mt-1 text-xl font-semibold tracking-tight">
              Your autonomous operators
            </h3>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {agents.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.name}
                className="group relative overflow-hidden rounded-2xl glass p-5 transition-all hover:-translate-y-0.5 hover:bg-white/[0.07] hover:shadow-[0_20px_60px_-20px_oklch(0.5_0.2_280/0.5)]"
              >
                <div
                  aria-hidden
                  className={`absolute -top-12 -right-12 h-32 w-32 rounded-full ${a.gradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}
                />
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${a.gradient} text-primary-foreground shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-base font-semibold tracking-tight">{a.name}</h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed min-h-[48px]">
                  {a.desc}
                </p>
                <button className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:gap-2.5 transition-all">
                  {a.action}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Alerts + System log */}
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            Smart Alerts
          </div>
          {alerts.map((a) => (
            <div
              key={a.title}
              className="glass rounded-xl p-4 flex gap-4 items-start hover:bg-white/[0.07] transition-colors"
            >
              <div
                className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  a.tone === "danger"
                    ? "bg-destructive"
                    : a.tone === "warning"
                    ? "bg-warning"
                    : "bg-brand-cyan"
                } animate-glow-pulse`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.body}</div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                Resolve
              </button>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            System Log
          </div>
          <div className="mt-4 space-y-4 text-sm">
            {[
              "AgentOS found 3 new opportunities",
              "Analyzing your revenue patterns…",
              "Drafted follow-up to Mariposa Inc.",
              "Trend Radar flagged a rising niche: AI ops",
            ].map((line, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <div className="text-foreground/90">{line}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {i === 1 ? "now" : `${(i + 1) * 6}m ago`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
