import { Calendar, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/site/container';
import { DoctorBookingPhoto } from '@/components/booking/doctor-booking-photo';
import { BookingEngine } from '@/components/booking/booking-engine';
import { siteConfig } from '@/config/site';

export default function BookingPage() {
  return (
    <main id="contenido-principal" className="bg-ivory min-h-screen py-10 sm:py-16">
      <Container className="max-w-6xl">
        <header className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-stone bg-white px-3.5 py-1 text-[11px] font-semibold text-obsidian/80 mb-3 shadow-2xs">
            <Calendar className="size-3.5 text-sage" />
            <span>Sistema oficial de reserva en tiempo real</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-obsidian tracking-tight">
            Reserva de Consulta Médica
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-obsidian/70 leading-relaxed">
            Una experiencia directa, ágil y transparente para programar tu valoración con el{' '}
            <strong className="text-obsidian font-semibold">{siteConfig.doctorName}</strong>. Sin llamadas ni tiempos de espera manuales.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-stone/80 bg-white p-6 shadow-xs space-y-5">
              <DoctorBookingPhoto variant="card" className="mx-auto" />
              <div className="border-b border-stone/50 pb-4 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage block">
                  Médico Cirujano
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-obsidian mt-0.5">
                  {siteConfig.doctorName}
                </h2>
                <p className="text-xs text-obsidian/70 mt-1 font-medium">
                  Médico General egresado del {siteConfig.university}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded bg-stone/[0.25] px-2.5 py-1 text-xs text-obsidian">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-obsidian/60">
                    Cédula:
                  </span>
                  <span className="font-mono font-semibold">{siteConfig.professionalLicense}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-obsidian/75">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-sage shrink-0 mt-0.5" />
                  <span>
                    <strong>Atención individualizada:</strong> Tiempo suficiente para escuchar y evaluar sin prisas.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-sage shrink-0 mt-0.5" />
                  <span>
                    <strong>Sincronización directa:</strong> Confirmación al instante ligada a Google Calendar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-sage shrink-0 mt-0.5" />
                  <span>
                    <strong>Aviso inmediato:</strong> Recibirás confirmación y recordatorio en tu WhatsApp.
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-stone/[0.18] p-3 text-[11px] text-obsidian/65 leading-relaxed">
                <strong className="text-obsidian block mb-0.5">Nota importante:</strong> Esta consulta está diseñada para valoración clínica programada y medicina preventiva. En caso de una urgencia médica vital, acuda de inmediato a un centro hospitalario de emergencias.
              </div>
            </div>
          </aside>

          <section className="lg:col-span-8">
            <BookingEngine />
          </section>
        </div>
      </Container>
    </main>
  );
}
