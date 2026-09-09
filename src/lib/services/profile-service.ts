import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  createLocalProfile,
  localStore,
} from "./local-store";
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
  if (!isSupabaseConfigured()) {
    return localStore.getProfile(userId);
  }

  const supabase = createClient();
  if (!supabase) return localStore.getProfile(userId);

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return localStore.getProfile(userId);
    }

    return mapRowToProfile(data as ProfileRow);
  } catch {
    return localStore.getProfile(userId);
  }
}

export async function createProfile(user: AuthUser): Promise<UserProfile> {
  const profile = createLocalProfile(user);

  if (!isSupabaseConfigured()) {
    localStore.setProfile(profile);
    return profile;
  }

  const supabase = createClient();
  if (!supabase) {
    localStore.setProfile(profile);
    return profile;
  }

  try {
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
      localStore.setProfile(profile);
      return profile;
    }

    const mapped = mapRowToProfile(data as ProfileRow);
    localStore.setProfile(mapped);
    return mapped;
  } catch {
    localStore.setProfile(profile);
    return profile;
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  const existing = await getProfile(userId);
  const base = existing ?? createLocalProfile({ id: userId, email: "", fullName: "" });
  const updated: UserProfile = {
    ...base,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    localStore.setProfile(updated);
    return { success: true, profile: updated };
  }

  const supabase = createClient();
  if (!supabase) {
    localStore.setProfile(updated);
    return { success: true, profile: updated };
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
      localStore.setProfile(updated);
      return { success: true, profile: updated };
    }

    const mapped = mapRowToProfile(data as ProfileRow);
    localStore.setProfile(mapped);
    return { success: true, profile: mapped };
  } catch {
    localStore.setProfile(updated);
    return { success: true, profile: updated };
  }
}

export async function isOnboardingComplete(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.onboardingCompleted ?? false;
}
