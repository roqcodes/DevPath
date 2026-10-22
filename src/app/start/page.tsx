import type { Metadata } from "next";
import { StartFlow } from "./start-flow";

export const metadata: Metadata = {
  title: "Start · DevPath",
  description: "Answer four quick questions and get a personalized DSA learning path.",
};

export default function StartPage() {
  return <StartFlow />;
}
