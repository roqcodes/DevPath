"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Play,
  Terminal,
  BookOpen,
  Code2,
  Target,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/logo";
import { MentorPanel } from "@/components/mentor/mentor-panel";
import { getMockModule } from "@/lib/mock/modules";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "lesson", label: "Lesson", icon: BookOpen },
  { id: "code", label: "Code", icon: Code2 },
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "challenge", label: "Challenge", icon: Target },
  { id: "output", label: "Output", icon: Monitor },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface WorkspaceViewProps {
  moduleSlug: string;
}

export function WorkspaceView({ moduleSlug }: WorkspaceViewProps) {
  const router = useRouter();
  const { state, completeCheckpoint } = useApp();
  const module = getMockModule(moduleSlug);
  const [activeTab, setActiveTab] = useState<TabId>("lesson");
  const [terminalLines, setTerminalLines] = useState<string[]>(
    module?.terminalOutput ? [module.terminalOutput] : ["$ "]
  );
  const [commandInput, setCommandInput] = useState("");
  const [completed, setCompleted] = useState(false);
  const [hintsUsed] = useState(state.progress.hintsUsed[module?.id ?? ""] ?? 0);

  if (!module) {
    return <div className="p-8 text-center text-muted-foreground">Module not found</div>;
  }

  const runCommand = () => {
    const cmd = commandInput.trim();
    if (!cmd) return;
    const newLines = [...terminalLines, `$ ${cmd}`];

    if (module.challenge && cmd === module.challenge.expectedCommand) {
      newLines.push(
        `Switched to a new branch 'feature/navbar'`,
        module.challenge.successMessage
      );
      setTerminalLines(newLines);
      setCompleted(true);
    } else if (cmd.startsWith("git")) {
      newLines.push(`git: '${cmd.split(" ")[1] ?? ""}' — simulated output`);
      setTerminalLines(newLines);
    } else {
      newLines.push(`command not found: ${cmd.split(" ")[0]}`);
      setTerminalLines(newLines);
    }
    setCommandInput("");
  };

  const handleComplete = () => {
    completeCheckpoint(module.id, "cp-remote-collab");
    router.push(`/workspace/${moduleSlug}/complete`);
  };

  if (module.type === "quiz") {
    router.push(`/workspace/${moduleSlug}/quiz`);
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-4">
          <Logo href="/dashboard" size="sm" />
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Git</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{module.moduleTitle}</span>
          </div>
        </div>
        <Badge variant="secondary">
          Checkpoint {module.checkpointIndex} of {module.totalCheckpoints}
        </Badge>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* Left panel - 66% */}
        <div className="flex flex-[2] flex-col overflow-hidden min-h-0">
          {/* Tabs */}
          <div className="flex shrink-0 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === "lesson" && (
              <div className="animate-fade-in space-y-4 max-w-2xl">
                <h2 className="text-lg font-semibold">{module.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{module.lesson.content}</p>
                {module.lesson.diagram && (
                  <pre className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm leading-relaxed text-accent/90">
                    {module.lesson.diagram}
                  </pre>
                )}
              </div>
            )}

            {activeTab === "code" && (
              <div className="animate-fade-in">
                <pre className="rounded-lg border border-border bg-[#0d0d0f] p-4 font-mono text-sm leading-relaxed text-green-400/90 overflow-x-auto">
                  {module.codeExample ?? "# No code example for this checkpoint"}
                </pre>
              </div>
            )}

            {(activeTab === "terminal" || activeTab === "challenge" || activeTab === "output") && (
              <div className="animate-fade-in flex flex-col h-full">
                {activeTab === "challenge" && module.challenge && (
                  <div className="mb-4 rounded-lg border border-border bg-muted/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Challenge</p>
                    <p className="text-sm">{module.challenge.instruction}</p>
                  </div>
                )}
                <div className="flex-1 rounded-lg border border-border bg-[#0d0d0f] font-mono text-sm overflow-hidden flex flex-col min-h-[200px]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {terminalLines.map((line, i) => (
                      <div key={i} className={cn(
                        "whitespace-pre-wrap",
                        line.includes("successfully") ? "text-success" : "text-zinc-300"
                      )}>
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-border p-2">
                    <span className="text-green-400/80 pl-2">$</span>
                    <input
                      className="flex-1 bg-transparent text-zinc-200 outline-none font-mono text-sm"
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && runCommand()}
                      placeholder="Enter command..."
                      aria-label="Terminal command input"
                    />
                    <Button size="sm" onClick={runCommand}>
                      <Play className="h-3.5 w-3.5" />
                      Run
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {completed && (
            <div className="shrink-0 border-t border-border bg-success/5 p-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Checkpoint completed</span>
                </div>
                <Button onClick={handleComplete}>
                  Next checkpoint
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel - 34% */}
        <div className="flex flex-1 lg:max-w-[400px] min-h-[300px] lg:min-h-0">
          <MentorPanel moduleSlug={moduleSlug} checkpointId={module.id} />
        </div>
      </div>
    </div>
  );
}
