"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Play,
  Terminal,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/shared/logo";
import { JourneyProgressHeader } from "@/components/shared/journey-progress-header";
import { MentorPanel } from "@/components/mentor/mentor-panel";
import { GitBranchGraph } from "@/components/workspace/git-branch-graph";
import { getMockModule } from "@/lib/mock/modules";
import { runGitCommand } from "@/lib/workspace/git-terminal";
import { getWorkspaceTabs } from "@/lib/workspace/workspace-tabs";
import { useApp } from "@/lib/context/app-context";
import type { WorkspaceGitState } from "@/lib/types/app";
import { cn } from "@/lib/utils";
import { TerminalOutputLine } from "@/components/shared/terminal-output-line";
import { isTerminalOkLine } from "@/lib/ui/terminal-lines";

interface WorkspaceViewProps {
  moduleSlug: string;
}

const DEFAULT_GIT_STATE: WorkspaceGitState = {
  branches: ["main"],
  currentBranch: "main",
  commits: { main: 1 },
};

export function WorkspaceView({ moduleSlug }: WorkspaceViewProps) {
  const router = useRouter();
  const { completeCheckpoint } = useApp();
  const module = getMockModule(moduleSlug);
  const tabs = getWorkspaceTabs(module?.domain ?? "git", Boolean(module?.challenge));

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "lesson");
  const [terminalLines, setTerminalLines] = useState<string[]>(
    module?.terminalOutput ? [module.terminalOutput] : []
  );
  const [gitState, setGitState] = useState<WorkspaceGitState>(
    module?.initialGitState ?? DEFAULT_GIT_STATE
  );
  const [commandInput, setCommandInput] = useState("");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [skillDemonstrated, setSkillDemonstrated] = useState(false);
  const [checkpointProgress, setCheckpointProgress] = useState(35);
  const [objectivesDone, setObjectivesDone] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (module?.type === "quiz") {
      router.replace(`/workspace/${moduleSlug}/quiz`);
    }
  }, [module?.type, moduleSlug, router]);

  if (!module) {
    return <div className="p-8 text-center text-muted-foreground">Module not found</div>;
  }

  if (module.type === "quiz") return null;

  const isGitPractice = module.domain === "git" && Boolean(module.challenge);

  const runCommand = async () => {
    const cmd = commandInput.trim();
    if (!cmd || running) return;
    setRunning(true);
    setTerminalLines((prev) => [...prev, `$ ${cmd}`]);
    setCommandInput("");

    await new Promise((r) => setTimeout(r, 250));

    if (isGitPractice) {
      const result = runGitCommand(cmd, gitState, module.challenge?.expectedCommand);
      setGitState(result.gitState);

      for (const line of result.lines) {
        setTerminalLines((prev) => [...prev, line]);
        await new Promise((r) => setTimeout(r, 180));
      }

      if (result.challengePassed) {
        setCheckpointProgress(100);
        setCompleted(true);
        setSkillDemonstrated(true);
        setObjectivesDone([true, true, true]);
      } else if (cmd === "git branch" && result.gitState.branches.includes("feature/navbar")) {
        setObjectivesDone([true, true, true]);
        setCheckpointProgress(85);
      } else if (cmd.startsWith("git checkout -b")) {
        setObjectivesDone([true, true, false]);
        setCheckpointProgress(70);
      } else if (cmd === "git status" || cmd === "git branch") {
        setCheckpointProgress((p) => Math.min(p + 10, 60));
      }
    } else if (module.challenge && cmd === module.challenge.expectedCommand) {
      setTerminalLines((prev) => [...prev, module.challenge!.successMessage]);
      setCheckpointProgress(100);
      setCompleted(true);
      setSkillDemonstrated(true);
    } else if (cmd.startsWith("git")) {
      setTerminalLines((prev) => [...prev, `git: simulated output for '${cmd.split(" ")[1] ?? ""}'`]);
    } else {
      setTerminalLines((prev) => [...prev, `command not found: ${cmd.split(" ")[0]}`]);
    }

    setRunning(false);
  };

  const handleComplete = () => {
    completeCheckpoint(module.id, "cp-remote-collab");
    router.push(`/workspace/${moduleSlug}/complete`);
  };

  const activeTabMeta = tabs.find((t) => t.id === activeTab);

  return (
    <div className="flex h-screen flex-col bg-background">
      <JourneyProgressHeader />

      <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4 bg-card">
        <div className="flex items-center gap-3 min-w-0">
          <Logo href="/dashboard" size="sm" />
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-1.5 text-sm min-w-0 truncate">
            <span className="text-muted-foreground shrink-0">Git</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="font-medium truncate">{module.moduleTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
            Checkpoint {module.checkpointIndex} of {module.totalCheckpoints}
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Zap className="h-3 w-3 text-warning" />
            +42 XP
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1 hidden sm:inline-flex">
            <Clock className="h-3 w-3" />
            ~{module.challenge ? 12 : 10} min
          </Badge>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <div className="flex flex-[2] flex-col overflow-hidden min-h-0 border-r border-border">
          <div className="flex shrink-0 border-b border-border bg-muted/20 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                title={tab.hint}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.id
                    ? "border-accent text-accent bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeTabMeta && (
              <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {activeTabMeta.hint}
              </p>
            )}

            {skillDemonstrated && (
              <div className="mb-4 rounded-lg border border-success/30 bg-success/5 p-4 animate-fade-in">
                <div className="flex items-center gap-2 text-success mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">Skill demonstrated</span>
                </div>
                <p className="text-sm font-medium">Git Branching</p>
                <p className="text-xs text-muted-foreground">Competency confirmed</p>
              </div>
            )}

            {activeTab === "lesson" && (
              <div className="animate-fade-in space-y-5 max-w-2xl">
                <h2 className="text-lg font-semibold">{module.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{module.lesson.content}</p>
                {module.lesson.diagram && (
                  <pre className="rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm leading-relaxed text-accent overflow-x-auto">
                    {module.lesson.diagram}
                  </pre>
                )}
                {module.lesson.keyPoints && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Key concepts
                    </p>
                    <ul className="space-y-2">
                      {module.lesson.keyPoints.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-foreground/90">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent mt-0.5" aria-hidden />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "code" && (
              <div className="animate-fade-in space-y-4 max-w-2xl">
                {module.workflowSteps ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step commands for this checkpoint. Run them in the Terminal tab.
                    </p>
                    <ol className="space-y-3">
                      {module.workflowSteps.map((step, i) => (
                        <li
                          key={step.command}
                          className="rounded-lg border border-border bg-card p-4"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium">{step.title}</span>
                          </div>
                          <pre className="rounded-md bg-muted/50 px-3 py-2 font-mono text-xs text-accent overflow-x-auto">
                            {step.command}
                          </pre>
                          <p className="mt-2 text-xs text-muted-foreground">{step.description}</p>
                        </li>
                      ))}
                    </ol>
                  </>
                ) : (
                  <pre className="terminal-panel rounded-lg border border-border p-4 font-mono text-sm leading-relaxed text-green-400/90 overflow-x-auto">
                    {module.codeExample ?? "# No code example"}
                  </pre>
                )}
              </div>
            )}

            {activeTab === "terminal" && (
              <div className="animate-fade-in flex flex-col">
                {isGitPractice && !completed && (
                  <div className="mb-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    You&apos;re on <span className="font-mono text-foreground">{gitState.currentBranch}</span>.
                    Run commands here — check the Branch Graph tab to see changes.
                  </div>
                )}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Checkpoint progress</span>
                    <span className="tabular-nums">{checkpointProgress}%</span>
                  </div>
                  <Progress value={checkpointProgress} size="sm" />
                </div>
                <div className="terminal-panel rounded-lg border border-border font-mono text-sm overflow-hidden flex flex-col min-h-[280px]">
                  <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-1.5 text-[10px] text-zinc-500">
                    <Terminal className="h-3 w-3" />
                    bash — devpath-playground
                    {isGitPractice && (
                      <span className="ml-auto font-mono text-zinc-400">{gitState.currentBranch}</span>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {terminalLines.map((line, i) => (
                      <TerminalOutputLine
                        key={i}
                        line={line}
                        className={cn(
                          "whitespace-pre-wrap animate-fade-in",
                          isTerminalOkLine(line)
                            ? "text-green-400"
                            : line.startsWith("$")
                              ? "text-zinc-400"
                              : "text-zinc-300"
                        )}
                      />
                    ))}
                    {running && <div className="text-zinc-500 animate-pulse-subtle">...</div>}
                  </div>
                  <div className="flex items-center gap-2 border-t border-white/10 p-2">
                    <span className="text-green-400/80 pl-2">$</span>
                    <input
                      className="flex-1 bg-transparent text-zinc-200 outline-none font-mono text-sm"
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && runCommand()}
                      placeholder={
                        isGitPractice ? "git checkout -b feature/navbar" : "Enter command..."
                      }
                      disabled={running || completed}
                      aria-label="Terminal command"
                    />
                    <Button size="sm" onClick={runCommand} disabled={running || completed}>
                      <Play className="h-3.5 w-3.5" />
                      Run
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "challenge" && module.challenge && (
              <div className="animate-fade-in space-y-5 max-w-xl">
                <div className="rounded-lg border border-accent/30 bg-accent/[0.04] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">
                    Prove Your Skill
                  </p>
                  <h3 className="text-base font-semibold">{module.challenge.instruction}</h3>
                  {module.challenge.context && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {module.challenge.context}
                    </p>
                  )}
                </div>

                {module.challenge.objectives && (
                  <div className="rounded-lg border border-border bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Objectives
                    </p>
                    <ul className="space-y-2.5">
                      {module.challenge.objectives.map((obj, i) => (
                        <li key={obj} className="flex items-start gap-2.5 text-sm">
                          {objectivesDone[i] ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                          )}
                          <span className={objectivesDone[i] ? "text-foreground" : "text-muted-foreground"}>
                            {obj}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Expected command
                  </p>
                  <pre className="font-mono text-sm text-accent">
                    {module.challenge.expectedCommand}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setActiveTab("terminal")} disabled={completed}>
                    <Terminal className="h-4 w-4" />
                    Open Terminal
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("output")} disabled={!isGitPractice}>
                    View Branch Graph
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "output" && isGitPractice && (
              <GitBranchGraph gitState={gitState} completed={completed} />
            )}
          </div>

          {completed && (
            <div className="shrink-0 border-t border-success/30 bg-success/5 p-4 animate-fade-in">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium text-sm">Checkpoint completed</span>
                </div>
                <Button onClick={handleComplete} size="sm">
                  View results
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 lg:max-w-[380px] min-h-[280px] lg:min-h-0">
          <MentorPanel
            moduleSlug={moduleSlug}
            checkpointId={module.id}
            checkpointNumber={module.checkpointIndex}
          />
        </div>
      </div>
    </div>
  );
}
