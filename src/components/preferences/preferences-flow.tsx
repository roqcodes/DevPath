"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";
import type { SkillDomain } from "@/lib/types/app";

const GOALS = [
  "Learn DevOps from scratch",
  "Build real projects",
  "Prepare for interviews",
  "Become deployment-ready",
  "Strengthen existing DevOps skills",
];

const TOPICS: { id: SkillDomain; label: string }[] = [
  { id: "git", label: "Git" },
  { id: "docker", label: "Docker" },
  { id: "ci_cd", label: "CI/CD" },
  { id: "testing", label: "Testing" },
  { id: "deployment", label: "Deployment" },
];

const DURATIONS = ["7 days", "14 days", "21 days", "30 days", "60 days"];
const COMMITMENTS = ["15 min", "30 min", "1 hour", "2+ hours"];

const LOADING_STEPS = [
  "Assessing current skills",
  "Understanding your goals",
  "Mapping prerequisite skills",
  "Building personalized journey",
];

export function PreferencesFlow() {
  const router = useRouter();
  const { completePreferences, generateJourney } = useApp();
  const [goal, setGoal] = useState("Become deployment-ready");
  const [interests, setInterests] = useState<SkillDomain[]>(["git", "docker", "ci_cd", "testing", "deployment"]);
  const [duration, setDuration] = useState("21 days");
  const [commitment, setCommitment] = useState("30 min");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const toggleInterest = (id: SkillDomain) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    completePreferences({
      learningGoal: goal,
      interests,
      duration,
      dailyCommitment: commitment,
    });
    setLoading(true);

    for (let i = 0; i <= LOADING_STEPS.length; i++) {
      setLoadingStep(i);
      await new Promise((r) => setTimeout(r, 700));
    }

    await generateJourney();
    await new Promise((r) => setTimeout(r, 600));
    router.push("/journey");
  };

  if (loading) {
    const done = loadingStep >= LOADING_STEPS.length;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full px-4 text-center animate-fade-in">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Analyzing Your Profile
          </p>
          <div className="space-y-3 text-left mb-8">
            {LOADING_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                {i < loadingStep ? (
                  <Check className="h-4 w-4 text-success shrink-0" />
                ) : i === loadingStep && !done ? (
                  <Loader2 className="h-4 w-4 animate-spin text-accent shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                )}
                <span className={i <= loadingStep ? "text-foreground" : "text-muted-foreground"}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          {done && (
            <p className="text-lg font-semibold text-accent animate-fade-in">
              Your learning path is ready.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <Logo />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-10 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold">Personalize your journey</h1>
          <p className="mt-1 text-muted-foreground">Tell us what you want to achieve and how much time you have.</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">What do you want to achieve?</h2>
          <div className="space-y-2">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoal(g)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left text-sm transition-colors",
                  goal === g ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">What do you want to learn?</h2>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleInterest(t.id)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  interests.includes(t.id)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent/50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">How much time can you commit?</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Duration</p>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      duration === d ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Daily commitment</p>
              <div className="flex flex-wrap gap-2">
                {COMMITMENTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCommitment(c)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      commitment === c ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Button size="lg" className="w-full" onClick={handleGenerate} disabled={interests.length === 0}>
          Generate My Learning Path
        </Button>
      </div>
    </div>
  );
}
