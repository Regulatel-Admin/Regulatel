import type { DraftStatus } from "@/hooks/useRecoverableDraft";

type Props = { draft: DraftStatus & { discard: () => void; retry: () => void; recoverLatest: () => void; keepCurrent: () => void }; disabled?: boolean; publishLabel?: string };
export function DraftRecoveryNotice({ draft, disabled, publishLabel = "Publicar" }: Props) {
  return <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-teal-800" data-draft-status>
    <span role="status">{draft.error || (draft.savedAt
      ? `${draft.recovered ? "Borrador recuperado" : "Borrador guardado"} · ${new Date(draft.savedAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })} · Sin publicar`
      : `Guardado automático en este navegador · Solo se publica cuando tú pulses ${publishLabel}`)}</span>
    {draft.changedPublished && <span className="w-full text-amber-800">La versión publicada cambió desde que empezaste este borrador. Revisa tus cambios antes de publicar.</span>}
    {draft.conflict ? <><button type="button" disabled={disabled} className="font-semibold underline" onClick={draft.recoverLatest}>Recuperar versión guardada</button><button type="button" disabled={disabled} className="font-semibold underline" onClick={draft.keepCurrent}>Conservar esta versión</button></>
      : draft.error ? <button type="button" disabled={disabled} className="font-semibold underline" onClick={draft.retry}>Reintentar guardado</button>
      : draft.savedAt && <button type="button" disabled={disabled} className="font-semibold underline" onClick={() => { if (window.confirm("¿Descartar este borrador y volver a la versión guardada? El sitio público no cambiará.")) draft.discard(); }}>Descartar borrador</button>}
  </div>;
}
