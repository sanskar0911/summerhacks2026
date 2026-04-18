import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";

export const Route = createFileRoute("/projects")({
  component: ProjectsRoute,
});

function ProjectsRoute() {
  return (
    <div className="space-y-5">
      <header className="glass-strong rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <FolderKanban className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        </div>
        <p className="mt-3 text-base text-muted-foreground">
          Track delivery health, milestones, and blockers across all active client projects.
        </p>
      </header>

      <section className="glass rounded-2xl p-6">
        <p className="text-lg font-medium">Project workspace is ready.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect this page to your project API to load live tasks and timelines.
        </p>
      </section>
    </div>
  );
}
