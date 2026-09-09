import type { UserData } from "@/lib/types/app";

export const DEFAULT_USER: UserData = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  role: "Software Developer",
  learningGoal: "Become deployment-ready",
  interests: ["git", "docker", "ci_cd", "testing", "deployment"],
  duration: "21 days",
  dailyCommitment: "30 min",
};

export function getMockUser(): UserData {
  return { ...DEFAULT_USER };
}
