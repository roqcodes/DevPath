import { WrappedExperience } from "@/components/wrapped/wrapped-experience";

export default async function WrappedPeriodPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;
  return <WrappedExperience period={period} />;
}
