"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MailCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { signUp } from "@/lib/services/auth-service";
import { resolvePathAfterAuth } from "@/lib/auth/post-auth-redirect";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

function getPasswordStrength(pwd: string): { score: number; label: string; barColor: string } {
  if (!pwd) return { score: 0, label: "", barColor: "bg-slate-200" };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pwd) || (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd))) score += 1;

  if (score <= 1) return { score: 1, label: "Too short", barColor: "bg-rose-500" };
  if (score === 2) return { score: 2, label: "Fair", barColor: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", barColor: "bg-emerald-500" };
  return { score: 4, label: "Strong", barColor: "bg-emerald-600" };
}

const fieldClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const { updateUser, state } = useApp();

  const [fullName, setFullName] = useState(state.user.name || "");
  const [email, setEmail] = useState(state.user.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    const result = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);

    if (!result.success || !result.user) {
      setError(result.error ?? "Failed to create account. Please try again.");
      return;
    }

    if (result.needsEmailVerification) {
      setVerificationPending(true);
      return;
    }

    updateUser({
      email: result.user.email,
      name: fullName.trim() || result.user.fullName || "",
    });

    const { path } = await resolvePathAfterAuth(nextPath);
    router.push(path);
  };

  return (
    <div className="auth-viewport grid overflow-hidden bg-slate-50 lg:grid-cols-[minmax(260px,1fr)_minmax(320px,1.05fr)]">
      {/* Left — minimal context */}
      <aside className="relative hidden min-h-0 flex-col justify-between overflow-hidden border-r border-slate-200/80 bg-white px-8 py-8 lg:flex xl:px-12">
        <Logo href="/" size="sm" />
        <div className="max-w-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            CUSAT · IT &amp; AI
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 xl:text-[1.65rem] xl:leading-tight">
            Learn DSA with your batch.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Structured modules, judged practice, and batch rankings — one account.
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
            {[
              ["12", "Modules"],
              ["89", "Lessons"],
              ["Live", "Judge"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="text-[11px] text-slate-400">School of Engineering · CUSAT</p>
      </aside>

      {/* Right — form */}
      <div className="flex min-h-0 flex-col overflow-hidden bg-slate-50">
        <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 sm:px-6">
          <div className="lg:hidden">
            <Logo href="/" size="sm" />
          </div>
          <p className="hidden truncate text-xs text-slate-500 lg:block">Create account</p>
          <Button variant="ghost" size="sm" className="ml-auto h-8 text-xs text-slate-600" asChild>
            <Link href={loginHref}>Sign in</Link>
          </Button>
        </header>

        <main className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 py-3 sm:px-6 lg:px-10">
          <div className="auth-fit-tight mx-auto w-full max-w-[22rem]">
            {verificationPending ? (
              <div className="animate-auth-rise">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70">
                  <MailCheck className="h-5 w-5" aria-hidden />
                </div>
                <h1 className="auth-fit-title mt-3 text-lg font-semibold tracking-tight text-slate-900">
                  Check your inbox
                </h1>
                <p className="auth-fit-lead mt-1 text-xs leading-snug text-slate-500">
                  We sent a link to{" "}
                  <span className="font-medium text-slate-800">{email}</span>. Verify, then sign in
                  to finish your profile.
                </p>
                <div className="mt-4 space-y-2">
                  <Button asChild className="h-9 w-full text-xs font-semibold">
                    <Link href={loginHref}>
                      Continue to sign in
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <button
                    type="button"
                    onClick={() => setVerificationPending(false)}
                    className="w-full text-center text-[11px] font-medium text-slate-500 hover:text-slate-800"
                  >
                    Use a different email
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-auth-rise">
                <div className="lg:hidden">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                    Step 1 of 2
                  </p>
                </div>
                <h1 className="auth-fit-title mt-0.5 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  Create your account
                </h1>
                <p className="auth-fit-lead mt-1 text-[11px] leading-snug text-slate-500 sm:text-xs">
                  Campus email recommended. Batch setup is next.
                </p>

                <form onSubmit={onSubmit} className="auth-fit-form mt-3 flex flex-col gap-2.5">
                  <div className="space-y-1">
                    <label htmlFor="fullName" className="text-xs font-medium text-slate-700">
                      Full name
                    </label>
                    <div className="relative">
                      <User
                        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                        placeholder="Your name"
                        className={cn(fieldClass, "auth-fit-field pl-8")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-medium text-slate-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                        aria-hidden
                      />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        placeholder="you@cusat.ac.in"
                        className={cn(fieldClass, "auth-fit-field pl-8")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="password" className="text-xs font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="8+ characters"
                        className={cn(fieldClass, "auth-fit-field pr-9")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="flex flex-1 gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={cn(
                                "h-0.5 flex-1 rounded-full",
                                level <= passwordStrength.score
                                  ? passwordStrength.barColor
                                  : "bg-slate-200"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="auth-fit-field mt-0.5 h-9 w-full text-xs font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        Please wait
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-2.5 text-center text-[11px] text-slate-500 lg:hidden">
                  Already registered?{" "}
                  <Link href={loginHref} className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
