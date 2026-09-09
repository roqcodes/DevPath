import { WorkspaceView } from "@/components/workspace/workspace-view";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;
  return <WorkspaceView moduleSlug={moduleSlug} />;
}
