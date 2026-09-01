import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

export type AddCategoryDialogState =
  | { kind: "category"; itemId: string; itemLabel: string; columnIndex: number; columnTitle: string }
  | { kind: "column"; itemId: string; itemLabel: string };

export function MegaAddCategoryButton({
  onClick,
  compact,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={
        compact
          ? "mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-2.5 py-2 text-[11px] font-bold uppercase tracking-wide transition hover:bg-[rgba(15,118,110,0.08)]"
          : "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide transition hover:bg-[rgba(15,118,110,0.08)]"
      }
      style={{ borderColor: "rgba(15,118,110,0.45)", color: "#0f766e" }}
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
      Añadir categoría
    </button>
  );
}

export function MegaAddColumnButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-6 text-center transition hover:bg-[rgba(15,118,110,0.06)]"
      style={{ borderColor: "rgba(15,118,110,0.4)", color: "#0f766e" }}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(15,118,110,0.12)" }}
      >
        <Plus className="h-5 w-5" aria-hidden />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-wide">Añadir grupo</span>
      <span className="text-[11px] font-normal normal-case tracking-normal" style={{ color: "var(--regu-gray-500)" }}>
        Una columna nueva en este menú
      </span>
    </button>
  );
}

export function AddCategoryDialog({
  state,
  onClose,
  onSubmit,
}: {
  state: AddCategoryDialogState | null;
  onClose: () => void;
  onSubmit: (title: string, description: string) => Promise<string | null>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state) return;
    setTitle("");
    setDescription("");
    setError(null);
    setSaving(false);
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, saving, onClose]);

  if (!state) return null;

  const isCategory = state.kind === "category";
  const heading = isCategory ? "Nueva categoría" : "Nuevo grupo";
  const context = isCategory
    ? `${state.itemLabel} → ${state.columnTitle}`
    : `En ${state.itemLabel}`;

  const submit = async () => {
    const nextTitle = title.trim();
    if (!nextTitle) {
      setError(isCategory ? "Ponle un nombre a la categoría." : "Ponle un nombre al grupo.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onSubmit(nextTitle, description.trim());
    setSaving(false);
    if (result) setError(result);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        onClick={() => {
          if (!saving) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-category-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        style={{ border: "1px solid rgba(22,61,89,0.10)" }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "#0f766e" }}>
              {context}
            </p>
            <h2 id="add-category-title" className="mt-1 text-lg font-bold" style={{ color: "var(--regu-navy)" }}>
              {heading}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
            Nombre
          </span>
          <input
            ref={inputRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void submit();
            }}
            placeholder={isCategory ? "Ej. Conocimiento abierto" : "Ej. Formación"}
            className="w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--regu-blue)] focus:ring-2 focus:ring-[rgba(68,137,198,0.18)]"
            style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
          />
        </label>
        {isCategory && (
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[13px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
              Texto corto en el menú
            </span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Una línea bajo el nombre"
              className="w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--regu-blue)] focus:ring-2 focus:ring-[rgba(68,137,198,0.18)]"
              style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
            />
          </label>
        )}
        {error && (
          <p className="mt-3 text-sm" style={{ color: "#991b1b" }}>
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
            style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-gray-700)" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#0f766e" }}
          >
            {saving ? "Creando…" : isCategory ? "Crear y abrir" : "Añadir grupo"}
          </button>
        </div>
      </div>
    </div>
  );
}
