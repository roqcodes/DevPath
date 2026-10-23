import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getStudentProfile, isProfileOnboardingComplete } from "@/lib/services/member-profile-service";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null, profile: null });
  }

  const profile = await getStudentProfile(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile,
    onboardingComplete: profile ? isProfileOnboardingComplete(profile) : false,
  });
}
