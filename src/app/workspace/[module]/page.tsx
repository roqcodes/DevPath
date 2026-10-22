import { redirect } from "next/navigation";

export default async function WorkspaceRedirect({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;
  redirect(`/learn/${moduleSlug}`);
}
