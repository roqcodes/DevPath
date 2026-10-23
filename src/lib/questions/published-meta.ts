import type { DifficultyLabel } from "./difficulty-config";
import type { QuestionPackage } from "./types";
import arraySum from "../../../question-bank/arrays/beginner/array-sum.json";
import twoSum from "../../../question-bank/arrays/easy/two-sum.json";
import reverseString from "../../../question-bank/strings/beginner/reverse-string.json";
import charFrequency from "../../../question-bank/hashing/easy/char-frequency.json";
import binarySearch from "../../../question-bank/searching-sorting/intermediate/binary-search-index.json";
import validParentheses from "../../../question-bank/stacks/easy/valid-parentheses.json";
import maxSubarray from "../../../question-bank/dynamic-programming/intermediate/max-subarray.json";
import factorialN from "../../../question-bank/recursion/beginner/factorial-n.json";
import simulateQueue from "../../../question-bank/stacks/easy/simulate-queue.json";
import sortedTwoSum from "../../../question-bank/two-pointers/intermediate/sorted-two-sum.json";
import listMaxValue from "../../../question-bank/linked-lists/beginner/list-max-value.json";
import { validateQuestionPackage } from "./validate";
import { toPublicView } from "./public-view";

const RAW: unknown[] = [
  arraySum,
  twoSum,
  reverseString,
  charFrequency,
  binarySearch,
  validParentheses,
  maxSubarray,
  factorialN,
  simulateQueue,
  sortedTwoSum,
  listMaxValue,
];

function load(): QuestionPackage[] {
  const out: QuestionPackage[] = [];
  for (const raw of RAW) {
    const { valid, question } = validateQuestionPackage(raw);
    if (valid && question) out.push(question);
  }
  return out;
}

export const PUBLISHED_QUESTIONS: QuestionPackage[] = load();

export const DIFFICULTY_BY_PROBLEM_ID: Record<string, { label: DifficultyLabel; score: number }> =
  Object.fromEntries(PUBLISHED_QUESTIONS.map((q) => [q.id, q.difficulty]));

export function listPublishedPackages(): QuestionPackage[] {
  return PUBLISHED_QUESTIONS.filter((q) => q.status === "published");
}

export function getPublishedPackage(id: string): QuestionPackage | undefined {
  return PUBLISHED_QUESTIONS.find((q) => q.id === id);
}

export { toPublicView };
