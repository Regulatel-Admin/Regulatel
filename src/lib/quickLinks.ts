/**
 * Shared mapping from icon name (stored in API) to LucideIcon for quick links.
 * Used by public Home and admin content pages.
 */
import type { LucideIcon } from "lucide-react";
import { BarChart3, BookOpen, Files, Globe, ImageIcon, Users } from "lucide-react";
import type { QuickLinkSettingItem } from "@/types/siteSettings";
import type { QuickLinkItem } from "@/components/home/QuickLinksBar";

export const QUICK_LINK_ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Globe,
  BarChart3,
  Files,
  ImageIcon,
  BookOpen,
};

export function quickLinkItemsFromSetting(items: QuickLinkSettingItem[]): QuickLinkItem[] {
  return items.map((it) => ({
    label: it.label,
    href: it.href,
    external: it.external,
    icon: it.icon ? QUICK_LINK_ICON_MAP[it.icon] : undefined,
  }));
}
