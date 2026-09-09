import { QuizView } from "@/components/workspace/quiz-view";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;
  return <QuizView moduleSlug={moduleSlug} />;
}
