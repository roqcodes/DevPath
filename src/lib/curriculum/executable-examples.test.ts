import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { EXECUTABLE_EXAMPLES } from "./executable-examples";

describe("executable example registry", () => {
  it("registry entries are well-formed", () => {
    assert.ok(EXECUTABLE_EXAMPLES.length >= 1);
    for (const ex of EXECUTABLE_EXAMPLES) {
      assert.ok(ex.id);
      assert.ok(ex.lessonId);
      assert.equal(ex.language, "python");
      assert.ok(ex.code.trim().length > 0);
    }
  });

  it("runs Python examples when interpreter available", () => {
    const py = spawnSync("python", ["--version"], { encoding: "utf8" });
    const py3 = spawnSync("python3", ["--version"], { encoding: "utf8" });
    const bin = py.status === 0 ? "python" : py3.status === 0 ? "python3" : null;
    if (!bin) {
      console.log("SKIP: no python on PATH — examples statically reviewed only");
      return;
    }

    for (const ex of EXECUTABLE_EXAMPLES) {
      const stdin = ex.id === "array-sum-ref" ? "3\n1 2 3" : "";
      const run: ReturnType<typeof spawnSync> = spawnSync(bin, ["-c", ex.code], {
        input: stdin,
        encoding: "utf8",
        timeout: 5000,
      });
      assert.equal(run.status, 0, `example ${ex.id} failed: ${run.stderr}`);
      const out = String(run.stdout ?? "").trim();
      assert.equal(out, ex.expectedStdout.trim(), ex.id);
    }
  });
});
