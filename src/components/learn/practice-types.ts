export type PracticeItemKind = "mcq" | "predict" | "order" | "fill";

export interface PracticeItemBase {
  id: string;
  kind: PracticeItemKind;
  topic: string;
  prompt: string;
  hint?: string;
}

export interface McqItem extends PracticeItemBase {
  kind: "mcq";
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation: string;
}

export interface PredictItem extends PracticeItemBase {
  kind: "predict";
  code: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation: string;
}

export interface OrderItem extends PracticeItemBase {
  kind: "order";
  steps: string[];
  /** correct order as indices into steps */
  correctOrder: number[];
  explanation: string;
}

export interface FillItem extends PracticeItemBase {
  kind: "fill";
  template: string;
  blankLabel: string;
  acceptedAnswers: string[];
  explanation: string;
}

export type PracticeItem = McqItem | PredictItem | OrderItem | FillItem;
