
import sanitizeHtml from "sanitize-html";

const CALENDAR_TIME_ZONE = "Europe/Prague";
const SUBTITLE_LABEL_PATTERN = /^(subtitle|subtatile):\s*/i;
const SUBTITLE_LABEL_ONLY_PATTERN = /^(subtitle|subtatile)$/i;

export class CalendarFetchError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "CalendarFetchError";
  }
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink: string;
}

export interface FetchEventsOptions {
  calendarId: string;
  apiKey: string;
  maxResults?: number;
}

export async function fetchUpcomingEvents({
  calendarId,
  apiKey,
  maxResults = 10,
}: FetchEventsOptions): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?key=${apiKey}&timeMin=${now}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new CalendarFetchError(
      `Failed to fetch events: ${response.statusText}`,
      response.status
    );
  }
  const data = await response.json();
  return data.items || [];
}

export interface FetchEventByIdOptions {
  calendarId: string;
  apiKey: string;
  id: string;
}

export async function fetchEventById({
  calendarId,
  apiKey,
  id,
}: FetchEventByIdOptions): Promise<CalendarEvent | null> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events/${encodeURIComponent(id)}?key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new CalendarFetchError(
      `Failed to fetch event: ${response.statusText}`,
      response.status
    );
  }
  return await response.json();
}

export function getEventIsoDate(event: CalendarEvent): string | null {
  return event.start.dateTime || event.start.date || null;
}

export interface FormattedDate {
  day: string;
  month: string;
  year: string;
  weekday?: string;
  time?: string;
  full: string;
}

export function formatDate(
  isoDate: string,
  lang: string = "cs",
  _variant: "short" | "full" = "short"
): FormattedDate {
  const date = new Date(isoDate);
  const locale = lang === "en" ? "en-US" : "cs-CZ";

  const day = date.toLocaleDateString(locale, { day: "numeric", timeZone: CALENDAR_TIME_ZONE });
  const month = date.toLocaleDateString(locale, { month: "long", timeZone: CALENDAR_TIME_ZONE });
  const year = date.toLocaleDateString(locale, { year: "numeric", timeZone: CALENDAR_TIME_ZONE });
  const weekday = date.toLocaleDateString(locale, { weekday: "long", timeZone: CALENDAR_TIME_ZONE });
  
  // Extract time if it's a dateTime (has 'T')
  const hasTime = isoDate.includes("T");
  const time = hasTime 
    ? date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: CALENDAR_TIME_ZONE })
    : undefined;

  const full = date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: hasTime ? "2-digit" : undefined,
    minute: hasTime ? "2-digit" : undefined,
    timeZone: CALENDAR_TIME_ZONE,
  });

  return {
    day,
    month,
    year,
    weekday,
    time,
    full,
  };
}

export function parseEventDescription(description?: string): {
  subtitle: string;
  ticket: string | undefined;
  program: string | undefined;
} {
  if (!description) {
    return { subtitle: "", ticket: undefined, program: undefined };
  }

  // Pre-process description to handle HTML from Google Calendar
  const cleanText = description
    .replace(/<br\s*\/?>/gi, "\n") // Replace <br> with newlines
    .replace(/<\/p>/gi, "\n")      // Replace </p> with newlines
    .replace(/<[^>]+>/g, "");      // Strip remaining tags

  // Decode HTML entities (basic ones)
  const decodedText = cleanText
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

  const lines = decodedText.split("\n");
  let ticket: string | undefined;
  const subtitleParts: string[] = [];
  const programLines: string[] = [];
  let isProgramSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    if (lower.startsWith("ticket:") || lower.startsWith("vstupenky:")) {
      const match = trimmed.match(/https?:\/\/[^\s]+/);
      if (match) {
        ticket = match[0];
      }
    } else if (lower.startsWith("program:") || lower === "program") {
      isProgramSection = true;
    } else if (isProgramSection) {
      programLines.push(trimmed);
    } else if (trimmed && !SUBTITLE_LABEL_ONLY_PATTERN.test(trimmed)) {
      subtitleParts.push(trimmed.replace(SUBTITLE_LABEL_PATTERN, ""));
    }
  }

  return {
    subtitle: subtitleParts.join("\n"),
    ticket,
    program: programLines.length > 0 ? programLines.join("\n") : undefined,
  };
}

export function sanitizeProgramHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["b", "i", "em", "strong", "a", "p", "br", "ul", "li"],
    allowedAttributes: {
      "a": ["href"]
    }
  });
}
