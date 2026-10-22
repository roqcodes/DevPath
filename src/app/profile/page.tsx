"use client";

import { useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Lock,
  Save,
  Shield,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/context/app-context";
import { syllabusProgress } from "@/lib/data/dsa-syllabus";

export default function ProfilePage() {
  const { state, updateUser, toggleProfilePublic } = useApp();
  const [name, setName] = useState(state.user.name);
  const [phone, setPhone] = useState(state.user.phone ?? "");
  const [savedNotice, setSavedNotice] = useState(false);
  const pct = syllabusProgress(state.progress.completedLessons);

  const initials = (name || "Student")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const save = () => {
    updateUser({ name, phone });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Profile Card Header (Inspired by Reference 2) */}
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 p-6 lg:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 text-2xl font-black text-white shadow-md ring-4 ring-white">
                {initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {state.user.displayName || name || "Student Member"}
                  </h1>
                  <Badge variant="purple" className="text-[10px]">
                    Verified Student
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-3">
                  <span>{state.user.department || "Information Technology"}</span>
                  <span>·</span>
                  <span>Batch {state.user.batch || "A"}</span>
                  <span>·</span>
                  <span>CUSAT SOE</span>
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {state.user.email || "—"}
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
              <div className="text-center px-2">
                <p className="text-[11px] font-medium text-slate-500">Streak</p>
                <p className="text-base font-bold text-slate-900 flex items-center justify-center gap-1">
                  <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {state.progress.streak}d
                </p>
              </div>
              <div className="h-8 w-px bg-slate-100" />
              <div className="text-center px-2">
                <p className="text-[11px] font-medium text-slate-500">Score</p>
                <p className="text-base font-bold text-purple-700 font-mono">
                  {state.progress.rankingScore}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-100" />
              <div className="text-center px-2">
                <p className="text-[11px] font-medium text-slate-500">Solved</p>
                <p className="text-base font-bold text-emerald-600">
                  {state.progress.solvedProblems.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Split */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200/80 bg-white shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-bold text-slate-900">
                  Student Information
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Manage your display name, contact information and academic metadata.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <Label htmlFor="profile-name" className="text-xs font-semibold text-slate-700">
                      Display Name
                    </Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Email (Private)</Label>
                    <p className="font-mono text-xs text-slate-700 mt-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 truncate">
                      {state.user.email || "—"}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="profile-phone" className="text-xs font-semibold text-slate-700">
                      Phone Number (Private)
                    </Label>
                    <Input
                      id="profile-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 h-10 rounded-xl"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Department</Label>
                    <p className="text-xs font-semibold text-slate-800 mt-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                      {state.user.department || "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Academic Year</Label>
                    <p className="text-xs font-semibold text-slate-800 mt-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                      {state.user.academicYear || "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Assigned Batch</Label>
                    <p className="text-xs font-semibold text-slate-800 mt-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                      Batch {state.user.batch || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="button" onClick={save} className="font-semibold text-xs h-9">
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Changes
                  </Button>
                  {savedNotice && (
                    <span className="text-xs font-medium text-emerald-600 animate-fade-in flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Saved successfully
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Academic & Learning Metric Cards */}
            <Card className="border-slate-200/80 bg-white shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-bold text-slate-900">
                  Learning & Activity Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Accepted Challenges
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {state.progress.solvedProblems.length}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Unique problem solutions</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                    Syllabus Mastery
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{pct}%</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {state.progress.completedLessons.length} lessons completed
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-500" />
                    Consistency Streak
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {state.progress.streak} days
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Active daily streak</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-sky-600" />
                    Practice Time (30d)
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {state.progress.activeMinutesLast30Days} min
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Focused active minutes</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy & Recent Submissions Sidebar */}
          <div className="space-y-6">
            <Card className="border-slate-200/80 bg-white shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  Privacy & Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={state.user.profilePublic}
                    onChange={(e) => toggleProfilePublic(e.target.checked)}
                  />
                  <div>
                    <span className="font-semibold text-slate-800">
                      Show on CUSAT Leaderboards
                    </span>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      Allow your display name, batch and score to be ranked amongst peers.
                    </p>
                  </div>
                </label>

                <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 leading-relaxed border border-slate-100">
                  <Lock className="h-3.5 w-3.5 text-slate-400 mb-1" />
                  Student ID, contact email, and phone numbers are strictly protected and never displayed publicly.
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="font-semibold text-slate-700 mb-2.5">Recent Activity</p>
                  <div className="space-y-1.5">
                    {state.progress.submissions.slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px]"
                      >
                        <span className="font-mono text-slate-700 truncate max-w-[130px]">
                          {s.problemId}
                        </span>
                        <Badge
                          variant={s.verdict === "accepted" ? "success" : "outline"}
                          className="text-[10px]"
                        >
                          {s.verdict}
                        </Badge>
                      </div>
                    ))}
                    {state.progress.submissions.length === 0 && (
                      <p className="text-slate-400 text-xs italic">No submission activity yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
