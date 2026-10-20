import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Eye, RefreshCw, Save } from "lucide-react";
import { api } from "@/lib/api";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useEvents } from "@/contexts/AdminDataContext";
import { SEMANA_RESOURCE_EVENTS } from "@/data/semanaRegulatelResources";
import { SEMANA_RESOURCE_GROUPS } from "@/data/eventMaterials";
import { EVENT_LAYOUT_KEY, EVENT_LAYOUT_OPTIONS, isValidEventLayoutSetting, parseEventLayoutSetting, type EventLayout } from "@/data/eventLayouts";
import { normalizeEvent, formatEventDateRange } from "@/types/event";
import { SemanaRegulatelPage } from "@/components/events/SemanaRegulatelResources";
import materials from "@/data/semanaRegulatelMaterials.json";
import "./event-layout-admin.css";

function LayoutThumbnail({ layout }: { layout: EventLayout }) {
  return <div className={`el-mini el-mini-${layout}`} aria-hidden="true">
    <div className="el-mini-title"/><div className="el-mini-meta"/>
    {layout === "editorial" && <div className="el-mini-photo"><img src={materials.comite.photos[0].src} alt=""/><img src={materials.comite.photos[1].src} alt=""/></div>}
    {layout === "sections" && <div className="el-mini-tabs"><span/><span/><span/></div>}
    <div className="el-mini-row"/><div className="el-mini-row"/>
    {layout !== "sections" && <><div className="el-mini-heading"/><div className="el-mini-row"/></>}
    {layout === "simple" && <div className="el-mini-gallery"><img src={materials.comite.photos[0].src} alt=""/><img src={materials.comite.photos[1].src} alt=""/><img src={materials.comite.photos[2].src} alt=""/></div>}
  </div>;
}

export default function AdminEventLayouts() {
  const { refetch } = useSiteSettings();
  const events = useEvents();
  const [selected, setSelected] = useState<EventLayout>("simple");
  const [published, setPublished] = useState<EventLayout>("simple");
  const [revision, setRevision] = useState("");
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const [eventId, setEventId] = useState("reunio-n-anual-grupos-de-trabajo-regulatel-2026");
  const catalogue = new Map(SEMANA_RESOURCE_EVENTS.map(event => [event.id, normalizeEvent(event)]));
  events.filter(event => SEMANA_RESOURCE_GROUPS[event.id]).forEach(event => catalogue.set(event.id, event));
  const availableEvents = Array.from(catalogue.values());
  const event = catalogue.get(eventId) ?? availableEvents[0];

  async function reload() {
    setLoading(true); setMessage(null); setReady(false);
    const res = await api.settings.get(EVENT_LAYOUT_KEY);
    if (res.ok) {
      const value = parseEventLayoutSetting(res.data.value);
      setSelected(value.layout); setPublished(value.layout); setRevision(res.data.updated_at ?? ""); setReady(true);
    } else setMessage({ error: true, text: res.error || "No se pudo cargar el formato publicado." });
    setLoading(false);
  }
  useEffect(() => { void reload(); }, []);

  async function publish() {
    if (!ready || saving) return;
    setSaving(true); setMessage(null);
    const res = await api.settings.set(EVENT_LAYOUT_KEY, { version: 1, layout: selected }, { baseUpdatedAt: revision });
    if (!res.ok) {
      setMessage({ error: true, text: res.error || "No se pudo publicar. El formato anterior sigue seleccionado." });
      setSaving(false); return;
    }
    const verified = await api.settings.get(EVENT_LAYOUT_KEY);
    if (!verified.ok || !isValidEventLayoutSetting(verified.data.value) || verified.data.value.layout !== selected) {
      setMessage({ error: true, text: "El servidor aceptó el cambio, pero no se pudo verificar el formato público. Pulsa Recargar antes de continuar." });
      setReady(false); setSaving(false); return;
    }
    setPublished(selected); setRevision(verified.data.updated_at ?? "");
    await refetch();
    setMessage({ error: false, text: `Formato publicado: ${EVENT_LAYOUT_OPTIONS.find(option => option.id === selected)?.title}. Ya se aplica a las páginas públicas de estos eventos.` });
    setSaving(false);
  }

  const previewUrl = event ? `/eventos/${event.id}?eventFormatPreview=${selected}` : "";
  return <div className="el-admin">
    <header className="el-admin-header"><div><h1>Formato de eventos</h1><p>Elige cómo se muestran los programas, documentos y fotografías de los eventos de la Semana REGULATEL.</p></div><button className="el-secondary" onClick={() => void reload()} disabled={loading || saving}><RefreshCw size={15}/>Recargar</button></header>
    <div className="el-public-status"><Check size={17}/><span>Formato público: <strong>{EVENT_LAYOUT_OPTIONS.find(option => option.id === published)?.title}</strong></span><span>Se aplica a los {availableEvents.length} eventos del selector.</span></div>
    {message && <p className={`el-message ${message.error ? "el-error" : "el-success"}`} role={message.error ? "alert" : "status"}>{message.text}</p>}
    <fieldset disabled={loading || saving} className="el-options"><legend className="sr-only">Seleccionar formato de eventos</legend>{EVENT_LAYOUT_OPTIONS.map(option => <label key={option.id} className={`el-option ${selected === option.id ? "el-selected" : ""}`}><div className="el-option-title"><input type="radio" name="event-layout" value={option.id} checked={selected === option.id} onChange={() => { setSelected(option.id); setMessage(null); }}/><strong>{option.title}</strong>{published === option.id && <span>Publicado</span>}</div><LayoutThumbnail layout={option.id}/><p>{option.description}</p></label>)}</fieldset>
    <div className="el-publish-bar"><p>{selected === published ? "Estás previsualizando el formato público actual." : "Esta es una vista previa. El sitio público seguirá igual hasta que pulses Publicar formato."}</p><button className="el-primary" onClick={() => void publish()} disabled={loading || saving || !ready}><Save size={17}/>{saving ? "Publicando…" : "Publicar formato"}</button></div>
    <section className="el-preview"><div className="el-preview-controls"><h2><Eye size={17}/>Vista previa</h2><label>Evento<select value={eventId} onChange={e => setEventId(e.target.value)}>{availableEvents.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><a className="el-secondary" href={previewUrl} target="_blank" rel="noopener noreferrer">Ver a pantalla completa<ArrowUpRight size={15}/></a></div>
      <p className="el-preview-note">Las tres opciones conservan los mismos archivos y fotos. Puedes abrir los documentos y probar la galería en esta vista.</p>
      <div className="el-preview-canvas">{event && <SemanaRegulatelPage key={`${event.id}-${selected}`} event={event} dateLabel={formatEventDateRange(event.startDate, event.endDate)} documents={event.attachments ?? []} layout={selected} embedded/>}</div>
    </section>
  </div>;
}
