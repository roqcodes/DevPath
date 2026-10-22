import "server-only";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import type { QuestionPackage } from "./types";
import { validateQuestionPackage } from "./validate";
import { listPublishedPackages, getPublishedPackage } from "./published-meta";
import { toPublicView } from "./public-view";

const BANK_ROOT = join(process.cwd(), "question-bank");

function walkJsonFiles(dir: string, acc: string[] = []): string[] {
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walkJsonFiles(full, acc);
      } else if (
        entry.endsWith(".json") &&
        entry !== "question-template.json" &&
        entry !== "manifest.json" &&
        entry !== "question.schema.json"
      ) {
        acc.push(full);
      }
    }
  } catch {
    return acc;
  }
  return acc;
}

let diskCache: QuestionPackage[] | null = null;

export function loadQuestionBankFromDisk(): QuestionPackage[] {
  if (diskCache) return diskCache;
  const files = walkJsonFiles(BANK_ROOT);
  if (files.length === 0) return listPublishedPackages();
  const items: QuestionPackage[] = [];
  for (const file of files) {
    try {
      const raw = JSON.parse(readFileSync(file, "utf8")) as unknown;
      const { valid, question, issues } = validateQuestionPackage(raw);
      if (!valid || !question) {
        console.warn(`[question-bank] skip ${relative(BANK_ROOT, file)}`, issues);
        continue;
      }
      items.push(question);
    } catch (e) {
      console.warn(`[question-bank] parse error ${file}`, e);
    }
  }
  diskCache = items.length ? items : listPublishedPackages();
  return diskCache;
}

export function getQuestionFromDisk(id: string): QuestionPackage | undefined {
  return loadQuestionBankFromDisk().find((q) => q.id === id) ?? getPublishedPackage(id);
}

export function listPublishedFromDisk(): QuestionPackage[] {
  return loadQuestionBankFromDisk().filter((q) => q.status === "published");
}

export { toPublicView };
