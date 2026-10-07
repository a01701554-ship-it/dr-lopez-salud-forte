const MASTERCLASS_VARIANTS: Record<string, string> = {
  'dormir-mejor-energia-enfoque-y-rendimiento': '60089447121182',
  'menopausia-con-claridad': '60089447252254',
  'menopausia-sin-miedo-entender-cambios-y-opciones': '60089447252254',
  'estres-y-tension-muscular': '60089447285022',
  'estres-y-tension-muscular-entender-tu-cuerpo-y-crear-una-rutina-de-alivio-seguro': '60089447285022',
  'salud-hormonal-masculina': '60089447317790',
  'hormonas-masculinas-cambios-sintomas-y-cuando-consultar': '60089447317790',
  'sindrome-ovario-poliquistico': '60089447350558',
  'sindrome-de-ovario-poliquistico-entender-diagnostico-y-opciones': '60089447350558',
};

const STORE_URL = 'https://saludfortedrgalindo.com';

export function getMasterclassCartUrl(slug: string): string | null {
  const variantId = MASTERCLASS_VARIANTS[slug];
  return variantId ? `${STORE_URL}/cart/${variantId}:1` : null;
}
