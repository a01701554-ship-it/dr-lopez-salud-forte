import { MockCalendarProvider, GoogleCalendarProvider, CalendarProvider } from '../calendar/provider';
import { MockWhatsAppProvider, MetaWhatsAppCloudProvider, WhatsAppProvider } from '../messaging/provider';
import { AppointmentService } from './appointment-service';
import { AvailabilityService } from './availability-service';
import { NotificationService } from './notification-service';
import { ConversationOrchestrator } from './orchestrator';

const runtimeEnv: Record<string, string | undefined> =
  typeof process !== 'undefined' ? process.env : {};

// Initialize providers based on available environment variables
const calendarProvider: CalendarProvider =
  runtimeEnv.GOOGLE_CALENDAR_ACCESS_TOKEN || runtimeEnv.GOOGLE_CALENDAR_ID
    ? new GoogleCalendarProvider()
    : new MockCalendarProvider();

const whatsappProvider: WhatsAppProvider =
  runtimeEnv.WHATSAPP_CLOUD_ACCESS_TOKEN && runtimeEnv.WHATSAPP_PHONE_NUMBER_ID
    ? new MetaWhatsAppCloudProvider()
    : new MockWhatsAppProvider();

export const appointmentService = new AppointmentService(calendarProvider);
export const availabilityService = new AvailabilityService(calendarProvider);
export const notificationService = new NotificationService(whatsappProvider);
export const conversationOrchestrator = new ConversationOrchestrator(
  appointmentService,
  availabilityService,
  notificationService,
);

export * from './types';
export * from './config';
export * from './knowledge-base';
