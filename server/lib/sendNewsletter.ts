/**
 * Envío de notificaciones por correo a suscriptores (noticias, eventos).
 * Usa Resend (https://resend.com). Sin RESEND_API_KEY no se envía (solo se registra en logs).
 */

import { getActiveSubscriberEmails } from "./subscribers.js";

const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL ?? "REGULATEL <onboarding@resend.dev>";
const SITE_NAME = "REGULATEL";

async function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  return new Resend(key);
}

/** Envía un correo de nueva noticia/publicación a todos los suscriptores activos. */
export async function notifySubscribersNewContent(params: {
  type: "noticia" | "evento" | "publicación";
  title: string;
  excerpt?: string;
  url?: string;
  date?: string;
}): Promise<{ sent: number; skipped: boolean }> {
  const resend = await getResend();
  const emails = await getActiveSubscriberEmails();
  if (emails.length === 0) return { sent: 0, skipped: false };
  if (!resend) {
    console.warn("[sendNewsletter] RESEND_API_KEY no configurado. No se enviaron correos a", emails.length, "suscriptores.");
    return { sent: 0, skipped: true };
  }

  const typeLabel = params.type === "noticia" ? "Nueva noticia" : params.type === "evento" ? "Nuevo evento" : "Nueva publicación";
  const subject = `${SITE_NAME} – ${typeLabel}: ${params.title}`;
  const baseUrl = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://regulatel.org");
  const fullUrl = params.url ? (params.url.startsWith("http") ? params.url : `${baseUrl}${params.url.startsWith("/") ? "" : "/"}${params.url}`) : "";
  const linkHtml = fullUrl
    ? `<p><a href="${fullUrl}" style="color:#4489c6;font-weight:600;">Ver en el sitio</a></p>`
    : "";
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <p style="color:#163d59;font-size:14px;">${typeLabel} en ${SITE_NAME}:</p>
      <h2 style="color:#163d59;font-size:18px;">${params.title}</h2>
      ${params.date ? `<p style="color:#666;font-size:12px;">${params.date}</p>` : ""}
      ${params.excerpt ? `<p style="color:#444;font-size:14px;line-height:1.5;">${params.excerpt}</p>` : ""}
      ${linkHtml}
      <p style="color:#888;font-size:12px;margin-top:24px;">Recibes este correo porque te suscribiste a las actualizaciones en regulatel.org. Puedes darte de baja en el pie de este mensaje.</p>
    </div>
  `;

  let sent = 0;
  for (const to of emails) {
    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      if (error) {
        console.error("[sendNewsletter] Error enviando a", to, error);
      } else {
        sent++;
      }
    } catch (e) {
      console.error("[sendNewsletter] Error enviando a", to, e);
    }
  }
  return { sent, skipped: false };
}
