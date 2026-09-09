import type { AuthUser, OnboardingData, UserProfile } from "@/lib/types/profile";
import type { LearningPath } from "@/lib/types/learning";
import { createMockLearningPath } from "@/lib/data/mock-learning-path";

const KEYS = {
  session: "devpath_session",
  profile: "devpath_profile",
  onboardingDraft: "devpath_onboarding_draft",
  learningPath: "devpath_learning_path",
} as const;

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export const localStore = {
  getSession(): AuthUser | null {
    return read<AuthUser>(KEYS.session);
  },

  setSession(user: AuthUser): void {
    write(KEYS.session, user);
  },

  clearSession(): void {
    remove(KEYS.session);
  },

  getProfile(userId: string): UserProfile | null {
    const profile = read<UserProfile>(KEYS.profile);
    return profile?.id === userId ? profile : null;
  },

  setProfile(profile: UserProfile): void {
    write(KEYS.profile, profile);
  },

  getOnboardingDraft(): Partial<OnboardingData> | null {
    return read<Partial<OnboardingData>>(KEYS.onboardingDraft);
  },

  setOnboardingDraft(draft: Partial<OnboardingData>): void {
    write(KEYS.onboardingDraft, draft);
  },

  clearOnboardingDraft(): void {
    remove(KEYS.onboardingDraft);
  },

  getLearningPath(userId: string): LearningPath | null {
    const path = read<LearningPath>(KEYS.learningPath);
    return path?.userId === userId ? path : null;
  },

  setLearningPath(path: LearningPath): void {
    write(KEYS.learningPath, path);
  },
};

export function createLocalUser(email: string, fullName: string): AuthUser {
  const id = `local-${btoa(email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`;
  return { id, email, fullName };
}

export function createLocalProfile(user: AuthUser, data?: Partial<UserProfile>): UserProfile {
  const now = new Date().toISOString();
  return {
    id: user.id,
    fullName: data?.fullName ?? user.fullName ?? "",
    email: user.email,
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

export function ensureLocalLearningPath(userId: string, userName: string): LearningPath {
  const existing = localStore.getLearningPath(userId);
  if (existing) return existing;
  const path = createMockLearningPath(userId, userName);
  localStore.setLearningPath(path);
  return path;
}
