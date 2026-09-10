/**
 * Local & Cloud Appointments Repository
 * Handles persistent storage of appointments, idempotency, holds, and Google Calendar sync
 */

import { AppointmentRecord } from './types';

const APPOINTMENTS_STORAGE_KEY = 'dr_mauricio_appointments_store_v1';
const TEMPORARY_HOLDS_KEY = 'dr_mauricio_booking_holds_v1';

export interface TemporaryHold {
  slotIso: string;
  expiresAt: number; // timestamp ms
  holdId: string;
}

export class AppointmentsRepository {
  static getAll(): AppointmentRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Error reading appointments store:', e);
      return [];
    }
  }

  static getByPublicId(publicId: string): AppointmentRecord | null {
    const list = this.getAll();
    return list.find((item) => item.publicId.toLowerCase() === publicId.toLowerCase()) || null;
  }

  static getByToken(token: string): AppointmentRecord | null {
    const list = this.getAll();
    return list.find((item) => item.token === token) || null;
  }

  static save(record: AppointmentRecord): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getAll();
      const existingIdx = list.findIndex((a) => a.id === record.id || a.publicId === record.publicId);
      if (existingIdx >= 0) {
        list[existingIdx] = record;
      } else {
        list.push(record);
      }
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save appointment to repository:', e);
    }
  }

  static cancel(publicId: string, reason?: string): AppointmentRecord | null {
    const record = this.getByPublicId(publicId);
    if (!record) return null;
    record.status = 'cancelled';
    record.cancellationReason = reason;
    record.reminder2hStatus = 'CANCELLED';
    this.save(record);
    return record;
  }

  static reschedule(
    publicId: string,
    newSlotIso: string,
    newDateFormatted: string,
    newTimeFormatted: string,
  ): AppointmentRecord | null {
    const record = this.getByPublicId(publicId);
    if (!record) return null;
    record.status = 'rescheduled';
    record.slotIso = newSlotIso;
    record.dateFormatted = newDateFormatted;
    record.timeFormatted = newTimeFormatted;

    // Recalculate 2h reminder
    const apptTime = new Date(newSlotIso).getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    const reminderTime = new Date(apptTime - twoHoursMs);
    if (reminderTime.getTime() > Date.now()) {
      record.reminder2hScheduledFor = reminderTime.toISOString();
      record.reminder2hStatus = 'SCHEDULED';
      record.reminder2hAttemptCount = 0;
    } else {
      record.reminder2hStatus = 'NOT_SCHEDULED';
      record.reminder2hScheduledFor = undefined;
    }

    this.save(record);
    return record;
  }

  // Temporary holds to avoid race conditions (hold slot for 5 minutes while user completes checkout)
  static acquireHold(slotIso: string, durationMinutes = 5): { success: boolean; holdId?: string } {
    if (typeof window === 'undefined') return { success: true };
    try {
      this.cleanupHolds();
      const raw = localStorage.getItem(TEMPORARY_HOLDS_KEY);
      const holds: TemporaryHold[] = raw ? JSON.parse(raw) : [];
      const now = Date.now();

      const existing = holds.find((h) => h.slotIso === slotIso && h.expiresAt > now);
      if (existing) {
        return { success: false };
      }

      const holdId = `hold-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      holds.push({
        slotIso,
        expiresAt: now + durationMinutes * 60 * 1000,
        holdId,
      });

      localStorage.setItem(TEMPORARY_HOLDS_KEY, JSON.stringify(holds));
      return { success: true, holdId };
    } catch (e) {
      return { success: true };
    }
  }

  static isSlotHeld(slotIso: string, currentHoldId?: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(TEMPORARY_HOLDS_KEY);
      if (!raw) return false;
      const holds: TemporaryHold[] = JSON.parse(raw);
      const now = Date.now();
      return holds.some(
        (h) => h.slotIso === slotIso && h.expiresAt > now && (!currentHoldId || h.holdId !== currentHoldId),
      );
    } catch (e) {
      return false;
    }
  }

  static releaseHold(holdId?: string): void {
    if (typeof window === 'undefined' || !holdId) return;
    try {
      const raw = localStorage.getItem(TEMPORARY_HOLDS_KEY);
      if (!raw) return;
      const holds: TemporaryHold[] = JSON.parse(raw);
      const filtered = holds.filter((h) => h.holdId !== holdId);
      localStorage.setItem(TEMPORARY_HOLDS_KEY, JSON.stringify(filtered));
    } catch (e) {
      // ignore
    }
  }

  private static cleanupHolds(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(TEMPORARY_HOLDS_KEY);
      if (!raw) return;
      const holds: TemporaryHold[] = JSON.parse(raw);
      const now = Date.now();
      const valid = holds.filter((h) => h.expiresAt > now);
      localStorage.setItem(TEMPORARY_HOLDS_KEY, JSON.stringify(valid));
    } catch (e) {
      // ignore
    }
  }
}
