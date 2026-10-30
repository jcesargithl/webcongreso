import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { CONGRESS_CONTACT_EMAIL, CONGRESS_SITE_URL, CONGRESS_WHATSAPP_GROUP_URL } from "./email-template";
import { formatCurrency } from "./congress";

export type CorporateParticipant = {
  name: string;
  doc_type: string;
  doc_number: string;
  category: string;
  mode: string;
};

export type CorporateEmailData = {
  manager: {
    name: string;
    email: string;
    phone: string;
    institution: string;
  };
  participants: CorporateParticipant[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "pagalo_pe" | "coordination";
  paymentSequence?: string;
  paymentDate?: string;
};

const logoAssets = [
  { filename: "Logo_UNAP.png", cid: "una-logo@coninci2026.com", alt: "UNA Puno", width: 48, height: 52 },
  { filename: "logosecu.png", cid: "epep-logo@coninci2026.com", alt: "EPEP", width: 50, height: 52 },
];

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value || "").replace(/[&<>"']/g, character => entities[character]);
}

export async function sendCorporateEmail(data: CorporateEmailData): Promise<boolean> {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_PASS;
  if (!user || !pass) {
    console.error("Correo corporativo no enviado: configura GMAIL_USER y GMAIL_PASS.");
    return false;
  }

  try {
    const assets = await Promise.all(
      logoAssets.map(async asset => {
        try {
          return { ...asset, content: await readFile(path.join(process.cwd(), "public", asset.filename)) };
        } catch {
          return null;
        }
      })
    );

    const attachments = [];
    const validLogos = [];
    for (const asset of assets) {
      if (!asset) continue;
      validLogos.push(asset);
      attachments.push({
        filename: asset.filename,
        content: asset.content,
        cid: asset.cid,
        contentType: "image/png",
        contentDisposition: "inline" as const,
      });
    }

    const e = escapeHtml;
    const { manager, participants, subtotal, discount, total } = data;

    const rowsHtml = participants
      .map(
        (p, idx) => `
        <tr style="border-bottom:1px solid #edf1f7;">
          <td style="padding:10px 8px;font-size:13px;color:#142e59;font-weight:bold;">${idx + 1}</td>
          <td style="padding:10px 8px;font-size:13px;color:#243c60;">${e(p.name)}</td>
          <td style="padding:10px 8px;font-size:13px;color:#46536a;">${e(p.doc_type)}: ${e(p.doc_number)}</td>
          <td style="padding:10px 8px;font-size:13px;color:#46536a;">${e(p.category)}</td>
          <td style="padding:10px 8px;font-size:13px;color:#46536a;">${e(p.mode)}</td>
        </tr>
      `
      )
      .join("");

    const html = `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Inscripción Corporativa Recibida</title>
</head>
<body style="margin:0;padding:0;background-color:#edf1f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#edf1f7">
    <tr>
      <td align="center" style="padding:36px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="max-width:680px;border:1px solid #dce3ee;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:24px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  ${validLogos
                    .map(
                      logo =>
                        `<td width="${logo.width + 14}" valign="middle"><img src="cid:${e(logo.cid)}" alt="${e(logo.alt)}" width="${logo.width}" height="${logo.height}" style="display:block;border:0;"></td>`
                    )
                    .join("")}
                  <td align="right" valign="middle" style="font-size:12px;line-height:19px;letter-spacing:1px;color:#52627b;">
                    UNIVERSIDAD NACIONAL<br>DEL ALTIPLANO · PUNO<br><strong style="color:#142e59;">EDUCACIÓN PRIMARIA</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="#142e59" style="padding:30px 40px;border-top:4px solid #d5ad36;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:bold;letter-spacing:3px;color:#f3cf72;">PAGO CORPORATIVO · 20% DESCUENTO</p>
              <p style="margin:0;font-size:24px;line-height:32px;font-weight:bold;color:#ffffff;">Inscripción de Delegación Recibida</p>
              <p style="margin:14px 0 0;font-size:13px;line-height:21px;color:#dbe4f4;">IV Congreso Internacional de Investigación Científica · 25, 26 y 27 de noviembre de 2026</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td bgcolor="#fff5d8" style="padding:7px 14px;border-radius:20px;color:#755817;font-size:12px;font-weight:bold;">
                    Delegación en revisión y validación
                  </td>
                </tr>
              </table>

              <h1 style="margin:12px 0 16px;font-size:26px;line-height:34px;color:#142e59;">
                Hola, <strong>${e(manager.name)}</strong>:
              </h1>

              <p style="margin:0 0 18px;font-size:15px;line-height:24px;color:#46536a;">
                Hemos registrado con éxito la inscripción corporativa para la delegación de <strong>${e(manager.institution)}</strong> con <strong>${participants.length} participantes</strong> y un <strong>20% de descuento del total</strong>.
              </p>

              <div style="background-color:#f6f8fc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
                <h3 style="margin:0 0 12px;font-size:16px;color:#142e59;">Resumen Económico de la Delegación</h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#64748b;">Subtotal tarifas normales:</td>
                    <td align="right" style="padding:6px 0;font-size:14px;font-weight:bold;color:#142e59;">${formatCurrency(subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#166534;font-weight:bold;">Descuento Corporativo (20%):</td>
                    <td align="right" style="padding:6px 0;font-size:14px;font-weight:bold;color:#166534;">- ${formatCurrency(discount)}</td>
                  </tr>
                  <tr style="border-top:1px dashed #cbd5e1;">
                    <td style="padding:10px 0 4px;font-size:16px;font-weight:bold;color:#142e59;">Monto Total a Pagar:</td>
                    <td align="right" style="padding:10px 0 4px;font-size:18px;font-weight:bold;color:#b38600;">${formatCurrency(total)}</td>
                  </tr>
                </table>
              </div>

              <h3 style="margin:24px 0 12px;font-size:16px;color:#142e59;">Lista de Integrantes Inscritos (${participants.length})</h3>
              <div style="overflow-x:auto;margin-bottom:24px;">
                <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5eaf2;border-radius:8px;border-collapse:collapse;">
                  <thead>
                    <tr bgcolor="#f8fafc" style="border-bottom:2px solid #e2e8f0;">
                      <th align="left" style="padding:10px 8px;font-size:12px;color:#475569;">#</th>
                      <th align="left" style="padding:10px 8px;font-size:12px;color:#475569;">Nombre</th>
                      <th align="left" style="padding:10px 8px;font-size:12px;color:#475569;">Documento</th>
                      <th align="left" style="padding:10px 8px;font-size:12px;color:#475569;">Categoría</th>
                      <th align="left" style="padding:10px 8px;font-size:12px;color:#475569;">Modalidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml}
                  </tbody>
                </table>
              </div>

              <div style="background-color:#f0fbf4;border:1px solid #bce6cb;border-radius:10px;padding:20px;margin:24px 0;">
                <h4 style="margin:0 0 8px;font-size:15px;color:#0d5e36;">Grupo oficial de WhatsApp</h4>
                <p style="margin:0 0 14px;font-size:14px;line-height:22px;color:#244c35;">
                  Únete al grupo del congreso para recibir avisos oficiales y el cronograma en tiempo real:
                </p>
                <a href="${e(CONGRESS_WHATSAPP_GROUP_URL)}" style="display:inline-block;padding:12px 20px;background-color:#25d366;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:6px;">
                  Unirme al grupo de WhatsApp
                </a>
              </div>

              <h3 style="margin:24px 0 10px;font-size:16px;color:#142e59;">Contactos del Comité para Validar Pago:</h3>
              <p style="margin:0 0 8px;font-size:14px;color:#46536a;">
                • <strong>Dra. Ruth:</strong> <a href="https://wa.me/51982311128" style="color:#0d5e36;font-weight:bold;">982 311 128 (WhatsApp)</a><br>
                • <strong>Dra. Rossy:</strong> <a href="https://wa.me/51961441879" style="color:#0d5e36;font-weight:bold;">961 441 879 (WhatsApp)</a><br>
                • <strong>Mg. Juan:</strong> <a href="https://wa.me/51964328207" style="color:#0d5e36;font-weight:bold;">964 328 207 (WhatsApp)</a>
              </p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#f6f8fc" style="padding:24px 40px;border-top:1px solid #e5eaf2;">
              <p style="margin:0 0 6px;font-size:13px;color:#142e59;"><strong>Comité Organizador · IV Congreso EPEP</strong></p>
              <p style="margin:0;font-size:12px;color:#68758b;">Universidad Nacional del Altiplano – Puno · <a href="mailto:${CONGRESS_CONTACT_EMAIL}" style="color:#244d87;">${CONGRESS_CONTACT_EMAIL}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = [
      "IV Congreso Internacional de Investigación Científica",
      "PAGO CORPORATIVO (20% DE DESCUENTO)",
      "",
      `Hola, ${manager.name}:`,
      `Hemos registrado con éxito la inscripción corporativa para la delegación de ${manager.institution}.`,
      `Total de participantes: ${participants.length}`,
      `Subtotal: ${formatCurrency(subtotal)}`,
      `Descuento 20%: - ${formatCurrency(discount)}`,
      `Total a Pagar: ${formatCurrency(total)}`,
      "",
      "Participantes:",
      ...participants.map((p, idx) => `${idx + 1}. ${p.name} - ${p.doc_type}: ${p.doc_number} - ${p.category} (${p.mode})`),
      "",
      "Grupo de WhatsApp del congreso:",
      CONGRESS_WHATSAPP_GROUP_URL,
      "",
      "Contactos para coordinar pago:",
      "Dra. Ruth: 982 311 128",
      "Dra. Rossy: 961 441 879",
      "Mg. Juan: 964 328 207",
      "",
      CONGRESS_SITE_URL,
    ].join("\n");

    const result = await nodemailer
      .createTransport({
        service: "gmail",
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      })
      .sendMail({
        from: { name: "IV Congreso EPEP", address: user },
        to: { name: manager.name, address: manager.email },
        replyTo: { name: "Comité Organizador EPEP", address: CONGRESS_CONTACT_EMAIL },
        subject: `Inscripción Corporativa Recibida - ${manager.institution} | IV Congreso EPEP`,
        html,
        text,
        attachments,
      });

    return Boolean(result.accepted?.length);
  } catch (error) {
    console.error("Error al enviar correo corporativo:", error);
    return false;
  }
}

