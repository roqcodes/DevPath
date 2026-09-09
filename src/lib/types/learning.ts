import type { DevOpsTopic } from "@/lib/data/devops-topics";

export type ModuleStatus = "locked" | "in_progress" | "completed" | "available";

export interface Checkpoint {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
}

export interface LearningModule {
  id: string;
  topic: DevOpsTopic;
  title: string;
  description: string;
  order: number;
  status: ModuleStatus;
  progress: number;
  checkpointCount: number;
  checkpoints: Checkpoint[];
}

export interface LearningPath {
  id: string;
  userId: string;
  overallProgress: number;
  currentModuleId: string;
  modules: LearningModule[];
  streak: number;
  createdAt: string;
}
