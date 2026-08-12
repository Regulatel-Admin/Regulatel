import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";

type PreviewStatus = "loading" | "ready" | "error";

export default function DocxPreview({ url }: { url: string }) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<PreviewStatus>("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setStatus("loading");
    container.replaceChildren();

    (async () => {
      try {
        const [response, { renderAsync }] = await Promise.all([
          fetch(url),
          import("docx-preview"),
        ]);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        if (cancelled || !containerRef.current) return;
        await renderAsync(buffer, containerRef.current, undefined, {
          className: "docx",
          inWrapper: true,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          renderHeaders: true,
          renderFooters: true,
          useBase64URL: true,
          experimental: true,
        });
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [url]);

  return (
    <div className="docx-preview-scroll relative h-full min-h-[400px]" aria-busy={status === "loading"}>
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#E8ECF0]">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-[rgba(22,61,89,0.15)] border-t-[var(--regu-blue)]"
            aria-hidden
          />
          <p className="text-sm font-medium" style={{ color: "var(--regu-gray-600)" }}>
            {t("pages.shared.wordPreviewLoading")}
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#E8ECF0] px-6 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "rgba(68,137,198,0.10)", color: "var(--regu-blue)" }}
          >
            <FileText className="h-6 w-6" />
          </div>
          <p className="max-w-md text-sm" style={{ color: "var(--regu-gray-600)" }}>
            {t("pages.shared.wordPreviewError")}
          </p>
        </div>
      )}
      <div ref={containerRef} className="docx-preview-host" />
    </div>
  );
}
