import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";
import { canPreviewDocument } from "@/lib/documentPreview";

/**
 * Miniatura de portada clicable: abre el PDF en un visor sobre la misma página.
 * El título de la tarjeta no usa este control a propósito.
 */
export default function CoverPreviewTrigger({
  url,
  title,
  children,
}: {
  url?: string | null;
  title: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const previewable = Boolean(url && canPreviewDocument(url));

  if (!previewable || !url) {
    return <>{children}</>;
  }

  const modal =
    typeof document === "undefined"
      ? null
      : createPortal(
          <DocumentPreviewModal
            doc={open ? { url, title } : null}
            onClose={() => setOpen(false)}
          />,
          document.body,
        );

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className="relative shrink-0 cursor-pointer rounded-[2px] text-left transition-[transform,filter,box-shadow] duration-200 ease-out hover:-translate-y-px hover:brightness-[1.04] hover:shadow-[0_10px_24px_-10px_rgba(22,61,89,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1eb]"
        aria-label={t("homeSections.previewCoverAria", { title })}
      >
        {children}
      </button>
      {modal}
    </>
  );
}
