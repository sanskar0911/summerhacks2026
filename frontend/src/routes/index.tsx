import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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
  Zap,
  Activity,
  Loader2,
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
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
