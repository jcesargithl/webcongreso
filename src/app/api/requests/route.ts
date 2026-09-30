import { NextResponse } from "next/server";
import { createRequest, listRequests, updateRequestStatus, type RequestKind, type RequestStatus } from "@/lib/requests";

export const runtime = "nodejs";

const allowedKinds: RequestKind[] = ["registration", "paper"];
const allowedStatuses: RequestStatus[] = ["pending", "reviewing", "approved", "rejected"];

export async function GET() {
  return NextResponse.json(await listRequests());
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const kind = body.kind as RequestKind;

  if (!name || !email || !email.includes("@") || !allowedKinds.includes(kind)) {
    return NextResponse.json({ error: "Completa los campos obligatorios." }, { status: 400 });
  }

  const created = await createRequest({
    kind,
    name,
    email,
    mode: body.mode === "Virtual" ? "Virtual" : "Presencial",
    institution: typeof body.institution === "string" ? body.institution.trim() : undefined,
    topic: typeof body.topic === "string" ? body.topic.trim() : undefined,
    message: typeof body.message === "string" ? body.message.trim() : undefined,
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (typeof body.id !== "string" || !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Solicitud de actualización inválida." }, { status: 400 });
  }
  const updated = await updateRequestStatus(body.id, body.status);
  return updated ? NextResponse.json(updated) : NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
}
