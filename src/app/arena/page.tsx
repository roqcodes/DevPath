import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/app-layout";
import { Arena } from "@/components/arena/arena";

export const metadata: Metadata = {
  title: "The Arena · DevPath",
  description: "Mock DSA interviews as boss fights. Three rounds, real rubrics, honest feedback.",
};

export default function ArenaPage() {
  return (
    <AppLayout>
      <Arena />
    </AppLayout>
  );
}
