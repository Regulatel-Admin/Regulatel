import { api } from "@/lib/api";

export type SubscriberNotifyType = "noticia" | "evento" | "publicación";

export type SubscriberNotifyPayload = {
  type: SubscriberNotifyType;
  title: string;
  excerpt?: string;
  url?: string;
  date?: string;
};

export type SubscriberNotifyResult = {
  sent: number;
  skipped: boolean;
  total?: number;
  error?: string;
};

export type SubscriberNotifyPreview = {
  subject: string;
  html: string;
  total: number;
  error?: string;
};

export async function notifySubscribersOfPublish(
  payload: SubscriberNotifyPayload
): Promise<SubscriberNotifyResult> {
  const res = await api.admin.notifySubscribers(payload);
  if (!res.ok) {
    return { sent: 0, skipped: false, error: res.error ?? "No se pudo enviar el correo." };
  }
  return {
    sent: res.data.sent,
    skipped: res.data.skipped,
    total: res.data.total,
  };
}

export async function previewSubscriberNotify(
  payload: SubscriberNotifyPayload
): Promise<SubscriberNotifyPreview> {
  const res = await api.admin.notifySubscribersPreview(payload);
  if (!res.ok) {
    return {
      subject: "",
      html: "",
      total: 0,
      error: res.error ?? "No se pudo generar la vista previa.",
    };
  }
  return {
    subject: res.data.subject,
    html: res.data.html,
    total: res.data.total,
  };
}

export function subscriberNotifyMessage(result: SubscriberNotifyResult): string {
  if (result.error) {
    return `No se pudo avisar a los suscriptores: ${result.error}`;
  }
  if (result.skipped) {
    return "El envío de correos no está configurado (falta la clave de Resend).";
  }
  if (result.sent === 0) {
    return "No hay suscriptores activos a quienes avisar.";
  }
  const n = result.sent;
  return `Se avisó a ${n} suscriptor${n === 1 ? "" : "es"}.`;
}
