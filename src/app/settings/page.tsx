"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Database,
  HelpCircle,
  LogOut,
  Sliders,
  Sparkles,
  Target,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader, PageScroll } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/context/app-context";
import { signOut } from "@/lib/services/auth-service";
import { BetaFeedbackForm } from "@/components/feedback/beta-feedback-form";

export default function SettingsPage() {
  const { state, setWeeklyGoal } = useApp();
  const router = useRouter();
  const [weekly, setWeekly] = useState(state.user.weeklyGoalProblems);
  const [savedGoal, setSavedGoal] = useState(false);

  const onSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleSaveGoal = () => {
    setWeeklyGoal(weekly);
    setSavedGoal(true);
    setTimeout(() => setSavedGoal(false), 2500);
  };

  return (
    <AppLayout>
      <PageHeader
        icon={Sliders}
        title="Account & preferences"
        description="Practice targets, session controls, and feedback — tuned to how you actually study."
      />
      <PageScroll className="mx-auto w-full max-w-2xl">

        {/* Practice goals */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-600" />
              Practice Targets
            </CardTitle>
            <p className="text-xs text-slate-500">
              Set weekly solved problem targets displayed in your dashboard momentum tracker.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="weekly-goal" className="text-xs font-semibold text-slate-700">
                Weekly Target (Problems per week)
              </Label>
              <div className="flex items-center gap-3 mt-1.5">
                <Input
                  id="weekly-goal"
                  type="number"
                  min={1}
                  max={50}
                  className="max-w-[120px] h-10 rounded-xl"
                  value={weekly}
                  onChange={(e) => setWeekly(Number(e.target.value))}
                />
                <Button type="button" onClick={handleSaveGoal} className="h-10 text-xs font-semibold">
                  Update Goal
                </Button>
                {savedGoal && (
                  <span className="text-xs font-medium text-emerald-600 animate-fade-in flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beta feedback */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Private Beta Feedback
            </CardTitle>
            <p className="text-xs text-slate-500">
              Direct report channel to the SAIT engineering and curriculum team.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <BetaFeedbackForm />
          </CardContent>
        </Card>

        {/* Session management */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600" />
              Session & Data Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={onSignOut} className="text-xs h-9 gap-1.5">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Environment Reference */}
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-500" />
              Backend Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 space-y-2 pt-4 leading-relaxed font-mono">
            <p>• Supabase: Configured via NEXT_PUBLIC_SUPABASE_URL</p>
            <p>• Judge0: Integrated via JUDGE0_API_URL and server token</p>
            <p>• Curriculum: 12 Modules · 89 Verified Lessons</p>
          </CardContent>
        </Card>
      </PageScroll>
    </AppLayout>
  );
}
