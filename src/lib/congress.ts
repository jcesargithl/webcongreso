export const INSTITUTIONAL_FEE = 1;
export const PAGALO_URL = "https://www.pagalo.pe/home";
export const PAYMENT_CODE = "091";
export const PAYMENT_ENTITY = "Tasas educativas UNA Puno";
export const PAYMENT_SERVICE = "OTROS SERV. EDU. EDU. PRIMARIA";
export const RECEIPT_MAX_BYTES = 2 * 1024 * 1024;
export const PAPER_MAX_BYTES = 10 * 1024 * 1024;
export const CONGRESS_FILES_BUCKET = "congress-files";

export const registrationCategories = [
  { id: "student_internal_attendee", title: "Estudiante EPEP", role: "Asistente Interno", mode: "Presencial", fee: 20, speaker: false, image: "/enseedu.jpg", features: ["Acceso a todas las conferencias", "Certificado de asistente", "Material del congreso"] },
  { id: "student_external", title: "Estudiante Externo", role: "Público General", mode: "Híbrido", fee: 30, speaker: false, image: "/integrantes.jpeg", features: ["Acceso a todas las conferencias", "Certificado de asistente", "Material del congreso"] },
  { id: "speaker_external", title: "Ponente Externo", role: "Investigadores", mode: "Híbrido", fee: 100, speaker: true, image: "/tutoria.jpg", features: ["Modalidad híbrida (nacionales e internacionales)", "Certificado como ponente para cada autor (S/ 100 c/u)", "Publicación en la memoria del congreso"] },
  { id: "attendee_external", title: "Asistente Externo", role: "Público General y Egresados", mode: "Híbrido", fee: 70, speaker: false, image: "/interior.jpg", features: ["Acceso a todas las conferencias", "Certificado oficial de asistente", "Válido para profesionales, egresados y público general"] },
  { id: "speaker_internal_teacher", title: "Docente EPEP", role: "Ponente Interno", mode: "Presencial", fee: 0, speaker: true, image: "/docentes.jpg", features: ["Derecho a ponencia", "Certificado de ponente", "Acceso prioritario"] },
  { id: "speaker_internal_student", title: "Estudiante EPEP", role: "Ponente Interno", mode: "Presencial", fee: 0, speaker: true, image: "/estudiantesedudes.jpg", features: ["Derecho a ponencia", "Certificado de ponente", "Mentoría académica"] },
] as const;

export type RegistrationCategory = (typeof registrationCategories)[number];
export type RegistrationCategoryId = RegistrationCategory["id"];

export function getCategory(id: unknown): RegistrationCategory | undefined {
  return registrationCategories.find(category => category.id === id);
}

export function categoryLabel(category: RegistrationCategory): string {
  return category.title + " · " + category.role;
}

export function getInstitutionalFee(category: RegistrationCategory): number {
  return category.fee > 0 ? INSTITUTIONAL_FEE : 0;
}

export function getRegistrationTotal(category: RegistrationCategory): number {
  return category.fee + getInstitutionalFee(category);
}

export function formatCurrency(amount: number): string {
  return "S/ " + amount.toFixed(2);
}

// Legacy values are resolved only when they identify a single category.
export function getCategoryForRequest(request: { category_id?: string | null; category?: string | null }): RegistrationCategory | undefined {
  if (request.category_id) return getCategory(request.category_id);
  const exact = registrationCategories.find(category => categoryLabel(category) === request.category);
  if (exact) return exact;
  const legacy: Record<string, RegistrationCategoryId> = {
    "Asistente Interno": "student_internal_attendee",
    "Estudiante Externo": "student_external",
    "Ponente Externo": "speaker_external",
    "Investigadores": "speaker_external",
    "Asistente Externo": "attendee_external",
    "Docente EPEP": "speaker_internal_teacher",
  };
  return request.category ? getCategory(legacy[request.category]) : undefined;
}
