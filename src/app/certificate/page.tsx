import { AppLayout } from "@/components/layout/app-layout";
import { CertificateView } from "@/components/certificate/certificate-view";

export default function CertificatePage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Your Certificate</h1>
        <p className="mt-1 text-muted-foreground">
          Recognition of your DevOps fundamentals achievement.
        </p>
      </div>
      <CertificateView />
    </AppLayout>
  );
}
