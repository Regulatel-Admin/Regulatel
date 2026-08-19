/**
 * Envío de notificaciones por correo a suscriptores (noticias, eventos).
 * Usa Resend (https://resend.com). Sin RESEND_API_KEY no se envía (solo se registra en logs).
 */

import { getActiveSubscribers } from "./subscribers.js";
import { emailButton, escapeHtml, siteBaseUrl, wrapEmailHtml } from "./emailLayout.js";

const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL ?? "REGULATEL <onboarding@resend.dev>";
const SITE_NAME = "REGULATEL";

async function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  return new Resend(key);
}

export type SubscriberNotifyType = "noticia" | "evento" | "publicación";

function typeLabelForNotify(type: SubscriberNotifyType) {
  return type === "noticia" ? "Nueva noticia" : type === "evento" ? "Nuevo evento" : "Nueva publicación";
}

function absoluteUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = siteBaseUrl();
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** HTML y asunto idénticos a los que recibe cada suscriptor (salvo el enlace de baja). */
export function buildSubscriberNotifyEmail(params: {
  type: SubscriberNotifyType;
  title: string;
  excerpt?: string;
  url?: string;
  date?: string;
  unsubscribeUrl: string;
}): { subject: string; html: string; typeLabel: string } {
  const typeLabel = typeLabelForNotify(params.type);
  const safeTitle = escapeHtml(params.title);
  const subject = `${SITE_NAME} – ${typeLabel}: ${params.title}`.slice(0, 200);
  const fullUrl = absoluteUrl(params.url);
  const safeDate = params.date ? escapeHtml(params.date) : "";
  const safeExcerpt = params.excerpt ? escapeHtml(params.excerpt) : "";

  const html = wrapEmailHtml({
    preheader: `${typeLabel}: ${params.title}`,
    title: typeLabel,
    footerNote: `Recibe este correo porque se suscribió en regulatel.org. <a href="${params.unsubscribeUrl}" style="color:#bdd034;text-decoration:underline;">Darse de baja</a>.`,
    bodyHtml: `
      <h2 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:1.4;color:#163d59;">${safeTitle}</h2>
      ${safeDate ? `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7c8a;">${safeDate}</p>` : ""}
      ${safeExcerpt ? `<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">${safeExcerpt}</p>` : ""}
      ${fullUrl ? emailButton(fullUrl, "Ver en el sitio") : ""}
    `,
  });

  return { subject, html, typeLabel };
}

export async function previewSubscriberNotifyEmail(params: {
  type: SubscriberNotifyType;
  title: string;
  excerpt?: string;
  url?: string;
  date?: string;
}): Promise<{ subject: string; html: string; total: number }> {
  const subscribers = await getActiveSubscribers();
  const { subject, html } = buildSubscriberNotifyEmail({
    ...params,
    unsubscribeUrl: `${siteBaseUrl()}/unsubscribe`,
  });
  return { subject, html, total: subscribers.length };
}

/** Envía un correo de nueva noticia/publicación a todos los suscriptores activos. */
export async function notifySubscribersNewContent(params: {
  type: SubscriberNotifyType;
  title: string;
  excerpt?: string;
  url?: string;
  date?: string;
}): Promise<{ sent: number; skipped: boolean; total: number }> {
  const resend = await getResend();
  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) return { sent: 0, skipped: false, total: 0 };
  if (!resend) {
    console.warn("[sendNewsletter] RESEND_API_KEY no configurado. No se enviaron correos a", subscribers.length, "suscriptores.");
    return { sent: 0, skipped: true, total: subscribers.length };
  }

  const baseUrl = siteBaseUrl();
  let sent = 0;
  for (const subscriber of subscribers) {
    const unsubUrl = `${baseUrl}/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`;
    const { subject, html } = buildSubscriberNotifyEmail({
      ...params,
      unsubscribeUrl: unsubUrl,
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
  return { sent, skipped: false, total: subscribers.length };
}
