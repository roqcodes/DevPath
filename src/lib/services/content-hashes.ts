import { createAdminClient } from "@/lib/supabase/admin";
import { hashQuestionContent } from "@/lib/questions/content-hash";
import { listPublishedPackages } from "@/lib/questions/published-meta";

export async function getExistingContentHashes(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin.from("problems").select("id, content_hash");
    for (const row of data ?? []) {
      if (row.content_hash) map.set(row.id, row.content_hash);
    }
  }
  for (const q of listPublishedPackages()) {
    if (!map.has(q.id)) map.set(q.id, hashQuestionContent(q));
  }
  return map;
}
