import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { completeStudentOnboarding, type OnboardingPayload } from "@/lib/services/member-profile-service";
import { validateOnboardingPayload } from "@/lib/onboarding/validate-payload";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = (await request.json()) as OnboardingPayload;
  const err = validateOnboardingPayload(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const result = await completeStudentOnboarding(user.id, user.email, body);
  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
