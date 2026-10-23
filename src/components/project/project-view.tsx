"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Circle, ArrowRight, Terminal, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getMockProject, PROJECT_COMPETENCY } from "@/lib/mock/project";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";
import { TerminalOutputLine } from "@/components/shared/terminal-output-line";
import { formatTerminalOk } from "@/lib/ui/terminal-lines";

export function ProjectView() {
  const router = useRouter();
  const { state, completeProjectStage, completeProject, earnCertificate } = useApp();
  const project = getMockProject(state.progress.projectStagesCompleted);
  const [showCompletion, setShowCompletion] = useState(state.progress.projectComplete);
  const [terminalOutput, setTerminalOutput] = useState([
    "$ docker build -t myapp .",
    "Sending build context...",
    "Successfully built image myapp:latest",
    "$ npm test",
    "Tests: 24 passed, 24 total",
  ]);

  const nextStage = project.stages.find((s) => !s.completed);

  const handleContinueStage = () => {
    if (nextStage) {
      completeProjectStage(nextStage.id);
      setTerminalOutput((prev) => [
        ...prev,
        `$ # Completed: ${nextStage.title}`,
        formatTerminalOk(`${nextStage.title} stage complete`),
      ]);
      const updated = getMockProject([...state.progress.projectStagesCompleted, nextStage.id]);
      if (updated.completedStages === updated.totalStages) {
        completeProject();
        setShowCompletion(true);
      }
    }
  };

  const handleViewAchievement = () => {
    earnCertificate();
    router.push("/readiness-report");
  };

  if (showCompletion || state.progress.projectComplete) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center py-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">Project successfully completed</h1>
        <p className="text-muted-foreground mb-8">You shipped a containerized application through a CI/CD pipeline.</p>

        <Card className="mb-8 text-left">
          <CardHeader>
            <CardTitle className="text-base">Competency Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PROJECT_COMPETENCY.skills.map((s) => (
              <div key={s.domain} className="flex justify-between text-sm">
                <span>{s.domain}</span>
                <Badge variant={s.level === "Strong" ? "success" : "default"}>{s.level}</Badge>
              </div>
            ))}
            <div className="pt-3 border-t border-border flex justify-between">
              <span className="font-medium">Final project score</span>
              <span className="font-bold text-accent">{PROJECT_COMPETENCY.score}%</span>
            </div>
          </CardContent>
        </Card>

        <Button size="lg" onClick={handleViewAchievement}>
          View My Achievement
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
        <p className="mt-1 text-muted-foreground">{project.description}</p>
        <div className="mt-4 max-w-md">
          <Progress
            value={project.progress}
            label={`${project.completedStages} / ${project.totalStages} stages completed`}
            showLabel
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {project.stages.map((stage, i) => (
            <Card
              key={stage.id}
              className={cn(
                stage.completed && "border-success/30 bg-success/5",
                nextStage?.id === stage.id && "border-accent/30"
              )}
            >
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    stage.completed ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {stage.completed ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Stage {i + 1}</span>
                      {nextStage?.id === stage.id && <Badge variant="default" className="text-[10px]">Current</Badge>}
                    </div>
                    <h3 className="font-medium mt-0.5">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{stage.objective}</p>
                    <ul className="mt-2 space-y-1">
                      {stage.requirements.map((req) => (
                        <li key={req} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Project Workspace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="terminal-panel rounded-lg border border-border p-4 font-mono text-sm space-y-1 min-h-[200px]">
                {terminalOutput.map((line, i) => (
                  <TerminalOutputLine
                    key={i}
                    line={line}
                    className={cn(
                      "text-zinc-300",
                      line.startsWith("$ #") && "text-accent"
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {nextStage && (
            <Button className="w-full" size="lg" onClick={handleContinueStage}>
              <Play className="h-4 w-4" />
              Continue Project — {nextStage.title}
            </Button>
          )}

          {!nextStage && !state.progress.projectComplete && (
            <Button className="w-full" size="lg" onClick={() => { completeProject(); setShowCompletion(true); }}>
              Complete Project
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
