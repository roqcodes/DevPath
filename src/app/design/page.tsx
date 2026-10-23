"use client";

import { useState } from "react";
import { Flame, Sparkles, Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import { SectionHeader } from "@/components/ui/section-header";
import { SegmentedControl } from "@/components/ui/segmented";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat-tile";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

export default function DesignSystemPage() {
  const [segment, setSegment] = useState<"week" | "month" | "all">("week");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [motionOn, setMotionOn] = useState(true);

  return (
    <div className="min-h-screen bg-surface bg-dot-grid">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        <header className="space-y-3">
          <p className="eyebrow text-brand-600">DevPath · V14</p>
          <h1 className="text-display text-slate-900">Design system QA</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Internal gallery for tokens, primitives, and motion. Not indexed.
          </p>
        </header>

        <section className="space-y-4">
          <SectionHeader
            eyebrow="Tokens"
            title="Surfaces & ink"
            description="Hero ink gradient and raised cards."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface-ink rounded-hero p-8 shadow-lg">
              <p className="eyebrow text-highlight">Hero surface</p>
              <p className="mt-2 text-lg font-semibold">Deep indigo → slate ink</p>
              <Button variant="ink" size="sm" className="mt-4">Glass CTA</Button>
            </div>
            <Card variant="interactive" padding="dense">
              <CardHeader>
                <CardTitle>Interactive card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Hover for lift + ring glow.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Actions" description="Buttons, badges, kbd." />
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge dot>Default</Badge>
            <Badge variant="success" dot>Success</Badge>
            <Badge variant="xp">+120 XP</Badge>
            <Badge variant="flame">Streak</Badge>
            <Badge variant="highlight">Live</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Command palette{" "}
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </p>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Data display" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Streak" value={12} hint="days" icon={Flame} accent="flame" />
            <StatTile label="XP today" value="340" icon={Zap} accent="xp" />
            <StatTile label="Rank" value="#4" icon={Trophy} accent="purple" />
            <StatTile label="Quests" value={3} icon={Sparkles} accent="brand" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Progress value={68} showLabel label="Syllabus" variant="default" />
            <Progress value={42} showLabel label="Weekly goal" variant="xp" />
          </div>
          <div className="flex flex-wrap items-center gap-8">
            <ProgressRing value={72} size={80}>
              <span className="num text-sm font-bold">72%</span>
            </ProgressRing>
            <ProgressRing value={88} size={56} stroke={5} barClassName="text-emerald-600" />
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Inputs & feedback" />
          <div className="flex flex-wrap items-center gap-6">
            <SegmentedControl
              aria-label="Time range"
              value={segment}
              onValueChange={setSegment}
              options={[
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
                { value: "all", label: "All time" },
              ]}
            />
            <Switch
              label="Celebrations"
              description="Confetti on level-up"
              checked={motionOn}
              onChange={(e) => setMotionOn(e.target.checked)}
            />
            <Tooltip content="Tooltip on hover/focus">
              <Button variant="outline" size="sm">Hover me</Button>
            </Tooltip>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() =>
                toast({ title: "Saved", description: "Progress synced locally.", tone: "success" })
              }
            >
              Toast success
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast({ title: "+50 XP", tone: "xp" })}
            >
              Toast XP
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setDialogOpen(true)}>
              Open dialog
            </Button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent onOpenChange={setDialogOpen}>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>Native dialog with V14 motion classes.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setDialogOpen(false)}>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        <section className="space-y-4">
          <SectionHeader title="Loading & empty" />
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-10 w-10" circle />
                <SkeletonText lines={3} className="mt-4" />
              </CardContent>
            </Card>
            <Card>
              <EmptyState
                title="No submissions yet"
                description="Solve a practice problem to appear on the board."
                action={{ label: "Browse problems", onClick: () => {} }}
              />
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
