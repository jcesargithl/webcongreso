import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import type { CongressRequest } from "./requests";
import { buildRequestEmail, CONGRESS_CONTACT_EMAIL, type EmailEvent, type EmailLogo } from "./email-template";

const logoAssets = [
  { filename: "Logo_UNAP.png", cid: "una-logo@coninci2026.com", alt: "UNA Puno", width: 48, height: 52 },
  { filename: "logosecu.png", cid: "epep-logo@coninci2026.com", alt: "EPEP", width: 50, height: 52 },
];

export async function sendRequestEmail(request: CongressRequest, event: EmailEvent = "received"): Promise<boolean> {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_PASS;
  if (!user || !pass) {
    console.error("Correo no enviado: configura GMAIL_USER y GMAIL_PASS.", { requestId: request.id, event });
    return false;
  }
  try {
    const assets = await Promise.all(logoAssets.map(async asset => {
      try {
        return { ...asset, content: await readFile(path.join(process.cwd(), "public", asset.filename)) };
      } catch {
        // Keep the notification readable even if a deployment omits a logo.
        console.error("Logotipo no disponible para el correo:", asset.filename);
        return null;
      }
    }));
    const logos: EmailLogo[] = [];
    const attachments = [];
    for (const asset of assets) {
      if (!asset) continue;
      logos.push(asset);
      attachments.push({ filename: asset.filename, content: asset.content, cid: asset.cid, contentType: "image/png", contentDisposition: "inline" as const });
    }
    const message = buildRequestEmail(request, event, logos);
    const result = await nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    }).sendMail({
      from: { name: "IV Congreso EPEP", address: user },
      to: { name: request.name, address: request.email },
      replyTo: { name: "Comité Organizador EPEP", address: CONGRESS_CONTACT_EMAIL },
      ...message,
      attachments,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    if (!result.accepted.length) {
      console.error("El servidor de correo no aceptó el destinatario.", { requestId: request.id, event });
      return false;
    }
    return true;
  } catch (error) {
    const failure = error as { code?: string; responseCode?: number };
    console.error("No se pudo enviar la notificación del congreso:", {
      requestId: request.id, event, code: failure?.code, responseCode: failure?.responseCode,
    });
    return false;
  }
}
