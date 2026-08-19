import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mail, Send, X } from "lucide-react";
import {
  notifySubscribersOfPublish,
  previewSubscriberNotify,
  subscriberNotifyMessage,
  type SubscriberNotifyPayload,
} from "@/lib/notifySubscribers";

type NotifySubscribersButtonProps = {
  payload: SubscriberNotifyPayload;
  disabled?: boolean;
  /** Si el contenido aún no está en el sitio público. */
  warnUnpublished?: boolean;
  disabledHint?: string;
  onSent?: (message: string) => void;
};

export function NotifySubscribersButton({
  payload,
  disabled,
  warnUnpublished,
  disabledHint,
  onSent,
}: NotifySubscribersButtonProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SubscriberNotifyPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ subject: string; html: string; total: number } | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const missingTitle = !payload.title.trim();
  const isDisabled = disabled || missingTitle;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, sending]);

  useEffect(() => {
    if (!open || !draft) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPreview(null);
    void (async () => {
      const result = await previewSubscriberNotify(draft);
      if (cancelled) return;
      if (result.error) {
        setError(result.error);
      } else {
        setPreview({ subject: result.subject, html: result.html, total: result.total });
      }
      setLoading(false);
      requestAnimationFrame(() => dialogRef.current?.focus());
    })();
    return () => {
      cancelled = true;
    };
  }, [open, draft]);

  const close = () => {
    if (sending) return;
    setOpen(false);
  };

  const send = async () => {
    if (!draft) return;
    setSending(true);
    setError(null);
    const result = await notifySubscribersOfPublish(draft);
    const message = subscriberNotifyMessage(result);
    setSending(false);
    if (result.error) {
      setError(message);
      return;
    }
    setSentMessage(message);
    onSent?.(message);
    setOpen(false);
  };

  const hint = isDisabled
    ? disabledHint || (missingTitle ? "Pon un título antes de avisar." : undefined)
    : "Primero verás el correo. No se envía hasta que confirmes.";

  return (
    <div>
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => {
          setSentMessage(null);
          setDraft({
            type: payload.type,
            title: payload.title.trim(),
            excerpt: payload.excerpt?.trim() || undefined,
            url: payload.url?.trim() || undefined,
            date: payload.date?.trim() || undefined,
          });
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          borderColor: "rgba(22,61,89,0.18)",
          backgroundColor: "#f0f7fb",
          color: "var(--regu-navy)",
        }}
      >
        <Mail className="h-4 w-4" />
        Notificar a todos los suscriptores
      </button>
      {hint ? (
        <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
          {hint}
        </p>
      ) : null}
      {sentMessage ? (
        <p className="mt-2 text-sm font-medium" style={{ color: "#0f766e" }}>
          {sentMessage}
        </p>
      ) : null}

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[240] flex items-end justify-center p-3 sm:items-center sm:p-6">
              <button
                type="button"
                className="absolute inset-0 bg-slate-900/45"
                aria-label="Cerrar vista previa"
                disabled={sending}
                onClick={close}
              />
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="relative flex max-h-[min(92vh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
              >
                <div
                  className="flex items-start justify-between gap-3 border-b px-5 py-4"
                  style={{ borderColor: "rgba(22,61,89,0.10)" }}
                >
                  <div className="min-w-0">
                    <h2
                      id={titleId}
                      className="text-base font-bold leading-snug"
                      style={{ color: "var(--regu-navy)" }}
                    >
                      Así les llegará el correo
                    </h2>
                    <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
                      Esta es la misma plantilla que se envía. Revisa el asunto y el contenido antes de notificar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    disabled={sending}
                    className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-50"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  {warnUnpublished ? (
                    <p
                      className="mb-3 rounded-xl border px-3 py-2 text-[13px] leading-relaxed"
                      style={{
                        borderColor: "#f59e0b",
                        backgroundColor: "#fffbeb",
                        color: "#92400e",
                      }}
                    >
                      Esta pieza aún no está visible en el sitio. El enlace del correo puede no funcionar hasta que la
                      publiques.
                    </p>
                  ) : null}

                  {loading ? (
                    <p className="text-sm" style={{ color: "var(--regu-gray-500)" }}>
                      Preparando la vista previa…
                    </p>
                  ) : null}

                  {error && !loading ? (
                    <p className="text-sm" style={{ color: "#991b1b" }}>
                      {error}
                    </p>
                  ) : null}

                  {preview && !loading ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--regu-gray-500)" }}>
                          Asunto
                        </p>
                        <p className="mt-1 text-sm font-semibold" style={{ color: "var(--regu-navy)" }}>
                          {preview.subject}
                        </p>
                      </div>
                      <p className="text-sm" style={{ color: "var(--regu-gray-600)" }}>
                        {preview.total === 0
                          ? "Nadie está inscrito todavía. Si envías ahora, no saldrá ningún correo."
                          : `Se enviará a ${preview.total} ${preview.total === 1 ? "persona inscrita" : "personas inscritas"}.`}
                      </p>
                      <div
                        className="overflow-hidden rounded-xl border"
                        style={{ borderColor: "rgba(22,61,89,0.12)", backgroundColor: "#e8eef3" }}
                      >
                        <iframe
                          title="Vista previa del correo"
                          srcDoc={preview.html}
                          sandbox=""
                          className="h-[min(52vh,480px)] w-full bg-white"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div
                  className="flex flex-wrap justify-end gap-2 border-t bg-white px-5 py-4"
                  style={{ borderColor: "rgba(22,61,89,0.10)" }}
                >
                  <button
                    type="button"
                    onClick={close}
                    disabled={sending}
                    className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                    style={{ borderColor: "rgba(22,61,89,0.18)", color: "var(--regu-navy)" }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={sending || loading || !preview || preview.total === 0}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: "var(--regu-blue)" }}
                  >
                    <Send className="h-4 w-4" />
                    {sending ? "Enviando…" : "Enviar / Notificar"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

