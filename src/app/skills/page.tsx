import { AppLayout } from "@/components/layout/app-layout";
import { SkillGraph } from "@/components/skills/skill-graph";
import { SkillBars } from "@/components/shared/skill-bars";

export default function SkillsPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Skill Map</h1>
        <p className="mt-1 text-muted-foreground">
          Track your mastery across DevOps domains and sub-skills.
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-border bg-card p-5 max-w-lg">
        <h2 className="text-sm font-medium mb-4">Overall Skill Profile</h2>
        <SkillBars />
      </div>

      <SkillGraph />
    </AppLayout>
  );
}
