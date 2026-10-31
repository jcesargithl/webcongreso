import { randomUUID } from "node:crypto";
import { supabase } from "@/lib/supabase";
import { getCategory, categoryLabel, getInstitutionalFee, CONGRESS_FILES_BUCKET, RECEIPT_MAX_BYTES } from "@/lib/congress";
import { normalizeDocument, normalizeEmail, validatePdf, ValidationError } from "@/lib/registration-rules";
import { errorResponse } from "@/lib/api-errors";
import { sendCorporateEmail } from "@/lib/corporate-email";

export const runtime = "nodejs";

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const uploadedFiles: string[] = [];

  try {
    const form = await request.formData().catch(() => {
      throw new ValidationError("El formulario no es válido.");
    });

    const managerName = field(form, "manager_name");
    const managerEmail = normalizeEmail(field(form, "manager_email"));
    const managerPhone = field(form, "manager_phone");
    const managerInstitution = field(form, "manager_institution");

    if (managerName.length < 2 || managerName.length > 160) {
      throw new ValidationError("Ingresa el nombre completo del encargado.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managerEmail)) {
      throw new ValidationError("Ingresa un correo electrónico válido para el encargado.");
    }
    if (!managerPhone || managerPhone.length < 6 || managerPhone.length > 25) {
      throw new ValidationError("Ingresa un teléfono o WhatsApp de contacto válido.");
    }
    if (managerInstitution.length < 2 || managerInstitution.length > 240) {
      throw new ValidationError("Ingresa el nombre de la institución o universidad de la delegación.");
    }

    const rawParticipants = field(form, "participants_json");
    let parsedList: Array<{
      name: string;
      doc_type: string;
      doc_number: string;
      category_id: string;
      mode?: string;
    }> = [];

    try {
      parsedList = JSON.parse(rawParticipants);
    } catch {
      throw new ValidationError("Los datos de los integrantes no tienen un formato válido.");
    }

    if (!Array.isArray(parsedList) || parsedList.length < 10) {
      throw new ValidationError("La inscripción corporativa requiere un mínimo de 10 participantes.", 400);
    }

    // Validate participants
    const validatedParticipants: Array<{
      name: string;
      doc_type: string;
      doc_number: string;
      category_id: string;
      category_title: string;
      mode: string;
      fee: number;
      institutional_fee: number;
    }> = [];

    const seenDocs = new Set<string>();

    for (let i = 0; i < parsedList.length; i++) {
      const p = parsedList[i];
      const name = typeof p.name === "string" ? p.name.trim() : "";
      const docType = typeof p.doc_type === "string" ? p.doc_type.trim() : "DNI";
      const docNumber = normalizeDocument(p.doc_number);
      const category = getCategory(p.category_id);

      if (name.length < 2 || name.length > 160) {
        throw new ValidationError(`Integrante #${i + 1}: ingresa un nombre y apellidos válidos.`);
      }
      if (!["DNI", "CE", "Pasaporte", "Otro"].includes(docType) || !docNumber || docNumber.length > 30) {
        throw new ValidationError(`Integrante #${i + 1}: revisa el tipo y número de documento.`);
      }
      if (docType === "DNI" && !/^\d{8}$/.test(docNumber)) {
        throw new ValidationError(`Integrante #${i + 1} (${name}): el DNI debe tener 8 dígitos.`);
      }
      if (!category) {
        throw new ValidationError(`Integrante #${i + 1}: selecciona una categoría de inscripción válida.`);
      }

      const docKey = `${docType}:${docNumber}`;
      if (seenDocs.has(docKey)) {
        throw new ValidationError(`El documento ${docNumber} está duplicado dentro de la misma lista.`);
      }
      seenDocs.add(docKey);

      // Check duplicate in database
      const { data: existing, error: dupError } = await supabase
        .from("congress_requests")
        .select("id")
        .eq("kind", "registration")
        .eq("doc_type", docType)
        .eq("doc_number", docNumber)
        .limit(1)
        .maybeSingle();

      if (dupError) throw dupError;
      if (existing) {
        throw new ValidationError(`El documento ${docNumber} (${name}) ya cuenta con una inscripción previa en el sistema.`, 409);
      }

      validatedParticipants.push({
        name,
        doc_type: docType,
        doc_number: docNumber,
        category_id: category.id,
        category_title: categoryLabel(category),
        mode: (p.mode === "Presencial" || p.mode === "Híbrido" ? p.mode : category.mode) as "Presencial" | "Híbrido",
        fee: category.fee,
        institutional_fee: getInstitutionalFee(category),
      });
    }

    // Calculate totals with 20% discount
    const subtotal = validatedParticipants.reduce((acc, p) => acc + p.fee + p.institutional_fee, 0);
    const discount = Math.round(subtotal * 0.2 * 100) / 100;
    const finalTotal = Math.round((subtotal - discount) * 100) / 100;

    // Optional receipt upload
    const paymentMethod = field(form, "payment_method") || "coordination";
    const paymentSequence = field(form, "payment_sequence") || undefined;
    const paymentDate = field(form, "payment_date") || undefined;

    let receiptPath: string | null = null;
    const rawReceipt = form.get("receipt");
    if (rawReceipt instanceof File && rawReceipt.size > 0) {
      const receipt = await validatePdf(rawReceipt, RECEIPT_MAX_BYTES, "el comprobante corporativo");
      receiptPath = "receipts/corp-" + randomUUID() + ".pdf";
      const { error: uploadError } = await supabase.storage
        .from(CONGRESS_FILES_BUCKET)
        .upload(receiptPath, Buffer.from(await receipt.arrayBuffer()), {
          contentType: "application/pdf",
          upsert: false,
        });
      if (uploadError) throw uploadError;
      uploadedFiles.push(receiptPath);
    }

    // Insert all participants into congress_requests
    const rowsToInsert = validatedParticipants.map((p, idx) => ({
      kind: "registration",
      name: p.name,
      email: managerEmail, // Sent to manager
      doc_type: p.doc_type,
      doc_number: p.doc_number,
      institution: managerInstitution,
      category_id: p.category_id,
      category: p.category_title,
      mode: p.mode,
      registration_fee: Math.round(p.fee * 0.8 * 100) / 100, // Individual 20% discount
      institutional_fee: p.institutional_fee,
      status: "reviewing",
      payment_status: "pending",
      payment_method: paymentMethod === "pagalo_pe" ? "pagalo_pe" : "corporativo",
      payment_sequence: paymentSequence || null,
      payment_date: paymentDate || null,
      payment_amount: finalTotal,
      receipt_path: receiptPath,
      payment_notes: `[PAGO CORPORATIVO - 20% DCTO] Delegación: ${managerInstitution}. Integrante ${idx + 1} de ${validatedParticipants.length}. Encargado: ${managerName} (${managerEmail}, Tel: ${managerPhone}).`,
      workflow_version: 1,
    }));

    const { error: insertError } = await supabase.from("congress_requests").insert(rowsToInsert);
    if (insertError) throw insertError;

    // Send confirmation email to manager
    const emailData = {
      manager: {
        name: managerName,
        email: managerEmail,
        phone: managerPhone,
        institution: managerInstitution,
      },
      participants: validatedParticipants.map(p => ({
        name: p.name,
        doc_type: p.doc_type,
        doc_number: p.doc_number,
        category: p.category_title,
        mode: p.mode,
      })),
      subtotal,
      discount,
      total: finalTotal,
      paymentMethod: paymentMethod === "pagalo_pe" ? ("pagalo_pe" as const) : ("coordination" as const),
      paymentSequence,
      paymentDate,
    };

    // Fire and don't block response on email failure
    sendCorporateEmail(emailData).catch(err => {
      console.error("No se pudo enviar el correo corporativo al encargado:", err);
    });

    return Response.json(
      {
        success: true,
        count: validatedParticipants.length,
        managerEmail,
        subtotal,
        discount,
        total: finalTotal,
      },
      { status: 201 }
    );
  } catch (error) {
    if (uploadedFiles.length) {
      await supabase.storage.from(CONGRESS_FILES_BUCKET).remove(uploadedFiles).catch(() => null);
    }
    return errorResponse(error);
  }
}

