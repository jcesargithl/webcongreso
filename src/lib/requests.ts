import "server-only";
import { supabase } from "./supabase";
import { CONGRESS_FILES_BUCKET, categoryLabel, getCategoryForRequest } from "./congress";
import { assertSpeakerEligibility, ValidationError } from "./registration-rules";

export type RequestKind = "registration" | "paper";
export type RequestMode = "Presencial" | "Virtual" | "Híbrido";
export type RequestStatus = "pending" | "reviewing" | "approved" | "rejected" | "cash";
export type PaymentStatus = "pending" | "approved" | "rejected" | "exempt";

export type CongressRequest = {
  id: string;
  kind: RequestKind;
  category?: string | null;
  category_id?: string | null;
  registration_id?: string | null;
  name: string;
  email: string;
  doc_type?: string | null;
  doc_number?: string | null;
  mode: RequestMode;
  institution?: string | null;
  topic?: string | null;
  message?: string | null;
  file_url?: string | null;
  file_path?: string | null;
  receipt_url?: string | null;
  receipt_path?: string | null;
  registration_fee?: number | null;
  institutional_fee?: number | null;
  payment_method?: string | null;
  payment_status?: PaymentStatus | null;
  payment_document_number?: string | null;
  payment_sequence?: string | null;
  payment_amount?: number | null;
  payment_date?: string | null;
  payment_verified_at?: string | null;
  payment_verified_by?: string | null;
  payment_verified_by_email?: string | null;
  payment_notes?: string | null;
  workflow_version?: number;
  status: RequestStatus;
  created_at: string;
};

export type NewCongressRequest = Omit<CongressRequest, "id" | "created_at" | "receipt_url">;

export async function listRequests(): Promise<CongressRequest[]> {
  const { data, error } = await supabase.from("congress_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data as CongressRequest[];
  const paths = [...new Set(rows.flatMap(row => [row.receipt_path, row.file_path].filter((path): path is string => Boolean(path))))];
  if (!paths.length) return rows;
  const { data: urls, error: signingError } = await supabase.storage.from(CONGRESS_FILES_BUCKET).createSignedUrls(paths, 3600);
  if (signingError) throw signingError;
  const signed = new Map((urls || []).map(item => [item.path, item.signedUrl]));
  return rows.map(row => ({
    ...row,
    receipt_url: row.receipt_path ? signed.get(row.receipt_path) || null : row.receipt_url,
    file_url: row.file_path ? signed.get(row.file_path) || null : row.file_url,
  }));
}

export async function getRequest(id: string): Promise<CongressRequest | null> {
  const { data, error } = await supabase.from("congress_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as CongressRequest | null;
}

export async function findRegistrations(email: string, documentType: string, documentNumber: string): Promise<CongressRequest[]> {
  const literalEmail = email.replace(/[\\%_]/g, "\\$&");
  const { data, error } = await supabase.from("congress_requests").select("*")
    .eq("kind", "registration").eq("doc_type", documentType).eq("doc_number", documentNumber)
    .ilike("email", literalEmail).order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data as CongressRequest[];
}

export async function createRequest(input: NewCongressRequest): Promise<CongressRequest> {
  const { data, error } = await supabase.from("congress_requests").insert({ ...input, workflow_version: 2 }).select().single();
  if (error) throw error;
  return data as CongressRequest;
}

export async function updateRequestStatus(id: string, status: RequestStatus): Promise<CongressRequest> {
  const existing = await getRequest(id);
  if (!existing) throw new ValidationError("Solicitud no encontrada.", 404);
  const category = getCategoryForRequest(existing);
  if (status === "approved" && existing.kind === "registration" && (!category || (category.fee > 0 && existing.payment_status !== "approved"))) {
    throw new ValidationError("Primero valida el pago y la categoría de esta inscripción.", 409);
  }
  if (status === "approved" && existing.kind === "paper" && existing.workflow_version === 2) {
    assertSpeakerEligibility(existing.registration_id ? await getRequest(existing.registration_id) : null);
  }
  const { data, error } = await supabase.from("congress_requests").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data as CongressRequest;
}

export async function reviewPayment(id: string, decision: "approved" | "rejected", administratorId: string, administratorEmail: string, notes: string): Promise<CongressRequest> {
  const existing = await getRequest(id);
  if (!existing || existing.kind !== "registration") throw new ValidationError("Inscripción no encontrada.", 404);
  const category = getCategoryForRequest(existing);
  if (!category || category.fee === 0) throw new ValidationError("Esta inscripción no requiere validar un pago.");
  if (decision === "approved" && (!existing.receipt_path || !existing.payment_sequence || existing.payment_amount == null || !existing.payment_date || !existing.payment_document_number)) {
    throw new ValidationError("No puedes aprobar el pago sin el comprobante y sus datos completos.");
  }
  const { data, error } = await supabase.from("congress_requests").update({
    payment_status: decision,
    payment_verified_at: new Date().toISOString(),
    payment_verified_by: administratorId,
    payment_verified_by_email: administratorEmail,
    payment_notes: notes || null,
    status: decision === "approved" ? "approved" : "rejected",
  }).eq("id", id).select().single();
  if (error) throw error;
  return data as CongressRequest;
}

export async function assignLegacyCategory(id: string, categoryId: string): Promise<CongressRequest> {
  const existing = await getRequest(id);
  const category = getCategoryForRequest({ category_id: categoryId });
  if (!existing || existing.kind !== "registration" || !category) throw new ValidationError("Categoría o inscripción inválida.");
  if (existing.workflow_version === 2) throw new ValidationError("La categoría de una inscripción nueva no se puede cambiar.");
  const { data, error } = await supabase.from("congress_requests").update({
    category_id: category.id,
    category: categoryLabel(category),
    mode: category.mode,
    registration_fee: category.fee,
    institutional_fee: 0,
    payment_status: category.fee === 0 ? "exempt" : ["approved", "cash"].includes(existing.status) ? "approved" : "pending",
  }).eq("id", id).select().single();
  if (error) throw error;
  return data as CongressRequest;
}
