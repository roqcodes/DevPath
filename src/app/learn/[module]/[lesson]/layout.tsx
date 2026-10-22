import { AppLayout } from "@/components/layout/app-layout";

export default function LessonWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout wideContent>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </AppLayout>
  );
}
