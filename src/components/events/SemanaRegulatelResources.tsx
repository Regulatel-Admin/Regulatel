import { SEMANA_RESOURCE_GROUPS } from "@/data/eventMaterials";
import { EVENT_LAYOUT_OPTIONS, isEventLayout, type EventLayout } from "@/data/eventLayouts";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, Images, MapPin, X } from "lucide-react";
import type { Event, EventAttachment } from "@/types/event";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import EventPdfReader from "@/components/events/EventPdfReader";
import EventDocumentsSection from "@/components/events/EventDocumentsSection";
import materials from "@/data/semanaRegulatelMaterials.json";
import "./semana-event.css";

const resources = SEMANA_RESOURCE_GROUPS;
export function hasSemanaResources(id: string) { return Boolean(resources[id]); }
type Preview = { title: string; url: string };
const tabs = [
  { id: "programas", label: "Programa", icon: CalendarDays },
  { id: "presentaciones", label: "Documentos", icon: FileText },
  { id: "galeria", label: "Galería", icon: Images },
] as const;
type TabId = typeof tabs[number]["id"];

export default function SemanaRegulatelResources({ id, extraDocuments = [], layout = "simple" }: { id: string; extraDocuments?: EventAttachment[]; layout?: EventLayout }) {
  const data = materials[resources[id]];
  const [preview, setPreview] = useState<Preview | null>(null);
  const [photo, setPhoto] = useState<number | null>(null);
  const [allPhotos, setAllPhotos] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("programas");
  useEffect(() => {
    if (!preview && photo === null) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setPreview(null); setPhoto(null); }
      if (photo !== null && e.key === "ArrowRight") setPhoto((photo + 1) % data.photos.length);
      if (photo !== null && e.key === "ArrowLeft") setPhoto((photo + data.photos.length - 1) % data.photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = before; window.removeEventListener("keydown", onKey); };
  }, [preview, photo, data]);
  if (!data) return null;

  const programs = <section id="programas" className="se-section"><h2>Programa</h2><div className="se-file-list">
    {data.programs.map(doc => {
      const name = doc.title === "Ver programa" ? "Grupos de Trabajo y Comité Ejecutivo" : doc.title;
      const stem = doc.url.split("/").pop()!.split("?")[0].replace(/\.pdf$/i, "");
      return <article className="se-file-row" key={doc.url}>
        {layout === "editorial" ? <button className="se-paper-cover" onClick={() => setPreview({ ...doc, title: name })} aria-label={`Vista previa de ${name}`}><img src={`/eventos/semana-regulatel-2026/${resources[id]}/covers/${stem}.png`} alt={`Portada: ${name}`} loading="lazy"/></button> : <FileText className="se-file-icon" size={21} aria-hidden/>}
        <h3>{name}</h3><div className="se-file-actions"><button className="se-outline" onClick={() => setPreview({ ...doc, title: name })}>Ver programa<ArrowUpRight size={16}/></button><a className="se-download" href={doc.url} download aria-label={`Descargar programa: ${name}`} title="Descargar PDF"><Download size={18}/></a></div>
      </article>;
    })}
  </div></section>;

  const documents = <section id="presentaciones" className="se-section"><h2>Documentos</h2><div className="se-file-list">
    {data.documents.map(doc => <article className="se-file-row" key={doc.url}><FileText className="se-file-icon" size={21} aria-hidden/><div className="se-file-info"><h3>{doc.title}</h3>{doc.description && <p>{doc.description}</p>}</div><div className="se-file-actions"><button className="se-text-link" onClick={() => setPreview(doc)} aria-label={`Abrir ${doc.title}`}>Abrir<ArrowUpRight size={16}/></button><a className="se-download" href={doc.url} download aria-label={`Descargar ${doc.title}`} title="Descargar PDF"><Download size={18}/></a></div></article>)}
  </div>{extraDocuments.length > 0 && <EventDocumentsSection documents={extraDocuments}/>}</section>;

  const gallery = <section id="galeria" className="se-section"><h2>Galería</h2><div className="se-photo-grid">{data.photos.slice(0, allPhotos ? undefined : 6).map((p, index) => <button key={p.src} className="se-photo" onClick={() => setPhoto(index)} aria-label={`Ver fotografía ${index + 1}`}><img src={p.src} alt={p.caption || `Fotografía ${index + 1} del evento`} loading={allPhotos ? "eager" : "lazy"}/></button>)}</div>{data.photos.length > 6 && <button className="se-outline se-gallery-more" onClick={() => setAllPhotos(!allPhotos)}>{allPhotos ? "Mostrar menos fotografías" : "Ver todas las fotografías"}</button>}</section>;
  const panels = { programas: programs, presentaciones: documents, galeria: gallery };

  return <>
    {layout === "sections" ? <div className="se-workspace"><div className="se-tabs" role="tablist" aria-label="Materiales del evento">{tabs.map((tab, index) => <button key={tab.id} type="button" role="tab" id={`se-tab-${id}-${tab.id}`} aria-selected={activeTab === tab.id} aria-controls={`se-panel-${id}-${tab.id}`} tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => setActiveTab(tab.id)} onKeyDown={e => {
      let next = index;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % tabs.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index + tabs.length - 1) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;
      e.preventDefault(); setActiveTab(tabs[next].id); e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
    }}><tab.icon size={21}/><span>{tab.label}</span></button>)}</div><div role="tabpanel" id={`se-panel-${id}-${activeTab}`} aria-labelledby={`se-tab-${id}-${activeTab}`} className="se-tab-panel">{panels[activeTab]}</div></div> : layout === "editorial" ? <>{programs}{gallery}{documents}</> : <>{programs}{documents}{gallery}</>}
    <div className="se-practical-links"><a className="se-text-link" href={data.survey} target="_blank" rel="noopener noreferrer">Encuesta de satisfacción<ArrowUpRight size={15}/></a><a className="se-text-link" href={data.taxi} target="_blank" rel="noopener noreferrer">Transporte<ArrowUpRight size={15}/></a></div>
    {preview && <div className="se-modal-overlay" onClick={() => setPreview(null)}><div className="se-document-modal" role="dialog" aria-modal="true" aria-label={preview.title} onClick={e => e.stopPropagation()}><div className="se-modal-header"><h2>{preview.title}</h2><div><a href={preview.url} target="_blank" rel="noopener noreferrer" aria-label="Abrir PDF en otra pestaña"><ExternalLink size={20}/></a><button autoFocus onClick={() => setPreview(null)} aria-label="Cerrar vista previa"><X size={23}/></button></div></div><EventPdfReader url={preview.url} title={preview.title}/></div></div>}
    {photo !== null && <div className="se-lightbox" role="dialog" aria-modal="true" aria-label="Fotografías del evento"><button className="se-lightbox-close" autoFocus onClick={() => setPhoto(null)} aria-label="Cerrar fotografía"><X size={25}/></button><img src={data.photos[photo].src} alt={data.photos[photo].caption || `Fotografía ${photo + 1}`}/><div className="se-lightbox-controls"><button onClick={() => setPhoto((photo + data.photos.length - 1) % data.photos.length)} aria-label="Fotografía anterior"><ChevronLeft size={23}/></button><span>{photo + 1} / {data.photos.length}</span><button onClick={() => setPhoto((photo + 1) % data.photos.length)} aria-label="Fotografía siguiente"><ChevronRight size={23}/></button></div></div>}
  </>;
}

export function SemanaRegulatelPage({ event, dateLabel, documents, layout: forcedLayout, embedded = false }: { event: Event; dateLabel: string; documents: EventAttachment[]; layout?: EventLayout; embedded?: boolean }) {
  const { eventMaterialsLayout } = useSiteSettings();
  const { isAdmin } = useAuth();
  const [params] = useSearchParams();
  const preview = params.get("eventFormatPreview");
  const previewLayout = isAdmin && isEventLayout(preview) ? preview : null;
  const layout = forcedLayout ?? previewLayout ?? eventMaterialsLayout.layout;
  const data = materials[resources[event.id]];
  return <div className={`semana-event se-layout-${layout}`} data-event-layout={layout}>
    {previewLayout && !embedded && <div className="se-preview-banner">Vista previa · {EVENT_LAYOUT_OPTIONS.find(option => option.id === layout)?.title}<Link to="/admin/content/formato-eventos">Volver al administrador</Link></div>}
    <div className="se-container"><header className="se-event-header">
      {!embedded && <Link className="se-back" to="/eventos?tab=pasados"><ArrowLeft size={15}/>Eventos pasados</Link>}
      <h1>{event.title}</h1><div className="se-event-meta"><span><CalendarDays size={16}/>{dateLabel} · {event.year}</span><span><MapPin size={16}/>{event.location}</span><span>{event.organizer}</span></div>
      {layout === "editorial" && <><nav className="se-editorial-nav" aria-label="Secciones del evento"><a href="#programas">Programa</a><a href="#galeria">Galería</a><a href="#presentaciones">Documentos</a></nav><div className="se-editorial-cover"><img src={data.photos[0].src} alt={`Participantes de ${event.title}`} fetchPriority="high"/><div><img src={data.photos[1].src} alt="Sesiones de trabajo"/><img src={data.photos[2].src} alt="Fotografías del evento"/></div></div></>}
    </header><SemanaRegulatelResources key={`${event.id}-${layout}`} id={event.id} extraDocuments={documents} layout={layout}/>
    {!embedded && <footer className="se-event-footer"><Link className="se-text-link" to="/eventos?tab=pasados"><ArrowLeft size={16}/>Volver a eventos pasados</Link></footer>}
  </div></div>;
}
