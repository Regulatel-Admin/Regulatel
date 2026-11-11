import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { Event } from "@/types/event";
import { hasPublishedTextTranslation, localizePublishedText, localizePublishedValue, publishedLanguage } from "@/lib/publishedContent";
import { EVENTS_SEED } from "@/data/eventsSeed";
import { SEMANA_RESOURCE_EVENTS } from "@/data/semanaRegulatelResources";
import { PUBLIC_EVENT_ADDITIONS } from "@/data/publicEventAdditions";

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
  if (publishedLanguage(language) === "es") return event;

  const prefix = eventPrefix(event.id);
  const localized = localizePublishedValue(event, language);
  const original = [...EVENTS_SEED, ...SEMANA_RESOURCE_EVENTS, ...PUBLIC_EVENT_ADDITIONS].find(item => item.id === event.id);
  const title = t(`${prefix}.title`, { defaultValue: "" });
  if (!title) {
    return {
      ...localized,
      location: hasPublishedTextTranslation(event.location, language) ? localized.location : localizeEventLocation(event.location, t, language),
    };
  }

  return {
    ...localized,
    title: hasPublishedTextTranslation(event.title, language) ? localized.title : original?.title === event.title ? title : event.title,
    organizer: hasPublishedTextTranslation(event.organizer, language) ? localized.organizer : original?.organizer === event.organizer ? t(`${prefix}.organizer`, { defaultValue: event.organizer }) : event.organizer,
    location: hasPublishedTextTranslation(event.location, language) ? localized.location : original?.location === event.location ? t(`${prefix}.location`, {
      defaultValue: localizeEventLocation(event.location, t, language),
    }) : localizeEventLocation(event.location, t, language),
    description: event.description
      ? hasPublishedTextTranslation(event.description, language) ? localizePublishedText(event.description, language) : original?.description === event.description ? t(`${prefix}.description`, { defaultValue: event.description }) : event.description
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
