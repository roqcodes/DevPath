import { Suspense } from "react";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-viewport flex items-center justify-center bg-slate-50 text-sm text-slate-500">
          Loading registration…
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

