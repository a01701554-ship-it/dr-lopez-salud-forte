export type ClinicLocationId = 'jilotepec' | 'queretaro' | 'telemedicina';

export interface ClinicLocation {
  id: ClinicLocationId;
  name: string;
  shortName: string;
  city: string;
  address: string | null;
  googleMapsUrl?: string;
  isOnline: boolean;
  onlineInstructions?: string;
}

export const CLINIC_LOCATIONS: Record<ClinicLocationId, ClinicLocation> = {
  jilotepec: {
    id: 'jilotepec',
    name: 'Consultorio Jilotepec',
    shortName: 'Jilotepec',
    city: 'Jilotepec, Estado de México',
    address: 'Calle Benito Juárez 108, Jilotepec Centro, Estado de México, México',
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Calle Benito Juárez 108, Jilotepec Centro, Estado de México, México')}`,
    isOnline: false,
  },
  queretaro: {
    id: 'queretaro',
    name: 'Consultorio Querétaro',
    shortName: 'Querétaro',
    city: 'Santiago de Querétaro, Qro.',
    address: 'San Simón 142, Col. San Francisco Juriquilla, C.P. 76230, Querétaro, Qro., México',
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('San Simón 142, Col. San Francisco Juriquilla, C.P. 76230, Querétaro, Qro., México')}`,
    isOnline: false,
  },
  telemedicina: {
    id: 'telemedicina',
    name: 'Telemedicina',
    shortName: 'En línea',
    city: 'En línea',
    address: null,
    isOnline: true,
    onlineInstructions: 'La consulta se realizará en línea. Recibirás las instrucciones de acceso en la confirmación de tu cita.',
  },
};

export const CLINIC_LOCATION_OPTIONS = [
  {
    id: 'jilotepec' as ClinicLocationId,
    value: 'jilotepec',
    label: 'Presencial — Jilotepec',
    location: CLINIC_LOCATIONS.jilotepec,
  },
  {
    id: 'queretaro' as ClinicLocationId,
    value: 'queretaro',
    label: 'Presencial — Querétaro',
    location: CLINIC_LOCATIONS.queretaro,
  },
  {
    id: 'telemedicina' as ClinicLocationId,
    value: 'telemedicina',
    label: 'En línea — Telemedicina',
    location: CLINIC_LOCATIONS.telemedicina,
  },
];

export function getClinicLocation(idOrString?: string | null): ClinicLocation {
  if (!idOrString) return CLINIC_LOCATIONS.queretaro;
  const norm = idOrString.toLowerCase().trim();
  if (norm.includes('jilotepec')) return CLINIC_LOCATIONS.jilotepec;
  if (norm.includes('queretaro') || norm.includes('querétaro')) return CLINIC_LOCATIONS.queretaro;
  if (norm.includes('linea') || norm.includes('línea') || norm.includes('telemedicina') || norm.includes('online')) {
    return CLINIC_LOCATIONS.telemedicina;
  }
  return CLINIC_LOCATIONS.queretaro;
}

export function getLocationLabel(locationId: ClinicLocationId): string {
  switch (locationId) {
    case 'jilotepec':
      return 'Presencial — Jilotepec';
    case 'queretaro':
      return 'Presencial — Querétaro';
    case 'telemedicina':
      return 'En línea — Telemedicina';
  }
}
