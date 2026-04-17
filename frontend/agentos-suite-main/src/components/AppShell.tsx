import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Sparkles,
  Users,
  FileText,
  TrendingUp,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { BrainOrb } from "./BrainOrb";
import { TypingDots } from "./TypingDots";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/opportunities", label: "Opportunities", icon: Sparkles },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/proposals", label: "Proposals", icon: FileText },
  { to: "/insights", label: "Insights", icon: TrendingUp },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex w-full text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 lg:w-60 shrink-0 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-full glass border-r border-border/60 flex flex-col p-4">
          <div className="flex items-center gap-2.5 px-2 py-3">
            <BrainOrb size={28} />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">AgentOS</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Autonomous
              </div>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all
                    ${active
                      ? "bg-white/10 text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-xl glass-strong p-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-glow-pulse" />
              System healthy
            </div>
            <div className="mt-1 text-foreground/80">12 tasks automated today</div>
          </div>
        </div>
      </aside>

      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 glass border-b border-border/60">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-success animate-glow-pulse" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-sm font-medium">AgentOS Active</span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground ml-4 px-3 py-1.5 rounded-full bg-white/5">
              <TypingDots className="text-primary" />
              <span className="shimmer-text">Analyzing your business…</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-warning" />
              </button>
              <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="h-7 w-7 rounded-full bg-gradient-primary grid place-items-center text-xs font-semibold text-primary-foreground">
                  AK
                </div>
                <span className="hidden sm:inline text-xs font-medium">Alex K.</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-10 max-w-[1400px] w-full mx-auto animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
