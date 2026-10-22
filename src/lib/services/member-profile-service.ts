import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { BatchId, DepartmentId } from "@/lib/types/sait";

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  avatarUrl?: string;
  phone?: string;
  department: DepartmentId | "";
  admissionCohort: string;
  academicYear: string;
  batch: BatchId | "";
  studentId?: string;
  profilePublic: boolean;
  weeklyGoalProblems: number;
  preferredLanguage: string;
  dsaExperience?: string;
  onboardingStatus: string;
  accountStatus: string;
  membershipStatus: string;
  onboardingCompleted: boolean;
  rankingScore: number;
  uniqueSolvedCount: number;
  currentStreak: number;
  longestStreak: number;
}

const SAFE_UPDATE_FIELDS = new Set([
  "full_name",
  "display_name",
  "avatar_url",
  "phone",
  "academic_year",
  "profile_public",
  "weekly_goal_problems",
  "preferred_language",
  "dsa_experience",
]);

export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  const supabase = await createClient();
  const client = supabase ?? createAdminClient();
  if (!client) return null;

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return mapRow(data);
}

function mapRow(row: Record<string, unknown>): StudentProfile {
  return {
    id: row.id as string,
    email: (row.email as string) ?? "",
    fullName: (row.full_name as string) ?? "",
    displayName: (row.display_name as string) ?? (row.full_name as string) ?? "",
    avatarUrl: row.avatar_url as string | undefined,
    phone: row.phone as string | undefined,
    department: (row.department_id as DepartmentId) ?? "",
    admissionCohort: (row.admission_cohort as string) ?? "",
    academicYear: (row.academic_year as string) ?? "",
    batch: (row.batch as BatchId) ?? "",
    studentId: row.student_id as string | undefined,
    profilePublic: row.profile_public !== false,
    weeklyGoalProblems: (row.weekly_goal_problems as number) ?? 5,
    preferredLanguage: (row.preferred_language as string) ?? "python",
    dsaExperience: row.dsa_experience as string | undefined,
    onboardingStatus: (row.onboarding_status as string) ?? "pending_onboarding",
    accountStatus: (row.account_status as string) ?? "active",
    membershipStatus: (row.membership_status as string) ?? "unverified",
    onboardingCompleted: Boolean(row.onboarding_completed),
    rankingScore: (row.ranking_score as number) ?? 0,
    uniqueSolvedCount: (row.unique_solved_count as number) ?? 0,
    currentStreak: (row.current_streak as number) ?? 0,
    longestStreak: (row.longest_streak as number) ?? 0,
  };
}

export interface OnboardingPayload {
  fullName: string;
  displayName?: string;
  phone?: string;
  department: DepartmentId;
  admissionCohort: string;
  academicYear: string;
  batch: BatchId;
  studentId?: string;
  weeklyGoalProblems: number;
  preferredLanguage: string;
  dsaExperience?: string;
}

export async function completeStudentOnboarding(
  userId: string,
  email: string,
  payload: OnboardingPayload
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { success: false, error: "Database not configured (service role required)" };
  }

  const { error } = await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: payload.fullName,
      display_name: payload.displayName || payload.fullName,
      phone: payload.phone ?? null,
      department_id: payload.department,
      admission_cohort: payload.admissionCohort,
      academic_year: payload.academicYear,
      batch: payload.batch,
      student_id: payload.studentId ?? null,
      weekly_goal_problems: payload.weeklyGoalProblems,
      preferred_language: payload.preferredLanguage,
      dsa_experience: payload.dsaExperience ?? null,
      onboarding_completed: true,
      onboarding_status: "active",
      membership_status: "unverified",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateSafeProfileFields(
  userId: string,
  updates: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  const supabase = await createClient();
  const client = admin ?? supabase;
  if (!client) return { success: false, error: "Unavailable" };

  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (SAFE_UPDATE_FIELDS.has(key)) row[key] = value;
  }
  if (!Object.keys(row).length) return { success: false, error: "No permitted fields" };

  const { error } = await client.from("profiles").update(row).eq("id", userId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export function isProfileOnboardingComplete(profile: StudentProfile): boolean {
  return (
    profile.onboardingCompleted ||
    profile.onboardingStatus === "active"
  );
}

export function canAccessApp(profile: StudentProfile): boolean {
  return profile.accountStatus === "active" && profile.onboardingStatus !== "suspended";
}
