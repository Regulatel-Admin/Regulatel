import { useEffect, useRef, useState } from "react";
import { CANVAS_W, sortBlocksForFlow, type CustomPageCanvas } from "@/data/customPages";
import { BlockVisual } from "@/components/custom-pages/CanvasBlockVisual";
import { flowBoxStyle } from "@/lib/canvasLayout";
import { useCanvasStack } from "@/hooks/useCanvasStack";

function ScaledCanvas({ canvas }: { canvas: CustomPageCanvas }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const apply = () => setScale(Math.min(1, el.clientWidth / CANVAS_W));
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [canvas.height]);

  const sorted = [...canvas.blocks].sort((a, b) => a.z - b.z);

  return (
    <div ref={outerRef} className="relative mx-auto w-full overflow-hidden" style={{ height: canvas.height * scale, maxWidth: CANVAS_W }}>
      <div
        style={{
          width: CANVAS_W,
          height: canvas.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          backgroundColor: canvas.backgroundColor || "#FAFBFC",
          position: "relative",
        }}
      >
        {sorted.map((block) => {
          if (block.content.opacity === 0) return null;
          return (
            <div
              key={block.id}
              style={{
                position: "absolute",
                left: block.x,
                top: block.y,
                width: block.w,
                height: block.h,
                zIndex: block.z,
              }}
            >
              <div style={{ width: "100%", height: "100%" }}>
                <BlockVisual block={block} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StackedCanvas({ canvas }: { canvas: CustomPageCanvas }) {
  const blocks = sortBlocksForFlow(canvas.blocks);
  return (
    <div style={{ backgroundColor: canvas.backgroundColor || "#FAFBFC" }}>
      <div className="mx-auto flex max-w-[720px] flex-col gap-5 px-4 py-6 sm:px-5">
        {blocks.map((block) => (
          <div key={block.id} style={flowBoxStyle(block)}>
            <BlockVisual block={block} layout="flow" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PublicCanvas({
  canvas,
  forceStack,
}: {
  canvas: CustomPageCanvas;
  forceStack?: boolean;
}) {
  const stack = useCanvasStack(forceStack);
  if (stack) return <StackedCanvas canvas={canvas} />;
  return <ScaledCanvas canvas={canvas} />;
}
