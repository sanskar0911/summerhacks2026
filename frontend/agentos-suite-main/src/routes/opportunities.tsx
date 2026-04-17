import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ArrowRight, MapPin, Clock } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities · AgentOS" },
      {
        name: "description",
        content: "AI-generated opportunities matched to your portfolio and rates.",
      },
    ],
  }),
  component: Opportunities,
});

const opps = [
  {
    title: "Senior React Engineer — Fintech startup",
    desc: "12-week contract building a trading dashboard. Stack: React, TanStack, Supabase. Remote, EU timezone preferred.",
    score: 96,
    location: "Remote · EU",
    age: "2h ago",
    tags: ["React", "TanStack", "Fintech"],
  },
  {
    title: "AI Product Engineer — B2B SaaS",
    desc: "Help ship LLM features into an existing onboarding flow. Equity + retainer.",
    score: 91,
    location: "Remote · Worldwide",
    age: "5h ago",
    tags: ["AI", "Product", "TypeScript"],
  },
  {
    title: "Design Engineer — Studio collab",
    desc: "Build a marketing site for a venture studio. Motion-heavy, 3 week sprint.",
    score: 84,
    location: "Hybrid · Berlin",
    age: "1d ago",
    tags: ["Framer", "Motion", "Brand"],
  },
  {
    title: "Frontend Audit — DTC e-commerce",
    desc: "One-week audit of Next.js storefront. Performance + conversion focus.",
    score: 78,
    location: "Remote",
    age: "1d ago",
    tags: ["Next.js", "Audit", "Perf"],
  },
];

function Opportunities() {
  return (
    <div>
      <PageHeader
        eyebrow="Lead Scout"
        title="Opportunities"
        description="Curated by AgentOS based on your skills, rates, and recent wins."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground glow-primary">
            <Sparkles className="h-4 w-4" />
            Re-scan market
          </button>
        }
      />

      <div className="grid md:grid-cols-2 gap-4">
        {opps.map((o) => (
          <article
            key={o.title}
            className="group glass rounded-2xl p-5 hover:bg-white/[0.07] transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-semibold tracking-tight leading-snug">
                {o.title}
              </h3>
              <div className="shrink-0 text-right">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Match
                </div>
                <div className="text-lg font-semibold text-gradient-primary">
                  {o.score}%
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{o.desc}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> {o.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> {o.age}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {o.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="relative h-1 w-32 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-primary"
                  style={{ width: `${o.score}%` }}
                />
              </div>
              <button className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-2.5 transition-all">
                Generate Proposal
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
