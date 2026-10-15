import { getCategoryForRequest, getRegistrationTotal, RECEIPT_MAX_BYTES, type RegistrationCategory } from "./congress";
import type { CongressRequest } from "./requests";

export class ValidationError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "ValidationError";
  }
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeDocument(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function assertSpeakerEligibility(registration: CongressRequest | null): RegistrationCategory {
  if (!registration || registration.kind !== "registration") {
    throw new ValidationError("No encontramos una inscripción con esos datos. Inscríbete primero como ponente.", 404);
  }
  const category = getCategoryForRequest(registration);
  if (!category) throw new ValidationError("Tu inscripción no tiene una categoría identificada. Contacta a la Secretaría para actualizarla.", 403);
  if (!category.speaker) throw new ValidationError("Tu inscripción es de asistente. Para enviar una investigación debes estar inscrito como ponente externo, docente EPEP o estudiante ponente EPEP.", 403);
  if (registration.status === "rejected") throw new ValidationError("Tu inscripción fue rechazada. Contacta a la Secretaría.", 403);
  if (category.fee > 0 && registration.payment_status !== "approved") {
    throw new ValidationError("El pago de tu inscripción como ponente externo todavía no está aprobado por un administrador.", 403);
  }
  return category;
}

export function validatePayment(input: { sequence: string; amount: string; date: string; documentNumber: string; method: string }, category: RegistrationCategory) {
  if (input.method !== "pagalo_pe") throw new ValidationError("Confirma que realizaste el pago mediante Págalo.pe.");
  if (!/^\d{6}$/.test(input.sequence)) throw new ValidationError("La secuencia del comprobante debe tener exactamente 6 dígitos.");
  if (!input.documentNumber || input.documentNumber.length > 30) throw new ValidationError("Ingresa el documento que figura en el comprobante.");
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(input.amount)) throw new ValidationError("Ingresa un monto válido con hasta dos decimales.");
  const amount = Number(input.amount.replace(",", "."));
  const expected = getRegistrationTotal(category);
  if (!Number.isFinite(amount) || Math.round(amount * 100) !== Math.round(expected * 100)) {
    throw new ValidationError("El monto total debe ser S/ " + expected.toFixed(2) + ", incluido el cargo institucional.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new ValidationError("Ingresa la fecha del comprobante.");
  const parsedDate = new Date(input.date + "T12:00:00Z");
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== input.date) {
    throw new ValidationError("La fecha del comprobante no es válida.");
  }
  return { sequence: input.sequence, amount, date: input.date, documentNumber: normalizeDocument(input.documentNumber) };
}

export async function validatePdf(file: File | null, maxBytes: number, label: string): Promise<File> {
  if (!file || file.size === 0) throw new ValidationError("Adjunta " + label + " en PDF.");
  if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
    throw new ValidationError("El archivo de " + label + " debe ser un PDF.");
  }
  if ((maxBytes === RECEIPT_MAX_BYTES && file.size >= maxBytes) || file.size > maxBytes) {
    throw new ValidationError(maxBytes === RECEIPT_MAX_BYTES ? "El comprobante debe pesar menos de 2 MB." : "La investigación no puede superar los 10 MB.");
  }
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...header) !== "%PDF-") throw new ValidationError("El archivo de " + label + " no es un PDF válido.");
  return file;
}
