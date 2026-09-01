import { useEffect, useState } from "react";
import { CANVAS_STACK_BP } from "@/data/customPages";

export function useCanvasStack(force?: boolean) {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < CANVAS_STACK_BP : false
  );
  useEffect(() => {
    const apply = () => setNarrow(window.innerWidth < CANVAS_STACK_BP);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
  return force === true || (force !== false && narrow);
}
