import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, RefreshCw, Sparkles, FileText } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TypingDots } from "../components/TypingDots";

export const Route = createFileRoute("/proposals")({
  head: () => ({
    meta: [
      { title: "Proposals · AgentOS" },
      { name: "description", content: "AI-drafted proposals you can edit and send in seconds." },
    ],
  }),
  component: Proposals,
});

const initial = `Hi Sara,

Saw your post about needing a senior React engineer for the trading dashboard — this is squarely in my zone. I've shipped two real-time dashboards this year (one for a fintech, one for a marketplace), both using React + TanStack Query.

A 12-week scope feels right. I'd suggest:
  • Week 1: architecture + design system alignment
  • Weeks 2–10: feature delivery in 2-week sprints
  • Weeks 11–12: hardening, perf, handoff

Happy to share case studies on a 20-min call this week.

— Alex`;

function Proposals() {
  const [text, setText] = useState(initial);
  const [regen, setRegen] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow="Ops Agent"
        title="Proposal draft"
        description="Edit freely. AgentOS will regenerate a tightened version on demand."
        actions={
          <>
            <button
              onClick={() => {
                setRegen(true);
                setTimeout(() => setRegen(false), 1500);
              }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium glass hover:bg-white/10 transition"
            >
              <RefreshCw className={`h-4 w-4 ${regen ? "animate-spin" : ""}`} />
              Regenerate
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground glow-primary">
              <Send className="h-4 w-4" />
              Send Email
            </button>
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-strong rounded-2xl p-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>To: sara@northwindfintech.com</span>
            </div>
            {regen && (
              <div className="text-xs text-primary inline-flex items-center gap-2">
                <TypingDots /> rewriting…
              </div>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[460px] bg-transparent resize-none p-5 text-sm leading-relaxed focus:outline-none font-sans text-foreground/90"
          />
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              AI suggestions
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                "Mention your case study with Mariposa — same stack, similar scope.",
                "Tighten paragraph 2 — currently 18% over ideal length.",
                "Add a clear next step: propose a specific time slot.",
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-foreground/85">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Tone
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Confident", "Friendly", "Concise", "Formal"].map((t, i) => (
                <button
                  key={t}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    i === 0
                      ? "bg-gradient-primary text-primary-foreground border-transparent"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
