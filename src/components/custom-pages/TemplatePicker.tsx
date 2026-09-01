import { LayoutTemplate, MousePointer2 } from "lucide-react";
import { CUSTOM_PAGE_TEMPLATES, type CustomPageTemplateId } from "@/data/customPages";

export function ModePicker({
  onTemplates,
  onFree,
}: {
  onTemplates: () => void;
  onFree: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-center text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: "#0f766e" }}>
        Cómo se verá esta categoría
      </p>
      <h1
        className="mt-2 text-center text-3xl font-bold"
        style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
      >
        Elige cómo quieres armar la página
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
        Puedes partir de un formato listo y solo rellenar datos, o entrar al lienzo libre y colocar cada pieza a mano.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <button
          type="button"
          onClick={onTemplates}
          className="rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          style={{ borderColor: "rgba(22,61,89,0.12)" }}
        >
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(68,137,198,0.12)", color: "var(--regu-blue)" }}
          >
            <LayoutTemplate className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-bold" style={{ color: "var(--regu-navy)" }}>
            Plantillas
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
            Formatos ya diseñados. Tú pones el título, el texto, las fotos, los videos o los PDFs.
          </p>
        </button>
        <button
          type="button"
          onClick={onFree}
          className="rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          style={{ borderColor: "rgba(22,61,89,0.12)" }}
        >
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(15,118,110,0.12)", color: "#0f766e" }}
          >
            <MousePointer2 className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-bold" style={{ color: "var(--regu-navy)" }}>
            Edición libre
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
            Arrastra títulos, fotos, videos, portadas y cajitas exactamente donde los quieres. Colores incluidos.
          </p>
        </button>
      </div>
    </div>
  );
}

export function TemplateGallery({
  onPick,
  onBack,
}: {
  onPick: (id: CustomPageTemplateId) => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold"
        style={{ color: "var(--regu-blue)" }}
      >
        ← Volver
      </button>
      <h1
        className="mt-4 text-3xl font-bold"
        style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
      >
        Elige un formato
      </h1>
      <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--regu-gray-600)" }}>
        Después solo rellenas la información. Si más adelante quieres control total, puedes pasar a edición libre.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CUSTOM_PAGE_TEMPLATES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPick(item.id)}
            className="rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: "rgba(22,61,89,0.12)" }}
          >
            <TemplateSketch id={item.id} />
            <h2 className="mt-3 font-bold" style={{ color: "var(--regu-navy)" }}>
              {item.name}
            </h2>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
              {item.blurb}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TemplateSketch({ id }: { id: CustomPageTemplateId }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ backgroundColor: "#F3F6F8", height: 118 }}>
      {id === "articulo" && (
        <div className="flex h-full flex-col">
          <div className="h-12" style={{ backgroundColor: "#163D59" }} />
          <div className="space-y-1.5 p-3">
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: "#4489C6" }} />
            <div className="h-1.5 w-full rounded bg-white" />
            <div className="h-1.5 w-5/6 rounded bg-white" />
          </div>
        </div>
      )}
      {id === "hub" && (
        <div className="flex h-full flex-col p-3">
          <div className="mb-2 h-2 w-1/2 rounded" style={{ backgroundColor: "#163D59" }} />
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((n) => (
              <div key={n} className="h-16 rounded-lg bg-white" style={{ borderTop: "3px solid #4489C6" }} />
            ))}
          </div>
        </div>
      )}
      {id === "multimedia" && (
        <div className="flex h-full gap-2 p-3">
          <div className="h-full flex-1 rounded-lg" style={{ backgroundColor: "#051329" }} />
          <div className="grid w-16 grid-rows-3 gap-1">
            <div className="rounded bg-white" />
            <div className="rounded bg-white" />
            <div className="rounded bg-white" />
          </div>
        </div>
      )}
      {id === "documentos" && (
        <div className="space-y-2 p-3">
          {[0, 1, 2].map((n) => (
            <div key={n} className="flex h-6 items-center gap-2 rounded bg-white px-2">
              <span className="h-3 w-3 rounded" style={{ backgroundColor: "#4489C6" }} />
              <span className="h-1.5 flex-1 rounded" style={{ backgroundColor: "#E6E7DF" }} />
            </div>
          ))}
        </div>
      )}
      {id === "landing" && (
        <div className="flex h-full flex-col">
          <div className="relative h-16" style={{ backgroundColor: "#163D59" }}>
            <div className="absolute bottom-2 left-3 h-2 w-24 rounded bg-white/80" />
          </div>
          <div className="grid flex-1 grid-cols-3 gap-2 p-2">
            <div className="rounded" style={{ backgroundColor: "#4489C6" }} />
            <div className="rounded" style={{ backgroundColor: "#33A4B4" }} />
            <div className="rounded" style={{ backgroundColor: "#163D59" }} />
          </div>
        </div>
      )}
    </div>
  );
}
