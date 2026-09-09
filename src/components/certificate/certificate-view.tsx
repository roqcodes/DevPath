"use client";

import { Download, ShieldCheck, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMockCertificate } from "@/lib/mock/certificate";
import { useApp } from "@/lib/context/app-context";

export function CertificateView() {
  const { state } = useApp();
  const cert = getMockCertificate(state.user.name);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-gradient-to-br from-accent/10 via-transparent to-transparent p-8 sm:p-12 text-center border-b border-border">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
            DevPath AI
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{cert.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">Certificate of Completion</p>
        </div>

        <div className="p-8 sm:p-12">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">This certifies that</p>
            <p className="text-2xl font-semibold">{cert.recipientName}</p>
            <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              has successfully completed the DevOps Fundamentals learning path,
              demonstrating competency across core DevOps domains.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Completed</p>
              <div className="flex flex-wrap gap-2">
                {cert.completedDomains.map((d) => (
                  <Badge key={d} variant="success">{d}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Final project</span>
                <span className="font-medium text-success">Passed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score</span>
                <span className="font-medium">{cert.score}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificate ID</span>
                <span className="font-mono text-xs">{cert.certificateId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue date</span>
                <span className="font-medium">{cert.issueDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-muted/30">
              <QrCode className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground max-w-xs text-right">
              This is a DevPath AI completion certificate and is not an accredited industry certification.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
        <Button variant="outline">
          <ShieldCheck className="h-4 w-4" />
          Verify Certificate
        </Button>
        <Button>
          <Download className="h-4 w-4" />
          Download Certificate
        </Button>
      </div>
    </div>
  );
}
