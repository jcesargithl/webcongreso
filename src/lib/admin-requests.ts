import type { CongressRequest, PaymentStatus, RequestStatus } from "./requests";
import { getCategoryForRequest } from "./congress";

export type RequestLookup = ReadonlyMap<string, CongressRequest>;
export type AdminFilters = {
  kind: "all" | CongressRequest["kind"];
  payment: "all" | PaymentStatus;
  status: "all" | RequestStatus;
  category: string;
  query: string;
};
export type AdminSort = "newest" | "oldest" | "name_asc" | "name_desc";
export const defaultAdminFilters: AdminFilters = { kind: "all", payment: "all", status: "all", category: "all", query: "" };
export const requestStatuses: RequestStatus[] = ["pending", "reviewing", "approved", "rejected"];

export function statusLabel(status: RequestStatus, kind: CongressRequest["kind"], compact = false): string {
  if (compact) {
    return {
      pending: kind === "paper" ? "Recibida" : "Pendiente",
      reviewing: kind === "paper" ? "En revisión" : "En validación",
      approved: kind === "paper" ? "Aceptada" : "Confirmada",
      rejected: "Rechazada",
      cash: "Anterior",
    }[status];
  }
  return kind === "paper"
    ? { pending: "Recibida", reviewing: "En revisión académica", approved: "Ponencia aceptada", rejected: "Ponencia rechazada", cash: "Estado anterior" }[status]
    : { pending: "Pendiente", reviewing: "En validación", approved: "Inscripción confirmada", rejected: "Inscripción rechazada", cash: "Pago registrado anteriormente" }[status];
}

export function paymentLabel(status?: PaymentStatus | null, compact = false): string {
  if (!status) return "Sin datos";
  return compact
    ? { pending: "Por validar", approved: "Aprobado", rejected: "Rechazado", exempt: "Exonerado" }[status]
    : { pending: "Pendiente de validación", approved: "Pago aprobado", rejected: "Pago rechazado", exempt: "Exonerado · gratuito" }[status];
}

export function formatTimestamp(value: string, dateOnly = false): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No registrada";
  return date.toLocaleString("es-PE", {
    dateStyle: "medium", ...(dateOnly ? {} : { timeStyle: "short" as const }), timeZone: "America/Lima",
  });
}

export function formatPaymentDate(value?: string | null): string {
  return value ? formatTimestamp(value + "T12:00:00Z", true) : "No registrada";
}

export function registrationFor(request: CongressRequest, lookup: RequestLookup): CongressRequest | undefined {
  if (request.kind === "registration") return request;
  const parent = request.registration_id ? lookup.get(request.registration_id) : undefined;
  return parent?.kind === "registration" ? parent : undefined;
}

export function canApproveRequest(request: CongressRequest, lookup: RequestLookup): boolean {
  const registration = registrationFor(request, lookup);
  const category = getCategoryForRequest(registration || request);
  if (!category) return false;
  if (request.kind === "paper") {
    return Boolean(registration && category.speaker && registration.status !== "rejected"
      && (category.fee === 0 || registration.payment_status === "approved"));
  }
  return category.fee === 0 || request.payment_status === "approved";
}

function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export function filterAdminRequests(
  requests: CongressRequest[], lookup: RequestLookup, filters: AdminFilters, sort: AdminSort,
): CongressRequest[] {
  const terms = normalizeSearch(filters.query).split(/\s+/).filter(Boolean);
  const result = requests.filter(request => {
    const registration = registrationFor(request, lookup);
    if (filters.kind !== "all" && request.kind !== filters.kind) return false;
    if (filters.status !== "all" && request.status !== filters.status) return false;
    if (filters.payment !== "all" && registration?.payment_status !== filters.payment) return false;
    const category = getCategoryForRequest(registration || request);
    if (filters.category !== "all" && category?.id !== filters.category) return false;
    const text = normalizeSearch([
      request.name, request.email, request.doc_number, request.doc_type, request.institution,
      request.category, request.topic, request.payment_sequence, registration?.payment_sequence,
      category?.title, category?.role,
    ].join(" "));
    return terms.every(term => text.includes(term));
  });
  return result.sort((a, b) => {
    const compared = sort === "name_asc" || sort === "name_desc"
      ? a.name.localeCompare(b.name, "es", { sensitivity: "base", numeric: true }) * (sort === "name_desc" ? -1 : 1)
      : ((Date.parse(a.created_at) || 0) - (Date.parse(b.created_at) || 0)) * (sort === "newest" ? -1 : 1);
    return compared || a.id.localeCompare(b.id);
  });
}

export function paginateRequests<T>(rows: T[], requestedPage: number, pageSize: number) {
  const size = Math.max(1, Math.trunc(pageSize) || 10);
  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  const page = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), pageCount);
  const start = (page - 1) * size;
  return { rows: rows.slice(start, start + size), page, pageCount, from: rows.length ? start + 1 : 0, to: Math.min(start + size, rows.length) };
}

function csvCell(value: unknown): string {
  let text = String(value ?? "");
  // Avoid spreadsheet formulas from participant-controlled values.
  if (/^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

export function buildRequestsCsv(rows: CongressRequest[], lookup: RequestLookup): string {
  const headers = [
    "ID", "Tipo", "Nombre", "Correo", "Tipo de documento", "Documento", "Institución",
    "Categoría", "Modalidad", "Título de ponencia", "Estado de solicitud", "Estado de pago",
    "Tarifa", "Cargo institucional", "Monto declarado", "Secuencia", "Fecha de pago", "Fecha de registro",
  ];
  const lines = rows.map(request => {
    const registration = registrationFor(request, lookup);
    return [
      request.id, request.kind === "paper" ? "Ponencia" : "Inscripción", request.name, request.email,
      request.doc_type, request.doc_number, request.institution, request.category, request.mode,
      request.topic, statusLabel(request.status, request.kind), paymentLabel(registration?.payment_status),
      registration?.registration_fee, registration?.institutional_fee, registration?.payment_amount,
      registration?.payment_sequence, registration?.payment_date, formatTimestamp(request.created_at),
    ];
  });
  return "\uFEFF" + [headers, ...lines].map(line => line.map(csvCell).join(",")).join("\r\n");
}
