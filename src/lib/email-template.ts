import type { CongressRequest } from "./requests";
import { categoryLabel, formatCurrency, getCategoryForRequest } from "./congress";

export type EmailEvent = "received" | "status_updated" | "payment_reviewed";
export type EmailLogo = { cid: string; alt: string; width: number; height: number };
export const CONGRESS_SITE_URL = "https://www.coninci2026.com";
export const CONGRESS_CONTACT_EMAIL = "subdireccion.investigacion.epep@unap.edu.pe";

type MessageContent = {
  title: string;
  status: string;
  description: string;
  next: string;
  tone: "success" | "pending" | "attention";
  button: string;
  href: string;
};

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, character => entities[character]);
}

function contentFor(request: CongressRequest, event: EmailEvent): MessageContent {
  const site = { button: "Visitar el congreso", href: CONGRESS_SITE_URL + "/" };
  const contact = { button: "Contactar al comité", href: "mailto:" + CONGRESS_CONTACT_EMAIL };
  const program = { button: "Consultar el programa", href: CONGRESS_SITE_URL + "/#programa" };
  if (request.kind === "paper") {
    if (request.status === "approved") return {
      title: "Tu ponencia ha sido aprobada", status: "Ponencia aceptada", tone: "success",
      description: "El comité académico ha aprobado tu investigación para participar como ponencia en el IV Congreso Internacional de Investigación Científica.",
      next: "Consulta el programa del congreso. Para coordinar los detalles de tu presentación, comunícate con el comité organizador.",
      ...program,
    };
    if (request.status === "rejected") return {
      title: "Resultado de la evaluación de tu ponencia", status: "Ponencia no aprobada", tone: "attention",
      description: "El comité académico ha concluido la evaluación y tu ponencia no ha sido aprobada. Agradecemos que hayas compartido tu investigación con nosotros.",
      next: "Puedes contactar al comité para consultar los detalles de la evaluación. Esta decisión corresponde a tu ponencia; tu inscripción se gestiona por separado.",
      ...contact,
    };
    if (event === "received" || request.status === "pending") return {
      title: "Recibimos tu investigación", status: "Ponencia recibida", tone: "pending",
      description: "Tu investigación se registró correctamente. El comité académico revisará tu propuesta; la recepción del documento todavía no significa que la ponencia haya sido aceptada.",
      next: "Te notificaremos por correo cuando cambie el estado de tu ponencia. Conserva esta confirmación y el código de tu solicitud.",
      ...site,
    };
    if (request.status === "reviewing") return {
      title: "Tu ponencia está en revisión", status: "En revisión académica", tone: "pending",
      description: "El comité académico está evaluando tu investigación. En esta etapa todavía no hay una decisión de aceptación.",
      next: "Te enviaremos un correo cuando se registre el resultado de la evaluación.",
      ...site,
    };
  } else {
    const category = getCategoryForRequest(request);
    if (request.payment_status === "rejected") return {
      title: "Tu comprobante de pago no fue aprobado", status: "Pago rechazado", tone: "attention",
      description: "La revisión del comprobante finalizó y el pago no fue aprobado. Tu inscripción aún no está confirmada.",
      next: "Revisa las observaciones incluidas en este mensaje y contacta al comité para regularizar tu inscripción. Conserva tu constancia de Págalo.pe.",
      ...contact,
    };
    if (request.status === "rejected") return {
      title: "Actualización de tu inscripción", status: "Inscripción rechazada", tone: "attention",
      description: "Tu solicitud de inscripción fue rechazada por la organización.",
      next: "Contacta al comité para consultar el motivo y los pasos que correspondan a tu caso.",
      ...contact,
    };
    if (request.status === "approved" && (request.payment_status === "approved" || request.payment_status === "exempt")) {
      const free = request.payment_status === "exempt";
      return {
        title: event === "payment_reviewed" ? "Tu pago ha sido aprobado" : "Tu inscripción está confirmada",
        status: free ? "Inscripción gratuita confirmada" : "Inscripción confirmada", tone: "success",
        description: free
          ? "Tu inscripción como ponente interno está confirmada. La participación de docentes y estudiantes EPEP en esta categoría es gratuita y no requiere comprobante de pago."
          : "La organización aprobó tu pago y tu inscripción al congreso está confirmada. Gracias por ser parte de este encuentro académico.",
        next: category?.speaker
          ? "Ya puedes presentar tu investigación. Entra a la web, selecciona «Enviar investigación» y verifica tu inscripción con el mismo correo y documento. La aceptación de la ponencia dependerá de la evaluación académica."
          : "Consulta el programa y las actividades del congreso. Conserva este correo como confirmación de tu inscripción.",
        ...(category?.speaker ? site : program),
      };
    }
    if (request.payment_status === "pending") return {
      title: event === "received" ? "Recibimos tu inscripción" : "Tu inscripción está en validación",
      status: "Pago pendiente de validación", tone: "pending",
      description: "Recibimos tus datos y el comprobante de Págalo.pe. La organización debe validar el pago antes de confirmar tu inscripción.",
      next: category?.speaker
        ? "Espera el correo de aprobación del pago. Después podrás ingresar a «Enviar investigación» y presentar tu ponencia."
        : "Te notificaremos el resultado de la revisión del comprobante por este mismo correo.",
      ...site,
    };
    if (request.status === "pending" || request.status === "reviewing") return {
      title: "Tu inscripción está en revisión", status: "Inscripción en revisión", tone: "pending",
      description: "La organización está revisando tu solicitud de inscripción.",
      next: "Conserva este mensaje. Si necesitas información sobre tu solicitud, comunícate con el comité.",
      ...contact,
    };
  }
  return {
    title: "Actualización de tu solicitud", status: "Consulta tu solicitud", tone: "pending",
    description: "La organización ha actualizado tu solicitud al congreso.",
    next: "Contacta al comité para confirmar los detalles de tu participación.",
    ...contact,
  };
}

export function buildRequestEmail(request: CongressRequest, event: EmailEvent = "received", logos: EmailLogo[] = []) {
  const content = contentFor(request, event);
  const category = getCategoryForRequest(request);
  const details: [string, string][] = [];
  if (request.kind === "paper" && request.topic) details.push(["Investigación", request.topic]);
  details.push(["Categoría", category ? categoryLabel(category) : request.category || "Por confirmar"]);
  details.push(["Modalidad", request.mode]);
  if (request.kind === "registration") {
    if (request.payment_status === "exempt") details.push(["Inscripción", "Gratuita · no requiere pago"]);
    if (request.payment_amount != null) details.push(["Monto del comprobante", formatCurrency(Number(request.payment_amount))]);
    if (request.payment_sequence) details.push(["Secuencia de pago", request.payment_sequence]);
    if (request.payment_date) {
      const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(request.payment_date);
      details.push(["Fecha de pago", date ? date[3] + "/" + date[2] + "/" + date[1] : request.payment_date]);
    }
  }
  const notes = request.kind === "registration" ? request.payment_notes?.trim() : undefined;
  const color = { success: { text: "#176244", background: "#e9f5ee" }, pending: { text: "#755817", background: "#fff5d8" }, attention: { text: "#9a3d37", background: "#fceeed" } }[content.tone];
  const e = escapeHtml;
  const paragraph = (value: string) => '<p style="margin:0 0 18px;font-size:16px;line-height:26px;color:#46536a;">' + e(value) + "</p>";
  const html = [
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>' + e(content.title) + "</title>",
    '<style>@media only screen and (max-width:620px){.outer{padding:16px 8px!important}.pad{padding-left:24px!important;padding-right:24px!important}.headline{font-size:28px!important;line-height:35px!important}.brand{font-size:11px!important}.detail-label{width:100px!important}}</style></head>',
    '<body style="margin:0;padding:0;background-color:#edf1f7;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">',
    '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' + e(content.title + " · IV Congreso EPEP · 25, 26 y 27 de noviembre de 2026") + "</div>",
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#edf1f7"><tr><td class="outer" align="center" style="padding:36px 12px;">',
    '<!--[if mso]><table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="max-width:640px;border:1px solid #dce3ee;border-radius:16px;overflow:hidden;">',
    '<tr><td class="pad" style="padding:24px 40px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>',
    ...logos.map(logo => '<td width="' + (logo.width + 14) + '" valign="middle"><img src="cid:' + e(logo.cid) + '" alt="' + e(logo.alt) + '" width="' + logo.width + '" height="' + logo.height + '" style="display:block;border:0;width:' + logo.width + "px;height:" + logo.height + 'px;"></td>'),
    '<td class="brand" align="right" valign="middle" style="font-size:12px;line-height:19px;letter-spacing:1px;color:#52627b;">UNIVERSIDAD NACIONAL<br>DEL ALTIPLANO · PUNO<br><strong style="color:#142e59;">EDUCACIÓN PRIMARIA</strong></td></tr></table></td></tr>',
    '<tr><td class="pad" bgcolor="#142e59" style="padding:30px 40px;border-top:4px solid #d5ad36;"><p style="margin:0 0 10px;font-size:11px;font-weight:bold;letter-spacing:3px;color:#f3cf72;">INVESTIGACIÓN · INNOVACIÓN · EDUCACIÓN</p><p style="margin:0;font-size:24px;line-height:32px;font-weight:bold;color:#ffffff;">IV Congreso Internacional<br>de Investigación Científica</p><p style="margin:14px 0 0;font-size:13px;line-height:21px;color:#dbe4f4;">25, 26 y 27 de noviembre de 2026 &nbsp;·&nbsp; Puno, Perú</p></td></tr>',
    '<tr><td class="pad" style="padding:32px 40px 12px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="' + color.background + '" style="padding:7px 12px;border-radius:20px;color:' + color.text + ';font-size:12px;font-weight:bold;">' + e(content.status) + "</td></tr></table>",
    '<h1 class="headline" style="margin:20px 0;font-size:32px;line-height:39px;letter-spacing:-0.7px;color:#142e59;">' + e(content.title) + "</h1>",
    '<p style="margin:0 0 14px;font-size:16px;line-height:26px;color:#142e59;">Hola, <strong>' + e(request.name) + "</strong>:</p>",
    paragraph(content.description),
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #e5eaf2;border-bottom:1px solid #e5eaf2;">',
    ...details.map(([label, value]) => '<tr><td class="detail-label" width="152" valign="top" style="padding:12px 12px 12px 0;font-size:13px;line-height:21px;color:#68758b;">' + e(label) + '</td><td valign="top" style="padding:12px 0;font-size:14px;line-height:21px;font-weight:bold;color:#243c60;overflow-wrap:anywhere;word-break:break-word;">' + e(value) + "</td></tr>"),
    "</table>",
    ...(notes ? ['<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:20px;"><tr><td bgcolor="#fff7e2" style="padding:18px;border-left:3px solid #d5ad36;font-size:14px;line-height:23px;color:#644d1d;"><strong>Observaciones de la revisión</strong><br>' + e(notes).replace(/\r?\n/g, "<br>") + "</td></tr></table>"] : []),
    '<h2 style="margin:24px 0 8px;font-size:16px;line-height:24px;color:#142e59;">¿Qué sigue?</h2>',
    paragraph(content.next),
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 24px;"><tr><td bgcolor="#d5ad36" style="border-radius:6px;mso-padding-alt:15px 24px;"><a href="' + e(content.href) + '" style="display:inline-block;padding:15px 24px;mso-padding-alt:0;color:#10294f;font-size:15px;font-weight:bold;text-decoration:none;border:1px solid #d5ad36;border-radius:6px;">' + e(content.button) + "</a></td></tr></table>",
    '<p style="margin:0 0 20px;font-size:12px;line-height:20px;color:#748198;">Código de solicitud<br><span style="font-family:Consolas,monospace;word-break:break-all;">' + e(request.id) + "</span></p></td></tr>",
    '<tr><td class="pad" bgcolor="#f6f8fc" style="padding:24px 40px;border-top:1px solid #e5eaf2;"><p style="margin:0 0 8px;font-size:14px;line-height:23px;color:#142e59;"><strong>Comité Organizador · IV Congreso EPEP</strong><br>Escuela Profesional de Educación Primaria<br>Universidad Nacional del Altiplano – Puno</p><p style="margin:0;font-size:12px;line-height:21px;color:#68758b;">¿Necesitas ayuda? Responde a este correo o escríbenos a<br><a href="mailto:' + CONGRESS_CONTACT_EMAIL + '" style="color:#244d87;text-decoration:underline;word-break:break-all;">' + CONGRESS_CONTACT_EMAIL + "</a></p></td></tr></table>",
    '<!--[if mso]></td></tr></table><![endif]-->',
    '<p style="max-width:600px;margin:20px 8px 0;font-size:11px;line-height:18px;color:#78869c;">Este mensaje corresponde a tu solicitud al congreso.<br><a href="' + CONGRESS_SITE_URL + '/" style="color:#526b91;text-decoration:none;">www.coninci2026.com</a></p>',
    "</td></tr></table></body></html>",
  ].join("");
  const text = [
    "IV Congreso Internacional de Investigación Científica",
    "25, 26 y 27 de noviembre de 2026 · Puno, Perú", "",
    content.status.toUpperCase(), content.title, "",
    "Hola, " + request.name + ":", content.description, "",
    ...details.map(([label, value]) => label + ": " + value),
    ...(notes ? ["", "Observaciones de la revisión:", notes] : []),
    "", "¿Qué sigue?", content.next, "", content.button + ": " + content.href,
    "", "Código de solicitud: " + request.id, "",
    "Comité Organizador · IV Congreso EPEP", "Escuela Profesional de Educación Primaria",
    "Universidad Nacional del Altiplano – Puno", "Contacto: " + CONGRESS_CONTACT_EMAIL,
    CONGRESS_SITE_URL + "/",
  ].join("\n");
  return { subject: content.title + " | IV Congreso EPEP", html, text };
}
