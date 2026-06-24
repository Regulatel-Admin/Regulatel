import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { Event } from "@/types/event";

const LOCATION_KEYS: Record<string, string> = {
  "Por definir": "eventsShared.locations.toBeDefined",
  Virtual: "eventsShared.locations.virtual",
};

function eventPrefix(id: string): string {
  return `eventsArticles.${id}`;
}

export function localizeEventLocation(location: string, t: TFunction, language: string): string {
  if (language === "es") return location;
  const key = LOCATION_KEYS[location.trim()];
  return key ? t(key) : location;
}

export function localizeEvent(event: Event, t: TFunction, language: string): Event {
  if (language === "es") return event;

  const prefix = eventPrefix(event.id);
  const title = t(`${prefix}.title`, { defaultValue: "" });
  if (!title) {
    return {
      ...event,
      location: localizeEventLocation(event.location, t, language),
    };
  }

  return {
    ...event,
    title,
    organizer: t(`${prefix}.organizer`, { defaultValue: event.organizer }),
    location: t(`${prefix}.location`, {
      defaultValue: localizeEventLocation(event.location, t, language),
    }),
    description: event.description
      ? t(`${prefix}.description`, { defaultValue: event.description })
      : event.description,
  };
}

export function useLocalizedEvents(events: Event[]): Event[] {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => events.map((event) => localizeEvent(event, t, i18n.language)),
    [events, t, i18n.language]
  );
}

export function useLocalizedEvent(event: Event | null | undefined): Event | null | undefined {
  const { t, i18n } = useTranslation();
  return useMemo(() => {
    if (!event) return event;
    return localizeEvent(event, t, i18n.language);
  }, [event, t, i18n.language]);
}
