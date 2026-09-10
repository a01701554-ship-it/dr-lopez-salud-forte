import { MEDICAL_CONTACT_CONFIG } from './config';
import { DEFAULT_PRICING_CONFIG, formatProfessionalFee } from '@/config/pricing';

export interface KnowledgeItem {
  id: string;
  topic: string;
  keywords: string[];
  answer: string;
  priority?: number;
}

export const MEDICAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'doctor-identity',
    topic: 'Identidad y Cédula del Doctor',
    keywords: ['quien es', 'cedula', 'estudios', 'doctor', 'mauricio', 'especialidad', 'titulo', 'universidad', 'formacion', 'trayectoria', 'escuela', 'tec de monterrey', 'itesm'],
    answer: `El ${MEDICAL_CONTACT_CONFIG.doctor.name} es ${MEDICAL_CONTACT_CONFIG.doctor.title} egresado de la Escuela de Medicina y Ciencias de la Salud del ${MEDICAL_CONTACT_CONFIG.doctor.university}, con Cédula Profesional Federal número ${MEDICAL_CONTACT_CONFIG.doctor.license}. Su enfoque clínico integra diagnóstico riguroso, medicina preventiva y explicación comprensible para el paciente.`,
    priority: 10,
  },
  {
    id: 'modalities',
    topic: 'Modalidades de Consulta',
    keywords: ['modalidad', 'online', 'presencial', 'en linea', 'zoom', 'virtual', 'videollamada', 'distancia', 'remota'],
    answer: `Disponemos de dos modalidades de consulta:\n• Presencial: en consultorio médico en Querétaro, Qro.\n• En línea (Telemedicina): videollamada cifrada y segura para pacientes en cualquier parte de México o el extranjero.\nAmbas modalidades cuentan con atención médica individualizada y tiempo suficiente para una valoración completa.`,
    priority: 9,
  },
  {
    id: 'consultation-duration',
    topic: 'Duración de la consulta',
    keywords: ['cuanto dura', 'duracion', 'tiempo', 'minutos', 'tarda'],
    answer: `La primera consulta tiene una duración de ${DEFAULT_PRICING_CONFIG.firstVisit.duration} (${DEFAULT_PRICING_CONFIG.firstVisit.durationMinutes} minutos dedicados exclusivamente a escuchar su motivo de consulta, revisar antecedentes, examinar estudios clínicos y construir un plan de salud detallado). Las consultas de seguimiento tienen una duración aproximada de ${DEFAULT_PRICING_CONFIG.followUp.duration}.`,
    priority: 8,
  },
  {
    id: 'pricing',
    topic: 'Costos y Honorarios',
    keywords: ['precio', 'costo', 'cuanto cuesta', 'honorarios', 'tarifa', 'cuanto cobra', 'valoracion'],
    answer: `Los honorarios médicos profesionales son transparentes y éticos:\n• Primera Consulta Médica: ${formatProfessionalFee(DEFAULT_PRICING_CONFIG.firstVisit.price, DEFAULT_PRICING_CONFIG.firstVisit.currency)} (${DEFAULT_PRICING_CONFIG.firstVisit.duration})\n• Consulta de Seguimiento: ${formatProfessionalFee(DEFAULT_PRICING_CONFIG.followUp.price, DEFAULT_PRICING_CONFIG.followUp.currency)} (${DEFAULT_PRICING_CONFIG.followUp.duration})\n• Consulta en Línea: ${formatProfessionalFee(DEFAULT_PRICING_CONFIG.online.price, DEFAULT_PRICING_CONFIG.online.currency)} (${DEFAULT_PRICING_CONFIG.online.duration})\n• Consulta a Domicilio: ${formatProfessionalFee(DEFAULT_PRICING_CONFIG.homeVisit.price, DEFAULT_PRICING_CONFIG.homeVisit.currency, true)} (sujeta a verificación de zona).\nPuede agendar directamente desde la sección de horarios.`,
    priority: 9,
  },
  {
    id: 'payment-methods',
    topic: 'Formas de pago y facturación',
    keywords: ['pago', 'factura', 'facturan', 'transferencia', 'tarjeta', 'spei', 'efectivo', 'cfdi', 'recibo'],
    answer: `Aceptamos ${DEFAULT_PRICING_CONFIG.paymentMethods.join(', ')}. Si requiere factura fiscal (CFDI), se emite con gusto con todos los requisitos oficiales y cédula profesional del Dr. Galindo.`,
    priority: 8,
  },
  {
    id: 'location',
    topic: 'Ubicación del Consultorio',
    keywords: ['donde esta', 'ubicacion', 'direccion', 'consultorio', 'ciudad', 'queretaro', 'donde atiende', 'donde queda'],
    answer: `El consultorio presencial del Dr. Mauricio Galindo se encuentra en la ciudad de Santiago de Querétaro, Qro., México. Para pacientes fuera de la ciudad o del país, se atiende mediante consulta En Línea con la misma profundidad y validez clínica.`,
    priority: 8,
  },
  {
    id: 'schedule',
    topic: 'Horarios de Atención',
    keywords: ['horario', 'dias', 'atencion', 'cuando atiende', 'sabado', 'domingo', 'horas', 'abierto'],
    answer: `El horario de atención es de Lunes a Viernes de 09:00 a 18:00 hrs y Sábados de 09:00 a 13:00 hrs (hora del Centro de México GMT-6). Puede consultar los espacios libres en tiempo real pulsando en «Ver horarios» arriba.`,
    priority: 8,
  },
  {
    id: 'scope-of-care',
    topic: 'Motivos de consulta y alcance',
    keywords: ['que atiende', 'servicios', 'servicios medicos', 'tratamiento', 'segunda opinion', 'analisis', 'chequeo', 'checkup', 'estilo de vida', 'hipertension', 'diabetes', 'prevencion'],
    answer: `El Dr. Mauricio Galindo brinda atención médica general integral para adultos y jóvenes, incluyendo:\n• Diagnóstico y tratamiento de padecimientos agudos y crónicos comunes.\n• Interpretación detallada de estudios de laboratorio e imagen.\n• Segunda opinión médica fundamentada.\n• Optimización de salud metabólica, prevención y estilo de vida.\n• Orientación y canalización oportuna a subespecialidades cuando se amerite.`,
    priority: 7,
  },
  {
    id: 'preparation',
    topic: 'Preparación para la Consulta',
    keywords: ['que llevar', 'preparar', 'estudios', 'analisis', 'laboratorio', 'receta', 'como prepararme', 'documentos'],
    answer: `Para aprovechar al máximo sus 50 minutos de consulta le sugerimos:\n1. Lista de medicamentos y suplementos actuales (nombre y dosis).\n2. Estudios recientes de laboratorio, radiografías o análisis previos.\n3. Anotar sus dudas principales o la cronología de sus síntomas.`,
    priority: 7,
  },
  {
    id: 'prescriptions',
    topic: 'Recetas y tratamientos médicos',
    keywords: ['receta', 'prescripcion', 'medicamentos', 'medicinas', 'recetar', 'farmacia'],
    answer: `En caso de ser médicamente necesario tras su valoración clínica, el Dr. Mauricio Galindo emite receta médica oficial con Cédula Profesional, firma digital válida para farmacias autorizadas e instrucciones claras de dosificación.`,
    priority: 7,
  },
  {
    id: 'podcast',
    topic: 'Podcast Salud Forte',
    keywords: ['podcast', 'salud forte', 'spotify', 'episodios', 'escuchar', 'programa'],
    answer: `«Salud Forte» es el podcast oficial de divulgación científica del Dr. Mauricio Galindo, disponible en Spotify. En él se abordan temas de fisiología, medicina preventiva, nutrición basada en evidencia y hábitos para el bienestar diario sin tecnicismos innecesarios.`,
    priority: 6,
  },
  {
    id: 'cancellation',
    topic: 'Política de Cancelación y Reprogramación',
    keywords: ['cancelar', 'mover', 'reprogramar', 'politica', 'tiempo', 'aviso', 'con cuanto tiempo'],
    answer: `Le solicitamos notificar con al menos ${MEDICAL_CONTACT_CONFIG.consultation.cancellationNoticeHours} horas de anticipación en caso de requerir reprogramar o cancelar su cita, para permitir que otro paciente pueda aprovechar ese espacio. Puede hacerlo directamente aquí en el chat indicándomelo.`,
    priority: 7,
  },
  {
    id: 'emergency-warning',
    topic: 'Atención de Urgencias',
    keywords: ['urgencia', 'emergencia', 'infarto', 'pecho', 'dolor agudo', 'falta de aire', 'desmayo', 'ambulancia', '911', 'hemorragia', 'accidente'],
    answer: MEDICAL_CONTACT_CONFIG.assistant.emergencyWarning,
    priority: 20,
  },
];

export function findKnowledgeMatch(query: string): string | null {
  const normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Score matches to pick the most accurate answer
  let bestMatch: { item: KnowledgeItem; score: number } | null = null;

  for (const item of MEDICAL_KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of item.keywords) {
      const normKeyword = keyword
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (normalized === normKeyword) {
        score += 15;
      } else if (normalized.includes(normKeyword)) {
        score += normKeyword.length > 4 ? 6 : 3;
      }
    }

    if (score > 0) {
      const totalScore = score + (item.priority || 0);
      if (!bestMatch || totalScore > bestMatch.score) {
        bestMatch = { item, score: totalScore };
      }
    }
  }

  return bestMatch ? bestMatch.item.answer : null;
}
