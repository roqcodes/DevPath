import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createProfile, getProfile, updateProfile } from "./profile-service";
import { getCurrentUser } from "./auth-service";
import type { OnboardingData, SkillAssessment } from "@/lib/types/profile";

const ONBOARDING_DRAFT_KEY = "devpath_onboarding_draft";
const ONBOARDING_DRAFT_STEP_KEY = "devpath_onboarding_step";

export function getOnboardingDraft(): Partial<OnboardingData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<OnboardingData>) : {};
  } catch {
    return {};
  }
}

export function saveOnboardingDraft(draft: Partial<OnboardingData>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
}

export function getOnboardingStep(): number {
  if (typeof window === "undefined") return 1;
  try {
    const step = localStorage.getItem(ONBOARDING_DRAFT_STEP_KEY);
    return step ? parseInt(step, 10) : 1;
  } catch {
    return 1;
  }
}

export function saveOnboardingStep(step: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_DRAFT_STEP_KEY, String(step));
}

export function clearOnboardingDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_DRAFT_KEY);
  localStorage.removeItem(ONBOARDING_DRAFT_STEP_KEY);
}

export async function saveInterests(
  userId: string,
  topics: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database is not configured" };
  }

  const supabase = createClient();
  if (!supabase) return { success: false, error: "Database is not configured" };

  try {
    await supabase.from("user_interests").delete().eq("user_id", userId);

    if (topics.length > 0) {
      const rows = topics.map((topic) => ({ user_id: userId, topic }));
      const { error } = await supabase.from("user_interests").insert(rows);
      if (error) {
        console.error("[Onboarding] Save interests failed:", error.message);
        return { success: false, error: "Unable to save your interests. Please try again." };
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unable to save your interests. Please try again." };
  }
}

export async function saveSkillAssessment(
  userId: string,
  assessments: SkillAssessment[]
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database is not configured" };
  }

  const supabase = createClient();
  if (!supabase) return { success: false, error: "Database is not configured" };

  try {
    await supabase.from("user_skill_assessment").delete().eq("user_id", userId);

    if (assessments.length > 0) {
      const rows = assessments.map((a) => ({
        user_id: userId,
        topic: a.topic,
        self_rating: a.selfRating,
      }));
      const { error } = await supabase.from("user_skill_assessment").insert(rows);
      if (error) {
        console.error("[Onboarding] Save skill assessment failed:", error.message);
        return { success: false, error: "Unable to save your assessment. Please try again." };
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: "Unable to save your assessment. Please try again." };
  }
}

export async function completeOnboarding(
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be signed in to complete onboarding." };
  }

  let profile = await getProfile(user.id);
  if (!profile) {
    profile = await createProfile(user);
  }

  const profileResult = await updateProfile(user.id, {
    fullName: data.fullName,
    role: data.role,
    experienceLevel: data.experienceLevel,
    learningGoal: data.learningGoal,
    learningDuration: data.learningDuration,
    dailyTime: data.dailyTime,
    onboardingCompleted: true,
  });

  if (!profileResult.success) {
    return { success: false, error: "Unable to save your profile. Please try again." };
  }

  const interestsResult = await saveInterests(user.id, data.interests);
  if (!interestsResult.success) {
    return interestsResult;
  }

  const assessmentResult = await saveSkillAssessment(user.id, data.skillAssessments);
  if (!assessmentResult.success) {
    return assessmentResult;
  }

  clearOnboardingDraft();

  return { success: true };
}
