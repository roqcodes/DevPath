import { NextResponse } from "next/server";
import JSZip from "jszip";
import { isImportAdmin } from "@/lib/auth/admin";
import { previewImport } from "@/lib/services/import-pipeline";
import { validateQuestionPackage } from "@/lib/questions/validate";
import type { QuestionPackage } from "@/lib/questions/types";

const MAX_ZIP_BYTES = 5 * 1024 * 1024;

async function parseBody(request: Request): Promise<{ name: string; content: unknown }[]> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    if (body.files && Array.isArray(body.files)) {
      return body.files as { name: string; content: unknown }[];
    }
    if (body.content) {
      return [{ name: body.name ?? "question.json", content: body.content }];
    }
    return [];
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const files: { name: string; content: unknown }[] = [];
    const zip = form.get("package");
    if (zip instanceof File) {
      const buf = await zip.arrayBuffer();
      if (buf.byteLength > MAX_ZIP_BYTES) throw new Error("ZIP too large");
      const archive = await JSZip.loadAsync(buf);
      for (const [path, entry] of Object.entries(archive.files)) {
        if (entry.dir || !path.endsWith(".json")) continue;
        if (path.includes("..")) continue;
        const text = await entry.async("string");
        files.push({ name: path, content: JSON.parse(text) });
      }
      return files;
    }
    const single = form.get("file");
    if (single instanceof File) {
      const text = await single.text();
      return [{ name: single.name, content: JSON.parse(text) }];
    }
  }

  return [];
}

export async function POST(request: Request) {
  if (!(await isImportAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const files = await parseBody(request);
    if (!files.length) {
      return NextResponse.json({ error: "No question files found" }, { status: 400 });
    }

    const verifyReferences = request.headers.get("x-verify-references") === "true";
    const report = await previewImport(files, { verifyReferences });

    const packages: QuestionPackage[] = [];
    for (const f of files) {
      const { valid, question } = validateQuestionPackage(f.content);
      if (valid && question) packages.push(question);
    }

    return NextResponse.json({ report, packages: packages.map((p) => ({ id: p.id, title: p.title, status: p.status })) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Import failed" },
      { status: 400 }
    );
  }
}
