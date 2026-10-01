import { createRequest, listRequests, updateRequestStatus, type RequestKind, type RequestStatus } from "@/lib/requests";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export const runtime = "nodejs";

const allowedKinds: RequestKind[] = ["registration", "paper"];
const allowedStatuses: RequestStatus[] = ["pending", "reviewing", "approved", "rejected"];

export async function GET() {
  const data = await listRequests();
  return Response.json(data);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  
  const name = (formData.get("name") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || "";
  const doc_type = (formData.get("doc_type") as string)?.trim() || "";
  const doc_number = (formData.get("doc_number") as string)?.trim() || "";
  const kind = formData.get("kind") as RequestKind;
  const category = (formData.get("category") as string)?.trim();
  const mode = formData.get("mode") as "Virtual" | "Presencial" || "Presencial";
  const institution = (formData.get("institution") as string)?.trim();
  const topic = (formData.get("topic") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  
  const file = formData.get("file") as File | null;

  if (!name || !email || !email.includes("@") || !allowedKinds.includes(kind) || !doc_type || !doc_number) {
    return Response.json({ error: "Completa los campos obligatorios." }, { status: 400 });
  }

  let file_url: string | undefined = undefined;

  // Upload file if present
  if (file && file.size > 0) {
    if (file.type !== "application/pdf") {
      return Response.json({ error: "El archivo debe ser un PDF." }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Create a unique filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    const { error: uploadError } = await supabase.storage
      .from("papers")
      .upload(filename, buffer, {
        contentType: "application/pdf",
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return Response.json({ error: "Error al subir el archivo PDF." }, { status: 500 });
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("papers").getPublicUrl(filename);
    file_url = publicUrlData.publicUrl;
  }

  const created = await createRequest({
    kind,
    category,
    name,
    email,
    doc_type,
    doc_number,
    mode,
    institution,
    topic,
    message,
    file_url,
  });

  if (!created) {
    return Response.json({ error: "Error al crear la solicitud." }, { status: 500 });
  }

  // Generar usuario en Supabase Auth
  const password = doc_number; // Contraseña es el documento
  const { error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { name, doc_type, doc_number }
  });

  if (authError) {
    console.error("Error al crear usuario en Auth:", authError);
    // Seguimos de todas formas porque la request ya se guardó
  }

  // Enviar correo con Resend
  if (process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: "IV Congreso <onboarding@resend.dev>", // Cambia a tu dominio verificado luego
        to: email,
        subject: "Confirmación de registro y accesos - IV Congreso",
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #0F2756;">¡Hola, ${name}!</h2>
            <p>Hemos recibido tu solicitud para el <strong>IV Congreso Internacional</strong>.</p>
            <p>Se ha generado tu cuenta para acceder a la plataforma del congreso:</p>
            <ul>
              <li><strong>Usuario:</strong> ${email}</li>
              <li><strong>Contraseña:</strong> ${password}</li>
            </ul>
            <p>Te avisaremos cuando tu solicitud cambie de estado.</p>
            <br/>
            <p>Atentamente,<br/>Comité Organizador</p>
          </div>
        `
      });
    } catch (err) {
      console.error("Error enviando email con Resend:", err);
    }
  }

  return Response.json(created, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (typeof body.id !== "string" || !allowedStatuses.includes(body.status)) {
    return Response.json({ error: "Solicitud de actualización inválida." }, { status: 400 });
  }
  const updated = await updateRequestStatus(body.id, body.status);
  return updated
    ? Response.json(updated)
    : Response.json({ error: "Solicitud no encontrada." }, { status: 404 });
}
