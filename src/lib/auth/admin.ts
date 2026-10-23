import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "./session";

export async function isImportAdmin(request: Request): Promise<boolean> {
  const adminKey = process.env.SAIT_ADMIN_IMPORT_KEY;
  const auth = request.headers.get("authorization");
  if (adminKey && auth === `Bearer ${adminKey}`) return true;

  const user = await getSessionUser();
  if (!user) return false;

  const admin = createAdminClient();
  if (!admin) return false;

  const { data } = await admin.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  return Boolean(data?.role);
}
