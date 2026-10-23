"use client";

import Link from "next/link";
import { Map } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageFill, PageHeader } from "@/components/layout/page-shell";
import { PathMap } from "@/components/learn/path-map";
import { Button } from "@/components/ui/button";

export default function PathPage() {
  return (
    <AppLayout wideContent>
      <PageFill>
        <PageHeader
          backHref="/learn"
          backLabel="Syllabus"
          icon={Map}
          title="Your learning path"
          description="Twelve modules, one winding road. Locked nodes open when prerequisites are mastered."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/review">Daily review</Link>
            </Button>
          }
        />
        <div className="min-h-0 flex-1 overflow-hidden pt-2">
          <PathMap />
        </div>
      </PageFill>
    </AppLayout>
  );
}
