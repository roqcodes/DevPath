import {
  BookOpen,
  Check,
  Code2,
  GraduationCap,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "@/lib/data/onboarding-options";

const STEP_VISUALS = [
  { icon: User, surface: "bg-sky-50 text-sky-700 ring-sky-100" },
  { icon: GraduationCap, surface: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  { icon: Code2, surface: "bg-amber-50 text-amber-800 ring-amber-100" },
  { icon: Sparkles, surface: "bg-violet-50 text-violet-700 ring-violet-100" },
] as const;

function greetingForHour() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export interface StudentPreviewData {
  fullName?: string;
  displayName?: string;
  department?: string;
  batch?: string;
  academicYear?: string;
  preferredLanguage?: string;
  weeklyGoal?: number;
}

export function OnboardingMobileProgress({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Onboarding progress" className="mb-6 lg:hidden">
      <ol className="flex gap-2">
        {ONBOARDING_STEPS.map((s) => {
          const done = currentStep > s.id;
          const current = currentStep === s.id;
          return (
            <li key={s.id} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors duration-300",
                  done || current ? "bg-accent" : "bg-border"
                )}
              />
              <span
                className={cn(
                  "truncate text-[10px] font-medium",
                  current ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function OnboardingAside({
  currentStep,
  previewData,
  firstName,
}: {
  currentStep: number;
  previewData?: StudentPreviewData;
  firstName: string;
}) {
  const greeting = greetingForHour();
  const display = previewData?.displayName || previewData?.fullName;
  const initials = (display || firstName || "You")
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const weekly = previewData?.weeklyGoal ?? 5;
  const weeklyPct = Math.min(100, Math.round((weekly / 20) * 100));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:rounded-3xl">
        <p className="text-sm font-medium text-muted-foreground">{greeting},</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {firstName === "there" ? "let’s set you up" : `${firstName} 👋`}
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          A few details so practice, lessons, and rankings match your batch. About two minutes.
        </p>
      </div>

      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1" aria-label="Setup steps">
        {ONBOARDING_STEPS.map((step, index) => {
          const done = currentStep > step.id;
          const current = currentStep === step.id;
          const visual = STEP_VISUALS[index];
          const Icon = visual.icon;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3.5 transition-colors duration-200",
                current
                  ? "border-accent/30 bg-accent-muted/40 shadow-sm"
                  : done
                    ? "border-border bg-card"
                    : "border-transparent bg-muted/60 opacity-80"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
                  done
                    ? "bg-success-muted text-success ring-success/20"
                    : visual.surface
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : <Icon className="h-4 w-4" aria-hidden />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{step.label}</p>
                <p className="text-xs text-muted-foreground">
                  {current ? "You are here" : done ? "Done" : "Up next"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-sky-50/80 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
            <BookOpen className="h-4 w-4" aria-hidden />
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">12</p>
          <p className="text-xs font-medium text-muted-foreground">Learning modules</p>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-amber-50/90 p-4">
          <p className="text-xs font-medium text-muted-foreground">Weekly target</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{weekly}</p>
          <p className="text-xs text-muted-foreground">unique problems</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-[width] duration-300"
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
        </div>
      </div>

      {(display || previewData?.department) && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-muted text-sm font-bold text-accent"
              aria-hidden
            >
              {initials || "—"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{display || "Your profile"}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {[previewData?.department, previewData?.batch && `Batch ${previewData.batch}`, previewData?.academicYear && `Year ${previewData.academicYear}`]
                  .filter(Boolean)
                  .join(" · ") || "Campus details next"}
              </p>
            </div>
          </div>
          {previewData?.preferredLanguage && (
            <p className="mt-3 text-xs text-muted-foreground">
              Playground default:{" "}
              <span className="font-medium capitalize text-foreground">{previewData.preferredLanguage}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 rounded-2xl border border-border bg-muted/40 p-4">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Email and phone stay private. Leaderboards use your display name and verified solves only.
        </p>
      </div>
    </div>
  );
}

/** @deprecated Use OnboardingAside / OnboardingMobileProgress */
export function JoinFlowOverview({
  activeStep,
  previewData,
  variant = "card",
}: {
  activeStep: "account" | "profile" | "workspace";
  previewData?: StudentPreviewData;
  variant?: "card" | "editorial" | "compact";
}) {
  const step = activeStep === "workspace" ? 4 : 2;
  if (variant === "compact") {
    return <OnboardingMobileProgress currentStep={step} />;
  }
  const name = previewData?.fullName?.split(" ")[0] ?? "there";
  return <OnboardingAside currentStep={step} previewData={previewData} firstName={name} />;
}

export function JoinFlowStepBar({
  activeStep,
  className,
}: {
  activeStep: "account" | "profile" | "workspace";
  className?: string;
}) {
  const step = activeStep === "workspace" ? 4 : 2;
  return <OnboardingMobileProgress currentStep={step} />;
}
