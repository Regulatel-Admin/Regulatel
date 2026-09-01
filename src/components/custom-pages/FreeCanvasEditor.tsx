import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  BoxSelect,
  Copy,
  FileText,
  Heading2,
  ImageIcon,
  Images,
  Italic,
  LayoutGrid,
  LayoutTemplate,
  Link2,
  List,
  Loader2,
  Lock,
  Minus,
  Monitor,
  MousePointerClick,
  Plus,
  Quote,
  RectangleHorizontal,
  Smartphone,
  Trash2,
  Type,
  Unlock,
  Upload,
  Video,
} from "lucide-react";
import {
  CANVAS_BLOCK_META,
  CANVAS_W,
  defaultBlockForType,
  emptyCustomCard,
  emptyCustomDocument,
  newCustomId,
  type CanvasBlock,
  type CanvasBlockType,
  type CustomPageCanvas,
} from "@/data/customPages";
import { uploadAdminFile } from "@/lib/uploads";
import { wrapTextareaSelection } from "@/lib/inlineMarkup";
import { useDraftHistory } from "@/hooks/useDraftHistory";
import { BlockVisual } from "@/components/custom-pages/CanvasBlockVisual";
import { PublicCanvas } from "@/components/custom-pages/PublicCanvas";
import { isTexty } from "@/lib/canvasLayout";

const SNAP = 10;
const GUIDE_THRESH = 6;
const MIN_W = 80;
const MIN_H = 36;
const PAGE_INSET = 48;

type GuideLine = { axis: "v" | "h"; at: number };

function nearest(value: number, targets: number[], thresh: number): { at: number; dist: number } | null {
  let best: { at: number; dist: number } | null = null;
  for (const at of targets) {
    const dist = Math.abs(value - at);
    if (dist <= thresh && (!best || dist < best.dist)) best = { at, dist };
  }
  return best;
}

function snapMove(
  orig: CanvasBlock,
  dx: number,
  dy: number,
  others: CanvasBlock[],
  canvasHeight: number,
  grid: boolean
): { x: number; y: number; guides: GuideLine[] } {
  const rawX = orig.x + dx;
  const rawY = orig.y + dy;
  const xs = [0, PAGE_INSET, CANVAS_W / 2, CANVAS_W - PAGE_INSET, CANVAS_W];
  const ys = [0, canvasHeight / 2, canvasHeight];
  for (const other of others) {
    xs.push(other.x, other.x + other.w / 2, other.x + other.w);
    ys.push(other.y, other.y + other.h / 2, other.y + other.h);
  }
  const candidatesX = [
    nearest(rawX, xs, GUIDE_THRESH),
    nearest(rawX + orig.w / 2, xs, GUIDE_THRESH),
    nearest(rawX + orig.w, xs, GUIDE_THRESH),
  ]
    .filter((item): item is { at: number; dist: number } => Boolean(item))
    .sort((a, b) => a.dist - b.dist);
  const candidatesY = [
    nearest(rawY, ys, GUIDE_THRESH),
    nearest(rawY + orig.h / 2, ys, GUIDE_THRESH),
    nearest(rawY + orig.h, ys, GUIDE_THRESH),
  ]
    .filter((item): item is { at: number; dist: number } => Boolean(item))
    .sort((a, b) => a.dist - b.dist);

  const guides: GuideLine[] = [];
  let x = rawX;
  let y = rawY;
  if (candidatesX[0]) {
    const hit = candidatesX[0];
    if (Math.abs(rawX - hit.at) === hit.dist) x = hit.at;
    else if (Math.abs(rawX + orig.w / 2 - hit.at) === hit.dist) x = hit.at - orig.w / 2;
    else x = hit.at - orig.w;
    guides.push({ axis: "v", at: hit.at });
  } else if (grid) {
    x = snap(rawX, true);
  }
  if (candidatesY[0]) {
    const hit = candidatesY[0];
    if (Math.abs(rawY - hit.at) === hit.dist) y = hit.at;
    else if (Math.abs(rawY + orig.h / 2 - hit.at) === hit.dist) y = hit.at - orig.h / 2;
    else y = hit.at - orig.h;
    guides.push({ axis: "h", at: hit.at });
  } else if (grid) {
    y = snap(rawY, true);
  }
  return { x, y, guides };
}
const PALETTE_ICONS: Record<CanvasBlockType, typeof Type> = {
  heading: Heading2,
  text: Type,
  image: ImageIcon,
  video: Video,
  cover: LayoutTemplate,
  box: BoxSelect,
  button: MousePointerClick,
  spacer: RectangleHorizontal,
  gallery: Images,
  cards: LayoutGrid,
  list: List,
  document: FileText,
  quote: Quote,
  divider: Minus,
};

const COLOR_PRESETS = [
  "#163D59",
  "#4489C6",
  "#33A4B4",
  "#C5DC0B",
  "#051329",
  "#FC9187",
  "#FFFFFF",
  "#FAFBFC",
  "#4A5568",
  "#1C1C1C",
];

type DragMode = "move" | "resize";
type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

function snap(n: number, enabled: boolean) {
  if (!enabled) return Math.round(n);
  return Math.round(n / SNAP) * SNAP;
}

function clampBlock(block: CanvasBlock, canvasHeight: number): CanvasBlock {
  const w = Math.max(MIN_W, block.w);
  const h = Math.max(MIN_H, block.h);
  return {
    ...block,
    w,
    h,
    x: Math.min(Math.max(0, block.x), CANVAS_W - MIN_W),
    y: Math.min(Math.max(0, block.y), Math.max(0, canvasHeight - MIN_H)),
  };
}

function applyResize(orig: CanvasBlock, handle: Handle, dx: number, dy: number): CanvasBlock {
  let { x, y, w, h } = orig;
  if (handle.includes("e")) w = orig.w + dx;
  if (handle.includes("s")) h = orig.h + dy;
  if (handle.includes("w")) {
    w = orig.w - dx;
    x = orig.x + dx;
  }
  if (handle.includes("n")) {
    h = orig.h - dy;
    y = orig.y + dy;
  }
  if (w < MIN_W) {
    if (handle.includes("w")) x = orig.x + orig.w - MIN_W;
    w = MIN_W;
  }
  if (h < MIN_H) {
    if (handle.includes("n")) y = orig.y + orig.h - MIN_H;
    h = MIN_H;
  }
  return { ...orig, x, y, w, h };
}

const HANDLES: Handle[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

function handleStyle(handle: Handle): CSSProperties {
  const size = 12;
  const base: CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    background: "#0f766e",
    border: "2px solid white",
    borderRadius: 999,
    zIndex: 5,
    boxShadow: "0 1px 4px rgba(15,118,110,0.35)",
  };
  if (handle.includes("n")) base.top = -6;
  if (handle.includes("s")) base.bottom = -6;
  if (handle.includes("e")) base.right = -6;
  if (handle.includes("w")) base.left = -6;
  if (handle === "n" || handle === "s") {
    base.left = "50%";
    base.marginLeft = -6;
    base.cursor = "ns-resize";
  }
  if (handle === "e" || handle === "w") {
    base.top = "50%";
    base.marginTop = -6;
    base.cursor = "ew-resize";
  }
  if (handle === "ne" || handle === "sw") base.cursor = "nesw-resize";
  if (handle === "nw" || handle === "se") base.cursor = "nwse-resize";
  if (handle === "ne") {
    base.top = -6;
    base.right = -6;
  }
  if (handle === "nw") {
    base.top = -6;
    base.left = -6;
  }
  if (handle === "se") {
    base.bottom = -6;
    base.right = -6;
  }
  if (handle === "sw") {
    base.bottom = -6;
    base.left = -6;
  }
  return base;
}

export function FreeCanvasEditor({
  canvas: canvasProp,
  onChange,
  editing,
  toolbarExtra,
  saveStatus,
  liveDirty,
}: {
  canvas: CustomPageCanvas;
  onChange?: (next: CustomPageCanvas) => void;
  editing: boolean;
  toolbarExtra?: ReactNode;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  liveDirty?: boolean;
}) {
  const { value: draftCanvas, setValue: setDraftCanvas } = useDraftHistory(() => canvasProp);
  const canvas = editing ? draftCanvas : canvasProp;
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const clipboardRef = useRef<CanvasBlock | null>(null);
  const [scale, setScale] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [snapOn, setSnapOn] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [phonePreview, setPhonePreview] = useState(false);
  const dragRef = useRef<{
    mode: DragMode;
    handle?: Handle;
    id: string;
    startX: number;
    startY: number;
    orig: CanvasBlock;
  } | null>(null);

  const selected = canvas.blocks.find((b) => b.id === selectedId) ?? null;
  const sorted = useMemo(() => [...canvas.blocks].sort((a, b) => a.z - b.z), [canvas.blocks]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const apply = () => setScale(Math.min(1, el.clientWidth / CANVAS_W));
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [canvas.height]);

  const toCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const el = innerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const sx = rect.width / CANVAS_W;
    return {
      x: (clientX - rect.left) / sx,
      y: (clientY - rect.top) / sx,
    };
  }, []);

  const commit = useCallback(
    (next: CustomPageCanvas) => {
      if (editing) setDraftCanvas(next);
      onChange?.(next);
    },
    [editing, onChange, setDraftCanvas]
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<CanvasBlock> | ((block: CanvasBlock) => CanvasBlock)) => {
      if (!onChange) return;
      let grew = canvas.height;
      const blocks = canvas.blocks.map((block) => {
        if (block.id !== id) return block;
        const next = typeof patch === "function" ? patch(block) : { ...block, ...patch };
        const clamped = clampBlock(next, Math.max(canvas.height, next.y + next.h + 80));
        grew = Math.max(grew, clamped.y + clamped.h + 80);
        return clamped;
      });
      commit({ ...canvas, height: grew, blocks });
    },
    [canvas, onChange, commit]
  );

  const addBlock = (type: CanvasBlockType, x: number, y: number) => {
    if (!onChange) return;
    const z = canvas.blocks.reduce((max, b) => Math.max(max, b.z), 0) + 1;
    const block = clampBlock(defaultBlockForType(type, snap(x, snapOn), snap(y, snapOn), z), canvas.height);
    commit({
      ...canvas,
      height: Math.max(canvas.height, block.y + block.h + 80),
      blocks: [...canvas.blocks, block],
    });
    setSelectedId(block.id);
  };

  const duplicateBlock = useCallback(
    (block: CanvasBlock) => {
      const copy: CanvasBlock = {
        ...block,
        id: newCustomId("b"),
        x: Math.min(block.x + 24, CANVAS_W - block.w),
        y: block.y + 24,
        z: canvas.blocks.reduce((max, b) => Math.max(max, b.z), 0) + 1,
        content: { ...block.content },
      };
      commit({
        ...canvas,
        height: Math.max(canvas.height, copy.y + copy.h + 80),
        blocks: [...canvas.blocks, copy],
      });
      setSelectedId(copy.id);
    },
    [canvas, commit]
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !onChange) return;
      const point = toCanvasPoint(event.clientX, event.clientY);
      const dx = point.x - drag.startX;
      const dy = point.y - drag.startY;
      if (drag.mode === "move") {
        const others = canvas.blocks.filter((block) => block.id !== drag.id);
        const next = snapMove(drag.orig, dx, dy, others, canvas.height, snapOn);
        setGuides(next.guides);
        updateBlock(drag.id, { x: next.x, y: next.y });
        return;
      }
      if (drag.handle) {
        const resized = applyResize(drag.orig, drag.handle, dx, dy);
        setGuides([]);
        updateBlock(drag.id, {
          ...resized,
          x: snap(resized.x, snapOn),
          y: snap(resized.y, snapOn),
          w: snap(resized.w, snapOn),
          h: snap(resized.h, snapOn),
        });
      }
    },
    [canvas.blocks, canvas.height, onChange, snapOn, toCanvasPoint, updateBlock]
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setGuides([]);
  }, []);

  useEffect(() => {
    if (!editing) return;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
    };
  }, [editing, onPointerMove, endDrag]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "Escape") {
        setSelectedId(null);
        setEditingTextId(null);
        return;
      }
      if (typing) return;
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId && onChange) {
        event.preventDefault();
        commit({ ...canvas, blocks: canvas.blocks.filter((b) => b.id !== selectedId) });
        setSelectedId(null);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d" && selected) {
        event.preventDefault();
        duplicateBlock(selected);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c" && selected) {
        clipboardRef.current = selected;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v" && clipboardRef.current) {
        event.preventDefault();
        duplicateBlock(clipboardRef.current);
      }
      if (!selected || selected.content.locked) return;
      const step = event.shiftKey ? 10 : 1;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        updateBlock(selected.id, { x: selected.x - step });
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        updateBlock(selected.id, { x: selected.x + step });
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        updateBlock(selected.id, { y: selected.y - step });
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        updateBlock(selected.id, { y: selected.y + step });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, selectedId, selected, canvas, onChange, updateBlock, commit, duplicateBlock]);

  const startMove = (event: ReactPointerEvent, block: CanvasBlock) => {
    if (!editing) return;
    event.stopPropagation();
    if (event.detail === 2 && isTexty(block.type)) {
      setSelectedId(block.id);
      setEditingTextId(block.id);
      return;
    }
    setSelectedId(block.id);
    if (block.content.locked) return;
    const point = toCanvasPoint(event.clientX, event.clientY);
    dragRef.current = { mode: "move", id: block.id, startX: point.x, startY: point.y, orig: { ...block } };
    const z = canvas.blocks.reduce((max, b) => Math.max(max, b.z), 0) + 1;
    updateBlock(block.id, { z });
  };

  const startResize = (event: ReactPointerEvent, block: CanvasBlock, handle: Handle) => {
    event.stopPropagation();
    if (block.content.locked) return;
    const point = toCanvasPoint(event.clientX, event.clientY);
    dragRef.current = { mode: "resize", handle, id: block.id, startX: point.x, startY: point.y, orig: { ...block } };
    setSelectedId(block.id);
  };

  const fitHeight = () => {
    const bottom = canvas.blocks.reduce((max, b) => Math.max(max, b.y + b.h), 0);
    commit({ ...canvas, height: Math.max(600, bottom + 80) });
  };

  if (!editing) {
    return <PublicCanvas canvas={canvas} />;
  }

  return (
    <div className={editing ? "pb-10" : ""}>
      {editing && (
        <div
          className="sticky z-[30] border-b bg-white/95 px-3 py-2.5 backdrop-blur"
          style={{ top: "var(--site-edit-bar-h, 3.25rem)", borderColor: "rgba(22,61,89,0.10)" }}
        >
          <div className="mx-auto flex max-w-[1480px] flex-wrap items-center gap-1.5">
            <p className="mr-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#0f766e" }}>
              Arrastra al lienzo
            </p>
            {CANVAS_BLOCK_META.map((item) => {
              const Icon = PALETTE_ICONS[item.type];
              return (
                <button
                  key={item.type}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("application/x-regulatel-block", item.type);
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() =>
                    addBlock(item.type, PAGE_INSET, Math.max(40, canvas.blocks.reduce((m, b) => Math.max(m, b.y + b.h), 0) + 16))
                  }
                  title={`${item.hint} · arrastra o pulsa`}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1.5 text-[11px] font-semibold shadow-sm transition hover:border-[#0f766e] hover:text-[#0f766e]"
                  style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
                >
                  <Icon className="h-3.5 w-3.5 opacity-80" />
                  {item.label}
                </button>
              );
            })}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {((saveStatus && saveStatus !== "idle") || liveDirty) && (
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    color: saveStatus === "error" ? "#991b1b" : liveDirty && saveStatus !== "saving" ? "#b45309" : "#0f766e",
                  }}
                >
                  {saveStatus === "saving"
                    ? "Guardando…"
                    : saveStatus === "error"
                      ? "No se pudo guardar"
                      : liveDirty
                        ? "Cambios sin publicar"
                        : "Borrador guardado"}
                </span>
              )}
              <div className="flex rounded-lg border p-0.5" style={{ borderColor: "rgba(22,61,89,0.14)" }}>
                <button
                  type="button"
                  onClick={() => setPhonePreview(false)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: phonePreview ? "transparent" : "rgba(15,118,110,0.12)",
                    color: phonePreview ? "var(--regu-gray-600)" : "#0f766e",
                  }}
                >
                  <Monitor className="h-3 w-3" />
                  Escritorio
                </button>
                <button
                  type="button"
                  onClick={() => setPhonePreview(true)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: phonePreview ? "rgba(15,118,110,0.12)" : "transparent",
                    color: phonePreview ? "#0f766e" : "var(--regu-gray-600)",
                  }}
                >
                  <Smartphone className="h-3 w-3" />
                  Móvil
                </button>
              </div>
              <label className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
                <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
                Guía
              </label>
              <label className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
                <input type="checkbox" checked={snapOn} onChange={(e) => setSnapOn(e.target.checked)} />
                Encajar
              </label>
              <button
                type="button"
                onClick={fitHeight}
                className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold"
                style={{ borderColor: "rgba(22,61,89,0.14)" }}
                title="Ajustar el alto al contenido"
              >
                <Minus className="h-3 w-3" />
                Alto
              </button>
              <button
                type="button"
                onClick={() => commit({ ...canvas, height: canvas.height + 200 })}
                className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold"
                style={{ borderColor: "rgba(22,61,89,0.14)" }}
              >
                <Plus className="h-3 w-3" />
                Alto
              </button>
              {toolbarExtra}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1480px] gap-4 px-3 py-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {phonePreview ? (
          <div>
            <p className="mb-3 text-center text-[12px] font-medium" style={{ color: "var(--regu-gray-500)" }}>
              Así se ve en el teléfono. Vuelve a Escritorio para mover o añadir piezas.
            </p>
            <div
              className="mx-auto overflow-hidden rounded-[28px] border bg-white"
              style={{ width: 390, maxWidth: "100%", borderColor: "rgba(22,61,89,0.16)" }}
            >
              <PublicCanvas canvas={canvas} forceStack />
            </div>
          </div>
        ) : (
        <div
          ref={outerRef}
          className="relative w-full overflow-hidden rounded-xl"
          style={{
            height: canvas.height * scale,
            outline: dragOver ? "2px dashed #0f766e" : undefined,
            outlineOffset: 2,
          }}
        >
          <div
            ref={innerRef}
            onDragOver={(event) => {
              if (!editing) return;
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              if (!editing) return;
              event.preventDefault();
              setDragOver(false);
              const type = event.dataTransfer.getData("application/x-regulatel-block") as CanvasBlockType;
              if (!CANVAS_BLOCK_META.some((item) => item.type === type)) return;
              const point = toCanvasPoint(event.clientX, event.clientY);
              addBlock(type, point.x - 80, point.y - 20);
            }}
            onPointerDown={() => {
              if (editing) {
                setSelectedId(null);
                setEditingTextId(null);
              }
            }}
            style={{
              width: CANVAS_W,
              height: canvas.height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              backgroundColor: canvas.backgroundColor || "#FAFBFC",
              backgroundImage:
                editing && showGrid
                  ? "linear-gradient(rgba(22,61,89,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(22,61,89,0.07) 1px, transparent 1px)"
                  : undefined,
              backgroundSize: editing && showGrid ? "20px 20px" : undefined,
              position: "relative",
            }}
          >
            {sorted.map((block) => {
              if (block.content.opacity === 0 && !editing) return null;
              const isSel = editing && block.id === selectedId;
              const isHover = editing && !isSel && block.id === hoverId;
              return (
                <div
                  key={block.id}
                  onPointerDown={(event) => startMove(event, block)}
                  onPointerEnter={() => setHoverId(block.id)}
                  onPointerLeave={() => setHoverId((id) => (id === block.id ? null : id))}
                  style={{
                    position: "absolute",
                    left: block.x,
                    top: block.y,
                    width: block.w,
                    height: block.h,
                    zIndex: block.z,
                    cursor: editing ? (block.content.locked ? "default" : "move") : "default",
                    outline: isSel ? "2px solid #0f766e" : isHover ? "1px dashed rgba(15,118,110,0.7)" : "none",
                    outlineOffset: 2,
                    userSelect: editing && editingTextId !== block.id ? "none" : undefined,
                  }}
                >
                  {editing && editingTextId === block.id && isTexty(block.type) ? (
                    <textarea
                      autoFocus
                      value={block.type === "button" ? block.content.label || "" : block.content.text || ""}
                      onPointerDown={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateBlock(block.id, {
                          content:
                            block.type === "button"
                              ? { ...block.content, label: e.target.value }
                              : { ...block.content, text: e.target.value },
                        })
                      }
                      onBlur={() => setEditingTextId(null)}
                      className="h-full w-full resize-none border-0 bg-white/90 p-2 outline-none"
                      style={{
                        fontSize: block.content.fontSize || 16,
                        fontWeight: block.content.fontWeight || 400,
                        color: block.content.textColor || "#163D59",
                        textAlign: block.content.align || "left",
                        fontFamily:
                          block.content.fontFamily === "heading" || block.type === "heading"
                            ? "var(--token-font-heading)"
                            : "var(--token-font-body)",
                      }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", pointerEvents: editing ? "none" : undefined }}>
                      <BlockVisual block={block} editing={editing} />
                    </div>
                  )}
                  {isSel &&
                    !block.content.locked &&
                    HANDLES.map((handle) => (
                      <span
                        key={handle}
                        style={handleStyle(handle)}
                        onPointerDown={(event) => startResize(event, block, handle)}
                      />
                    ))}
                  {isSel && (
                    <span
                      className="pointer-events-none absolute -top-6 left-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: "#0f766e" }}
                    >
                      {CANVAS_BLOCK_META.find((item) => item.type === block.type)?.label} · {Math.round(block.w)}×
                      {Math.round(block.h)}
                      {block.content.locked ? " · bloqueada" : ""}
                    </span>
                  )}
                </div>
              );
            })}
            {editing &&
              guides.map((guide) => (
                <div
                  key={`${guide.axis}-${guide.at}`}
                  className="pointer-events-none"
                  style={
                    guide.axis === "v"
                      ? {
                          position: "absolute",
                          left: guide.at,
                          top: 0,
                          width: 1,
                          height: canvas.height,
                          backgroundColor: "#C5DC0B",
                          boxShadow: "0 0 0 1px rgba(197,220,11,0.35)",
                          zIndex: 9999,
                        }
                      : {
                          position: "absolute",
                          top: guide.at,
                          left: 0,
                          height: 1,
                          width: CANVAS_W,
                          backgroundColor: "#C5DC0B",
                          boxShadow: "0 0 0 1px rgba(197,220,11,0.35)",
                          zIndex: 9999,
                        }
                  }
                />
              ))}
            {editing && dragOver && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: "rgba(15,118,110,0.08)", color: "#0f766e" }}
              >
                Suelta la pieza aquí
              </div>
            )}
          </div>
        </div>
        )}

        {editing && (
          <aside
            className="h-fit rounded-2xl border bg-white p-4 lg:sticky"
            style={{
              borderColor: "rgba(22,61,89,0.10)",
              top: "calc(var(--site-edit-bar-h, 3.25rem) + 3.75rem)",
              maxHeight: "calc(100vh - 8rem)",
              overflowY: "auto",
            }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "#0f766e" }}>
              Página
            </p>
            <div className="mt-2 space-y-3">
              <ColorField label="Fondo de la página" value={canvas.backgroundColor} onChange={(backgroundColor) => commit({ ...canvas, backgroundColor })} />
              <Field label="Alto del lienzo">
                <input
                  type="number"
                  min={600}
                  max={4000}
                  value={Math.round(canvas.height)}
                  onChange={(e) => commit({ ...canvas, height: Math.max(600, Number(e.target.value) || 900) })}
                  className="w-full rounded-lg border px-2.5 py-2 text-sm"
                  style={{ borderColor: "rgba(22,61,89,0.14)" }}
                />
              </Field>
            </div>
            <div className="my-4 h-px" style={{ backgroundColor: "rgba(22,61,89,0.08)" }} />
            <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "#0f766e" }}>
              Pieza seleccionada
            </p>
            {!selected && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--regu-gray-500)" }}>
                Pulsa un bloque, o arrastra Título, Foto, Galería, PDF o Tarjetas desde arriba. Doble clic para escribir en el lienzo.
              </p>
            )}
            {selected && (
              <BlockProps
                block={selected}
                onChange={(next) => updateBlock(selected.id, next)}
                onRemove={() => {
                  commit({ ...canvas, blocks: canvas.blocks.filter((b) => b.id !== selected.id) });
                  setSelectedId(null);
                }}
                onDuplicate={() => duplicateBlock(selected)}
                onFront={() =>
                  updateBlock(selected.id, { z: canvas.blocks.reduce((max, b) => Math.max(max, b.z), 0) + 1 })
                }
                onBack={() =>
                  updateBlock(selected.id, { z: canvas.blocks.reduce((min, b) => Math.min(min, b.z), selected.z) - 1 })
                }
                onAlign={(where) => {
                  if (where === "left") updateBlock(selected.id, { x: PAGE_INSET });
                  if (where === "center") updateBlock(selected.id, { x: Math.round((CANVAS_W - selected.w) / 2) });
                  if (where === "right") updateBlock(selected.id, { x: CANVAS_W - selected.w - PAGE_INSET });
                  if (where === "wide") updateBlock(selected.id, { x: PAGE_INSET, w: CANVAS_W - PAGE_INSET * 2 });
                }}
              />
            )}
            {canvas.blocks.length > 0 && (
              <>
                <div className="my-4 h-px" style={{ backgroundColor: "rgba(22,61,89,0.08)" }} />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "#0f766e" }}>
                  Capas
                </p>
                <ul className="mt-2 space-y-1">
                  {[...canvas.blocks]
                    .sort((a, b) => b.z - a.z)
                    .map((block) => {
                      const label = CANVAS_BLOCK_META.find((item) => item.type === block.type)?.label || block.type;
                      const snippet = (block.content.text || block.content.label || block.content.alt || "").replace(/\s+/g, " ").trim();
                      return (
                        <li key={block.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(block.id)}
                            className="flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[11px]"
                            style={{
                              borderColor: block.id === selectedId ? "#0f766e" : "rgba(22,61,89,0.10)",
                              backgroundColor: block.id === selectedId ? "rgba(15,118,110,0.08)" : "white",
                              color: "var(--regu-navy)",
                            }}
                          >
                            <span className="font-bold">{label}</span>
                            <span className="min-w-0 flex-1 truncate" style={{ color: "var(--regu-gray-500)" }}>
                              {snippet || `${Math.round(block.w)}×${Math.round(block.h)}`}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </>
            )}
            <p className="mt-4 text-[10px] leading-relaxed" style={{ color: "var(--regu-gray-400)" }}>
              Flechas mueven · Mayús + flechas de a 10 · Ctrl+D duplica · Supr borra · Esc suelta
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}

function BlockProps({
  block,
  onChange,
  onRemove,
  onDuplicate,
  onFront,
  onBack,
  onAlign,
}: {
  block: CanvasBlock;
  onChange: (block: CanvasBlock) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onFront: () => void;
  onBack: () => void;
  onAlign: (where: "left" | "center" | "right" | "wide") => void;
}) {
  const c = block.content;
  const setContent = (patch: Partial<CanvasBlock["content"]>) =>
    onChange({ ...block, content: { ...block.content, ...patch } });
  const setBox = (patch: Partial<Pick<CanvasBlock, "x" | "y" | "w" | "h">>) => onChange({ ...block, ...patch });

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold" style={{ color: "var(--regu-navy)" }}>
          {CANVAS_BLOCK_META.find((item) => item.type === block.type)?.label}
        </p>
        <button
          type="button"
          onClick={() => setContent({ locked: !c.locked })}
          className="rounded-lg border p-1.5"
          style={{ borderColor: "rgba(22,61,89,0.14)", color: c.locked ? "#0f766e" : "var(--regu-gray-500)" }}
          title={c.locked ? "Desbloquear" : "Bloquear posición"}
        >
          {c.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
        </button>
      </div>

      <SectionLabel>Contenido</SectionLabel>
      {(block.type === "heading" || block.type === "text" || block.type === "box" || block.type === "cover" || block.type === "quote") && (
        <Field label="Texto">
          <MarkupTextarea
            value={c.text || ""}
            onChange={(text) => setContent({ text })}
            rows={block.type === "heading" || block.type === "cover" ? 3 : 6}
          />
        </Field>
      )}
      {block.type === "button" && (
        <>
          <Field label="Etiqueta del botón">
            <input
              value={c.label || ""}
              onChange={(e) => setContent({ label: e.target.value })}
              className="w-full rounded-lg border px-2.5 py-2 text-sm"
              style={{ borderColor: "rgba(22,61,89,0.14)" }}
            />
          </Field>
          <Field label="Enlace">
            <input
              value={c.href || ""}
              onChange={(e) => setContent({ href: e.target.value })}
              placeholder="/noticias o https://…"
              className="w-full rounded-lg border px-2.5 py-2 text-sm"
              style={{ borderColor: "rgba(22,61,89,0.14)" }}
            />
          </Field>
        </>
      )}
      {(block.type === "heading" || block.type === "text" || block.type === "box" || block.type === "image") && (
        <Field label="Enlace al pulsar (opcional)">
          <input
            value={c.href || ""}
            onChange={(e) => setContent({ href: e.target.value })}
            placeholder="/pagina o https://…"
            className="w-full rounded-lg border px-2.5 py-2 text-sm"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          />
        </Field>
      )}
      {(block.type === "image" || block.type === "cover") && (
        <CompactImageField
          label={block.type === "cover" ? "Foto de portada" : "Foto"}
          value={c.url || ""}
          onChange={(url) => setContent({ url })}
        />
      )}
      {block.type === "image" && (
        <>
          <Field label="Texto alternativo">
            <input
              value={c.alt || ""}
              onChange={(e) => setContent({ alt: e.target.value })}
              className="w-full rounded-lg border px-2.5 py-2 text-sm"
              style={{ borderColor: "rgba(22,61,89,0.14)" }}
            />
          </Field>
          <div className="flex gap-1">
            {(["cover", "contain"] as const).map((fit) => (
              <button
                key={fit}
                type="button"
                onClick={() => setContent({ objectFit: fit })}
                className="flex-1 rounded-lg border py-1.5 text-[11px] font-semibold"
                style={{
                  borderColor: (c.objectFit || "cover") === fit ? "#0f766e" : "rgba(22,61,89,0.14)",
                  backgroundColor: (c.objectFit || "cover") === fit ? "rgba(15,118,110,0.08)" : "white",
                }}
              >
                {fit === "cover" ? "Llenar" : "Cabida"}
              </button>
            ))}
          </div>
        </>
      )}
      {block.type === "video" && (
        <Field label="YouTube o enlace MP4">
          <input
            value={c.url || ""}
            onChange={(e) => setContent({ url: e.target.value })}
            placeholder="https://youtu.be/…"
            className="w-full rounded-lg border px-2.5 py-2 text-sm"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          />
        </Field>
      )}
      {block.type === "quote" && (
        <Field label="Autor o fuente">
          <input
            value={c.cite || ""}
            onChange={(e) => setContent({ cite: e.target.value })}
            className="w-full rounded-lg border px-2.5 py-2 text-sm"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          />
        </Field>
      )}
      {block.type === "list" && (
        <Field label="Un punto por línea">
          <MarkupTextarea
            value={(c.items || []).join("\n")}
            onChange={(value) => setContent({ items: value.split("\n") })}
            rows={6}
          />
        </Field>
      )}
      {(block.type === "gallery" || block.type === "cards") && (
        <div className="flex gap-1">
          {([2, 3] as const).map((cols) => (
            <button
              key={cols}
              type="button"
              onClick={() => setContent({ columns: cols })}
              className="flex-1 rounded-lg border py-1.5 text-[11px] font-semibold"
              style={{
                borderColor: (c.columns || 3) === cols ? "#0f766e" : "rgba(22,61,89,0.14)",
                backgroundColor: (c.columns || 3) === cols ? "rgba(15,118,110,0.08)" : "white",
              }}
            >
              {cols} columnas
            </button>
          ))}
        </div>
      )}
      {block.type === "gallery" && (
        <div className="space-y-2">
          {(c.images || [""]).map((url, index) => (
            <div key={`img-${index}`} className="rounded-lg border p-2" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
              <CompactImageField
                label={`Foto ${index + 1}`}
                value={url}
                onChange={(next) => {
                  const images = [...(c.images || [])];
                  images[index] = next;
                  setContent({ images });
                }}
              />
              <button
                type="button"
                onClick={() => setContent({ images: (c.images || []).filter((_, i) => i !== index) })}
                className="mt-1 text-[11px] font-semibold text-red-700"
              >
                Quitar foto
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setContent({ images: [...(c.images || []), ""] })}
            className="w-full rounded-lg border py-1.5 text-[11px] font-semibold"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            + Foto
          </button>
        </div>
      )}
      {block.type === "cards" && (
        <div className="space-y-3">
          {(c.cards || []).map((card, index) => (
            <div key={card.id} className="space-y-2 rounded-lg border p-2" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
              <p className="text-[11px] font-bold" style={{ color: "var(--regu-navy)" }}>
                Tarjeta {index + 1}
              </p>
              <input
                value={card.title}
                onChange={(e) => {
                  const cards = (c.cards || []).map((item, i) => (i === index ? { ...item, title: e.target.value } : item));
                  setContent({ cards });
                }}
                placeholder="Título"
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{ borderColor: "rgba(22,61,89,0.14)" }}
              />
              <textarea
                value={card.text}
                onChange={(e) => {
                  const cards = (c.cards || []).map((item, i) => (i === index ? { ...item, text: e.target.value } : item));
                  setContent({ cards });
                }}
                rows={2}
                placeholder="Texto"
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{ borderColor: "rgba(22,61,89,0.14)" }}
              />
              <input
                value={card.href || ""}
                onChange={(e) => {
                  const cards = (c.cards || []).map((item, i) => (i === index ? { ...item, href: e.target.value } : item));
                  setContent({ cards });
                }}
                placeholder="Enlace /pagina o https://…"
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{ borderColor: "rgba(22,61,89,0.14)" }}
              />
              <CompactImageField
                label="Foto"
                value={card.imageUrl || ""}
                onChange={(imageUrl) => {
                  const cards = (c.cards || []).map((item, i) => (i === index ? { ...item, imageUrl } : item));
                  setContent({ cards });
                }}
              />
              <button
                type="button"
                onClick={() => setContent({ cards: (c.cards || []).filter((_, i) => i !== index) })}
                className="text-[11px] font-semibold text-red-700"
              >
                Quitar tarjeta
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setContent({ cards: [...(c.cards || []), { ...emptyCustomCard(), title: "Tarjeta", text: "Texto corto." }] })}
            className="w-full rounded-lg border py-1.5 text-[11px] font-semibold"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            + Tarjeta
          </button>
        </div>
      )}
      {block.type === "document" && (
        <div className="space-y-3">
          {(c.documents || []).map((doc, index) => (
            <div key={doc.id} className="space-y-2 rounded-lg border p-2" style={{ borderColor: "rgba(22,61,89,0.10)" }}>
              <input
                value={doc.title}
                onChange={(e) => {
                  const documents = (c.documents || []).map((item, i) => (i === index ? { ...item, title: e.target.value } : item));
                  setContent({ documents });
                }}
                placeholder="Título del documento"
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{ borderColor: "rgba(22,61,89,0.14)" }}
              />
              <input
                value={doc.description || ""}
                onChange={(e) => {
                  const documents = (c.documents || []).map((item, i) =>
                    i === index ? { ...item, description: e.target.value } : item
                  );
                  setContent({ documents });
                }}
                placeholder="Descripción (opcional)"
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{ borderColor: "rgba(22,61,89,0.14)" }}
              />
              <CompactFileField
                label="Archivo PDF"
                value={doc.url}
                onChange={(url) => {
                  const documents = (c.documents || []).map((item, i) => (i === index ? { ...item, url } : item));
                  setContent({ documents });
                }}
              />
              <button
                type="button"
                onClick={() => setContent({ documents: (c.documents || []).filter((_, i) => i !== index) })}
                className="text-[11px] font-semibold text-red-700"
              >
                Quitar PDF
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setContent({ documents: [...(c.documents || []), emptyCustomDocument()] })}
            className="w-full rounded-lg border py-1.5 text-[11px] font-semibold"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            + PDF
          </button>
        </div>
      )}
      {block.type === "cover" && (
        <>
          <SliderField
            label="Oscuridad de la foto"
            min={0}
            max={80}
            value={Math.round((c.overlayOpacity ?? 0.45) * 100)}
            onChange={(n) => setContent({ overlayOpacity: n / 100, overlay: `rgba(11, 38, 57, ${n / 100})` })}
          />
          <div className="flex gap-1">
            {(["top", "center", "bottom"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setContent({ verticalAlign: v })}
                className="flex-1 rounded-lg border py-1.5 text-[11px] font-semibold"
                style={{
                  borderColor: (c.verticalAlign || "bottom") === v ? "#0f766e" : "rgba(22,61,89,0.14)",
                  backgroundColor: (c.verticalAlign || "bottom") === v ? "rgba(15,118,110,0.08)" : "white",
                }}
              >
                {v === "top" ? "Arriba" : v === "center" ? "Centro" : "Abajo"}
              </button>
            ))}
          </div>
        </>
      )}

      {isTexty(block.type) && (
        <>
          <SectionLabel>Tipografía</SectionLabel>
          <div className="flex gap-1">
            {(["heading", "body"] as const).map((fam) => (
              <button
                key={fam}
                type="button"
                onClick={() => setContent({ fontFamily: fam })}
                className="flex-1 rounded-lg border py-1.5 text-[11px] font-semibold"
                style={{
                  borderColor: (c.fontFamily || (block.type === "heading" || block.type === "cover" ? "heading" : "body")) === fam ? "#0f766e" : "rgba(22,61,89,0.14)",
                  backgroundColor:
                    (c.fontFamily || (block.type === "heading" || block.type === "cover" ? "heading" : "body")) === fam
                      ? "rgba(15,118,110,0.08)"
                      : "white",
                }}
              >
                {fam === "heading" ? "Montserrat" : "Inter"}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(
              [
                [400, "Rg"],
                [500, "Md"],
                [700, "Bd"],
                [800, "Ex"],
              ] as const
            ).map(([w, label]) => (
              <button
                key={w}
                type="button"
                onClick={() => setContent({ fontWeight: w })}
                className="flex-1 rounded-lg border py-1.5 text-[11px] font-bold"
                style={{
                  borderColor: (c.fontWeight || 400) === w ? "#0f766e" : "rgba(22,61,89,0.14)",
                  backgroundColor: (c.fontWeight || 400) === w ? "rgba(15,118,110,0.08)" : "white",
                  fontWeight: w,
                }}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setContent({ italic: !c.italic })}
              className="rounded-lg border px-2 py-1.5"
              style={{
                borderColor: c.italic ? "#0f766e" : "rgba(22,61,89,0.14)",
                backgroundColor: c.italic ? "rgba(15,118,110,0.08)" : "white",
              }}
              aria-label="Cursiva"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setContent({ fontWeight: (c.fontWeight || 400) >= 700 ? 400 : 700 })}
              className="rounded-lg border px-2 py-1.5"
              style={{
                borderColor: (c.fontWeight || 400) >= 700 ? "#0f766e" : "rgba(22,61,89,0.14)",
                backgroundColor: (c.fontWeight || 400) >= 700 ? "rgba(15,118,110,0.08)" : "white",
              }}
              aria-label="Negrita"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
          </div>
          <SliderField
            label={`Tamaño de letra · ${c.fontSize || 16}px`}
            min={10}
            max={96}
            value={c.fontSize || 16}
            onChange={(fontSize) => setContent({ fontSize })}
          />
          <SliderField
            label={`Interlineado · ${(c.lineHeight || 1.4).toFixed(2)}`}
            min={100}
            max={220}
            value={Math.round((c.lineHeight || 1.4) * 100)}
            onChange={(n) => setContent({ lineHeight: n / 100 })}
          />
          <SliderField
            label={`Espaciado · ${c.letterSpacing ?? 0}px`}
            min={-4}
            max={12}
            value={c.letterSpacing ?? 0}
            onChange={(letterSpacing) => setContent({ letterSpacing })}
          />
          <div className="flex gap-1">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => setContent({ align })}
                className="flex-1 rounded-lg border py-1.5"
                style={{
                  borderColor: (c.align || "left") === align ? "#0f766e" : "rgba(22,61,89,0.14)",
                  backgroundColor: (c.align || "left") === align ? "rgba(15,118,110,0.08)" : "white",
                }}
                aria-label={align}
              >
                {align === "left" ? (
                  <AlignLeft className="mx-auto h-4 w-4" />
                ) : align === "center" ? (
                  <AlignCenter className="mx-auto h-4 w-4" />
                ) : (
                  <AlignRight className="mx-auto h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <SectionLabel>Apariencia</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {block.type !== "image" && block.type !== "video" && (
          <ColorField
            label="Color de fondo"
            value={c.backgroundColor || (block.type === "heading" || block.type === "text" || block.type === "spacer" ? "" : "#163D59")}
            onChange={(backgroundColor) => setContent({ backgroundColor })}
            allowEmpty={block.type === "heading" || block.type === "text" || block.type === "spacer"}
          />
        )}
        {isTexty(block.type) && (
          <ColorField label="Color de texto" value={c.textColor || "#163D59"} onChange={(textColor) => setContent({ textColor })} />
        )}
      </div>

      <SliderField label={`Esquinas · ${c.borderRadius ?? 0}px`} min={0} max={40} value={c.borderRadius ?? 0} onChange={(borderRadius) => setContent({ borderRadius })} />
      {(block.type === "box" || block.type === "button" || block.type === "cover" || block.type === "heading" || block.type === "text") && (
        <SliderField label={`Relleno · ${c.padding ?? 0}px`} min={0} max={64} value={c.padding ?? 0} onChange={(padding) => setContent({ padding })} />
      )}
      <SliderField
        label={`Borde · ${c.borderWidth ?? 0}px`}
        min={0}
        max={8}
        value={c.borderWidth ?? 0}
        onChange={(borderWidth) => setContent({ borderWidth })}
      />
      {(c.borderWidth ?? 0) > 0 && (
        <ColorField label="Color del borde" value={c.borderColor || "#163D59"} onChange={(borderColor) => setContent({ borderColor })} />
      )}
      <SliderField
        label={`Opacidad · ${Math.round((c.opacity ?? 1) * 100)}%`}
        min={20}
        max={100}
        value={Math.round((c.opacity ?? 1) * 100)}
        onChange={(n) => setContent({ opacity: n / 100 })}
      />
      <label className="inline-flex items-center gap-2 text-xs font-medium" style={{ color: "var(--regu-gray-700)" }}>
        <input type="checkbox" checked={Boolean(c.shadow)} onChange={(e) => setContent({ shadow: e.target.checked })} />
        Sombra
      </label>

      <SectionLabel>Posición</SectionLabel>
      <div className="grid grid-cols-4 gap-1.5">
        {(["x", "y", "w", "h"] as const).map((key) => (
          <Field key={key} label={key.toUpperCase()}>
            <input
              type="number"
              value={Math.round(block[key])}
              onChange={(e) => setBox({ [key]: Number(e.target.value) || 0 } as Partial<CanvasBlock>)}
              className="w-full rounded-lg border px-1.5 py-1.5 text-xs"
              style={{ borderColor: "rgba(22,61,89,0.14)" }}
            />
          </Field>
        ))}
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={() => onAlign("left")} className="flex-1 rounded-lg border py-1.5 text-[10px] font-semibold" style={{ borderColor: "rgba(22,61,89,0.14)" }}>
          Izq.
        </button>
        <button type="button" onClick={() => onAlign("center")} className="flex-1 rounded-lg border py-1.5 text-[10px] font-semibold" style={{ borderColor: "rgba(22,61,89,0.14)" }}>
          Centro
        </button>
        <button type="button" onClick={() => onAlign("right")} className="flex-1 rounded-lg border py-1.5 text-[10px] font-semibold" style={{ borderColor: "rgba(22,61,89,0.14)" }}>
          Der.
        </button>
        <button type="button" onClick={() => onAlign("wide")} className="flex-1 rounded-lg border py-1.5 text-[10px] font-semibold" style={{ borderColor: "rgba(22,61,89,0.14)" }}>
          Ancho
        </button>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-[11px] font-semibold"
          style={{ borderColor: "rgba(22,61,89,0.14)" }}
        >
          <ArrowDownToLine className="h-3.5 w-3.5" />
          Atrás
        </button>
        <button
          type="button"
          onClick={onFront}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-[11px] font-semibold"
          style={{ borderColor: "rgba(22,61,89,0.14)" }}
        >
          <ArrowUpToLine className="h-3.5 w-3.5" />
          Delante
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-[11px] font-semibold"
          style={{ borderColor: "rgba(22,61,89,0.14)" }}
        >
          <Copy className="h-3.5 w-3.5" />
          Copiar
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold text-red-700"
        style={{ borderColor: "rgba(22,61,89,0.14)" }}
      >
        <Trash2 className="h-4 w-4" />
        Quitar pieza
      </button>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--regu-gray-400)" }}>
      {children}
    </p>
  );
}

function CompactImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const res = await uploadAdminFile({ file, kind: "image", folder: "attachments" });
      onChange(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="block text-[12px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void handleFile(file);
        }}
      />
      {value ? (
        <div className="mt-1 overflow-hidden rounded-lg border" style={{ borderColor: "rgba(22,61,89,0.14)" }}>
          <img src={value} alt="" className="h-24 w-full object-cover" />
        </div>
      ) : null}
      <div className="mt-1.5 flex gap-1">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold disabled:opacity-60"
          style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Subiendo…" : value ? "Cambiar foto" : "Subir foto"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border px-2 py-1.5 text-[11px] font-semibold text-red-700"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            Quitar
          </button>
        ) : null}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="o pega un enlace https://…"
        className="mt-1.5 w-full rounded-lg border px-2 py-1.5 font-mono text-[11px]"
        style={{ borderColor: "rgba(22,61,89,0.14)" }}
      />
      {error ? (
        <p className="mt-1 text-[11px] text-red-700">{error}</p>
      ) : null}
    </div>
  );
}

function CompactFileField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const res = await uploadAdminFile({ file, kind: "document", folder: "documents" });
      onChange(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="block text-[12px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void handleFile(file);
        }}
      />
      <div className="mt-1.5 flex gap-1">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold disabled:opacity-60"
          style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Subiendo…" : value ? "Cambiar PDF" : "Subir PDF"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border px-2 py-1.5 text-[11px] font-semibold text-red-700"
            style={{ borderColor: "rgba(22,61,89,0.14)" }}
          >
            Quitar
          </button>
        ) : null}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="o pega un enlace https://…"
        className="mt-1.5 w-full rounded-lg border px-2 py-1.5 font-mono text-[11px]"
        style={{ borderColor: "rgba(22,61,89,0.14)" }}
      />
      {error ? <p className="mt-1 text-[11px] text-red-700">{error}</p> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block text-[12px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
      {label}
      <div className="mt-1">{children}</div>
    </div>
  );
}

function applyMarkupWrap(
  el: HTMLTextAreaElement | null,
  value: string,
  onChange: (next: string) => void,
  before: string,
  after: string,
  fallback = "texto"
) {
  if (!el) {
    onChange(`${before}${value || fallback}${after}`);
    return;
  }
  const wrapped = wrapTextareaSelection(el, value, before, after, fallback);
  onChange(wrapped.next);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(wrapped.selectStart, wrapped.selectEnd);
  });
}

function MarkupTextarea({
  value,
  onChange,
  rows,
}: {
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (before: string, after: string, fallback?: string) =>
    applyMarkupWrap(ref.current, value, onChange, before, after, fallback);
  const insertLink = () => {
    const url = window.prompt("Enlace (ruta del sitio o https://…)", "/");
    if (url == null) return;
    const href = url.trim() || "/";
    wrap("[", `](${href})`);
  };
  return (
    <div>
      <div className="mb-1 flex flex-wrap gap-1">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => wrap("**", "**")}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold"
          style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
          title="Negrita (Ctrl+B)"
        >
          <Bold className="h-3 w-3" />
          Negrita
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => wrap("*", "*")}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold"
          style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
          title="Cursiva (Ctrl+I)"
        >
          <Italic className="h-3 w-3" />
          Cursiva
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertLink}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold"
          style={{ borderColor: "rgba(22,61,89,0.14)", color: "var(--regu-navy)" }}
          title="Enlace (Ctrl+K)"
        >
          <Link2 className="h-3 w-3" />
          Enlace
        </button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (!(e.ctrlKey || e.metaKey)) return;
          const key = e.key.toLowerCase();
          if (key === "b") {
            e.preventDefault();
            wrap("**", "**");
          } else if (key === "i") {
            e.preventDefault();
            wrap("*", "*");
          } else if (key === "k") {
            e.preventDefault();
            insertLink();
          }
        }}
        rows={rows}
        className="w-full rounded-lg border px-2.5 py-2 text-sm"
        style={{ borderColor: "rgba(22,61,89,0.14)" }}
      />
      <p className="mt-1 text-[10px] font-normal leading-relaxed" style={{ color: "var(--regu-gray-400)" }}>
        Selecciona una palabra y pulsa Negrita o Enlace. También vale **así** o [texto](/ruta).
      </p>
    </div>
  );
}

function SliderField({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block text-[12px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
      {label}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[#0f766e]"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
  allowEmpty,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
}) {
  const hex = toHex(value) || "#ffffff";
  return (
    <div>
      <span className="block text-[12px] font-medium" style={{ color: "var(--regu-gray-600)" }}>
        {label}
      </span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-11 cursor-pointer rounded-lg border bg-white p-0.5"
          style={{ borderColor: "rgba(22,61,89,0.14)" }}
          aria-label={label}
        />
        <input
          value={value === "transparent" ? "" : value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#163D59"
          className="min-w-0 flex-1 rounded-lg border px-2 py-1.5 font-mono text-xs"
          style={{ borderColor: "rgba(22,61,89,0.14)" }}
        />
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {COLOR_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="h-5 w-5 rounded-full border"
            style={{
              backgroundColor: color,
              borderColor: value?.toLowerCase() === color.toLowerCase() ? "#0f766e" : "rgba(22,61,89,0.2)",
              boxShadow: value?.toLowerCase() === color.toLowerCase() ? "0 0 0 2px rgba(15,118,110,0.35)" : undefined,
            }}
            aria-label={color}
          />
        ))}
        {allowEmpty && (
          <button
            type="button"
            onClick={() => onChange("transparent")}
            className="h-5 rounded-full border px-1.5 text-[9px] font-bold"
            style={{ borderColor: "rgba(22,61,89,0.2)", color: "var(--regu-gray-500)" }}
          >
            Sin
          </button>
        )}
      </div>
    </div>
  );
}

function toHex(color?: string): string {
  if (!color || color === "transparent") return "";
  if (color.startsWith("#") && (color.length === 7 || color.length === 4)) {
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    return color;
  }
  return "";
}
