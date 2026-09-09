import Link from "next/link";
import {
  ArrowRight,
  Award,
  Bot,
  GitBranch,
  Map,
  Play,
  Sparkles,
  Target,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { SkillBars } from "@/components/shared/skill-bars";

const FEATURES = [
  {
    icon: Map,
    title: "Personalized learning",
    description: "A curriculum adapted to your baseline skills, goals, and available time.",
  },
  {
    icon: Target,
    title: "Practical checkpoints",
    description: "Prove your skills through hands-on challenges at every stage.",
  },
  {
    icon: Bot,
    title: "AI Mentor",
    description: "Contextual guidance embedded in your learning — not a generic chatbot.",
  },
  {
    icon: Terminal,
    title: "Hands-on playground",
    description: "Practice in a realistic developer environment with lessons and terminal.",
  },
  {
    icon: GitBranch,
    title: "Final project",
    description: "Ship a containerized application through a complete CI/CD pipeline.",
  },
  {
    icon: Award,
    title: "Competency certificate",
    description: "Earn a certificate demonstrating your DevOps fundamentals mastery.",
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
              <Link href="/journey">Explore the Journey</Link>
            </Button>
            <Button asChild>
              <Link href="/onboarding">Build My Learning Path</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-accent" />
              Adaptive DevOps learning
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              DevPath AI
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Your personalized path to becoming DevOps-ready.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground max-w-lg">
              DevPath adapts a complete DevOps learning journey to your current skills,
              career goals, and available time. Learn, practice, and prove your abilities
              across Git, Docker, CI/CD, Testing, and Deployment.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/onboarding">
                  Build My Learning Path
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">
                  <Play className="h-4 w-4" />
                  Explore the Journey
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">Your DevOps Journey</span>
              <span className="text-xs text-muted-foreground">21-day path · 42%</span>
            </div>
            <div className="mb-6 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[42%] rounded-full bg-accent" />
            </div>
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-muted-foreground">Git Foundations</span>
                <span className="ml-auto text-xs text-success">Complete</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse-subtle" />
                <span>Branches & Merging</span>
                <span className="ml-auto text-xs text-accent">Current</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-border" />
                <span>Docker Fundamentals</span>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-accent" />
                <span className="text-xs font-medium">AI Mentor</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create a new branch for the navbar changes without modifying main.
              </p>
            </div>
            <SkillBars compact />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Learn → Practice → Prove
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to become deployment-ready
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/30"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center lg:px-8">
          <h2 className="text-2xl font-semibold">Ready to start your DevOps journey?</h2>
          <p className="mt-2 text-muted-foreground">
            Take a short assessment and get your personalized learning path in minutes.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/onboarding">
              Build My Learning Path
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground lg:px-8">
          DevPath AI — Adaptive DevOps learning environment
        </div>
      </footer>
    </div>
  );
}
