import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { CongressRequest } from "./requests";
import { ValidationError } from "./registration-rules";

type VerificationClaims = { id: string; email: string; documentType: string; documentNumber: string; expires: number };

function signingKey(): string {
  const key = process.env.PAPER_VERIFICATION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key === "placeholder-key") throw new Error("Falta la clave de verificación de ponencias.");
  return key;
}

export function issueVerificationToken(registration: CongressRequest): string {
  const claims: VerificationClaims = {
    id: registration.id, email: registration.email.toLowerCase(),
    documentType: registration.doc_type || "", documentNumber: registration.doc_number || "",
    expires: Date.now() + 15 * 60 * 1000,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return payload + "." + createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export function readVerificationToken(token: string): VerificationClaims {
  try {
    if (token.length > 2048) throw new Error("Token inválido");
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) throw new Error("Token inválido");
    const expected = createHmac("sha256", signingKey()).update(payload).digest();
    const supplied = Buffer.from(signature, "base64url");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new Error("Firma inválida");
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as VerificationClaims;
    if (typeof claims.id !== "string" || typeof claims.email !== "string" || typeof claims.documentType !== "string" ||
        typeof claims.documentNumber !== "string" || typeof claims.expires !== "number" || claims.expires <= Date.now()) throw new Error("Token expirado");
    return claims;
  } catch {
    throw new ValidationError("La verificación venció o no es válida. Vuelve a verificar tu inscripción.", 403);
  }
}
