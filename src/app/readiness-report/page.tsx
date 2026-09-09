"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Award } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReadinessRing } from "@/components/shared/readiness-ring";
import { READINESS_REPORT } from "@/lib/mock/intelligence";

export default function ReadinessReportPage() {
  const report = READINESS_REPORT;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <Badge variant="default" className="mb-3">Final Assessment</Badge>
          <h1 className="text-2xl font-semibold tracking-tight">Your DevOps Readiness Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Competency summary based on your learning journey and final project.
          </p>
        </div>

        <Card className="mb-6 hover-lift">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-6">
            <ReadinessRing score={report.overallScore} size={140} />
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Overall DevOps Readiness</p>
              <p className="text-4xl font-bold tabular-nums mt-1">{report.overallScore}%</p>
              <p className="text-sm text-accent mt-2">Deployment-ready competency achieved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 hover-lift">
          <CardContent className="pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Competencies
            </h2>
            <div className="space-y-3">
              {report.competencies.map((c) => (
                <div key={c.domain} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.domain}</span>
                  <Badge variant={c.level === "Advanced" ? "success" : "default"}>{c.level}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 hover-lift">
          <CardContent className="pt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Practical Project
            </h2>
            <div className="space-y-2">
              {report.projectItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-xs text-success">Completed</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-accent/25 bg-gradient-to-r from-accent/[0.05] to-transparent p-5 mb-8">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">
                AI Mentor Assessment
              </p>
              <p className="text-sm leading-relaxed">&ldquo;{report.mentorAssessment}&rdquo;</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button size="lg" asChild>
            <Link href="/certificate">
              <Award className="h-4 w-4" />
              View Certificate
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
