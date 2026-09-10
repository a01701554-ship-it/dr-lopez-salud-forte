export type CalendarInterval = {
  start: Date;
  end: Date;
};

export type CalendarEventInput = CalendarInterval & {
  summary: string;
  description?: string;
  timezone: string;
  attendeeEmail?: string;
};

export type CalendarEvent = CalendarEventInput & {
  id: string;
};

export interface CalendarProvider {
  getBusyIntervals(range: CalendarInterval): Promise<CalendarInterval[]>;
  createEvent(input: CalendarEventInput): Promise<CalendarEvent>;
  updateEvent(id: string, input: CalendarEventInput): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
}

export class MockCalendarProvider implements CalendarProvider {
  private events: Map<string, CalendarEvent> = new Map();

  async getBusyIntervals(range: CalendarInterval): Promise<CalendarInterval[]> {
    const busy: CalendarInterval[] = [];
    for (const event of this.events.values()) {
      if (event.end > range.start && event.start < range.end) {
        busy.push({ start: new Date(event.start), end: new Date(event.end) });
      }
    }
    return busy;
  }

  async createEvent(input: CalendarEventInput): Promise<CalendarEvent> {
    const id = `gcal-mock-${crypto.randomUUID().slice(0, 8)}`;
    const event: CalendarEvent = { ...input, id };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, input: CalendarEventInput): Promise<CalendarEvent> {
    const event: CalendarEvent = { ...input, id };
    this.events.set(id, event);
    return event;
  }

  async deleteEvent(id: string): Promise<void> {
    this.events.delete(id);
  }
}

export class GoogleCalendarProvider implements CalendarProvider {
  private calendarId: string;
  private accessToken?: string;

  constructor(calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary', accessToken = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN) {
    this.calendarId = calendarId;
    this.accessToken = accessToken;
  }

  async getBusyIntervals(range: CalendarInterval): Promise<CalendarInterval[]> {
    if (!this.accessToken) {
      // In development or when credentials not configured, delegate to fallback
      return [];
    }

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: range.start.toISOString(),
          timeMax: range.end.toISOString(),
          timeZone: 'America/Mexico_City',
          items: [{ id: this.calendarId }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.statusText}`);
      }

      const data = await response.json();
      const busyList = data.calendars?.[this.calendarId]?.busy || [];
      return busyList.map((item: { start: string; end: string }) => ({
        start: new Date(item.start),
        end: new Date(item.end),
      }));
    } catch (error) {
      console.warn('Google Calendar free/busy check failed:', error);
      return [];
    }
  }

  async createEvent(input: CalendarEventInput): Promise<CalendarEvent> {
    if (!this.accessToken) {
      // Return synthetic ID if Google Calendar credentials not provided yet
      return { ...input, id: `gcal-dev-${Date.now()}` };
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: input.summary,
          description: input.description,
          start: { dateTime: input.start.toISOString(), timeZone: input.timezone },
          end: { dateTime: input.end.toISOString(), timeZone: input.timezone },
          attendees: input.attendeeEmail ? [{ email: input.attendeeEmail }] : undefined,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to create Google Calendar event: ${response.statusText}`);
    }

    const data = await response.json();
    return { ...input, id: data.id };
  }

  async updateEvent(id: string, input: CalendarEventInput): Promise<CalendarEvent> {
    if (!this.accessToken) {
      return { ...input, id };
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: input.summary,
          description: input.description,
          start: { dateTime: input.start.toISOString(), timeZone: input.timezone },
          end: { dateTime: input.end.toISOString(), timeZone: input.timezone },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update Google Calendar event: ${response.statusText}`);
    }

    const data = await response.json();
    return { ...input, id: data.id };
  }

  async deleteEvent(id: string): Promise<void> {
    if (!this.accessToken) {
      return;
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete Google Calendar event: ${response.statusText}`);
    }
  }
}
