import { CheckpointComplete } from "@/components/workspace/checkpoint-complete";

export default async function CheckpointCompletePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;
  return <CheckpointComplete moduleSlug={moduleSlug} />;
}
