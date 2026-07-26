import { afterEach, describe, expect, it, vi } from "vitest";
import {
	CalendarApiError,
	fetchEventById,
	fetchUpcomingEvents,
	parseEventDescription,
} from "./googleCalendar";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
	vi.restoreAllMocks();
});

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
	globalThis.fetch = vi.fn().mockResolvedValue(response) as unknown as typeof fetch;
}

describe("fetchUpcomingEvents", () => {
	it("returns calendar events from a successful response", async () => {
		const items = [{ id: "event-1", summary: "Concert" }];
		mockFetch({
			ok: true,
			json: async () => ({ items }),
		});

		await expect(fetchUpcomingEvents({ calendarId: "calendar", apiKey: "key" })).resolves.toEqual(items);
	});

	it("returns an empty array for a successful empty response", async () => {
		mockFetch({
			ok: true,
			json: async () => ({}),
		});

		await expect(fetchUpcomingEvents({ calendarId: "calendar", apiKey: "key" })).resolves.toEqual([]);
	});

	it("throws a calendar error for upstream failures", async () => {
		mockFetch({
			ok: false,
			status: 500,
			statusText: "Server Error",
		});

		await expect(fetchUpcomingEvents({ calendarId: "calendar", apiKey: "key" })).rejects.toMatchObject({
			name: "CalendarApiError",
			status: 500,
		});
	});
});

describe("fetchEventById", () => {
	it("returns null for a missing Google Calendar event", async () => {
		mockFetch({
			ok: false,
			status: 404,
			statusText: "Not Found",
		});

		await expect(fetchEventById({ calendarId: "calendar", apiKey: "key", id: "missing" })).resolves.toBeNull();
	});

	it("throws a calendar error for non-404 upstream failures", async () => {
		mockFetch({
			ok: false,
			status: 503,
			statusText: "Unavailable",
		});

		await expect(fetchEventById({ calendarId: "calendar", apiKey: "key", id: "event-1" })).rejects.toBeInstanceOf(CalendarApiError);
	});
});

describe("parseEventDescription", () => {
	it("separates subtitle, ticket URL, and program lines", () => {
		const parsed = parseEventDescription(`
			Festive evening<br>
			Ticket: https://tickets.example/event
			Program:
			Overture
			Aria
		`);

		expect(parsed).toEqual({
			subtitle: "Festive evening",
			ticket: "https://tickets.example/event",
			program: "Overture\nAria",
		});
	});
});
