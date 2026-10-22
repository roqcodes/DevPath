export const PLATFORM_TIMEZONE = "Asia/Kolkata";

export const ACCOUNT_STATUSES = ["active", "restricted", "suspended"] as const;
export const ONBOARDING_STATUSES = [
  "pending_onboarding",
  "pending_verification",
  "active",
  "restricted",
  "suspended",
] as const;
export const MEMBERSHIP_STATUSES = ["unverified", "pending", "verified", "rejected"] as const;

export const LANGUAGE_OPTIONS = [
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
] as const;

export const DSA_EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export const ADMISSION_COHORT_OPTIONS = [
  { value: "2022", label: "2022 intake" },
  { value: "2023", label: "2023 intake" },
  { value: "2024", label: "2024 intake" },
  { value: "2025", label: "2025 intake" },
  { value: "2026", label: "2026 intake" },
];
