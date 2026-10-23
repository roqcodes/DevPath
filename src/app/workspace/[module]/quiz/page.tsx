import { redirect } from "next/navigation";

export default async function WorkspaceQuizRedirect({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;
  redirect(`/learn/${moduleSlug}`);
}
