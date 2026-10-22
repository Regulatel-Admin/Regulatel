import { useEffect, useState } from "react";
import { FileClock, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { DRAFTS_CHANGED, listDrafts, type DraftRecord } from "@/lib/recoverableDrafts";

export function DraftLibrary() {
  const { user } = useAuth();
  const { enter, open, close } = useSiteEdit();
  const [shown, setShown] = useState(false);
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  useEffect(() => {
    const refresh = () => { try { setDrafts(user ? listDrafts(localStorage, user.id) : []); } catch { setDrafts([]); } };
    refresh(); window.addEventListener(DRAFTS_CHANGED, refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(DRAFTS_CHANGED, refresh); window.removeEventListener("storage", refresh); };
  }, [user?.id]);
  return <>
    <button type="button" onClick={() => setShown(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold hover:bg-white/25"><FileClock size={14} />Borradores{drafts.length ? ` (${drafts.length})` : ""}</button>
    {shown && <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-slate-950/35 p-5 pt-24 text-slate-800" role="dialog" aria-modal="true" aria-label="Borradores recuperables">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Borradores recuperables</h2><button aria-label="Cerrar borradores" onClick={() => setShown(false)} className="rounded-lg p-2"><X size={18} /></button></div>
        <p className="mb-4 text-sm text-slate-600">Guardados en este navegador para tu cuenta. Recuperarlos no publica ningún cambio.</p>
        {!drafts.length && <p className="py-5 text-sm">No tienes borradores pendientes de noticias o eventos.</p>}
        <ul className="space-y-2">{drafts.map(record => <li key={record.identity}><button type="button" className="w-full rounded-xl border border-teal-100 p-3 text-left hover:bg-teal-50" onClick={() => { close(); enter(record.path); if (record.newEvent) open({ kind: "evento" }); setShown(false); }}><span className="block font-semibold">{record.label}</span><span className="text-xs text-slate-500">{record.kind === "news" ? "Noticia" : record.kind === "event-order" ? "Orden de eventos" : "Evento"} · {new Date(record.savedAt).toLocaleString("es")}</span></button></li>)}</ul>
      </div>
    </div>}
  </>;
}
