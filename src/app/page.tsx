import Link from "next/link";
import { Map, Sparkles, Swords } from "lucide-react";
import { CompanionAvatar } from "@/components/companion";
import { LandingCta, PredictDemo } from "@/components/dashboard/landing-islands";

const FEATURES = [
  {
    icon: Map,
    title: "A path, not a pile",
    body: "Four questions in, you get a route through 12 DSA modules sized to your goal and your daily minutes.",
    tone: "text-cyan-300 bg-cyan-400/10 ring-cyan-300/20",
  },
  {
    icon: Sparkles,
    title: "Kip pays attention",
    body: "Your companion remembers what you miss, explains it a different way, and schedules reviews before you forget.",
    tone: "text-indigo-200 bg-indigo-400/15 ring-indigo-300/20",
  },
  {
    icon: Swords,
    title: "The Arena",
    body: "Timed mock interviews with an AI interviewer. Think aloud, get scored, see exactly where you lost points.",
    tone: "text-rose-200 bg-rose-400/10 ring-rose-300/20",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />

      <header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 rounded text-sm font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          <CompanionAvatar mood="idle" size={26} />
          DevPath
        </Link>
        <Link href="/login" className="rounded text-xs font-semibold text-indigo-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          Sign in
        </Link>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:pt-16">
          <div className="motion-safe:animate-fade-in">
            <div className="mb-6 flex items-center gap-3">
              <CompanionAvatar mood="excited" size={56} />
              <p className="rounded-2xl rounded-bl-sm border border-white/15 bg-white/10 px-3.5 py-2 text-xs text-indigo-100 backdrop-blur-md">
                Hi, I&apos;m Kip. I&apos;ll learn how you learn.
              </p>
            </div>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Learn DSA by doing.{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-indigo-200 bg-clip-text text-transparent">
                With a companion who actually pays attention.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-indigo-200/90">
              Short lessons you run, not read. Reviews timed to your memory. Mock interviews that hit back. Built for students
              who want to actually get good.
            </p>
            <div className="mt-8">
              <LandingCta />
            </div>
          </div>
          <div className="motion-safe:animate-fade-in" style={{ animationDelay: "120ms" }}>
            <PredictDemo />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 lg:px-8" aria-labelledby="features-title">
          <h2 id="features-title" className="sr-only">
            What you get
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition-colors hover:bg-white/[0.08]">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${f.tone}`}>
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-sm font-bold">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-indigo-200/85">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-[11px] text-indigo-300/70">
        DevPath · DSA for students, with Kip
      </footer>
    </div>
  );
}
