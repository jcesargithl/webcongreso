import { supabase } from "./supabase";

export type RequestKind = "registration" | "paper";
export type RequestStatus = "pending" | "reviewing" | "approved" | "rejected" | "yape" | "cash";

export type CongressRequest = {
  id: string;
  kind: RequestKind;
  category?: string;
  name: string;
  email: string;
  doc_type?: string;
  doc_number?: string;
  mode: "Presencial" | "Virtual";
  institution?: string;
  topic?: string;
  message?: string;
  file_url?: string;
  status: RequestStatus;
  created_at: string;
};

/**
 * Lista todas las solicitudes, ordenadas por fecha de creación descendente.
 */
export async function listRequests(): Promise<CongressRequest[]> {
  const { data, error } = await supabase
    .from("congress_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching requests:", error);
    return [];
  }

  return data as CongressRequest[];
}

/**
 * Crea una nueva solicitud de registro o ponencia.
 */
export async function createRequest(
  input: Omit<CongressRequest, "id" | "status" | "created_at">
): Promise<CongressRequest | null> {
  const payload: any = {
    kind: input.kind,
    category: input.category || null,
    name: input.name,
    email: input.email,
    doc_type: input.doc_type || null,
    doc_number: input.doc_number || null,
    mode: input.mode,
    institution: input.institution || null,
    topic: input.topic || null,
    message: input.message || null,
    status: "pending",
  };

  if (input.file_url !== undefined) {
    payload.file_url = input.file_url;
  }

  const { data, error } = await supabase
    .from("congress_requests")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error creating request:", error);
    return null;
  }

  return data as CongressRequest;
}

/**
 * Actualiza el estado de una solicitud existente.
 */
export async function updateRequestStatus(
  id: string,
  status: RequestStatus
): Promise<CongressRequest | null> {
  const { data, error } = await supabase
    .from("congress_requests")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating request:", error);
    return null;
  }

  return data as CongressRequest;
}
