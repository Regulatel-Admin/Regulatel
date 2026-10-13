import crypto from "crypto";
import { contactRecipients } from "./contactMessages.js";
import { emailButton, emailDetailsTable, escapeHtml, wrapEmailHtml } from "./emailLayout.js";
import type { SubscriberRecord } from "./subscribers.js";

const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL ?? "REGULATEL <onboarding@resend.dev>";

async function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  return new Resend(key);
}

function publicBaseUrl() {
  // VERCEL_URL can be a preview deployment; verification links must use the public site.
  return (process.env.SITE_URL || "https://www.regulatel.org").replace(/\/$/, "");
}

function unsubscribeUrl(token: string) {
  return `${publicBaseUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function sendSubscriptionConfirmation(
  subscriber: SubscriberRecord,
  confirmationToken: string,
): Promise<{ ok: true } | { ok: false; error: string; uncertain?: boolean }> {
  const resend = await getResend().catch(() => null);
  if (!resend) {
    return { ok: false, error: "El envío de correo no está disponible. Intente más tarde." };
  }
  const confirmUrl = `${publicBaseUrl()}/confirm-subscription?token=${encodeURIComponent(confirmationToken)}`;
  const html = wrapEmailHtml({
    preheader: "Confirme su correo para recibir noticias y publicaciones de REGULATEL.",
    title: "Confirme su suscripción",
    footerNote: `Si no solicitó esta suscripción, ignore este correo o <a href="${unsubscribeUrl(subscriber.unsubscribeToken)}" style="color:#bdd034;text-decoration:underline;">cancele la solicitud aquí</a>.`,
    bodyHtml: `
      <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">
        Recibimos una solicitud para suscribir el correo <strong>${escapeHtml(subscriber.email)}</strong> a las actualizaciones de <strong>REGULATEL</strong>.
      </p>
      <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">
        Para activar la suscripción, abra el siguiente enlace y confirme en la página. Hasta entonces no recibirá boletines. El enlace vence en 24 horas.
      </p>
      ${emailButton(confirmUrl, "Confirmar mi suscripción")}
    `,
  });
  const key = crypto.createHash("sha256").update(confirmationToken).digest("hex");
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: subscriber.email,
      subject: "REGULATEL – Confirme su suscripción",
      html,
      text: `Para recibir las actualizaciones de REGULATEL, abra ${confirmUrl} y confirme su suscripción. El enlace vence en 24 horas. Si no lo solicitó, ignore este correo.`,
    }, { idempotencyKey: `subscription-verification/${key}` });
    if (error) {
      console.error("[subscribe] No se pudo enviar la verificación", error.name);
      return { ok: false, error: "No se pudo enviar el correo de verificación. Intente más tarde." };
    }
    if (!data?.id) {
      console.error("[subscribe] No se pudo confirmar el envío de la verificación", "MissingDeliveryId");
      return { ok: false, uncertain: true, error: "No pudimos confirmar el envío. Revise su correo antes de volver a intentar." };
    }
    return { ok: true };
  } catch {
    console.error("[subscribe] Falló el servicio de correo de verificación");
    // A timeout may happen after Resend accepted the email. Keep its link valid.
    return { ok: false, uncertain: true, error: "No pudimos confirmar el envío. Revise su correo antes de volver a intentar." };
  }
}

export async function notifyStaffNewSubscriber(subscriber: SubscriberRecord): Promise<void> {
  const resend = await getResend().catch(() => null);
  if (!resend) return;
  const html = wrapEmailHtml({
    preheader: `${escapeHtml(subscriber.email)} confirmó su suscripción a las actualizaciones de REGULATEL.`,
    title: "Nueva suscripción confirmada",
    footerNote: "Este aviso se envía a la Secretaría Ejecutiva después de verificar el correo del suscriptor.",
    bodyHtml: `
      <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">
        El titular del correo confirmó su suscripción a las actualizaciones del portal.
      </p>
      ${emailDetailsTable([
        { label: "Correo", value: subscriber.email },
        { label: "Estado", value: subscriber.reactivated ? "Reactivó y confirmó su suscripción" : "Nueva suscripción confirmada" },
      ])}
    `,
  });
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: contactRecipients(),
      subject: `REGULATEL – Nueva suscripción confirmada: ${subscriber.email}`,
      html,
      text: `Nueva suscripción confirmada: ${subscriber.email}`,
    }, { idempotencyKey: `subscriber-confirmed/${subscriber.id}/${subscriber.confirmationKey ?? "legacy"}` });
    if (error) console.error("[subscribe] No se pudo avisar a Secretaría", error.name);
  } catch {
    console.error("[subscribe] Falló el aviso de suscripción confirmada a Secretaría");
  }
}
