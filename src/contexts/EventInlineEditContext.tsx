import { createContext, useContext } from "react";
import type { Event } from "@/types/event";

export interface EventInlineEditValue {
  event: Event;
  patch: (values: Partial<Event>) => void;
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
}
export const EventInlineEditContext = createContext<EventInlineEditValue | null>(null);
export function useEventInlineEditor() { return useContext(EventInlineEditContext); }
