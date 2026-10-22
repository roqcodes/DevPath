import type { UserData } from "@/lib/types/app";

export const DEFAULT_USER: UserData = {
  name: "",
  email: "",
  phone: "",
  department: "",
  academicYear: "",
  batch: "",
  studentId: "",
  profilePublic: true,
  weeklyGoalProblems: 5,
};

export function getMockUser(): UserData {
  return { ...DEFAULT_USER };
}
