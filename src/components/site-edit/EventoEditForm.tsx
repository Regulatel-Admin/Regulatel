import { useState, type ReactNode } from "react";
import { Send, Trash2 } from "lucide-react";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { useAdminData } from "@/contexts/AdminDataContext";
import { notifyCmsSaved, cloneJson } from "@/lib/siteEdit";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { usePreviewSync } from "@/hooks/usePreviewSync";
import { AdminBlobUploadField } from "@/components/admin/AdminBlobUploadField";
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
  const { events, addEvent, updateEvent, deleteEvent } = useAdminData();
  const { recordPersistedChange, clearPreview } = useSiteEdit();
  const [savedId, setSavedId] = useState(id);
  const existing = events.find((e) => e.id === (savedId ?? id));

  const { value: row, setValue: setRow } = useDraftHistory<Event>(() =>
    existing ? { ...existing } : emptyEvento(),
  );

  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [publishedNote, setPublishedNote] = useState<string | undefined>();

  const isNew = !existing;
  const previewEvent = removed ? undefined : normalizeEvent(row);
  const captureBaseline = usePreviewSync("evento", previewEvent, !removed);

  const save = async () => {
    if (removed) {
      if (!existing) {
        clearPreview("evento");
        return;
      }
      setSaving(true);
      setError(null);
      const before = cloneJson(existing);
      try {
        await deleteEvent(existing.id);
        recordPersistedChange({
          label: "evento",
          undo: async () => {
            await addEvent({ ...before, id: before.id });
            notifyCmsSaved("events");
          },
          redo: async () => {
            await deleteEvent(before.id);
            notifyCmsSaved("events");
          },
        });
        notifyCmsSaved("events");
        captureBaseline();
        clearPreview("evento");
        setPublished(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo quitar el evento.");
      } finally {
        setSaving(false);
      }
      return;
    }

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
      description: row.description?.trim() || undefined,
      tags: row.tags ?? [],
      imageUrl: imageUrl || undefined,
    };

    setSaving(true);
    setError(null);
    try {
      if (existing) {
        const before = {
          title: existing.title,
          organizer: existing.organizer,
          location: existing.location,
          startDate: existing.startDate,
          endDate: existing.endDate,
          registrationUrl: existing.registrationUrl,
          detailsUrl: existing.detailsUrl,
          isFeatured: existing.isFeatured,
          description: existing.description,
          tags: existing.tags,
          imageUrl: existing.imageUrl,
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
        const nextId = slugifyEventId(payload.title, year);
        await addEvent({ ...payload, id: nextId });
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
      captureBaseline();
      clearPreview("evento");
      setPublishedNote("Ya está en el sitio público.");
      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
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
            {saving ? "Publicando…" : published ? "Publicar otra vez" : removed ? "Quitar del sitio" : "Publicar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setRemoved(true);
              setPublished(false);
              if (isNew) clearPreview("evento");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-red-700"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            <Trash2 className="h-4 w-4" />
            Quitar
          </button>
        </div>
      </div>
    </div>
  );
}
