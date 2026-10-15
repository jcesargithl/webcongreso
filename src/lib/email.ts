import "server-only";
import nodemailer from "nodemailer";
import type { CongressRequest } from "./requests";
import { getCategoryForRequest, formatCurrency } from "./congress";

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, character => entities[character] || character);
}

export async function sendRequestEmail(request: CongressRequest): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) return false;
  const category = getCategoryForRequest(request);
  const description = request.kind === "paper"
    ? "Recibimos tu investigación. El comité académico revisará la ponencia; este mensaje confirma su recepción."
    : request.payment_status === "exempt"
      ? "Tu inscripción como ponente interno es gratuita y está registrada. Ya puedes verificar tu inscripción en «Enviar investigación»."
      : request.payment_status === "approved"
        ? "Un administrador aprobó tu pago. Tu inscripción está confirmada." + (category?.speaker ? " Ya puedes verificar tu inscripción en «Enviar investigación»." : "")
        : request.payment_status === "rejected"
          ? "La Secretaría observó tu comprobante de pago. Contacta al comité para revisar tu inscripción."
          : "Recibimos tu inscripción y el comprobante de Págalo.pe. Tu pago está pendiente de validación por un administrador.";
  try {
    await nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    }).sendMail({
      from: '"IV Congreso EPEP" <' + process.env.GMAIL_USER + ">",
      to: request.email,
      subject: request.kind === "paper" ? "Investigación recibida - IV Congreso EPEP" : "Estado de inscripción - IV Congreso EPEP",
      html: '<div style="font-family:sans-serif;color:#333"><h2>Hola, ' + escapeHtml(request.name) + '</h2><p>' + escapeHtml(description) +
        '</p><p><strong>Categoría:</strong> ' + escapeHtml(request.category || "") + '</p><p><strong>Modalidad:</strong> ' + escapeHtml(request.mode) +
        '</p>' + (request.payment_amount != null ? '<p><strong>Monto declarado:</strong> ' + formatCurrency(Number(request.payment_amount)) + '</p>' : "") +
        (request.payment_notes ? '<p><strong>Observaciones:</strong> ' + escapeHtml(request.payment_notes) + '</p>' : "") +
        '<p>Comité Organizador · IV Congreso Internacional EPEP</p></div>',
    });
    return true;
  } catch (error) { console.error("No se pudo enviar el correo de confirmación:", error); return false; }
}
