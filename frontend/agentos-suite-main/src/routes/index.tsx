import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  FolderKanban,
  Hand,
  ReceiptText,
  Search,
  Sparkles,
  DollarSign,
  Users,
  WandSparkles,
  Send,
} from "lucide-react";
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

const dashboardStats = [
  { label: "Revenue MTD", value: "1.45L", trend: "+22.6%", icon: DollarSign, tone: "text-success" },
  { label: "Pipeline", value: "5.2L", trend: "+18.4%", icon: Sparkles, tone: "text-success" },
  { label: "Active Clients", value: "24", trend: "+4.8%", icon: Users, tone: "text-success" },
  { label: "Pending Actions", value: "8", trend: "-37% done", icon: Clock3, tone: "text-warning" },
];

const invoices = [
  { company: "TechCorp India", amount: "₹48,000", status: "Paid" },
  { company: "Nextsoft", amount: "₹32,500", status: "Due" },
  { company: "StartupPad", amount: "₹65,000", status: "Draft" },
  { company: "DailySync", amount: "₹22,000", status: "Paid" },
];

const projectTracker = [
  { name: "TechCorp API v2", status: "On Track", progress: 92 },
  { name: "Nextsoft UI/UX - Dashboard", status: "In Review", progress: 68 },
  { name: "StartupPad - App MVP", status: "At Risk", progress: 41 },
];

const alerts = [
  { title: "StartupPad overdue 7d", body: "Client payment not sent.", tone: "danger" },
  { title: "TechCorp lead #A2X accepted", body: "Prep proposal deck.", tone: "ok" },
  { title: "3 hot leads found", body: "Prioritize outreach in 24h.", tone: "ok" },
];

function Dashboard() {
  const { user } = useAuth();
  const profile = user?.profile;
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      <section className="glass-strong rounded-3xl p-6 lg:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-base text-muted-foreground">Good morning, {firstName}</p>
            <h1 className="mt-1 text-3xl lg:text-4xl font-semibold tracking-tight">Control dashboard</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>3 agents active</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{metric.value}</p>
              <p className={`mt-1 text-sm font-medium ${metric.tone}`}>{metric.trend}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <article className="glass-strong rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-primary">AI Recommended</p>
                <h2 className="mt-2 text-2xl font-semibold">Reach out to 3 high-value leads in your pipeline</h2>
                <p className="mt-2 text-base text-muted-foreground">
                  Lead Scout detected stronger buying signals across 3 accounts this week.
                </p>
              </div>
              <WandSparkles className="mt-1 h-6 w-6 text-primary" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                Execute Action
                <Send className="h-4 w-4" />
              </button>
              <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium">
                View Details
              </button>
            </div>
          </article>

          <article className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Recent invoices</h3>
              <button className="text-sm text-primary">See all</button>
            </div>
            <div className="mt-5 space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.company}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium">{invoice.company}</p>
                    <p className="text-sm text-muted-foreground">{invoice.status}</p>
                  </div>
                  <p className="text-base font-semibold">{invoice.amount}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="space-y-5">
          <article className="glass rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              Agents
            </h3>
            <div className="mt-4 space-y-3">
              {["Ops Agent", "Lead Scout", "Trend Radar", "Comms Agent"].map((agent, idx) => (
                <div key={agent} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
                  <p className="text-sm">{agent}</p>
                  <span className={`text-xs ${idx === 1 ? "text-warning" : "text-success"}`}>
                    {idx === 1 ? "Warming" : "Active"}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="glass rounded-2xl p-5">
            <h3 className="text-lg font-semibold">Quick actions</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="rounded-xl bg-white/5 px-3 py-3 text-sm hover:bg-white/10">New Invoice</button>
              <button className="rounded-xl bg-white/5 px-3 py-3 text-sm hover:bg-white/10">Proposal</button>
              <button className="rounded-xl bg-white/5 px-3 py-3 text-sm hover:bg-white/10">Schedule</button>
              <button className="rounded-xl bg-white/5 px-3 py-3 text-sm hover:bg-white/10">Run Agent</button>
            </div>
          </article>

          <article className="glass rounded-2xl p-5">
            <h3 className="text-lg font-semibold">Alerts</h3>
            <div className="mt-4 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.title} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <div className="flex items-center gap-2">
                    {alert.tone === "danger" ? (
                      <CircleAlert className="h-4 w-4 text-warning" />
                    ) : (
                      <CircleCheckBig className="h-4 w-4 text-success" />
                    )}
                    <p className="text-sm font-medium">{alert.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.body}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="glass xl:col-span-2 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Project tracker</h3>
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-5 space-y-4">
            {projectTracker.map((project) => (
              <div key={project.name}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-base font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">{project.status}</p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-primary transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass rounded-2xl p-6">
          <h3 className="text-xl font-semibold">Your profile</h3>
          <p className="mt-3 text-base text-muted-foreground">
            {profile?.bio || "Add a short bio to improve client match quality and proposal acceptance."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile?.skills?.slice(0, 6).map((skill: string) => (
              <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Hand className="h-4 w-4" />
              {user?.isOnboarded ? "Onboarding complete" : "Onboarding pending"}
            </div>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4" />
              Base rate: ${profile?.expectedSalary || 0}
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Availability: {profile?.availability || 0}h/wk
            </div>
          </div>
          <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10">
            Edit profile
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </article>
      </section>
    </div>
  );
}
