"use client";

import { Download, ShieldCheck, QrCode, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMockCertificate } from "@/lib/mock/certificate";
import { useApp } from "@/lib/context/app-context";

export function CertificateView() {
  const { state } = useApp();
  const cert = getMockCertificate(state.user.name);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="rounded-xl border-2 border-accent/20 bg-card overflow-hidden shadow-lg">
        <div className="relative p-8 sm:p-12 text-center border-b-2 border-accent/10 bg-gradient-to-b from-accent/[0.06] to-transparent">
          <div className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
            <Award className="h-5 w-5 text-accent" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-6">
            DevPath AI
          </p>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">
            Certificate of Completion
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl uppercase">
            DevOps Fundamentals
          </h1>
        </div>

        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <p className="text-sm text-muted-foreground mb-2">Awarded to</p>
            <p className="text-3xl font-semibold tracking-tight">{cert.recipientName}</p>
            <p className="mt-6 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              for successfully completing a personalized DevOps learning journey and demonstrating
              practical competency in:
            </p>
            <p className="mt-4 text-sm font-medium tracking-wide">
              Git &bull; Docker &bull; CI/CD &bull; Testing &bull; Deployment
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 mb-10 text-center">
            <div className="rounded-lg border border-border p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Final Project Score</p>
              <p className="text-2xl font-bold tabular-nums mt-1 text-accent">{cert.score}%</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Certificate ID</p>
              <p className="text-sm font-mono font-medium mt-1">{cert.certificateId}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Issue Date</p>
              <p className="text-sm font-medium mt-1">{cert.issueDate}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-border bg-muted/30">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Verifiable
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground max-w-xs text-right leading-relaxed">
              This is a DevPath AI completion certificate and is not an accredited industry certification.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
        <Button variant="outline" className="hover-lift">
          <ShieldCheck className="h-4 w-4" />
          Verify Certificate
        </Button>
        <Button className="hover-lift">
          <Download className="h-4 w-4" />
          Download Certificate
        </Button>
      </div>
    </div>
  );
}
