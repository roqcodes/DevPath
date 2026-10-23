import { redirect } from "next/navigation";

export default async function WorkspaceCompleteRedirect({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;
  redirect(`/learn/${moduleSlug}`);
}
