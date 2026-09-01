import type { CSSProperties } from "react";
import type { CanvasBlock, CanvasBlockType } from "@/data/customPages";

export function isTexty(type: CanvasBlockType) {
  return (
    type === "heading" ||
    type === "text" ||
    type === "box" ||
    type === "cover" ||
    type === "button" ||
    type === "quote" ||
    type === "list"
  );
}

export function flowBoxStyle(block: CanvasBlock): CSSProperties {
  const ratio = `${Math.max(block.w, 1)} / ${Math.max(block.h, 1)}`;
  switch (block.type) {
    case "cover":
      return { width: "100%", aspectRatio: ratio, minHeight: 180 };
    case "image":
      return { width: "100%", aspectRatio: ratio, minHeight: 160 };
    case "video":
      return { width: "100%", aspectRatio: "16 / 9", minHeight: 200 };
    case "button":
      return { width: "100%", minHeight: 44 };
    case "spacer":
      return { width: "100%", height: Math.min(Math.max(block.h * 0.45, 12), 40) };
    case "divider":
      return { width: "100%", height: 24 };
    case "gallery":
    case "cards":
      return { width: "100%", minHeight: 180 };
    default:
      return { width: "100%" };
  }
}
