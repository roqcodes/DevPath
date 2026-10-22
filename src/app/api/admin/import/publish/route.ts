import { NextResponse } from "next/server";
import { isImportAdmin } from "@/lib/auth/admin";
import { publishImportItems } from "@/lib/services/import-pipeline";
import { validateQuestionPackage } from "@/lib/questions/validate";
import type { QuestionPackage } from "@/lib/questions/types";

export async function POST(request: Request) {
  if (!(await isImportAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const batchId = body.batchId as string;
    const approvedIds = body.approvedIds as string[];
    const files = body.files as { name: string; content: unknown }[];

    if (!batchId || !Array.isArray(approvedIds) || !Array.isArray(files)) {
      return NextResponse.json({ error: "Invalid publish payload" }, { status: 400 });
    }

    const packages: QuestionPackage[] = [];
    for (const f of files) {
      const { valid, question } = validateQuestionPackage(f.content);
      if (valid && question && approvedIds.includes(question.id)) {
        packages.push(question);
      }
    }

    const result = await publishImportItems(batchId, approvedIds, packages);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}
