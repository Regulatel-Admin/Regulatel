import { emailDetailsTable, escapeHtml, wrapEmailHtml } from "./emailLayout.js";
import { isValidPublicEmail } from "./formSecurity.js";

export type ContactMessageInput = {
  name: string;
  email: string;
  organization?: string | null;
  subject: string;
  message: string;
};

export type ValidContactMessage = ContactMessageInput & { organization: string | null };
export type ContactMessageResult = { ok: true } | { ok: false; error: string; status: number };

export function validateContactMessage(input: ContactMessageInput):
  | { ok: true; value: ValidContactMessage }
  | { ok: false; error: string; status: number } {
  const fields = [
    { key: "name", label: "nombre", value: input.name, limit: 120, required: true },
    { key: "email", label: "correo electrónico", value: input.email, limit: 254, required: true },
    { key: "organization", label: "institución", value: input.organization ?? "", limit: 160, required: false },
    { key: "subject", label: "asunto", value: input.subject, limit: 180, required: true },
    { key: "message", label: "mensaje", value: input.message, limit: 5000, required: true },
  ];
  for (const field of fields) {
    const controlChars = field.key === "message" ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/ : /[\u0000-\u001f\u007f-\u009f]/;
    if (controlChars.test(field.value)) {
      return { ok: false, error: `El ${field.label} contiene caracteres no permitidos.`, status: 400 };
    }
    if (field.value.length > field.limit) {
      return { ok: false, error: `El ${field.label} debe tener como máximo ${field.limit} caracteres.`, status: 400 };
    }
    if (field.required && !field.value.trim()) {
      return { ok: false, error: `El ${field.label} es obligatorio.`, status: 400 };
    }
  }
  const value = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    organization: input.organization?.trim() || null,
    subject: input.subject.trim(),
    message: input.message.trim(),
  };
  if (!isValidPublicEmail(value.email)) {
    return { ok: false, error: "Indique un correo electrónico válido.", status: 400 };
  }
  return { ok: true, value };
}

const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL ?? "REGULATEL <onboarding@resend.dev>";

export function contactRecipients() {
  const raw = process.env.CONTACT_TO_EMAIL?.trim();
  if (raw) {
    return raw.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return ["dcuervo@indotel.gob.do", "aarango@indotel.gob.do"];
}

async function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  return new Resend(key);
}

export async function sendContactMessage(input: ContactMessageInput): Promise<ContactMessageResult> {
  const validation = validateContactMessage(input);
  if (!validation.ok) return validation;
  const { name, email, subject, message, organization } = validation.value;

  const resend = await getResend();
  if (!resend) {
    return { ok: false, error: "El envío de correo no está configurado.", status: 503 };
  }

  const to = contactRecipients();
  const html = wrapEmailHtml({
    preheader: `${escapeHtml(name)} escribió desde el formulario de contacto de REGULATEL.`,
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
    console.error("[contact] El proveedor rechazó el envío del mensaje.");
    return { ok: false, error: "No se pudo enviar el mensaje. Intente más tarde.", status: 502 };
  }
  return { ok: true };
}
