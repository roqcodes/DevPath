import { DEPARTMENT_OPTIONS, BATCH_OPTIONS, ACADEMIC_YEAR_OPTIONS } from "@/lib/data/onboarding-options";
import { ADMISSION_COHORT_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/config/platform-config";

export interface OnboardingPayloadShape {
  fullName?: string;
  department?: string;
  batch?: string;
  academicYear?: string;
  admissionCohort?: string;
  preferredLanguage?: string;
  weeklyGoalProblems?: number;
}

export function validateOnboardingPayload(payload: OnboardingPayloadShape): string | null {
  if (!payload.fullName?.trim()) return "Full name is required";
  if (!DEPARTMENT_OPTIONS.some((d) => d.value === payload.department)) return "Invalid department";
  if (!BATCH_OPTIONS.some((b) => b.value === payload.batch)) return "Invalid batch";
  if (!ACADEMIC_YEAR_OPTIONS.some((y) => y.value === payload.academicYear)) return "Invalid academic year";
  if (!ADMISSION_COHORT_OPTIONS.some((c) => c.value === payload.admissionCohort)) return "Invalid admission cohort";
  if (!LANGUAGE_OPTIONS.some((l) => l.value === payload.preferredLanguage)) return "Invalid language";
  const goal = payload.weeklyGoalProblems;
  if (goal == null || goal < 1 || goal > 50) return "Invalid weekly goal";
  return null;
}
