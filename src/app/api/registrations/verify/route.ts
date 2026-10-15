import { findRegistrations } from "@/lib/requests";
import { assertSpeakerEligibility, normalizeDocument, normalizeEmail, ValidationError } from "@/lib/registration-rules";
import { categoryLabel, getCategoryForRequest } from "@/lib/congress";
import { issueVerificationToken } from "@/lib/paper-verification";
import { errorResponse } from "@/lib/api-errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = await request.json().catch(() => null);
    if (!input || typeof input.email !== "string" || typeof input.doc_type !== "string" || typeof input.doc_number !== "string") {
      throw new ValidationError("Ingresa el correo y el documento usados en tu inscripción.");
    }
    const email = normalizeEmail(input.email);
    const documentNumber = normalizeDocument(input.doc_number);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["DNI", "CE", "Pasaporte", "Otro"].includes(input.doc_type) || !documentNumber || documentNumber.length > 30) {
      throw new ValidationError("Revisa el correo y el documento de tu inscripción.");
    }
    const registrations = await findRegistrations(email, input.doc_type, documentNumber);
    const speakers = registrations.filter(row => getCategoryForRequest(row)?.speaker);
    const registration = speakers.find(row => row.status !== "rejected" && (getCategoryForRequest(row)?.fee === 0 || row.payment_status === "approved")) || speakers[0] || registrations[0] || null;
    const category = assertSpeakerEligibility(registration);
    if (!registration) throw new ValidationError("Inscripción no encontrada.", 404);
    return Response.json({
      token: issueVerificationToken(registration),
      registration: {
        id: registration.id, name: registration.name, email: registration.email,
        doc_type: registration.doc_type, doc_number: registration.doc_number,
        institution: registration.institution || "", category: categoryLabel(category),
        category_id: category.id, mode: category.mode,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
