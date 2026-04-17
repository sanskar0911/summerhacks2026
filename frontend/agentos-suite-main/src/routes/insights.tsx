import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Lightbulb, Target, ArrowUpRight } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights · AgentOS" },
      { name: "description", content: "Profit insights, growth tips and business suggestions." },
    ],
  }),
  component: Insights,
});

const cards = [
  {
    icon: TrendingUp,
    eyebrow: "Profit",
    title: "Your effective hourly rate climbed 14%",
    body: "Switching to fixed-scope proposals over the last 60 days delivered higher margins per project.",
    grad: "bg-gradient-primary",
  },
  {
    icon: Lightbulb,
    eyebrow: "Suggestion",
    title: "Productize your audit offering",
    body: "Three of your last five engagements started as audits. A $1,500 fixed-scope audit could become a recurring funnel.",
    grad: "bg-gradient-cool",
  },
  {
    icon: Target,
    eyebrow: "Growth",
    title: "Double down on fintech",
    body: "Fintech clients have 2.1× higher retention and 38% larger lifetime value than your average client.",
    grad: "bg-gradient-warm",
  },
];

function Insights() {
  return (
    <div>
      <PageHeader
        eyebrow="Strategist"
        title="Insights"
        description="What AgentOS noticed about your business this week."
      />

      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <article
              key={c.title}
              className="group relative overflow-hidden rounded-2xl glass p-6 hover:-translate-y-0.5 transition-all"
            >
              <div
                aria-hidden
                className={`absolute -top-16 -right-16 h-40 w-40 rounded-full ${c.grad} opacity-20 blur-3xl group-hover:opacity-35 transition-opacity`}
              />
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.grad} text-primary-foreground`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {c.eyebrow}
              </div>
              <h3 className="mt-1.5 text-lg font-semibold tracking-tight leading-snug">
                {c.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              <button className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-2.5 transition-all">
                Explore
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </article>
          );
        })}
      </div>

      <section className="mt-8 glass-strong rounded-2xl p-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          This week's narrative
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          You're trending toward your best month of the quarter.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Revenue is +24% MoM, pipeline coverage sits at 1.6× your monthly target, and
          two warm leads are ready to close. AgentOS recommends focusing the next 5
          working days on closing rather than prospecting.
        </p>
      </section>
    </div>
  );
}
