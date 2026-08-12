import { emailDetailsTable, escapeHtml, wrapEmailHtml } from "./emailLayout.js";

const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL ?? "REGULATEL <onboarding@resend.dev>";

export function contactRecipients() {
  const raw = process.env.CONTACT_TO_EMAIL?.trim();
  if (raw) {
    return raw.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return ["dcuervo@indotel.gob.do"];
}

async function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  return new Resend(key);
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  organization?: string | null;
  subject: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const subject = input.subject.trim();
  const message = input.message.trim();
  const organization = input.organization?.trim() || null;

  if (!name) return { ok: false, error: "El nombre es obligatorio.", status: 400 };
  if (!email || !email.includes("@")) return { ok: false, error: "Indique un correo electrónico válido.", status: 400 };
  if (!subject) return { ok: false, error: "El asunto es obligatorio.", status: 400 };
  if (!message) return { ok: false, error: "El mensaje es obligatorio.", status: 400 };

  const resend = await getResend();
  if (!resend) {
    return { ok: false, error: "El envío de correo no está configurado.", status: 503 };
  }

  const to = contactRecipients();
  const html = wrapEmailHtml({
    preheader: `${name} escribió desde el formulario de contacto de REGULATEL.`,
    title: "Nuevo mensaje de contacto",
    footerNote: "Puede responder este correo para escribirle directamente a la persona.",
    bodyHtml: `
      <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">
        Alguien envió un mensaje desde <strong>www.regulatel.org/contacto</strong>.
      </p>
      ${emailDetailsTable([
        { label: "Nombre", value: name },
        { label: "Correo", value: email },
        { label: "Institución", value: organization },
        { label: "Asunto", value: subject },
      ])}
      <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b7c8a;">Mensaje</p>
      <div style="background-color:#f4f7fa;border:1px solid #e5eaf0;border-radius:12px;padding:16px 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#163d59;white-space:pre-wrap;">${escapeHtml(message)}</div>
    `,
  });

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: email,
    subject: `REGULATEL – Contacto: ${subject}`,
    html,
    text: `Nombre: ${name}\nCorreo: ${email}\nInstitución: ${organization || "No indicado"}\nAsunto: ${subject}\n\n${message}`,
  });
  if (error) {
    console.error("[contact] Error enviando mensaje", error);
    return { ok: false, error: error.message, status: 502 };
  }
  return { ok: true };
}
