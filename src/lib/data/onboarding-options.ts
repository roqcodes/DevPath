import type { BatchId, DepartmentId } from "@/lib/types/sait";
import { ADMISSION_COHORT_OPTIONS, DSA_EXPERIENCE_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/config/platform-config";

export const DEPARTMENT_OPTIONS: { value: DepartmentId; label: string }[] = [
  { value: "IT", label: "Information Technology (IT)" },
  { value: "AI", label: "Artificial Intelligence (AI)" },
];

export const BATCH_OPTIONS: { value: BatchId; label: string }[] = [
  { value: "A", label: "Batch A" },
  { value: "B", label: "Batch B" },
];

export const ACADEMIC_YEAR_OPTIONS = [
  { value: "1", label: "1st Year (current)" },
  { value: "2", label: "2nd Year (current)" },
  { value: "3", label: "3rd Year (current)" },
  { value: "4", label: "4th Year (current)" },
];

export { ADMISSION_COHORT_OPTIONS, LANGUAGE_OPTIONS, DSA_EXPERIENCE_OPTIONS };

export const ONBOARDING_STEPS = [
  { id: 1, label: "Profile", key: "profile" },
  { id: 2, label: "Academic", key: "academic" },
  { id: 3, label: "Preferences", key: "preferences" },
  { id: 4, label: "Confirm", key: "confirm" },
] as const;

export const ONBOARDING_DRAFT_KEY = "sait_onboarding_draft_v1";
