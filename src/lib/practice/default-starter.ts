import type { SupportedLanguage } from "@/lib/questions/types";

export const DEFAULT_STARTER: Record<SupportedLanguage, string> = {
  python: "# Read from stdin, write to stdout\nimport sys\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}\n",
  java: "import java.util.*;\nimport java.io.*;\n\npublic class Main {\n  public static void main(String[] args) throws Exception {\n  }\n}\n",
};

export function starterForLanguage(language: SupportedLanguage, override?: string): string {
  return override ?? DEFAULT_STARTER[language] ?? "";
}
