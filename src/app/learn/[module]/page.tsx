import { redirect } from "next/navigation";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;
  redirect(`/workspace/${moduleSlug}`);
}
