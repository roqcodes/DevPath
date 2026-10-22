"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  GitBranch,
  Medal,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Reveal } from "@/components/motion";
import { enableDemoCookie } from "@/lib/auth/demo";

const PILLARS = [
  {
    icon: GitBranch,
    title: "Path map",
    copy: "One glowing node. Five minutes. Then the next.",
  },
  {
    icon: Swords,
    title: "Arena",
    copy: "Mock interviews with Kip watching your weak spots.",
  },
  {
    icon: Medal,
    title: "Achievements",
    copy: "Identity cards you actually want to share.",
  },
  {
    icon: Sparkles,
    title: "Wrapped",
    copy: "Your term, story-sized — not another leaderboard flex.",
  },
];

export default function LandingPage() {
  const router = useRouter();

  function tryWithoutAccount() {
    enableDemoCookie();
    router.push("/start");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(79,70,229,0.35), transparent 45%), radial-gradient(circle at 80% 10%, rgba(34,211,238,0.25), transparent 40%), radial-gradient(circle at 50% 80%, rgba(249,115,22,0.12), transparent 50%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <header className="relative border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:px-8">
          <Logo href="/" size="sm" tone="onDark" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" className="text-indigo-100 hover:text-white hover:bg-white/10" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button className="bg-white text-indigo-950 hover:bg-cyan-50" asChild>
              <Link href="/signup">Join SAIT DSA</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal className="m-rise">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300/90">
              <Zap className="h-3.5 w-3.5" />
              DevPath · zero-config demo
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              DSA that feels like{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-indigo-200 to-white bg-clip-text text-transparent">
                a game you can win
              </span>
              .
            </h1>
            <p className="mt-5 text-lg text-indigo-200/90 max-w-lg leading-relaxed">
              Structured syllabus, real code on the judge, spaced review, and a living path map — built for
              CUSAT IT &amp; AI, playable in demo mode with no backend setup.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg" onClick={tryWithoutAccount}>
                Try without an account
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/dashboard">Open workspace</Link>
              </Button>
            </div>
            <p className="mt-4 text-[11px] text-indigo-300/70">
              Sets <code className="font-mono text-cyan-200/80">devpath_demo=1</code> and walks you through
              4 steps on <Link href="/start" className="underline hover:text-white">/start</Link>.
            </p>
          </Reveal>

          <Reveal delay={80} className="relative m-rise">
            <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-indigo-900/80 via-slate-900/90 to-slate-950 p-6 shadow-lg backdrop-blur-md lg:p-8">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-200">
                <span>Live path preview</span>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-cyan-200 ring-1 ring-cyan-400/30">
                  Node 0 · glowing
                </span>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={
                      n === 0
                        ? "col-span-1 flex aspect-square items-center justify-center rounded-2xl border border-cyan-400/50 bg-cyan-500/20 m-glow"
                        : "aspect-square rounded-2xl border border-white/10 bg-white/5 opacity-50"
                    }
                  >
                    {n === 0 && <GitBranch className="h-6 w-6 text-cyan-300 m-float" aria-hidden />}
                  </div>
                ))}
              </div>
              <ul className="mt-6 space-y-2 text-sm text-indigo-100/90">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Today: one lesson + two problems
                </li>
                <li className="flex items-center gap-2 text-indigo-300/70">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  Review queue warms up after your first quiz
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Study · Compete · Share</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 m-stagger">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 50} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover-lift">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-cyan-300 ring-1 ring-white/10">
                  <p.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-indigo-200/80 leading-relaxed">{p.copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/10 py-8 text-center text-sm text-indigo-300/70">
        DevPath — peer learning for CUSAT IT &amp; AI · Press <kbd className="font-mono text-cyan-200/80">⌘K</kbd>{" "}
        in the app to jump anywhere
      </footer>
    </div>
  );
}
