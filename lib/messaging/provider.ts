/**
 * WhatsApp Delivery & Messaging Providers
 * Supports Meta WhatsApp Cloud API with strict configuration verification,
 * E.164 phone normalization, recipient verification, and delivery logging.
 */

import { normalizeWhatsAppNumber } from './phone-utils';

export type AppointmentMessage = {
  recipient: string;
  patientFirstName: string;
  appointmentDate: string;
  appointmentTime: string;
  secureBookingUrl?: string;
  notes?: string;
};

export type MessageDeliveryStatus = 'SENT' | 'DELIVERED' | 'FAILED' | 'NOT_CONFIGURED';

export type MessageReceipt = {
  providerMessageId: string;
  acceptedAt: Date;
  recipient: string;
  status: MessageDeliveryStatus;
  bodyPreview: string;
  error?: string;
};

export interface WhatsAppProvider {
  sendMessage(to: string, text: string): Promise<MessageReceipt>;
  sendConfirmation(message: AppointmentMessage): Promise<MessageReceipt>;
  sendReminder(message: AppointmentMessage): Promise<MessageReceipt>;
  getSentLogs?(): MessageReceipt[];
  isConfigured(): boolean;
}

export class MetaWhatsAppCloudProvider implements WhatsAppProvider {
  private phoneNumberId?: string;
  private accessToken?: string;

  constructor(
    phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN,
  ) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  isConfigured(): boolean {
    return Boolean(this.accessToken && this.phoneNumberId);
  }

  async sendMessage(to: string, text: string): Promise<MessageReceipt> {
    const normalizedTo = normalizeWhatsAppNumber(to);

    // If Meta API credentials are not set in environment, safely record status as NOT_CONFIGURED without throwing unhandled exceptions
    if (!this.accessToken || !this.phoneNumberId) {
      const devReceipt: MessageReceipt = {
        providerMessageId: `unconfigured-${Date.now()}`,
        acceptedAt: new Date(),
        recipient: normalizedTo,
        status: 'NOT_CONFIGURED',
        bodyPreview: text.slice(0, 100),
        error: 'WhatsApp Cloud API no configurado (WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_CLOUD_ACCESS_TOKEN ausente)',
      };
      return devReceipt;
    }

    const cleanDigits = normalizedTo.replace(/[^0-9]/g, '');
    const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanDigits,
          type: 'text',
          text: { preview_url: false, body: text },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        return {
          providerMessageId: `failed-${Date.now()}`,
          acceptedAt: new Date(),
          recipient: normalizedTo,
          status: 'FAILED',
          bodyPreview: text.slice(0, 100),
          error: errMsg,
        };
      }

      const data = await res.json();
      const messageId = data.messages?.[0]?.id || `meta-${Date.now()}`;

      return {
        providerMessageId: messageId,
        acceptedAt: new Date(),
        recipient: normalizedTo,
        status: 'SENT',
        bodyPreview: text.slice(0, 100),
      };
    } catch (networkErr: any) {
      return {
        providerMessageId: `error-${Date.now()}`,
        acceptedAt: new Date(),
        recipient: normalizedTo,
        status: 'FAILED',
        bodyPreview: text.slice(0, 100),
        error: networkErr?.message || 'Error de red con Meta Cloud API',
      };
    }
  }

  async sendConfirmation(message: AppointmentMessage): Promise<MessageReceipt> {
    const body = `Estimado(a) ${message.patientFirstName}, su consulta médica con el Dr. Mauricio Benjamín Galindo López ha sido confirmada para el día ${message.appointmentDate} a las ${message.appointmentTime} h.`;
    return this.sendMessage(message.recipient, body);
  }

  async sendReminder(message: AppointmentMessage): Promise<MessageReceipt> {
    const body = `Recordatorio médico: Estimado(a) ${message.patientFirstName}, le recordamos su consulta médica con el Dr. Mauricio Benjamín Galindo López hoy a las ${message.appointmentTime} h (${message.appointmentDate}).`;
    return this.sendMessage(message.recipient, body);
  }
}

export class MockWhatsAppProvider implements WhatsAppProvider {
  private sentLogs: MessageReceipt[] = [];

  isConfigured(): boolean {
    return true;
  }

  async sendMessage(to: string, text: string): Promise<MessageReceipt> {
    const normalizedTo = normalizeWhatsAppNumber(to);
    const receipt: MessageReceipt = {
      providerMessageId: `mock-msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      acceptedAt: new Date(),
      recipient: normalizedTo,
      status: 'DELIVERED',
      bodyPreview: text.slice(0, 100),
    };
    this.sentLogs.unshift(receipt);
    return receipt;
  }

  async sendConfirmation(message: AppointmentMessage): Promise<MessageReceipt> {
    const body = `Hola ${message.patientFirstName}, su consulta médica ha sido confirmada para el ${message.appointmentDate} a las ${message.appointmentTime}.`;
    return this.sendMessage(message.recipient, body);
  }

  async sendReminder(message: AppointmentMessage): Promise<MessageReceipt> {
    const body = `Recordatorio para ${message.patientFirstName}: su consulta médica es hoy a las ${message.appointmentTime}.`;
    return this.sendMessage(message.recipient, body);
  }

  getSentLogs(): MessageReceipt[] {
    return [...this.sentLogs];
  }
}
