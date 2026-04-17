import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass-strong rounded-2xl p-10">
        <h1 className="text-7xl font-bold text-gradient-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Signal lost</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          AgentOS couldn't locate this route.
        </p>
        <div className="mt-6">
          <Link
            to="/sanskar"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground glow-primary"
          >
            Return to control center
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AgentOS — Autonomous Business Operating System" },
      {
        name: "description",
        content:
          "AgentOS is an AI-driven control system that runs your solo business — proposals, leads, trends, and comms on autopilot.",
      },
      { name: "author", content: "AgentOS" },
      { property: "og:title", content: "AgentOS — Autonomous Business Operating System" },
      {
        property: "og:description",
        content: "AI-driven control system that runs your solo business.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider, useAuth } from "../lib/auth";
import { useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";

function RootComponent() {
  return (
    <AuthProvider>
      <AuthAwareApp />
    </AuthProvider>
  );
}

function AuthAwareApp() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      const isAuthRoute = location.pathname === "/login";
      const isOnboardingRoute = location.pathname === "/onboarding";

      if (!user) {
        if (!isAuthRoute) {
          navigate({ to: "/login" });
        }
      } else if (!user.isOnboarded) {
        if (!isOnboardingRoute) {
          navigate({ to: "/onboarding" });
        }
      } else if (isAuthRoute || isOnboardingRoute) {
        navigate({ to: "/sanskar" });
      }
    }
  }, [user, loading, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
