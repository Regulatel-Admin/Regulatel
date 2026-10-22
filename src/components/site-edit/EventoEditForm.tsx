import { useRef, useState, type ReactNode } from "react";
import { Send, Trash2 } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useAdminData, useEvents } from "@/contexts/AdminDataContext";
import { notifyCmsSaved, cloneJson } from "@/lib/siteEdit";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import { useRecoverableDraft } from "@/hooks/useRecoverableDraft";
import { DraftRecoveryNotice } from "@/components/site-edit/DraftRecoveryNotice";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
import EventAttachmentsField from "@/components/admin/EventAttachmentsField";
import { NotifySubscribersButton } from "@/components/admin/NotifySubscribersOption";
import {
  getEventStatus,
  getEventYear,
  normalizeEvent,
  slugifyEventId,
  type Event,
} from "@/types/event";

const fieldClass =
  "w-full min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-snug outline-none transition-colors focus:border-[var(--regu-blue)] focus:ring-2 focus:ring-[rgba(68,137,198,0.18)]";
const fieldStyle = { borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" } as const;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function isValidUrl(s: string): boolean {
  if (!s.trim()) return true;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function emptyEvento(): Event {
  const startDate = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  return {
    id: `evento-new-${Date.now()}`,
    title: "",
    organizer: "",
    location: "",
    startDate,
    endDate: null,
    year: getEventYear(startDate),
    status: getEventStatus({ startDate, endDate: null }),
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "",
    imageUrl: "",
    attachments: [],
    createdAt: now,
    updatedAt: now,
  };
}

function withDerivedDates(row: Event, startDate: string, endDate: string | null): Event {
  return normalizeEvent({
    ...row,
    startDate,
    endDate,
    year: getEventYear(startDate),
    status: getEventStatus({ startDate, endDate }),
  });
}

export function EventoForm({ id }: { id?: string }) {
  const { events, contentSource } = useAdminData();
  const visibleEvents = useEvents();
  if (contentSource === "loading") return <p role="status">Cargando evento…</p>;
  const seed = events.find((event) => event.id === id) ?? visibleEvents.find((event) => event.id === id);
  if (id && !seed) {
    return <p role="alert">No se encontró este evento. Recarga el listado antes de editarlo.</p>;
  }
  return <LoadedEventoForm key={id ?? "new-evento"} id={id} seed={seed} />;
}

function LoadedEventoForm({ id, seed }: { id?: string; seed?: Event }) {
  const { events, addEvent, updateEvent, deleteEvent } = useAdminData();
  const { recordPersistedChange, clearPreview, close, open } = useSiteEdit();
  const [savedId, setSavedId] = useState(id);
  const storedEvent = events.find((e) => e.id === (savedId ?? id));
  const existing = storedEvent ?? seed;

  const initial = useRef(existing ? { ...existing } : emptyEvento());
  const [baseline, setBaseline] = useState(initial.current);
  const { value: row, setValue: setRow, reset } = useDraftHistory<Event>(initial.current);
  const draft = useRecoverableDraft({ identity: `event:${id ?? "new"}`, kind: "event", path: id ? `/eventos/${encodeURIComponent(id)}` : "/eventos?tab=todos", label: row.title,
    value: row, baseline, enabled: true, newEvent: !id, onRestore: reset });

  const [removed, setRemoved] = useState(existing?.published === false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [publishedNote, setPublishedNote] = useState<string | undefined>();

  const isNew = !existing;
  const previewEvent = removed ? undefined : normalizeEvent(row);
  const captureBaseline = usePreviewSync("evento", previewEvent, !removed);

  const remove = async () => {
    if (saving || removed) return;
    if (!existing) {
      draft.clear(baseline);
      captureBaseline();
      clearPreview("evento");
      close();
      return;
    }
    setSaving(true);
    setError(null);
    const before = cloneJson(existing);
    try {
      if (storedEvent && existing) {
        await updateEvent(before.id, { published: false });
      } else {
        // A CMS override also suppresses the static fallback after a reload.
        await addEvent({ ...before, published: false });
        setSavedId(before.id);
      }
      recordPersistedChange({
        label: "retirar evento",
        undo: async () => {
          await updateEvent(before.id, { published: before.published !== false });
          notifyCmsSaved("events");
          setRemoved(before.published === false);
          setPublished(false);
        },
        redo: async () => {
          await updateEvent(before.id, { published: false });
          notifyCmsSaved("events");
          setRemoved(true);
          setPublishedNote("Evento despublicado. Sus datos y documentos se conservan.");
          setPublished(true);
        },
      });
      captureBaseline();
      clearPreview("evento");
      setRemoved(true);
      setPublishedNote("Evento despublicado. Sus datos y documentos se conservan.");
      setPublished(true);
      notifyCmsSaved("events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo despublicar el evento.");
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (saving) return;

    if (!row.title.trim()) {
      setError("El evento necesita un título.");
      return;
    }
    if (!row.startDate.trim()) {
      setError("Indica la fecha de inicio.");
      return;
    }
    const registrationUrl = row.registrationUrl?.trim() || "";
    const detailsUrl = row.detailsUrl?.trim() || "";
    const imageUrl = row.imageUrl?.trim() || "";
    if (!isValidUrl(registrationUrl)) {
      setError("El enlace de inscripción debe empezar por http o https.");
      return;
    }
    if (!isValidUrl(detailsUrl)) {
      setError("El enlace de más información debe empezar por http o https.");
      return;
    }
    if (imageUrl && !isValidUrl(imageUrl) && !imageUrl.startsWith("/")) {
      setError("El enlace de la imagen no es válido.");
      return;
    }

    const year = getEventYear(row.startDate);
    const payload = {
      title: row.title.trim(),
      organizer: row.organizer.trim(),
      location: row.location.trim(),
      startDate: row.startDate.trim(),
      endDate: row.endDate?.trim() || null,
      registrationUrl: registrationUrl || null,
      detailsUrl: detailsUrl || null,
      isFeatured: row.isFeatured,
      published: true,
      description: row.description?.trim() || undefined,
      tags: row.tags ?? [],
      imageUrl: imageUrl || undefined,
      attachments: (row.attachments ?? []).filter((item) => item.url.trim()),
    };

    setSaving(true);
    setError(null);
    try {
      const finalId = existing?.id ?? slugifyEventId(payload.title, year);
      if (storedEvent && existing) {
        const before = {
          title: existing.title,
          organizer: existing.organizer,
          location: existing.location,
          startDate: existing.startDate,
          endDate: existing.endDate,
          registrationUrl: existing.registrationUrl,
          detailsUrl: existing.detailsUrl,
          isFeatured: existing.isFeatured,
          published: existing.published !== false,
          description: existing.description,
          tags: existing.tags,
          imageUrl: existing.imageUrl,
          attachments: existing.attachments ?? [],
        };
        await updateEvent(existing.id, payload);
        recordPersistedChange({
          label: "evento",
          undo: async () => {
            await updateEvent(existing.id, before);
            notifyCmsSaved("events");
          },
          redo: async () => {
            await updateEvent(existing.id, payload);
            notifyCmsSaved("events");
          },
        });
        setRow(normalizeEvent({ ...existing, ...payload, year }));
      } else {
        const nextId = existing?.id ?? slugifyEventId(payload.title, year);
        await addEvent({ ...existing, ...payload, id: nextId });
        setSavedId(nextId);
        recordPersistedChange({
          label: "evento",
          undo: async () => {
            await deleteEvent(nextId);
            notifyCmsSaved("events");
          },
          redo: async () => {
            await addEvent({ ...payload, id: nextId });
            notifyCmsSaved("events");
          },
        });
        setRow(normalizeEvent({ ...row, ...payload, id: nextId, year }));
      }
      notifyCmsSaved("events");
      const saved = normalizeEvent({ ...row, ...payload, id: finalId, year });
      draft.clear(saved); setBaseline(saved); reset(saved);
      captureBaseline(saved);
      clearPreview("evento");
      setRemoved(false);
      setPublishedNote("Ya está en el sitio público.");
      setPublished(true);
      if (!id) open({ kind: "evento", id: finalId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <DraftRecoveryNotice draft={draft} disabled={saving} />
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
        Título, fechas y lugar. Se ve en la grilla al instante.
      </p>
      <Field label="Título">
        <input
          className={fieldClass}
          style={fieldStyle}
          value={row.title}
          onChange={(e) => {
            setRow({ ...row, title: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Organizador">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={row.organizer}
            onChange={(e) => {
              setRow({ ...row, organizer: e.target.value });
              setPublished(false);
            }}
          />
        </Field>
        <Field label="Lugar">
          <input
            className={fieldClass}
            style={fieldStyle}
            value={row.location}
            onChange={(e) => {
              setRow({ ...row, location: e.target.value });
              setPublished(false);
            }}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha de inicio">
          <input
            type="date"
            className={fieldClass}
            style={fieldStyle}
            value={row.startDate}
            onChange={(e) => {
              setRow(withDerivedDates(row, e.target.value, row.endDate));
              setPublished(false);
            }}
          />
        </Field>
        <Field label="Fecha fin (opcional)">
          <input
            type="date"
            className={fieldClass}
            style={fieldStyle}
            value={row.endDate ?? ""}
            onChange={(e) => {
              setRow(withDerivedDates(row, row.startDate, e.target.value || null));
              setPublished(false);
            }}
          />
        </Field>
      </div>
      <Field label="Descripción">
        <textarea
          rows={4}
          className={`${fieldClass} resize-y`}
          style={fieldStyle}
          value={row.description ?? ""}
          onChange={(e) => {
            setRow({ ...row, description: e.target.value });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Enlace para inscribirse">
        <input
          type="url"
          className={fieldClass}
          style={fieldStyle}
          placeholder="https://…"
          value={row.registrationUrl ?? ""}
          onChange={(e) => {
            setRow({ ...row, registrationUrl: e.target.value || null });
            setPublished(false);
          }}
        />
      </Field>
      <Field label="Más información (enlace)">
        <input
          type="url"
          className={fieldClass}
          style={fieldStyle}
          placeholder="https://…"
          value={row.detailsUrl ?? ""}
          onChange={(e) => {
            setRow({ ...row, detailsUrl: e.target.value || null });
            setPublished(false);
          }}
        />
      </Field>
      <AdminBlobUploadField
        label="Imagen del evento"
        value={row.imageUrl ?? ""}
        onChange={(url) => {
          setRow({ ...row, imageUrl: url });
          setPublished(false);
        }}
        kind="image"
        folder="events"
      />
      <EventAttachmentsField
        value={row.attachments ?? []}
        onChange={(attachments) => {
          setRow({ ...row, attachments });
          setPublished(false);
        }}
        disabled={saving}
      />
      <label className="flex items-center gap-2 text-sm" style={{ color: "var(--regu-navy)" }}>
        <input
          type="checkbox"
          checked={row.isFeatured}
          onChange={(e) => {
            setRow({ ...row, isFeatured: e.target.checked });
            setPublished(false);
          }}
        />
        Destacar en la portada
      </label>
      <div
        className="sticky bottom-0 -mx-6 mt-8 border-t bg-white px-6 py-4"
        style={{ borderColor: "rgba(22,61,89,0.08)" }}
      >
        {error && (
          <p className="mb-2 text-sm" style={{ color: "#991b1b" }}>
            {error}
          </p>
        )}
        {published && !error && (
          <p className="mb-2 text-sm font-medium" style={{ color: "#0f766e" }}>
            {publishedNote || "Ya está en el sitio público."}
          </p>
        )}
        <p className="mb-3 text-[12px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
          Se ve al instante en esta página. Hasta que publiques, el sitio real no cambia.
        </p>
        {!removed ? (
          <div className="mb-3">
            <NotifySubscribersButton
              payload={{
                type: "evento",
                title: row.title,
                excerpt: row.description,
                url: `/eventos/${existing?.id ?? savedId ?? slugifyEventId(row.title, getEventYear(row.startDate))}`,
                date: row.startDate,
              }}
              disabled={saving}
            />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "var(--regu-blue)" }}
          >
            <Send className="h-4 w-4" />
            {saving ? "Guardando…" : removed ? "Volver a publicar" : published ? "Publicar otra vez" : "Publicar"}
          </button>
          <button
            type="button"
            onClick={() => void remove()}
            disabled={saving || removed}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-60"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            <Trash2 className="h-4 w-4" />
            {removed ? "Despublicado" : isNew ? "Descartar" : "Quitar"}
          </button>
        </div>
      </div>
    </div>
  );
}
