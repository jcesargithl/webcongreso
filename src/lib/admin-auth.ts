import "server-only";
import { supabase } from "./supabase";

export async function verifyAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const { data: { user }, error } = await supabase.auth.getUser(authorization.slice(7));
  if (error || !user) return null;
  const emails = (process.env.ADMIN_EMAILS || "").split(",").map(email => email.trim().toLowerCase()).filter(Boolean);
  return user.email && emails.includes(user.email.toLowerCase()) ? user : null;
}
