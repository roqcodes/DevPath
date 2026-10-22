import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AuthUser, UserProfile } from "@/lib/types/profile";

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  experience_level: string | null;
  learning_goal: string | null;
  learning_duration: string | null;
  daily_time: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

function defaultProfileFromUser(user: Pick<AuthUser, "id" | "email" | "fullName">, data?: Partial<UserProfile>): UserProfile {
  const now = new Date().toISOString();
  return {
    id: user.id,
    fullName: data?.fullName ?? user.fullName ?? "",
    email: data?.email ?? user.email,
    role: data?.role ?? null,
    experienceLevel: data?.experienceLevel ?? null,
    learningGoal: data?.learningGoal ?? null,
    learningDuration: data?.learningDuration ?? null,
    dailyTime: data?.dailyTime ?? null,
    onboardingCompleted: data?.onboardingCompleted ?? false,
    createdAt: data?.createdAt ?? now,
    updatedAt: now,
  };
}

function mapRowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name ?? "",
    email: row.email ?? "",
    role: row.role as UserProfile["role"],
    experienceLevel: row.experience_level as UserProfile["experienceLevel"],
    learningGoal: row.learning_goal as UserProfile["learningGoal"],
    learningDuration: row.learning_duration as UserProfile["learningDuration"],
    dailyTime: row.daily_time as UserProfile["dailyTime"],
    onboardingCompleted: row.onboarding_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProfileToRow(profile: Partial<UserProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (profile.fullName !== undefined) row.full_name = profile.fullName;
  if (profile.email !== undefined) row.email = profile.email;
  if (profile.role !== undefined) row.role = profile.role;
  if (profile.experienceLevel !== undefined) row.experience_level = profile.experienceLevel;
  if (profile.learningGoal !== undefined) row.learning_goal = profile.learningGoal;
  if (profile.learningDuration !== undefined) row.learning_duration = profile.learningDuration;
  if (profile.dailyTime !== undefined) row.daily_time = profile.dailyTime;
  if (profile.onboardingCompleted !== undefined) row.onboarding_completed = profile.onboardingCompleted;
  return row;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;

    return mapRowToProfile(data as ProfileRow);
  } catch {
    return null;
  }
}

export async function createProfile(user: AuthUser): Promise<UserProfile> {
  const profile = defaultProfileFromUser(user);

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error("Supabase client unavailable");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: user.fullName ?? "",
      email: user.email,
      onboarding_completed: false,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create profile");
  }

  return mapRowToProfile(data as ProfileRow);
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured" };
  }

  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable" };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(mapProfileToRow(updates))
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("[Profile] Update failed:", error.message);
      return { success: false, error: "Unable to save your profile. Please try again." };
    }

    const mapped = mapRowToProfile(data as ProfileRow);
    return { success: true, profile: mapped };
  } catch {
    return { success: false, error: "Unable to save your profile. Please try again." };
  }
}

export async function isOnboardingComplete(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.onboardingCompleted ?? false;
}
