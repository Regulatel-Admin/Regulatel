/**
 * Envío de notificaciones por correo a suscriptores (noticias, eventos).
 * Usa Resend (https://resend.com). Sin RESEND_API_KEY no se envía (solo se registra en logs).
 */

import { getActiveSubscribers } from "./subscribers.js";
import { emailButton, siteBaseUrl, wrapEmailHtml } from "./emailLayout.js";

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
  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) return { sent: 0, skipped: false };
  if (!resend) {
    console.warn("[sendNewsletter] RESEND_API_KEY no configurado. No se enviaron correos a", subscribers.length, "suscriptores.");
    return { sent: 0, skipped: true };
  }

  const typeLabel = params.type === "noticia" ? "Nueva noticia" : params.type === "evento" ? "Nuevo evento" : "Nueva publicación";
  const subject = `${SITE_NAME} – ${typeLabel}: ${params.title}`;
  const baseUrl = siteBaseUrl();
  const fullUrl = params.url ? (params.url.startsWith("http") ? params.url : `${baseUrl}${params.url.startsWith("/") ? "" : "/"}${params.url}`) : "";

  let sent = 0;
  for (const subscriber of subscribers) {
    const unsubUrl = `${baseUrl}/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`;
    const html = wrapEmailHtml({
      preheader: `${typeLabel}: ${params.title}`,
      title: typeLabel,
      footerNote: `Recibe este correo porque se suscribió en regulatel.org. <a href="${unsubUrl}" style="color:#bdd034;text-decoration:underline;">Darse de baja</a>.`,
      bodyHtml: `
      <h2 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.4;color:#163d59;">${params.title}</h2>
      ${params.date ? `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7c8a;">${params.date}</p>` : ""}
      ${params.excerpt ? `<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">${params.excerpt}</p>` : ""}
      ${fullUrl ? emailButton(fullUrl, "Ver en el sitio") : ""}
    `,
    });
    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: subscriber.email,
        subject,
        html,
      });
      if (error) {
        console.error("[sendNewsletter] Error enviando a", subscriber.email, error);
      } else {
        sent++;
      }
    } catch (e) {
      console.error("[sendNewsletter] Error enviando a", subscriber.email, e);
    }
  }
  return { sent, skipped: false };
}
