import { BookOpenCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Event } from "@/types/event";
import { getEventMaterials } from "@/data/eventMaterials";

const labels = {
  es: { label: "Materiales disponibles", program: "programa", programs: "programas", document: "documento", documents: "documentos", photo: "foto", photos: "fotos" },
  en: { label: "Event materials available", program: "programme", programs: "programmes", document: "document", documents: "documents", photo: "photo", photos: "photos" },
  pt: { label: "Materiais disponíveis", program: "programa", programs: "programas", document: "documento", documents: "documentos", photo: "foto", photos: "fotos" },
  it: { label: "Materiali disponibili", program: "programma", programs: "programmi", document: "documento", documents: "documenti", photo: "foto", photos: "foto" },
};

export default function EventMaterialsBadge({ event }: { event: Event }) {
  const { i18n } = useTranslation();
  const content = getEventMaterials(event);
  if (event.status !== "past" || !content) return null;
  const language = i18n.language.split("-")[0] as keyof typeof labels;
  const text = labels[language] ?? labels.es;
  const counts = [
    content.programs ? `${content.programs} ${content.programs === 1 ? text.program : text.programs}` : "",
    content.documents ? `${content.documents} ${content.documents === 1 ? text.document : text.documents}` : "",
    content.photos ? `${content.photos} ${content.photos === 1 ? text.photo : text.photos}` : "",
  ].filter(Boolean).join(" · ");
  return <div className="mt-4" data-event-materials={event.id}>
    <span className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold" style={{ color: "#28644D", backgroundColor: "#F3F7F4", borderColor: "#DEE9E1" }}><BookOpenCheck size={14} aria-hidden/>{text.label}</span>
    <p className="mt-1 text-[10px] leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>{counts}</p>
  </div>;
}
