import { DraftEditableText } from "@/components/site-edit/DraftEditableText";
import { SEMANA_RESOURCE_GROUPS } from "@/data/eventMaterials";
import { EVENT_LAYOUT_OPTIONS, isEventLayout, type EventLayout } from "@/data/eventLayouts";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, Images, MapPin, X } from "lucide-react";
import type { Event, EventAttachment, EventResources } from "@/types/event";
import { safeContentUrl } from "@/types/contentBlocks";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import EventPdfReader from "@/components/events/EventPdfReader";
import EventDocumentsSection from "@/components/events/EventDocumentsSection";
import ContentBlocksEditor from "@/components/site-edit/ContentBlocksEditor";
import { useEventInlineEditor } from "@/contexts/EventInlineEditContext";
import { useEventResourceInlineTools } from "@/components/site-edit/EventResourceInlineTools";
import materials from "@/data/semanaRegulatelMaterials.json";
import "./semana-event.css";

const resourceGroups = SEMANA_RESOURCE_GROUPS;
type ResourceSection = "programs" | "documents" | "photos";
const standardOrder: ResourceSection[] = ["programs", "documents", "photos"];
const emptyResources: EventResources = { programs: [], documents: [], photos: [], survey: "", taxi: "" };

/** An explicit override, including empty lists, replaces the original resources. */
export function getSemanaResources(id: string, override?: EventResources): EventResources | undefined {
  if (override !== undefined) return override;
  const original = materials[resourceGroups[id]];
  if (!original) return undefined;
  return {
    ...original,
    programs: original.programs.map(program => ({
      ...program,
      title: program.title === "Ver programa" ? "Grupos de Trabajo y Comité Ejecutivo" : program.title,
    })),
  };
}

export function hasSemanaResources(id: string, override?: EventResources) {
  return override !== undefined || Boolean(resourceGroups[id]);
}

function resourceOrder(data: EventResources, layout: EventLayout): ResourceSection[] {
  const fallback: ResourceSection[] = layout === "editorial" ? ["programs", "photos", "documents"] : standardOrder;
  if (!data.sectionOrder) return fallback;
  return [...new Set([...data.sectionOrder, ...fallback])].filter((section): section is ResourceSection => standardOrder.includes(section));
}

type Preview = { title: string; url: string; comingSoon?: boolean };
const tabDefinitions = {
  programs: { id: "programas", label: "Programa", icon: CalendarDays },
  documents: { id: "presentaciones", label: "Documentos", icon: FileText },
  photos: { id: "galeria", label: "Galería", icon: Images },
} as const;

export default function SemanaRegulatelResources({ id, resources: override, extraDocuments = [], layout = "simple" }: {
  id: string; resources?: EventResources; extraDocuments?: EventAttachment[]; layout?: EventLayout;
}) {
  const data = getSemanaResources(id, override);
  const inline = useEventInlineEditor();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [photo, setPhoto] = useState<number | null>(null);
  const [allPhotos, setAllPhotos] = useState(false);
  const [activeTab, setActiveTab] = useState<ResourceSection>("programs");
  const photos = inline ? data?.photos ?? [] : data?.photos.filter(item => safeContentUrl(item.src)) ?? [];
  const order = data ? resourceOrder(data, layout) : standardOrder;
  const tools = useEventResourceInlineTools(data ?? emptyResources, order);
  const visibleSections = inline ? order : order.filter(section => section === "photos" ? photos.length > 0 : (data?.[section].length ?? 0) > 0 || (section === "documents" && extraDocuments.length > 0));
  const selectedTab = visibleSections.includes(activeTab) ? activeTab : visibleSections[0];

  useEffect(() => {
    if (photo !== null && photo >= photos.length) setPhoto(null);
  }, [photo, photos.length]);

  useEffect(() => {
    if (!preview && photo === null) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setPreview(null); setPhoto(null); }
      if (photo !== null && photos.length) {
        if (event.key === "ArrowRight") setPhoto((photo + 1) % photos.length);
        if (event.key === "ArrowLeft") setPhoto((photo + photos.length - 1) % photos.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = before; window.removeEventListener("keydown", onKey); };
  }, [preview, photo, photos.length]);
  if (!data) return null;

  const programs = <section id="programas" className="se-section" {...tools.sectionDragProps("programs")}><h2 className={inline ? "relative group" : undefined}>Programa{tools.sectionTools("programs")}</h2>{data.programs.length > 0 && <div className="se-file-list">
    {data.programs.map((doc, index) => {
      const url = safeContentUrl(doc.url);
      const original = materials[resourceGroups[id]]?.programs.find(item => item.url === doc.url);
      const stem = doc.url.split("/").pop()?.split("?")[0].replace(/\.pdf$/i, "") ?? "";
      return <article className={inline ? "se-file-row relative group" : "se-file-row"} key={`${doc.url}-${index}`} {...tools.itemDragProps("programs", index)}>
        {tools.itemTools("programs", index)}
        {url && (layout === "editorial" ? <button type="button" className="se-paper-cover" disabled={!url} onClick={() => setPreview({ title: doc.title, url, comingSoon: !url && doc.comingSoon })} aria-label={`Vista previa de ${doc.title}`}>
          {original ? <img src={`/eventos/semana-regulatel-2026/${resourceGroups[id]}/covers/${stem}.png`} alt={`Portada: ${doc.title}`} loading="lazy"/> : <FileText size={30} aria-hidden style={{ margin: "auto" }}/>}</button> : <FileText className="se-file-icon" size={21} aria-hidden/>)}
        <div className="se-file-info"><h3>{doc.title}</h3>{doc.description && <p>{doc.description}</p>}</div>
        {(url || doc.comingSoon || inline) && <div className="se-file-actions" style={inline ? { flexWrap: "wrap", flexShrink: 1 } : undefined}>{(url || doc.comingSoon) && <button type="button" className="se-outline" onClick={() => setPreview({ title: doc.title, url, comingSoon: !url && doc.comingSoon })}>Ver programa<ArrowUpRight size={16}/></button>}{tools.replaceButton("programs", index)}{url && <a className="se-download" href={url} download aria-label={`Descargar programa: ${doc.title}`} title="Descargar documento"><Download size={18}/></a>}</div>}
      </article>;
    })}
  </div>}{inline && <div className="mt-5">{tools.addProgramButton}</div>}</section>;

  const documents = <section id="presentaciones" className="se-section" {...tools.sectionDragProps("documents")}><h2 className={inline ? "relative group" : undefined}>Documentos{tools.sectionTools("documents")}</h2>{data.documents.length > 0 && <div className="se-file-list">
    {data.documents.map((doc, index) => {
      const url = safeContentUrl(doc.url);
      return <article className={inline ? "se-file-row relative group" : "se-file-row"} key={`${doc.url}-${index}`} {...tools.itemDragProps("documents", index)}>{tools.itemTools("documents", index)}{url && <FileText className="se-file-icon" size={21} aria-hidden/>}<div className="se-file-info"><h3>{doc.title}</h3>{doc.description && <p>{doc.description}</p>}</div>{(url || doc.comingSoon || inline) && <div className="se-file-actions" style={inline ? { flexWrap: "wrap", flexShrink: 1 } : undefined}>{(url || doc.comingSoon) && <button type="button" className="se-text-link" onClick={() => setPreview({ title: doc.title, url, comingSoon: !url && doc.comingSoon })} aria-label={`Abrir ${doc.title}`}>Abrir<ArrowUpRight size={16}/></button>}{tools.replaceButton("documents", index)}{url && <a className="se-download" href={url} download aria-label={`Descargar ${doc.title}`} title="Descargar documento"><Download size={18}/></a>}</div>}</article>;
    })}
  </div>}{extraDocuments.length > 0 && <EventDocumentsSection documents={extraDocuments}/>} {inline && <div className="mt-5">{tools.addDocumentButton}</div>}</section>;

  const gallery = <section id="galeria" className="se-section" {...tools.sectionDragProps("photos")}><h2 className={inline ? "relative group" : undefined}>Galería{tools.sectionTools("photos")}</h2><div className="se-photo-grid">{photos.slice(0, allPhotos ? undefined : 6).map((item, index) => {
    const button = <button type="button" key={`${item.src}-${index}`} className="se-photo" style={inline ? { aspectRatio: layout === "editorial" && index === 0 ? "1.9" : "4/3" } : undefined} onClick={() => setPhoto(index)} aria-label={`Ver fotografía ${index + 1}`}><img src={item.src} alt={item.caption || `Fotografía ${index + 1} del evento`} loading={allPhotos ? "eager" : "lazy"}/></button>;
    return inline ? <div key={`${item.src}-${index}`} className={`relative group min-w-0 ${layout === "editorial" && index === 0 ? "col-span-2" : ""}`} {...tools.itemDragProps("photos", index)}>{button}{tools.itemTools("photos", index)}<div className="absolute bottom-2 left-2">{tools.replaceButton("photos", index)}</div></div> : button;
  })}</div>{photos.length > 6 && <button type="button" className="se-outline se-gallery-more" onClick={() => setAllPhotos(!allPhotos)}>{allPhotos ? "Mostrar menos fotografías" : "Ver todas las fotografías"}</button>}</section>;
  const panels = { programs, documents, photos: gallery };
  const currentPhoto = photo !== null ? photos[photo] : undefined;
  const survey = safeContentUrl(data.survey);
  const taxi = safeContentUrl(data.taxi);

  return <>
    {tools.replacementInput}
    {layout === "sections" && selectedTab ? <div className="se-workspace"><div className="se-tabs" role="tablist" aria-label="Materiales del evento" style={{ gridTemplateColumns: `repeat(${visibleSections.length}, minmax(0, 1fr))` }}>{visibleSections.map((section, index) => {
      const tab = tabDefinitions[section];
      return <button key={section} type="button" role="tab" id={`se-tab-${id}-${tab.id}`} aria-selected={selectedTab === section} aria-controls={`se-panel-${id}-${tab.id}`} tabIndex={selectedTab === section ? 0 : -1} onClick={() => setActiveTab(section)} onKeyDown={event => {
        let next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % visibleSections.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + visibleSections.length - 1) % visibleSections.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = visibleSections.length - 1;
        else return;
        event.preventDefault(); setActiveTab(visibleSections[next]); event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
      }}><tab.icon size={21}/><span>{tab.label}</span></button>;
    })}</div><div role="tabpanel" id={`se-panel-${id}-${tabDefinitions[selectedTab].id}`} aria-labelledby={`se-tab-${id}-${tabDefinitions[selectedTab].id}`} className="se-tab-panel">{panels[selectedTab]}</div></div> : visibleSections.map(section => <div key={section} data-resource-section={section}>{panels[section]}</div>)}
    {(survey || taxi || inline) && <div className="se-practical-links">{survey && <a className="se-text-link" href={survey} target="_blank" rel="noopener noreferrer">Encuesta de satisfacción<ArrowUpRight size={15}/></a>}{taxi && <a className="se-text-link" href={taxi} target="_blank" rel="noopener noreferrer">Transporte<ArrowUpRight size={15}/></a>}{tools.manageButton}</div>}
    {tools.dialogs}
    {preview && <div className="se-modal-overlay" onClick={() => setPreview(null)}><div className="se-document-modal" role="dialog" aria-modal="true" aria-label={preview.title} onClick={event => event.stopPropagation()}><div className="se-modal-header"><h2>{preview.title}</h2><div>{preview.url && <a href={preview.url} target="_blank" rel="noopener noreferrer" aria-label="Abrir documento en otra pestaña"><ExternalLink size={20}/></a>}<button type="button" autoFocus onClick={() => setPreview(null)} aria-label="Cerrar vista previa"><X size={23}/></button></div></div>{preview.comingSoon ? <div className="p-8 text-center"><FileText size={36} className="mx-auto mb-4 text-teal-700"/><h3 className="text-xl font-semibold">Documento próximamente</h3><p className="mt-3 text-slate-600">Este documento estará disponible próximamente. Estamos preparando su publicación. Te invitamos a consultar esta página más adelante.</p></div> : /\.pdf(?:[?#]|$)/i.test(preview.url) ? <EventPdfReader url={preview.url} title={preview.title}/> : <div className="p-6"><a className="se-outline" href={preview.url} target="_blank" rel="noopener noreferrer">Abrir documento<ExternalLink size={18}/></a></div>}</div></div>}
    {currentPhoto && photo !== null && <div className="se-lightbox" role="dialog" aria-modal="true" aria-label="Fotografías del evento"><button type="button" className="se-lightbox-close" autoFocus onClick={() => setPhoto(null)} aria-label="Cerrar fotografía"><X size={25}/></button><img src={currentPhoto.src} alt={currentPhoto.caption || `Fotografía ${photo + 1}`}/>{currentPhoto.caption && <p className="max-w-3xl text-center text-sm text-white">{currentPhoto.caption}</p>}<div className="se-lightbox-controls"><button type="button" onClick={() => setPhoto((photo + photos.length - 1) % photos.length)} aria-label="Fotografía anterior"><ChevronLeft size={23}/></button><span>{photo + 1} / {photos.length}</span><button type="button" onClick={() => setPhoto((photo + 1) % photos.length)} aria-label="Fotografía siguiente"><ChevronRight size={23}/></button></div></div>}
  </>;
}

export function SemanaRegulatelPage({ event, dateLabel, documents, layout: forcedLayout, embedded = false, editor }: { event: Event; dateLabel: string; documents: EventAttachment[]; layout?: EventLayout; embedded?: boolean; editor?: ReactNode }) {
  const { eventMaterialsLayout } = useSiteSettings();
  const { isAdmin } = useAuth();
  const inline = useEventInlineEditor();
  const [params] = useSearchParams();
  const preview = params.get("eventFormatPreview");
  const previewLayout = isAdmin && isEventLayout(preview) ? preview : null;
  const layout = forcedLayout ?? previewLayout ?? eventMaterialsLayout.layout;
  const data = getSemanaResources(event.id, event.resources);
  const photos = data?.photos.filter(photo => safeContentUrl(photo.src)) ?? [];
  const sections = data ? resourceOrder(data, layout).filter(section => data[section].length || (section === "documents" && documents.length)) : [];
  return <div className={`semana-event se-layout-${layout}`} data-event-layout={layout}>
    {previewLayout && !embedded && <div className="se-preview-banner">Vista previa · {EVENT_LAYOUT_OPTIONS.find(option => option.id === layout)?.title}<Link to="/admin/content/formato-eventos">Volver al administrador</Link></div>}
    <div className="se-container"><header className="se-event-header">
      {!embedded && <Link className="se-back" to="/eventos?tab=pasados"><ArrowLeft size={15}/>Eventos pasados</Link>}
      {inline ? <DraftEditableText as="h1" disabled={inline.busy} value={event.title} aria-label="Título del evento" className="rounded-sm outline-none hover:ring-1 hover:ring-teal-200 focus:ring-2 focus:ring-teal-400" onChange={title => inline.patch({ title })} onKeyDown={change => { if (change.key === "Enter") { change.preventDefault(); change.currentTarget.blur(); } }} /> : <h1>{event.title}</h1>}<div className="se-event-meta"><span><CalendarDays size={16}/>{dateLabel} · {event.year}</span><span><MapPin size={16}/>{event.location}</span><span>{event.organizer}</span></div>
      {layout === "editorial" && <>{sections.length > 0 && <nav className="se-editorial-nav" aria-label="Secciones del evento">{sections.map(section => <a key={section} href={`#${tabDefinitions[section].id}`}>{tabDefinitions[section].label}</a>)}</nav>}{photos.length > 0 && <div className="se-editorial-cover" style={photos.length === 1 ? { gridTemplateColumns: "1fr" } : undefined}><img src={photos[0].src} alt={photos[0].caption || `Participantes de ${event.title}`} fetchPriority="high"/>{photos.length > 1 && <div style={photos.length === 2 ? { gridTemplateRows: "1fr" } : undefined}>{photos.slice(1, 3).map((photo, index) => <img key={`${photo.src}-${index}`} src={photo.src} alt={photo.caption || "Fotografías del evento"}/>)}</div>}</div>}</>}
    </header>{editor ?? <>
      {(event.description || inline) && <div className="se-section">{inline ? <DraftEditableText as="p" disabled={inline.busy} value={event.description ?? ""} aria-label="Descripción del evento" data-placeholder="Añadir descripción…" className="min-h-6 whitespace-pre-wrap rounded-sm leading-relaxed outline-none hover:ring-1 hover:ring-teal-200 focus:ring-2 focus:ring-teal-400 [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-400" onChange={description => inline.patch({ description })} /> : <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>}</div>}
      {(inline || (event.contentBlocks && event.contentBlocks.length > 0)) && <div className="se-section"><ContentBlocksEditor blocks={event.contentBlocks ?? []} editing={Boolean(inline)} onChange={inline ? contentBlocks => inline.patch({ contentBlocks }) : undefined} disabled={inline?.busy} onBusyChange={inline?.onBusyChange} folder="events"/></div>}
      <SemanaRegulatelResources key={`${event.id}-${layout}`} id={event.id} resources={event.resources} extraDocuments={documents} layout={layout}/>
    </>}
    {!embedded && <footer className="se-event-footer"><Link className="se-text-link" to="/eventos?tab=pasados"><ArrowLeft size={16}/>Volver a eventos pasados</Link></footer>}
  </div></div>;
}
