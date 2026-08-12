import { contactRecipients } from "./contactMessages.js";
import { emailButton, emailDetailsTable, escapeHtml, siteBaseUrl, wrapEmailHtml } from "./emailLayout.js";
import type { SubscriberRecord } from "./subscribers.js";

const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL ?? "REGULATEL <onboarding@resend.dev>";

async function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  return new Resend(key);
}

function unsubscribeUrl(token: string) {
  return `${siteBaseUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function sendSubscriptionConfirmation(subscriber: SubscriberRecord): Promise<void> {
  const resend = await getResend();
  if (!resend) {
    console.warn("[subscribe] RESEND_API_KEY no configurado. No se envió confirmación a", subscriber.email);
    return;
  }

  const html = wrapEmailHtml({
    preheader: "Su suscripción a las actualizaciones de REGULATEL quedó registrada.",
    title: "Suscripción confirmada",
    footerNote: `Si no solicitó esta suscripción, puede <a href="${unsubscribeUrl(subscriber.unsubscribeToken)}" style="color:#bdd034;text-decoration:underline;">darse de baja aquí</a>.`,
    bodyHtml: `
      <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">
        Gracias por suscribirse a las actualizaciones de <strong>REGULATEL</strong>.
      </p>
      <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">
        Le enviaremos noticias, eventos y publicaciones al correo <strong>${escapeHtml(subscriber.email)}</strong>. Puede darse de baja en cualquier momento.
      </p>
      ${emailButton(`${siteBaseUrl()}/noticias`, "Ver noticias")}
      ${emailButton(unsubscribeUrl(subscriber.unsubscribeToken), "Darse de baja", "ghost")}
    `,
  });

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: subscriber.email,
    subject: "REGULATEL – Suscripción confirmada",
    html,
  });
  if (error) {
    console.error("[subscribe] Error enviando confirmación a", subscriber.email, error);
  }
}

export async function notifyStaffNewSubscriber(subscriber: SubscriberRecord): Promise<void> {
  const resend = await getResend();
  if (!resend) return;

  const to = contactRecipients();
  const html = wrapEmailHtml({
    preheader: `${subscriber.email} se suscribió a las actualizaciones de REGULATEL.`,
    title: "Nueva suscripción",
    footerNote: "Este aviso se envía a la Secretaría Ejecutiva cuando alguien se suscribe en regulatel.org.",
    bodyHtml: `
      <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">
        Alguien se suscribió a las actualizaciones del portal.
      </p>
      ${emailDetailsTable([
        { label: "Correo", value: subscriber.email },
        { label: "Estado", value: subscriber.reactivated ? "Reactivó su suscripción" : "Nueva suscripción" },
      ])}
    `,
  });

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `REGULATEL – Nueva suscripción: ${subscriber.email}`,
    html,
    text: `Nueva suscripción: ${subscriber.email}`,
  });
  if (error) {
    console.error("[subscribe] Error avisando a la secretaría", error);
  }
}
