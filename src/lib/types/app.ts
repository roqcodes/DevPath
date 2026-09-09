export type SkillDomain = "git" | "docker" | "ci_cd" | "testing" | "deployment";

export type CheckpointStatus = "completed" | "current" | "locked" | "available";

export type SkillLevel = "mastered" | "learning" | "needs_practice" | "locked";

export type ReadinessLevel = "Beginner" | "Intermediate" | "Advanced";

export interface SkillScore {
  domain: SkillDomain;
  label: string;
  score: number;
}

export interface UserData {
  name: string;
  email: string;
  role: string;
  learningGoal: string;
  interests: SkillDomain[];
  duration: string;
  dailyCommitment: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  domain: SkillDomain;
  difficulty: "easy" | "medium" | "hard";
}

export interface AssessmentResult {
  skills: SkillScore[];
  overallReadiness: ReadinessLevel;
  summary: string;
  completedAt: string;
}

export interface JourneyCheckpoint {
  id: string;
  title: string;
  description: string;
  domain: SkillDomain;
  status: CheckpointStatus;
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: "lesson" | "quiz" | "practice";
  moduleSlug: string;
}

export interface JourneyPhase {
  id: string;
  number: number;
  title: string;
  domain: SkillDomain;
  checkpoints: JourneyCheckpoint[];
}

export interface JourneyData {
  title: string;
  durationDays: number;
  progress: number;
  phases: JourneyPhase[];
  currentCheckpointId: string;
  estimatedCompletion: string;
}

export interface SkillNode {
  id: string;
  label: string;
  domain: SkillDomain;
  status: SkillLevel;
  score?: number;
  checkpointsCompleted?: number;
  children?: SkillNode[];
}

export interface LearningIntelligence {
  readinessScore: number;
  journeyProgress: number;
  streak: number;
  daysRemaining: number;
  competencyLevel: string;
  paceMessage: string;
  xp: number;
}

export interface AILearningPlan {
  priorities: string[];
  insight: string;
}

export interface JourneyAIInsight {
  message: string;
  recommendedCheckpointSlug: string;
  recommendedTitle: string;
}

export interface MentorHint {
  id: number;
  text: string;
}

export interface MentorContext {
  moduleTitle: string;
  checkpointTitle: string;
  task: string;
  intro: string;
  hints: MentorHint[];
  solution: string;
}

export interface WorkspaceCheckpoint {
  id: string;
  moduleSlug: string;
  moduleTitle: string;
  domain: SkillDomain;
  title: string;
  checkpointIndex: number;
  totalCheckpoints: number;
  lesson: {
    content: string;
    diagram?: string;
  };
  codeExample?: string;
  terminalOutput?: string;
  challenge?: {
    instruction: string;
    expectedCommand: string;
    successMessage: string;
  };
  type: "lesson" | "quiz" | "practice";
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ProjectStage {
  id: string;
  title: string;
  objective: string;
  requirements: string[];
  completed: boolean;
}

export interface ProjectData {
  title: string;
  description: string;
  stages: ProjectStage[];
  progress: number;
  completedStages: number;
  totalStages: number;
}

export interface CertificateData {
  recipientName: string;
  title: string;
  completedDomains: string[];
  finalProjectPassed: boolean;
  score: number;
  certificateId: string;
  issueDate: string;
}

export interface AppProgress {
  onboardingComplete: boolean;
  assessmentComplete: boolean;
  preferencesComplete: boolean;
  journeyGenerated: boolean;
  completedCheckpoints: string[];
  currentCheckpointId: string;
  hintsUsed: Record<string, number>;
  quizScores: Record<string, number>;
  projectStagesCompleted: string[];
  projectComplete: boolean;
  certificateEarned: boolean;
  xp: number;
  readinessScore: number;
  streak: number;
  daysRemaining: number;
}

export interface AppState {
  user: UserData;
  assessmentAnswers: Record<string, number>;
  assessmentResult: AssessmentResult | null;
  journey: JourneyData | null;
  progress: AppProgress;
}
