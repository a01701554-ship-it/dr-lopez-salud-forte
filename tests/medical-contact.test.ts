import { MockCalendarProvider } from '../lib/calendar/provider';
import { MockWhatsAppProvider } from '../lib/messaging/provider';
import { AppointmentService } from '../lib/medical-contact/appointment-service';
import { AvailabilityService } from '../lib/medical-contact/availability-service';
import { NotificationService } from '../lib/medical-contact/notification-service';
import { ConversationOrchestrator } from '../lib/medical-contact/orchestrator';
import { MEDICAL_CONTACT_CONFIG } from '../lib/medical-contact/config';

export async function runMedicalContactTests(): Promise<{ passed: boolean; report: string[] }> {
  const report: string[] = [];
  let passed = true;

  function assert(condition: boolean, description: string) {
    if (condition) {
      report.push(`✅ PASS: ${description}`);
    } else {
      report.push(`❌ FAIL: ${description}`);
      passed = false;
    }
  }

  // Test 1: Config sanity check
  assert(
    MEDICAL_CONTACT_CONFIG.whatsapp.doctorNotificationNumber === '+524421275952',
    'Doctor notification number is strictly +524421275952',
  );
  assert(
    MEDICAL_CONTACT_CONFIG.doctor.license === '15851723',
    'Doctor medical license is 15851723',
  );
  assert(
    MEDICAL_CONTACT_CONFIG.doctor.name.includes('Benjamín'),
    'Doctor name contains correct accent on Benjamín',
  );

  // Setup services
  const mockCalendar = new MockCalendarProvider();
  const mockWhatsApp = new MockWhatsAppProvider();
  const apptService = new AppointmentService(mockCalendar);
  const availService = new AvailabilityService(mockCalendar);
  const notifService = new NotificationService(mockWhatsApp);
  const orchestrator = new ConversationOrchestrator(apptService, availService, notifService);

  // Test 2: Intent detection
  assert(
    orchestrator.detectIntent('Hola doctor') === 'GREETING',
    'Detects GREETING intent',
  );
  assert(
    orchestrator.detectIntent('Quisiera agendar una cita médica') === 'BOOK_APPOINTMENT',
    'Detects BOOK_APPOINTMENT intent',
  );
  assert(
    orchestrator.detectIntent('Tengo un dolor muy fuerte en el pecho y me falta el aire') === 'POSSIBLE_EMERGENCY',
    'Detects POSSIBLE_EMERGENCY triage intent',
  );
  assert(
    orchestrator.detectIntent('Quiero hablar con una persona') === 'HUMAN_SUPPORT',
    'Detects HUMAN_SUPPORT intent',
  );
  assert(
    orchestrator.detectIntent('Deseo cancelar mi cita de mañana') === 'CANCEL_APPOINTMENT',
    'Detects CANCEL_APPOINTMENT intent',
  );
  assert(
    orchestrator.detectIntent('Quiero mover mi cita para otro día') === 'RESCHEDULE_APPOINTMENT',
    'Detects RESCHEDULE_APPOINTMENT intent',
  );

  // Test 3: Emergency response and doctor alert
  const emergencyReply = await orchestrator.handleIncomingMessage(
    'sess-emerg',
    '+525599887766',
    'Tengo dolor en el pecho severo',
  );
  assert(
    emergencyReply.includes('911') || emergencyReply.includes('urgencias'),
    'Emergency response instructs patient to dial 911 or visit emergency room',
  );
  const alerts = notifService.getAlertsLog();
  assert(
    alerts.some((a) => a.eventType === 'MEDICAL_EMERGENCY_DETECTED'),
    'Emergency triggers critical alert to doctor',
  );

  // Test 4: Availability generation
  const slots = await availService.getAvailableSlots({ daysAhead: 7 });
  assert(slots.length > 0, 'Generates available candidate slots based on schedule');

  // Test 5: Atomic booking flow
  if (slots.length > 0) {
    const candidateSlot = slots[0];
    const confirmed = await apptService.confirmAppointment({
      patient: { fullName: 'Carlos Fuentes', phone: '+525544332211' },
      slot: candidateSlot,
      idempotencyKey: 'test-key-1',
    });

    assert(confirmed.status === 'CONFIRMED', 'Appointment status is CONFIRMED');
    assert(!!confirmed.calendarEventId, 'Appointment has a valid Google Calendar Event ID');

    // Notify doctor
    const alert = await notifService.notifyDoctorNewAppointment(confirmed);
    assert(alert.status === 'SENT', 'Doctor alert for new appointment was sent');
    assert(
      alert.details.includes('Carlos Fuentes') && alert.details.includes('+525544332211'),
      'Doctor alert contains patient name and phone',
    );

    // Double-booking check
    let threwConflict = false;
    try {
      await apptService.confirmAppointment({
        patient: { fullName: 'Otro Paciente', phone: '+525511223344' },
        slot: candidateSlot,
        idempotencyKey: 'test-key-2',
      });
    } catch {
      threwConflict = true;
    }
    assert(threwConflict, 'Prevents double-booking same slot');
  }

  return { passed, report };
}
