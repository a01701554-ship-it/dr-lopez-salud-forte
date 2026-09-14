/**
 * ============================================================================
 * FUENTE ÚNICA DE INFORMACIÓN DEL INSTRUCTOR OFICIAL
 * Dr. Mauricio Benjamín Galindo López · Academia Salud Forte
 * ============================================================================
 */

export interface InstructorProfile {
  name: string;
  credentials: string;
  professionalLicense: string;
  institution: string;
  shortBio: string;
  profileImage: string;
  profileImageOriginal: string;
  profileImageAlt: string;
  profileImagePosition: string;
  profileImageWidth: number;
  profileImageHeight: number;
  initials: string;
}

export const OFFICIAL_INSTRUCTOR: InstructorProfile = {
  name: 'Dr. Mauricio Benjamín Galindo López',
  credentials: 'Médico Cirujano (ITESM)',
  professionalLicense: 'Cédula Profesional 15851723',
  institution: 'Tecnológico de Monterrey · Creador de Salud Forte',
  shortBio:
    'Médico Cirujano graduado del Tecnológico de Monterrey y creador del podcast médico Salud Forte. Comprometido con la divulgación médica rigurosa, la medicina preventiva y la autonomía informada del paciente.',
  profileImage: '/images/doctor/official/mauricio-instructor-user-provided-2026.webp',
  profileImageOriginal: '/images/doctor/official/mauricio-instructor-user-provided-2026.png',
  profileImageAlt: 'Retrato del Dr. Mauricio Benjamín Galindo López',
  profileImagePosition: 'center 20%',
  profileImageWidth: 1254,
  profileImageHeight: 1254,
  initials: 'MBGL',
};
