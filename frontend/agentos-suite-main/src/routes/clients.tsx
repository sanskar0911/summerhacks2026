import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/PageHeader";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients · AgentOS" },
      { name: "description", content: "Your client roster, status, and lifetime value." },
    ],
  }),
  component: Clients,
});

const clients = [
  { name: "Mariposa Inc.", status: "Active", contact: "Jordan Lee", value: "$24,000", initials: "MI", color: "bg-gradient-primary" },
  { name: "Northwind Co.", status: "Pending", contact: "Sara Patel", value: "$8,500", initials: "NW", color: "bg-gradient-cool" },
  { name: "Helio Labs", status: "Active", contact: "Yuki Tanaka", value: "$41,200", initials: "HL", color: "bg-gradient-warm" },
  { name: "Orbital Studio", status: "Inactive", contact: "Diego Romero", value: "$3,200", initials: "OS", color: "bg-gradient-primary" },
  { name: "Pine & Co.", status: "Active", contact: "Mira Schultz", value: "$17,800", initials: "PC", color: "bg-gradient-cool" },
];

const statusStyle: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/25",
  Pending: "bg-warning/15 text-warning border-warning/25",
  Inactive: "bg-white/5 text-muted-foreground border-white/10",
};

function Clients() {
  return (
    <div>
      <PageHeader
        eyebrow="Roster"
        title="Clients"
        description="A minimal view of who you work with and where each relationship stands."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground glow-primary">
            <Plus className="h-4 w-4" /> Add client
          </button>
        }
      />

      <div className="glass-strong rounded-2xl divide-y divide-white/5 overflow-hidden">
        {clients.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-4 p-4 md:p-5 hover:bg-white/[0.04] transition-colors"
          >
            <div className={`h-10 w-10 rounded-xl ${c.color} grid place-items-center text-xs font-semibold text-primary-foreground shadow-md`}>
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{c.name}</div>
              <div className="text-xs text-muted-foreground truncate">{c.contact}</div>
            </div>
            <div className="hidden sm:block text-sm text-foreground/80 tabular-nums">
              {c.value}
            </div>
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full border ${statusStyle[c.status]}`}
            >
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
