const RAPIDAPI_DEFAULT_URL = "https://judge0-ce.p.rapidapi.com";
const RAPIDAPI_DEFAULT_HOST = "judge0-ce.p.rapidapi.com";

export interface Judge0Config {
  baseUrl: string;
  apiKey: string;
  rapidApiHost: string | null;
}

export function getJudge0Config(): Judge0Config | null {
  const apiKey = process.env.JUDGE0_RAPIDAPI_KEY ?? process.env.JUDGE0_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (process.env.JUDGE0_API_URL ?? RAPIDAPI_DEFAULT_URL).replace(/\/$/, "");
  const useRapid =
    baseUrl.includes("rapidapi.com") ||
    Boolean(process.env.JUDGE0_RAPIDAPI_KEY) ||
    !process.env.JUDGE0_API_URL;

  return {
    baseUrl,
    apiKey,
    rapidApiHost: useRapid
      ? process.env.JUDGE0_RAPIDAPI_HOST ?? RAPIDAPI_DEFAULT_HOST
      : null,
  };
}

interface Judge0Status {
  id: number;
  description?: string;
}

export interface Judge0SubmissionResult {
  token?: string;
  status?: Judge0Status;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
}

function judgeHeaders(config: Judge0Config): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.rapidApiHost) {
    headers["X-RapidAPI-Key"] = config.apiKey;
    headers["X-RapidAPI-Host"] = config.rapidApiHost;
  } else {
    headers["X-Auth-Token"] = config.apiKey;
  }
  return headers;
}

function b64(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

function decodeMaybeB64(value: string | null | undefined, base64Encoded: boolean): string {
  if (value == null) return "";
  if (!base64Encoded) return value;
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return value;
  }
}

export async function runJudge0Submission(
  config: Judge0Config,
  options: {
    sourceCode: string;
    languageId: number;
    stdin: string;
    expectedOutput: string;
    cpuTimeLimitSec: number;
    memoryLimitKb: number;
  }
): Promise<Judge0SubmissionResult> {
  const params = new URLSearchParams({
    base64_encoded: "true",
    wait: "false",
  });

  const body = {
    source_code: b64(options.sourceCode),
    language_id: options.languageId,
    stdin: b64(options.stdin),
    expected_output: b64(options.expectedOutput),
    cpu_time_limit: options.cpuTimeLimitSec,
    memory_limit: options.memoryLimitKb,
  };

  const createRes = await fetch(`${config.baseUrl}/submissions?${params}`, {
    method: "POST",
    headers: judgeHeaders(config),
    body: JSON.stringify(body),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Judge0 create failed (${createRes.status}): ${text.slice(0, 200)}`);
  }

  const created = (await createRes.json()) as Judge0SubmissionResult;
  const token = created.token;
  if (!token) {
    throw new Error("Judge0 did not return a submission token");
  }

  const pollParams = new URLSearchParams({
    base64_encoded: "true",
    fields: "status,stdout,stderr,compile_output,message,time,memory",
  });

  for (let attempt = 0; attempt < 40; attempt++) {
    await sleep(attempt < 5 ? 300 : 600);
    const pollRes = await fetch(`${config.baseUrl}/submissions/${token}?${pollParams}`, {
      headers: judgeHeaders(config),
    });
    if (!pollRes.ok) {
      const text = await pollRes.text();
      throw new Error(`Judge0 poll failed (${pollRes.status}): ${text.slice(0, 200)}`);
    }
    const result = (await pollRes.json()) as Judge0SubmissionResult;
    const statusId = result.status?.id;
    if (statusId !== 1 && statusId !== 2) {
      return {
        ...result,
        stdout: decodeMaybeB64(result.stdout ?? undefined, true),
        stderr: decodeMaybeB64(result.stderr ?? undefined, true),
        compile_output: decodeMaybeB64(result.compile_output ?? undefined, true),
      };
    }
  }

  throw new Error("Judge0 submission timed out while processing");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Judge0 status IDs: https://ce.judge0.com/#statuses-and-languages */
export function mapJudge0StatusId(statusId: number): {
  passed: boolean;
  verdict:
    | "accepted"
    | "wrong_answer"
    | "runtime_error"
    | "time_limit"
    | "compile_error"
    | "pending";
} {
  if (statusId === 3) return { passed: true, verdict: "accepted" };
  if (statusId === 4) return { passed: false, verdict: "wrong_answer" };
  if (statusId === 5) return { passed: false, verdict: "time_limit" };
  if (statusId === 6) return { passed: false, verdict: "compile_error" };
  if (statusId >= 7 && statusId <= 12) return { passed: false, verdict: "runtime_error" };
  if (statusId === 1 || statusId === 2) return { passed: false, verdict: "pending" };
  return { passed: false, verdict: "runtime_error" };
}

export function mapLanguageToJudge0(language: string): number {
  const map: Record<string, number> = {
    python: 71,
    javascript: 63,
    cpp: 54,
    java: 62,
  };
  return map[language] ?? 71;
}
