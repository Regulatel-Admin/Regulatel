import { createContext, useContext } from "react";
import type { Event } from "@/types/event";

export interface EventResourceDraft {
  target: { section: "programs" | "documents" | "photos"; index: number | null; original?: string };
  draft: { title: string; url: string; description: string; comingSoon?: boolean };
}

export interface EventInlineEditValue {
  event: Event;
  patch: (values: Partial<Event>) => void;
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  resourceDraft?: EventResourceDraft;
  setResourceDraft: (draft: EventResourceDraft | undefined) => void;
}
export const EventInlineEditContext = createContext<EventInlineEditValue | null>(null);
export function useEventInlineEditor() { return useContext(EventInlineEditContext); }
