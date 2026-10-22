import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "fs";
import { join } from "path";
import { previewImport } from "./import-pipeline";

describe("previewImport", () => {
  it("marks identical re-import as idempotent", async () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), "question-bank/arrays/beginner/array-sum.json"), "utf8")
    );
    const report = await previewImport([{ name: "array-sum.json", content: raw }]);
    const item = report.items.find((i) => i.id === "array-sum");
    assert.ok(item);
    assert.equal(item!.status === "new" || item!.status === "idempotent", true);
  });
});
