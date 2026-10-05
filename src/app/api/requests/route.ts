import { createRequest, listRequests, updateRequestStatus, type RequestKind, type RequestStatus } from "@/lib/requests";
import { supabase } from "@/lib/supabase";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const runtime = "nodejs";

const allowedKinds: RequestKind[] = ["registration", "paper"];
const allowedStatuses: RequestStatus[] = ["pending", "reviewing", "approved", "rejected", "cash"];

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() || "")) return null;

  return user;
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "No autorizado" }, { status: 401 });

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
  const receipt = formData.get("receipt") as File | null;

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

  let receipt_url: string | undefined = undefined;

  // Upload receipt if present
  if (receipt && receipt.size > 0) {
    if (!receipt.type.startsWith("image/") && receipt.type !== "application/pdf") {
      return Response.json({ error: "El comprobante debe ser una imagen o un PDF." }, { status: 400 });
    }
    
    const bytes = await receipt.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `receipt-${Date.now()}-${receipt.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    const { error: uploadError } = await supabase.storage
      .from("papers")
      .upload(filename, buffer, {
        contentType: receipt.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error (receipt):", uploadError);
      return Response.json({ error: "Error al subir el comprobante de pago." }, { status: 500 });
    }
    
    const { data: publicUrlData } = supabase.storage.from("papers").getPublicUrl(filename);
    receipt_url = publicUrlData.publicUrl;
  }

  const finalMessage = receipt_url 
    ? `🔗 COMPROBANTE DE PAGO:\n${receipt_url}\n\n${message || ""}`
    : message;

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
    message: finalMessage,
    file_url,
  });

  if (!created) {
    return Response.json({ error: "Error al crear la solicitud." }, { status: 500 });
  }



  // Enviar correo con Nodemailer (Gmail)
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    try {
      await transporter.sendMail({
        from: `"IV Congreso" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Confirmación de registro, accesos y pago - IV Congreso",
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #0F2756;">¡Hola, ${name}!</h2>
            <p>Hemos recibido tu solicitud de inscripción para el <strong>IV Congreso Internacional</strong>.</p>
            
            <h3 style="color: #B38600;">Instrucciones de Pago</h3>
            <p>Para completar tu registro, por favor realiza el pago correspondiente a tu categoría mediante transferencia o depósito bancario a la siguiente cuenta:</p>
            <div style="background: #F8F9FA; padding: 15px; border-radius: 8px; border: 1px solid #EAEAEA;">
              <p><strong>Banco:</strong> Banco de la Nación (Ejemplo)</p>
              <p><strong>Número de Cuenta:</strong> 0000-0000-0000-0000</p>
              <p><strong>Titular:</strong> IV Congreso EPEP</p>
              <p style="margin-top: 10px; font-size: 14px;"><em>Importante: Una vez realizado el pago, responde a este correo adjuntando tu comprobante (foto o PDF) indicando tu nombre completo y DNI.</em></p>
            </div>

            <p style="margin-top: 20px;">Te avisaremos en cuanto validemos tu pago y tu solicitud cambie a "Confirmado".</p>
            <br/>
            <p>Atentamente,<br/>Comité Organizador</p>
          </div>
        `
      });
    } catch (err) {
      console.error("Error enviando email con Nodemailer:", err);
    }
  }

  return Response.json(created, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return Response.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  if (typeof body.id !== "string" || !allowedStatuses.includes(body.status)) {
    return Response.json({ error: "Solicitud de actualización inválida." }, { status: 400 });
  }
  const updated = await updateRequestStatus(body.id, body.status);
  return updated
    ? Response.json(updated)
    : Response.json({ error: "Solicitud no encontrada." }, { status: 404 });
}
