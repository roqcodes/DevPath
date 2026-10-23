"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/services/auth-service";
import { resolvePathAfterAuth } from "@/lib/auth/post-auth-redirect";
import { useApp } from "@/lib/context/app-context";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthEditorialPanel } from "@/components/auth/auth-editorial";
import { JoinFlowStepBar } from "@/components/onboarding/join-flow-overview";
import { cn } from "@/lib/utils";

const fieldClass =
  "auth-fit-field h-9 rounded-lg border-slate-200 bg-white px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] placeholder:text-slate-400";

export function LoginForm({ defaultMode = "signin" }: { defaultMode?: "signin" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const { updateUser, state } = useApp();
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState(state.user.email);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(state.user.name);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("mode") === "signup") setMode("signup");
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const result =
      mode === "signup"
        ? await signUp(email, password, fullName)
        : await signIn(email, password);
    setLoading(false);
    if (!result.success || !result.user) {
      setError(result.error ?? "Authentication failed");
      return;
    }

    if (result.needsEmailVerification) {
      setInfo(
        "Account created. Check your email for a confirmation link, then sign in to continue your student profile setup."
      );
      setMode("signin");
      return;
    }

    updateUser({ email: result.user.email, name: fullName || result.user.fullName || "" });

    const { path } = await resolvePathAfterAuth(nextPath);
    router.push(path);
  };

  const isSignup = mode === "signup";

  return (
    <AuthShell
      showMotif
      mobileEyebrow={isSignup ? "Join SAIT DSA" : "Welcome back"}
      rightTop={isSignup ? <JoinFlowStepBar activeStep="account" /> : undefined}
      headerAction={
        isSignup ? (
          <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
            <Link href="/signup">Join</Link>
          </Button>
        )
      }
      editorial={<AuthEditorialPanel variant={isSignup ? "signup" : "signin"} />}
    >
      <div key={mode} className="flex min-h-0 flex-col justify-center animate-auth-rise">
        {!isSignup && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Student sign in
          </p>
        )}
        <h1 className="auth-fit-title mt-0.5 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {isSignup ? "Create your account" : "Sign in"}
        </h1>
        <p className="auth-fit-lead mt-1 line-clamp-2 text-[11px] leading-snug text-slate-500 sm:text-xs">
          {isSignup
            ? "Campus email recommended. Profile setup is next."
            : "Use your SAIT DSA email and password."}
        </p>

        <form
          onSubmit={onSubmit}
          className="auth-fit-form mt-3 flex flex-col gap-2.5 sm:mt-3.5"
        >
          {isSignup && (
            <div className="space-y-0.5">
              <Label htmlFor="name" className="text-xs font-medium text-slate-700">
                Full name
              </Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Campus name"
                className={fieldClass}
              />
            </div>
          )}

          <div className="space-y-0.5">
            <Label htmlFor="email" className="text-xs font-medium text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@cusat.ac.in"
              className={fieldClass}
            />
          </div>

          <div className="space-y-0.5">
            <Label htmlFor="password" className="text-xs font-medium text-slate-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder={isSignup ? "8+ characters" : "Password"}
                className={cn(fieldClass, "pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {error && (
            <p
              className="flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-800"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-3">{error}</span>
            </p>
          )}
          {info && (
            <p
              className="flex items-start gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] text-emerald-900"
              role="status"
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-4">{info}</span>
            </p>
          )}

          <Button type="submit" className="mt-0.5 h-9 w-full text-xs font-semibold" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Please wait
              </>
            ) : isSignup ? (
              <>
                Create account
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-2.5 text-center text-[11px] text-slate-500">
          {isSignup ? (
            <>
              Already registered?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Join SAIT DSA
              </Link>
            </>
          )}
        </p>
      </div>
    </AuthShell>
  );
}
