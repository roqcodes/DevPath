"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/logo";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

const ROLES = ["Student", "Developer", "DevOps beginner", "Software engineer", "Other"];

const STEPS = [
  { id: 1, label: "Profile" },
  { id: 2, label: "Assessment" },
];

export function OnboardingFlow() {
  const router = useRouter();
  const { state, updateUser } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(state.user.name);
  const [email, setEmail] = useState(state.user.email);
  const [role, setRole] = useState(state.user.role);

  const handleNext = () => {
    updateUser({ name, email, role });
    if (step === 1) setStep(2);
  };

  const startAssessment = () => {
    updateUser({ name, email, role });
    router.push("/assessment");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <Logo />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                    step >= s.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {s.id}
                </div>
                <span className={cn("text-sm hidden sm:block", step >= s.id ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-px", step > s.id ? "bg-accent" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">Tell us about yourself</h1>
              <p className="mt-1 text-muted-foreground">We&apos;ll personalize your DevOps learning experience.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Current role</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm transition-colors text-left",
                        role === r ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent/50"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full sm:w-auto" onClick={handleNext} disabled={!name || !email}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">How much DevOps do you already know?</h1>
              <p className="mt-1 text-muted-foreground">
                We&apos;ll quickly assess your current knowledge to build the right path for you.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Rather than relying on self-rating alone, DevPath uses a short diagnostic assessment
                across Git, Docker, CI/CD, Testing, and Deployment to establish your baseline.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  10 questions · ~5 minutes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Covers all core DevOps domains
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Results power your personalized journey
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button size="lg" onClick={startAssessment}>
                Start Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
