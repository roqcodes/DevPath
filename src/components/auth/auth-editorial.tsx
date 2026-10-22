import { AuthStatRow } from "@/components/auth/auth-shell";

export function AuthEditorialPanel({ variant }: { variant: "signin" | "signup" }) {
  const isSignup = variant === "signup";

  return (
    <div className="animate-auth-rise max-w-md">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300/90">
        CUSAT · IT & AI
      </p>
      <h1 className="mt-2 text-[1.5rem] font-semibold leading-[1.2] tracking-tight text-white xl:text-[1.85rem]">
        {isSignup
          ? "One account unlocks the full syllabus."
          : "Pick up where the last lecture left off."}
      </h1>
      <p className="mt-2.5 max-w-sm text-[13px] leading-snug text-indigo-100/70 xl:mt-3 xl:text-sm xl:leading-relaxed">
        {isSignup
          ? "Structured lessons, judged practice, and batch rankings on real accepts."
          : "Resume lessons, run against the judge, and check your batch rank."}
      </p>
      <AuthStatRow />
    </div>
  );
}
