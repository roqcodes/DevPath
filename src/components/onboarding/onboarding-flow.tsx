"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  Check,
  ChevronLeft,
  Clock,
  Code2,
  GitBranch,
  GraduationCap,
  Mail,
  MoreHorizontal,
  Rocket,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/logo";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

const ROLES = [
  { id: "Student", icon: GraduationCap, description: "Learning fundamentals" },
  { id: "Developer", icon: Code2, description: "Building software daily" },
  { id: "DevOps beginner", icon: Rocket, description: "Just getting started" },
  { id: "Software engineer", icon: Briefcase, description: "Full-stack or backend" },
  { id: "Other", icon: MoreHorizontal, description: "Something else" },
] as const;

const STEPS = [
  { id: 1, label: "Profile", description: "Your background" },
  { id: 2, label: "Assessment", description: "Skill baseline" },
];

const ASSESSMENT_DOMAINS = [
  { label: "Git", icon: GitBranch },
  { label: "Docker", icon: Target },
  { label: "CI/CD", icon: Rocket },
  { label: "Testing", icon: Check },
  { label: "Deployment", icon: Sparkles },
];

export function OnboardingFlow() {
  const router = useRouter();
  const { state, updateUser } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(state.user.name);
  const [email, setEmail] = useState(state.user.email);
  const [role, setRole] = useState(state.user.role);

  const canContinue = name.trim().length > 0 && email.trim().includes("@");
  const firstName = name.trim().split(" ")[0] || "there";

  const handleNext = () => {
    updateUser({ name, email, role });
    if (step === 1) setStep(2);
  };

  const startAssessment = () => {
    updateUser({ name, email, role });
    router.push("/assessment");
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <header className="relative border-b border-border/80 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            Step {step} of {STEPS.length}
          </span>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <nav aria-label="Onboarding progress" className="mb-8 sm:mb-10">
          <ol className="flex items-center gap-3">
            {STEPS.map((s, i) => {
              const isComplete = step > s.id;
              const isActive = step === s.id;

              return (
                <li key={s.id} className="flex flex-1 items-center gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                        isComplete && "bg-accent text-accent-foreground",
                        isActive && "bg-accent text-accent-foreground ring-4 ring-accent/20",
                        !isComplete && !isActive && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isComplete ? <Check className="h-4 w-4" aria-hidden /> : s.id}
                    </div>
                    <div className="hidden min-w-0 sm:block">
                      <p
                        className={cn(
                          "text-sm font-medium leading-none",
                          isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {s.label}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{s.description}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "hidden h-px flex-1 sm:block",
                        isComplete ? "bg-accent/60" : "bg-border"
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="lg:col-span-3">
            {step === 1 && (
              <div key="step-1" className="animate-fade-in">
                <Card className="border-border/80 shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <div className="mb-8">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-accent" aria-hidden />
                        Personalized learning
                      </div>
                      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Tell us about yourself
                      </h1>
                      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                        We&apos;ll tailor your DevOps journey to your background and goals.
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <div className="relative">
                          <User
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Alex Johnson"
                            autoComplete="name"
                            className="h-11 pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                          />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex@example.com"
                            autoComplete="email"
                            inputMode="email"
                            className="h-11 pl-10"
                          />
                        </div>
                      </div>

                      <fieldset className="space-y-3">
                        <legend className="text-sm font-medium">Current role</legend>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {ROLES.map((r) => {
                            const Icon = r.icon;
                            const selected = role === r.id;

                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => setRole(r.id)}
                                aria-pressed={selected}
                                className={cn(
                                  "group flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                  selected
                                    ? "border-accent bg-accent/10 shadow-sm"
                                    : "border-border hover:border-accent/40 hover:bg-muted/40"
                                )}
                              >
                                <div
                                  className={cn(
                                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                                    selected
                                      ? "bg-accent text-accent-foreground"
                                      : "bg-muted text-muted-foreground group-hover:text-foreground"
                                  )}
                                >
                                  <Icon className="h-4 w-4" aria-hidden />
                                </div>
                                <div className="min-w-0">
                                  <p
                                    className={cn(
                                      "text-sm font-medium",
                                      selected ? "text-accent" : "text-foreground"
                                    )}
                                  >
                                    {r.id}
                                  </p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
                      <p className="text-xs text-muted-foreground">
                        {canContinue ? "Ready to continue" : "Fill in your details to continue"}
                      </p>
                      <Button size="lg" onClick={handleNext} disabled={!canContinue}>
                        Continue
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 2 && (
              <div key="step-2" className="animate-fade-in">
                <Card className="border-border/80 shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    <div className="mb-8">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                        <Target className="h-3 w-3 text-accent" aria-hidden />
                        Skill diagnostic
                      </div>
                      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        How much DevOps do you already know?
                      </h1>
                      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                        A short diagnostic across core domains establishes your baseline — no
                        self-rating required.
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/30 p-5 sm:p-6">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        DevPath uses a focused assessment across Git, Docker, CI/CD, Testing, and
                        Deployment to build the right learning path for you.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {ASSESSMENT_DOMAINS.map((domain) => {
                          const Icon = domain.icon;
                          return (
                            <Badge key={domain.label} variant="secondary" className="gap-1.5 px-2.5 py-1">
                              <Icon className="h-3 w-3" aria-hidden />
                              {domain.label}
                            </Badge>
                          );
                        })}
                      </div>

                      <ul className="mt-6 space-y-3 border-t border-border/80 pt-5">
                        {[
                          { icon: Clock, text: "10 questions · ~5 minutes" },
                          { icon: Target, text: "Covers all core DevOps domains" },
                          { icon: Sparkles, text: "Results power your personalized journey" },
                        ].map((item) => (
                          <li key={item.text} className="flex items-center gap-3 text-sm">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10">
                              <item.icon className="h-3.5 w-3.5 text-accent" aria-hidden />
                            </div>
                            <span className="text-foreground/90">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <Button variant="outline" onClick={() => setStep(1)} className="sm:w-auto">
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                        Back
                      </Button>
                      <Button size="lg" onClick={startAssessment}>
                        Start Assessment
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <aside className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-8 space-y-4">
              <Card className="overflow-hidden border-border/80 bg-gradient-to-b from-muted/40 to-background">
                <CardContent className="p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Your path preview
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight">
                    {canContinue ? `Welcome, ${firstName}` : "Almost there"}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step === 1
                      ? "After your profile, a quick diagnostic maps your strengths and gaps across DevOps fundamentals."
                      : "Your assessment results will shape a journey with hands-on checkpoints, an AI mentor, and a final deployment project."}
                  </p>

                  <div className="mt-6 space-y-3">
                    {[
                      { step: "1", label: "Profile setup", done: step > 1, active: step === 1 },
                      { step: "2", label: "Skill assessment", done: false, active: step === 2 },
                      { step: "3", label: "Personalized journey", done: false, active: false },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                          item.active
                            ? "border-accent/30 bg-accent/5"
                            : item.done
                              ? "border-border bg-muted/30"
                              : "border-border/60 opacity-60"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                            item.done
                              ? "bg-accent text-accent-foreground"
                              : item.active
                                ? "bg-accent/15 text-accent"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.done ? <Check className="h-3 w-3" aria-hidden /> : item.step}
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {role && (
                    <div className="mt-6 rounded-lg border border-dashed border-border bg-background/60 p-4">
                      <p className="text-xs text-muted-foreground">Starting as</p>
                      <p className="mt-1 text-sm font-medium">{role}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                No account required to explore. Your progress is saved locally as you go.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
