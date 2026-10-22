import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Play, Target, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Practice-first syllabus",
    description: "Twelve DSA modules with short lessons, checkpoints, and linked problems.",
  },
  {
    icon: Code2,
    title: "Question bank",
    description: "Filter by topic, difficulty, and progress. Submit code through a secure judge boundary.",
  },
  {
    icon: Target,
    title: "Daily goals",
    description: "Know what to study next with lessons, problems, and consistency tracking.",
  },
  {
    icon: Trophy,
    title: "Peer rankings",
    description: "Compare progress within your batch, department, and across CUSAT.",
  },
  {
    icon: Users,
    title: "Built for SAIT",
    description: "Exclusive foundation for IT and AI students at CUSAT — extensible membership checks.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Join SAIT DSA</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-in">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              CUSAT · School of IT
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Learn DSA with your batch.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              SAIT DSA combines a structured syllabus, a searchable problem bank, and peer rankings so you
              always know what to study next and can prove your progress.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">
                  <Play className="h-4 w-4" />
                  Open workspace
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-fade-in">
            <p className="text-sm font-medium">Today&apos;s plan</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Finish one lesson in Arrays &amp; strings
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-border" />
                Solve two practice problems
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-border" />
                Review one difficult topic
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Study · Practice · Rank</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/30"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
                  <feature.icon className="h-5 w-5 text-accent" aria-hidden />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        SAIT DSA — peer learning for CUSAT IT &amp; AI
      </footer>
    </div>
  );
}
