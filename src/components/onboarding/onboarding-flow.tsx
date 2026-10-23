"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronLeft, Loader2, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";
import {
  ACADEMIC_YEAR_OPTIONS,
  ADMISSION_COHORT_OPTIONS,
  BATCH_OPTIONS,
  DEPARTMENT_OPTIONS,
  DSA_EXPERIENCE_OPTIONS,
  LANGUAGE_OPTIONS,
  ONBOARDING_DRAFT_KEY,
  ONBOARDING_STEPS,
} from "@/lib/data/onboarding-options";
import type { BatchId, DepartmentId } from "@/lib/types/sait";
import {
  OnboardingAside,
  OnboardingMobileProgress,
} from "@/components/onboarding/join-flow-overview";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

interface Draft {
  step: number;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  department: DepartmentId | "";
  admissionCohort: string;
  academicYear: string;
  batch: BatchId | "";
  studentId: string;
  weeklyGoal: number;
  preferredLanguage: string;
  dsaExperience: string;
}

export function OnboardingFlow() {
  const router = useRouter();
  const { state, updateUser, completeOnboarding, setWeeklyGoal } = useApp();
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState(state.user.name);
  const [displayName, setDisplayName] = useState(state.user.displayName ?? "");
  const [email, setEmail] = useState(state.user.email);
  const [phone, setPhone] = useState(state.user.phone ?? "");
  const [department, setDepartment] = useState<DepartmentId | "">(state.user.department || "");
  const [admissionCohort, setAdmissionCohort] = useState(state.user.admissionCohort || "");
  const [academicYear, setAcademicYear] = useState(state.user.academicYear || "");
  const [batch, setBatch] = useState<BatchId | "">(state.user.batch || "");
  const [studentId, setStudentId] = useState(state.user.studentId ?? "");
  const [weeklyGoal, setWeeklyGoalLocal] = useState(state.user.weeklyGoalProblems || 5);
  const [preferredLanguage, setPreferredLanguage] = useState(state.user.preferredLanguage || "python");
  const [dsaExperience, setDsaExperience] = useState(state.user.dsaExperience ?? "");
  const [authEmail, setAuthEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Draft;
      setStep(d.step ?? 1);
      setFullName(d.fullName ?? "");
      setDisplayName(d.displayName ?? "");
      setEmail(d.email ?? "");
      setPhone(d.phone ?? "");
      setDepartment(d.department ?? "");
      setAdmissionCohort(d.admissionCohort ?? "");
      setAcademicYear(d.academicYear ?? "");
      setBatch(d.batch ?? "");
      setStudentId(d.studentId ?? "");
      setWeeklyGoalLocal(d.weeklyGoal ?? 5);
      setPreferredLanguage(d.preferredLanguage ?? "python");
      setDsaExperience(d.dsaExperience ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.user?.id) {
          router.replace("/signup?next=/onboarding");
          return;
        }
        if (d.onboardingComplete) {
          router.replace("/dashboard");
          return;
        }
        const profile = d.profile as {
          fullName?: string;
          displayName?: string;
          email?: string;
          phone?: string;
          department?: DepartmentId;
          admissionCohort?: string;
          academicYear?: string;
          batch?: BatchId;
          studentId?: string;
          weeklyGoalProblems?: number;
          preferredLanguage?: string;
          dsaExperience?: string;
        } | null;

        if (d.user.email) {
          setAuthEmail(d.user.email);
          if (!email.trim()) setEmail(d.user.email);
        }
        if (profile?.fullName && !fullName.trim()) setFullName(profile.fullName);
        if (profile?.displayName && !displayName.trim()) setDisplayName(profile.displayName);
        if (profile?.phone && !phone.trim()) setPhone(profile.phone);
        if (profile?.department && !department) setDepartment(profile.department);
        if (profile?.admissionCohort && !admissionCohort) setAdmissionCohort(profile.admissionCohort);
        if (profile?.academicYear && !academicYear) setAcademicYear(profile.academicYear);
        if (profile?.batch && !batch) setBatch(profile.batch);
        if (profile?.studentId && !studentId.trim()) setStudentId(profile.studentId);
        if (profile?.weeklyGoalProblems) setWeeklyGoalLocal(profile.weeklyGoalProblems);
        if (profile?.preferredLanguage) setPreferredLanguage(profile.preferredLanguage);
        if (profile?.dsaExperience && !dsaExperience) setDsaExperience(profile.dsaExperience);

        setAuthChecked(true);
      })
      .catch(() => router.replace("/signup?next=/onboarding"));
    // Intentionally run once on mount — draft restore runs in a separate effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const saveDraft = (nextStep: number) => {
    const draft: Draft = {
      step: nextStep,
      fullName,
      displayName,
      email,
      phone,
      department,
      admissionCohort,
      academicYear,
      batch,
      studentId,
      weeklyGoal,
      preferredLanguage,
      dsaExperience,
    };
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  };

  const validateStep = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 1) {
      if (!fullName.trim()) next.fullName = "Full name is required";
      if (!email.trim().includes("@")) next.email = "Enter a valid email";
    }
    if (s === 2) {
      if (!department) next.department = "Select your department";
      if (!admissionCohort) next.admissionCohort = "Select your admission cohort";
      if (!academicYear) next.academicYear = "Select your current academic year";
      if (!batch) next.batch = "Select your batch";
    }
    if (s === 3) {
      if (!preferredLanguage) next.preferredLanguage = "Select a language";
      if (weeklyGoal < 1 || weeklyGoal > 50) next.weeklyGoal = "Goal must be 1–50";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const persistPartial = () => {
    updateUser({
      name: fullName,
      displayName,
      email,
      phone,
      department,
      admissionCohort,
      academicYear,
      batch,
      studentId,
      weeklyGoalProblems: weeklyGoal,
      preferredLanguage,
      dsaExperience: dsaExperience || undefined,
    });
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    persistPartial();
    const next = Math.min(step + 1, ONBOARDING_STEPS.length);
    saveDraft(next);
    setStep(next);
  };

  const handleBack = () => {
    persistPartial();
    const prev = Math.max(step - 1, 1);
    saveDraft(prev);
    setStep(prev);
  };

  const finish = async () => {
    for (const s of [1, 2, 3]) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    setSubmitting(true);
    setWeeklyGoal(weeklyGoal);
    const trimmedEmail = email.trim();
    const payload = {
      fullName: fullName.trim(),
      displayName: displayName.trim() || fullName.trim(),
      phone: phone.trim() || undefined,
      department: department as DepartmentId,
      admissionCohort,
      academicYear,
      batch: batch as BatchId,
      studentId: studentId.trim() || undefined,
      weeklyGoalProblems: weeklyGoal,
      preferredLanguage,
      dsaExperience: dsaExperience || undefined,
    };

    const meRes = await fetch("/api/me").catch(() => null);
    const meJson = meRes ? await meRes.json().catch(() => ({})) : {};
    const authId = meJson?.user?.id as string | undefined;
    if (!authId) {
      setSubmitting(false);
      router.replace("/signup?next=/onboarding");
      return;
    }

    try {
      const completeRes = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!completeRes.ok) {
        const body = await completeRes.json().catch(() => ({}));
        setErrors({ submit: (body as { error?: string }).error ?? "Unable to save your profile. Try again." });
        setSubmitting(false);
        return;
      }
    } catch {
      setErrors({ submit: "Unable to reach the server. Check your connection and try again." });
      setSubmitting(false);
      return;
    }

    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
    completeOnboarding({
      name: payload.fullName,
      displayName: payload.displayName,
      email: trimmedEmail,
      phone: payload.phone,
      department: payload.department,
      admissionCohort: payload.admissionCohort,
      academicYear: payload.academicYear,
      batch: payload.batch,
      studentId: payload.studentId,
      weeklyGoalProblems: weeklyGoal,
      preferredLanguage,
      dsaExperience: payload.dsaExperience,
    });
    setSubmitting(false);
    router.push("/dashboard");
  };

  const firstName = fullName.trim().split(" ")[0] || "there";

  if (!authChecked) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/50 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent" aria-hidden />
        Checking your session…
      </div>
    );
  }

  const currentStepMeta = ONBOARDING_STEPS[step - 1];
  const fieldClass =
    "h-11 rounded-xl border-border bg-background px-3.5 text-foreground shadow-none focus-visible:ring-accent/30";
  const choiceClass = (selected: boolean) =>
    cn(
      "rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      selected
        ? "border-accent bg-accent-muted text-foreground shadow-sm"
        : "border-border bg-card text-foreground/80 hover:border-accent/25 hover:bg-muted/50"
    );

  const previewData = {
    fullName,
    displayName,
    department: department || undefined,
    batch: batch || undefined,
    academicYear: academicYear || undefined,
    preferredLanguage,
    weeklyGoal,
  };

  return (
    <OnboardingShell step={step} totalSteps={ONBOARDING_STEPS.length} sidebar={<OnboardingAside currentStep={step} previewData={previewData} firstName={firstName} />}>
      <div key={step} className="animate-fade-in">
        <OnboardingMobileProgress currentStep={step} />

        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {currentStepMeta?.label ?? "Profile"}
        </p>

        {step === 1 && (
          <div className="mt-4 space-y-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {firstName === "there" ? "Tell us your name" : `Nice to meet you, ${firstName}`}
              </h1>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                This is how we greet you in the app. Leaderboards use your display name; email stays tied to your account.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Full name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  className={cn(fieldClass, "pl-10")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  aria-invalid={!!errors.fullName}
                />
              </div>
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="displayName" className="text-sm font-medium text-foreground">
                Display name <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="displayName"
                className={fieldClass}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={fullName || "Shown on rankings"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className={cn(fieldClass, "pl-10")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={Boolean(authEmail)}
                  aria-invalid={!!errors.email}
                />
              </div>
              {authEmail && (
                <p className="text-xs text-muted-foreground">From your account — contact support to change.</p>
              )}
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  className={cn(fieldClass, "pl-10")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Your campus details</h1>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                Department and batch shape your leaderboard. Your admission cohort stays the same as you advance years.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Department</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {DEPARTMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDepartment(opt.value)}
                    className={choiceClass(department === opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cohort" className="text-sm font-medium text-foreground">
                Admission cohort
              </Label>
              <select
                id="cohort"
                className="auth-select"
                value={admissionCohort}
                onChange={(e) => setAdmissionCohort(e.target.value)}
              >
                <option value="">Select cohort</option>
                {ADMISSION_COHORT_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.admissionCohort && (
                <p className="text-xs text-destructive">{errors.admissionCohort}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year" className="text-sm font-medium text-foreground">
                Current academic year
              </Label>
              <select
                id="year"
                className="auth-select"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="">Select year</option>
                {ACADEMIC_YEAR_OPTIONS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
              {errors.academicYear && <p className="text-xs text-destructive">{errors.academicYear}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Batch</Label>
              <div className="flex gap-2">
                {BATCH_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBatch(opt.value)}
                    className={cn(choiceClass(batch === opt.value), "flex-1 text-center")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.batch && <p className="text-xs text-destructive">{errors.batch}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="studentId" className="text-sm font-medium text-foreground">
                Student ID <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="studentId"
                className={fieldClass}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 space-y-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Practice preferences</h1>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                Defaults for the code playground. Change anytime in Settings.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lang" className="text-sm font-medium text-foreground">
                Preferred language
              </Label>
              <select
                id="lang"
                className="auth-select"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weekly" className="text-sm font-medium text-foreground">
                Weekly unique-problem target
              </Label>
              <Input
                id="weekly"
                type="number"
                min={1}
                max={50}
                className={fieldClass}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoalLocal(Number(e.target.value))}
              />
              {errors.weeklyGoal && <p className="text-xs text-destructive">{errors.weeklyGoal}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dsa" className="text-sm font-medium text-foreground">
                DSA experience <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <select
                id="dsa"
                className="auth-select"
                value={dsaExperience}
                onChange={(e) => setDsaExperience(e.target.value)}
              >
                <option value="">Skip for now</option>
                {DSA_EXPERIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-4 space-y-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Ready to go</h1>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                Confirm once, then you’ll land on your dashboard. Only judged accepts count toward rankings.
              </p>
            </div>
            <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-muted/30 text-sm">
              {[
                ["Name", fullName],
                ["Display", displayName || fullName],
                ["Department", department],
                ["Admission cohort", admissionCohort],
                ["Academic year", academicYear],
                ["Batch", batch],
                ["Weekly goal", `${weeklyGoal} problems`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-3.5 sm:px-5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-foreground text-right tabular-nums">{value || "—"}</dd>
                </div>
              ))}
            </dl>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-muted">
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                </span>
                Rankings use server-verified accepts only
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-muted">
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                </span>
                You can update allowed fields later in Profile
              </li>
            </ul>
          </div>
        )}

        {errors.submit && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {errors.submit}
          </p>
        )}

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="rounded-full sm:px-5"
            onClick={handleBack}
            disabled={step === 1 || submitting}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          {step < ONBOARDING_STEPS.length ? (
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-full px-8 font-semibold shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
              onClick={handleNext}
              disabled={submitting}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-full px-8 font-semibold shadow-[0_4px_14px_rgba(79,70,229,0.25)]"
              onClick={finish}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </OnboardingShell>
  );
}
