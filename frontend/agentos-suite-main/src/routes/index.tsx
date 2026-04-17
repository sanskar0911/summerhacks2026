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

import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate({ to: "/sanskar" });
      } else {
        navigate({ to: "/login" });
      }
    }
  }, [user, loading]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
