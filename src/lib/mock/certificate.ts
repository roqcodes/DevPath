import type { CertificateData } from "@/lib/types/app";

export function getMockCertificate(name = "Alex Johnson"): CertificateData {
  return {
    recipientName: name,
    title: "DevOps Fundamentals",
    completedDomains: ["Git", "Docker", "CI/CD", "Testing", "Deployment"],
    finalProjectPassed: true,
    score: 91,
    certificateId: "DP-2026-847291",
    issueDate: "September 2026",
  };
}
