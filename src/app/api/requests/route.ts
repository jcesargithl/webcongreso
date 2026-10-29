import { randomUUID } from "node:crypto";
import { createRequest, listRequests, updateRequestStatus, reviewPayment, assignLegacyCategory, getRequest, type NewCongressRequest, type RequestStatus } from "@/lib/requests";
import { supabase } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/admin-auth";
import { getCategory, categoryLabel, getInstitutionalFee, getRegistrationTotal, CONGRESS_FILES_BUCKET, RECEIPT_MAX_BYTES, PAPER_MAX_BYTES } from "@/lib/congress";
import { assertSpeakerEligibility, normalizeDocument, normalizeEmail, validatePayment, validatePdf, ValidationError } from "@/lib/registration-rules";
import { readVerificationToken } from "@/lib/paper-verification";
import { errorResponse } from "@/lib/api-errors";
import { queueRequestEmail, sendRequestEmail } from "@/lib/email";

export const runtime = "nodejs";
const statuses: RequestStatus[] = ["pending", "reviewing", "approved", "rejected"];

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

async function uploadPdf(file: File, prefix: "papers" | "receipts"): Promise<string> {
  const path = prefix + "/" + randomUUID() + ".pdf";
  const { error } = await supabase.storage.from(CONGRESS_FILES_BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: "application/pdf", upsert: false });
  if (error) throw error;
  return path;
}

export async function GET(request: Request) {
  try {
    if (!await verifyAdmin(request)) return Response.json({ error: "No autorizado" }, { status: 401 });
    return Response.json(await listRequests(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  const uploaded: string[] = [];
  const startedAt = performance.now();
  const timings: Record<string, number> = {};
  async function measure<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const stageStartedAt = performance.now();
    try { return await operation(); }
    finally { timings[name] = performance.now() - stageStartedAt; }
  }
  function timingHeaders() {
    return {
      "Server-Timing": Object.entries({ ...timings, total: performance.now() - startedAt })
        .map(([name, duration]) => name + ";dur=" + duration.toFixed(1)).join(", "),
    };
  }
  try {
    const form = await measure("form", () => request.formData()).catch(() => { throw new ValidationError("El formulario no es válido."); });
    const kind = field(form, "kind");
    let input: NewCongressRequest;
    if (kind === "registration") {
      const category = getCategory(field(form, "category_id"));
      if (!category) throw new ValidationError("Selecciona una tarjeta de inscripción válida.");
      const name = field(form, "name");
      const email = normalizeEmail(field(form, "email"));
      const documentType = field(form, "doc_type");
      const documentNumber = normalizeDocument(field(form, "doc_number"));
      const institution = field(form, "institution");
      if (name.length < 2 || name.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320 ||
          !["DNI", "CE", "Pasaporte", "Otro"].includes(documentType) || !documentNumber || documentNumber.length > 30 || institution.length > 240) {
        throw new ValidationError("Revisa tu nombre, correo y documento de identidad.");
      }
      if (documentType === "DNI" && !/^\d{8}$/.test(documentNumber)) throw new ValidationError("El DNI debe tener 8 dígitos.");
      const { data: duplicate, error: duplicateError } = await supabase.from("congress_requests").select("id")
        .eq("kind", "registration").eq("doc_type", documentType).eq("doc_number", documentNumber).limit(1).maybeSingle();
      if (duplicateError) throw duplicateError;
      if (duplicate) throw new ValidationError("Ya tienes una inscripción con este documento. Contacta a la Secretaría si necesitas actualizarla.", 409);
      input = {
        kind, name, email, doc_type: documentType, doc_number: documentNumber, institution,
        category_id: category.id, category: categoryLabel(category), mode: category.mode,
        registration_fee: category.fee, institutional_fee: getInstitutionalFee(category),
        status: category.fee === 0 ? "approved" : "reviewing",
        payment_status: category.fee === 0 ? "exempt" : "pending",
      };
      if (category.fee > 0) {
        const payment = validatePayment({
          sequence: field(form, "payment_sequence"), amount: field(form, "payment_amount"),
          date: field(form, "payment_date"), documentNumber: field(form, "payment_document_number"),
          method: field(form, "payment_method"),
        }, category);
        const rawReceipt = form.get("receipt");
        const receipt = await validatePdf(rawReceipt instanceof File ? rawReceipt : null, RECEIPT_MAX_BYTES, "el comprobante");
        const { data: usedReceipt, error: receiptError } = await supabase.from("congress_requests").select("id")
          .eq("kind", "registration").eq("payment_sequence", payment.sequence).eq("payment_date", payment.date).limit(1).maybeSingle();
        if (receiptError) throw receiptError;
        if (usedReceipt) throw new ValidationError("Este comprobante ya fue utilizado en otra inscripción.", 409);
        const path = await measure("storage", () => uploadPdf(receipt, "receipts"));
        uploaded.push(path);
        Object.assign(input, {
          payment_method: "pagalo_pe", payment_sequence: payment.sequence, payment_amount: payment.amount,
          payment_date: payment.date, payment_document_number: payment.documentNumber, receipt_path: path,
        });
        if (payment.amount !== getRegistrationTotal(category)) throw new ValidationError("El monto del comprobante no coincide con la tarifa.");
      }
    } else if (kind === "paper") {
      const claims = readVerificationToken(field(form, "verification_token"));
      const registration = await measure("registration", () => getRequest(claims.id));
      const category = assertSpeakerEligibility(registration);
      if (!registration || registration.email.toLowerCase() !== claims.email || registration.doc_type !== claims.documentType || registration.doc_number !== claims.documentNumber) {
        throw new ValidationError("Tu inscripción cambió. Vuelve a verificarla.", 403);
      }
      const topic = field(form, "topic");
      const message = field(form, "message");
      if (!topic || topic.length > 300 || message.length > 10000) throw new ValidationError("Ingresa un título válido y un resumen de hasta 10 000 caracteres.");
      const rawPaper = form.get("file");
      const paper = await validatePdf(rawPaper instanceof File ? rawPaper : null, PAPER_MAX_BYTES, "la investigación");
      const path = await measure("storage", () => uploadPdf(paper, "papers"));
      uploaded.push(path);
      input = {
        kind, registration_id: registration.id, category_id: category.id, category: categoryLabel(category),
        name: registration.name, email: registration.email, doc_type: registration.doc_type, doc_number: registration.doc_number,
        institution: registration.institution, mode: category.mode, topic, message, file_path: path,
        registration_fee: 0, institutional_fee: 0, payment_status: "exempt", status: "reviewing",
      };
    } else throw new ValidationError("Tipo de solicitud inválido.");
    const created = await measure("database", () => createRequest(input));
    const emailStatus = queueRequestEmail(created);
    const headers = timingHeaders();
    console.info("Solicitud del congreso guardada:", { requestId: created.id, kind: created.kind, timings: headers["Server-Timing"] });
    return Response.json({
      id: created.id, kind: created.kind, status: created.status, payment_status: created.payment_status,
      email_sent: emailStatus === "pending" ? null : false, email_status: emailStatus,
    }, { status: 201, headers });
  } catch (error) {
    if (uploaded.length) {
      const { error: cleanupError } = await supabase.storage.from(CONGRESS_FILES_BUCKET).remove(uploaded);
      if (cleanupError) console.error("No se pudo eliminar un archivo de la solicitud fallida:", cleanupError);
    }
    const response = errorResponse(error);
    response.headers.set("Server-Timing", timingHeaders()["Server-Timing"]);
    return response;
  }
}

export async function PATCH(request: Request) {
  try {
    const administrator = await verifyAdmin(request);
    if (!administrator) return Response.json({ error: "No autorizado" }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (!body || typeof body.id !== "string" || !body.id.trim() || body.id.length > 128) throw new ValidationError("Solicitud de actualización inválida.");
    if (body.action === "resend_notification") {
      const existing = await getRequest(body.id);
      if (!existing) throw new ValidationError("Solicitud no encontrada.", 404);
      const emailSent = await sendRequestEmail(existing, "status_updated");
      return Response.json({ ...existing, email_sent: emailSent });
    }
    if (body.action === "review_payment") {
      if (!["approved", "rejected"].includes(body.decision) || (body.notes != null && (typeof body.notes !== "string" || body.notes.length > 2000))) {
        throw new ValidationError("La decisión de pago no es válida.");
      }
      const notes = (body.notes || "").trim();
      const previous = await getRequest(body.id);
      const changed = previous?.payment_status !== body.decision || previous?.status !== body.decision || (previous?.payment_notes || "") !== notes;
      const updated = await reviewPayment(body.id, body.decision, administrator.id, administrator.email || "", notes);
      const emailSent = changed ? await sendRequestEmail(updated, "payment_reviewed") : null;
      return Response.json({ ...updated, email_sent: emailSent });
    }
    if (body.action === "assign_category") {
      if (typeof body.category_id !== "string" || !getCategory(body.category_id)) throw new ValidationError("Categoría inválida.");
      return Response.json(await assignLegacyCategory(body.id, body.category_id));
    }
    if (!statuses.includes(body.status)) throw new ValidationError("Estado inválido.");
    const previousStatus = (await getRequest(body.id))?.status;
    const updated = await updateRequestStatus(body.id, body.status);
    const emailSent = previousStatus !== updated.status ? await sendRequestEmail(updated, "status_updated") : null;
    return Response.json({ ...updated, email_sent: emailSent });
  } catch (error) { return errorResponse(error); }
}
