export type CommerceModel =
  | 'direct_shopify'
  | 'merchant_inventory'
  | 'third_party_fulfillment'
  | 'affiliate_external'
  | 'unconfigured';

export type ProductStatus = 'draft' | 'active' | 'archived';

export type ComplianceStatus =
  | 'pending_review'
  | 'high_priority_review'
  | 'approved'
  | 'rejected'
  | 'requires_correction';

export interface Product {
  // Identidad
  id: string;
  shopifyProductGid: string;
  shopifyVariantGid: string;
  slug: string;
  status: ProductStatus;
  complianceStatus: ComplianceStatus;
  commerceModel: CommerceModel;
  title: string;
  subtitle: string;
  brand: string;
  manufacturer: string;
  distributor: string;
  importer: string;
  countryOfOrigin: string;
  productType: string;
  category: string;
  vendor: string;
  barcode: string;
  sku: string;

  // Presentación
  dosageForm: string; // Cápsulas, tabletas, polvo, etc.
  netContent: string; // 180g, 120 cápsulas, etc.
  unitCount: number;
  servingSize: string;
  servingsPerContainer: number;
  flavor: string;
  variantTitle: string;
  weight: number; // en kg (necesario para envíos de Shopify)
  dimensions: string; // "L x W x H en cm"

  // Composición
  ingredients: string;
  activeComponents: string;
  inactiveIngredients: string;
  allergens: string;
  nutritionFacts: string; // Formato JSON de la tabla nutricional si aplica
  supplementalFacts: string;
  caffeinePerServing: string; // ej. "48 mg"
  formulaSource: string;
  labelVerifiedAt?: string;
  labelVerifiedBy?: string;

  // Seguridad y uso
  manufacturerDirections: string;
  warnings: string;
  contraindications: string;
  interactions: string;
  ageRestrictions: string;
  pregnancyWarning: string;
  storageInstructions: string;
  tamperSealInformation: string;
  adverseEventContact: string;

  // Cumplimiento regulatorio
  regulatoryClassification: string; // ej: "Suplemento Alimenticio (COFEPRIS)"
  classificationDocument: string;
  advertisingPermitStatus: string;
  advertisingPermitReference: string;
  importDocumentationStatus: string;
  spanishLabelStatus: string;
  trademarkUseStatus: string;
  supplierVerified: boolean;
  authenticityVerified: boolean;
  claimReviewStatus: string;
  complianceApprovedAt?: string;
  complianceApprovedBy?: string;
  complianceNotes: string;

  // Comercio
  price: number;
  compareAtPrice: number | null;
  currency: string;
  taxable: boolean;
  inventoryTracked: boolean;
  inventoryQuantity: number;
  allowBackorder: boolean;
  shippingRequired: boolean;
  shippingProfile: string;
  fulfillmentService: string;
  returnEligibility: boolean;
  returnWindow: number; // en días
  purchaseLimit: number;

  // Trazabilidad
  lotNumber: string;
  expirationDate: string;
  receivedAt?: string;
  supplierBatchReference?: string;

  // Medios
  imageId?: string;
  featuredImage: string;
  galleryImages: string[];
  altText: string;
  imageApprovalStatus: string;
  imageRightsStatus: string;
  videoUrl?: string;
  labelFrontImage?: string;
  labelBackImage?: string;
  labelSideImages?: string[];
}

// Checklist de validación obligatoria antes de poder publicar
export interface ProductChecklist {
  isShopifyVariantValid: boolean;
  hasPrice: boolean;
  hasSku: boolean;
  hasStock: boolean;
  hasWeight: boolean;
  hasApprovedImage: boolean;
  hasVerifiedImageRights: boolean;
  hasVerifiedSupplier: boolean;
  hasVerifiedAuthenticity: boolean;
  hasCompleteFormula: boolean;
  hasWarnings: boolean;
  hasLotAndExpiration: boolean;
  hasRegulatoryClassification: boolean;
  hasSpanishLabel: boolean;
  hasApprovedClaims: boolean;
  hasReturnPolicy: boolean;
  hasCommerceModel: boolean;
  hasMelatoninSpecialReview: boolean; // Obligatorio y prioritario solo si el slug es de melatonina
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_mushroom_coffee',
    shopifyProductGid: 'gid://shopify/Product/1111111111',
    shopifyVariantGid: 'gid://shopify/ProductVariant/11111111111',
    slug: 'cafe-hongos-melena-leon-reishi-mct',
    status: 'draft',
    complianceStatus: 'pending_review',
    commerceModel: 'unconfigured',
    title: 'Café de hongos con melena de león, reishi y aceite MCT',
    subtitle: 'Bebida instantánea de café con extractos de hongos adaptógenos y lípidos de cadena media',
    brand: 'Mushroom Coffee',
    manufacturer: 'Pendiente de verificar',
    distributor: 'Pendiente de verificar',
    importer: 'Pendiente de verificar',
    countryOfOrigin: 'EUA (por confirmar)',
    productType: 'Suplemento Alimenticio',
    category: 'Nutrición Funcional',
    vendor: 'Mushroom Coffee Oficial',
    barcode: 'Pendiente',
    sku: 'MC-MUSH-180G-TEMP',
    dosageForm: 'Polvo soluble',
    netContent: '180 g',
    unitCount: 30,
    servingSize: '6 g (1 porción)',
    servingsPerContainer: 30,
    flavor: 'Original',
    variantTitle: 'Bolsa 180 gramos',
    weight: 0.18,
    dimensions: '14 x 6 x 22 cm',
    ingredients: 'Café instantáneo, extracto de hongo Melena de León (Hericium erinaceus), extracto de hongo Reishi (Ganoderma lucidum), triglicéridos de cadena media (aceite MCT) en polvo.',
    activeComponents: 'Polisacáridos de Ganoderma, hericenonas de Hericium, lípidos de MCT.',
    inactiveIngredients: 'Dióxido de silicio (como antiapelmazante).',
    allergens: 'Procesado en instalaciones que manejan nueces y soya. (Por verificar)',
    nutritionFacts: 'Por porción (6g): Energía: 20 kcal, Proteínas: 0.5g, Grasas Totales: 1.2g, Carbohidratos disponibles: 1.8g, Azúcares: 0g, Fibra: 0.8g, Sodio: 5mg.',
    supplementalFacts: 'Extracto de Melena de León: 500mg, Extracto de Reishi: 500mg, Polvo de Aceite MCT: 1000mg.',
    caffeinePerServing: '48 mg',
    formulaSource: 'Declaración visual en el empaque del fabricante.',
    manufacturerDirections: 'Mezclar una porción (6 g) en una taza de agua caliente (240 ml). Consumir una vez al día por la mañana.',
    warnings: 'No se recomienda para menores de 18 años ni personas sensibles a la cafeína. Si presenta taquicardia o insomnio suspenda su uso.',
    contraindications: 'No consumir con anticoagulantes ni antes de una cirugía sin supervisión médica. Evitar en personas con alergia conocida a los hongos.',
    interactions: 'Puede potenciar los efectos de estimulantes del sistema nervioso central o interactuar con medicamentos hipoglucemiantes.',
    ageRestrictions: 'Solo adultos (18+ años).',
    pregnancyWarning: 'No se use durante el embarazo ni la lactancia.',
    storageInstructions: 'Consérvese en un lugar seco y fresco, con el empaque perfectamente cerrado para evitar humedad.',
    tamperSealInformation: 'Bolsa con cierre resellable y sello de seguridad térmico superior intacto.',
    adverseEventContact: 'saludforte.mx/contacto',
    regulatoryClassification: 'Pendiente de clasificar en México (Sujeto a confirmación bajo COFEPRIS)',
    classificationDocument: 'Pendiente',
    advertisingPermitStatus: 'No tramitado',
    advertisingPermitReference: 'Ninguna',
    importDocumentationStatus: 'Pendiente de presentar pedimento de importación',
    spanishLabelStatus: 'Falta traducción y etiqueta complementaria oficial NOM-051 / Ley de Salud',
    trademarkUseStatus: 'Pendiente de verificar derechos de uso de marca y reventa',
    supplierVerified: false,
    authenticityVerified: false,
    claimReviewStatus: 'Revisión técnica pendiente. Queda estrictamente prohibido afirmar que cura o previene la fatiga crónica o enfermedades cognitivas.',
    complianceNotes: 'Se requiere la contraetiqueta física en español con leyendas obligatorias antes de cualquier comercialización.',
    price: 690,
    compareAtPrice: null,
    currency: 'MXN',
    taxable: true,
    inventoryTracked: true,
    inventoryQuantity: 0,
    allowBackorder: false,
    shippingRequired: true,
    shippingProfile: 'Suplementos Envío Regular',
    fulfillmentService: 'manual',
    returnEligibility: false,
    returnWindow: 0,
    purchaseLimit: 3,
    lotNumber: 'Pendiente de recepción física',
    expirationDate: 'Pendiente de recepción física',
    imageId: 'IMG-204-PRODUCTO-CAFE-HONGOS',
    featuredImage: '/images/products/mushroom_coffee.webp',
    galleryImages: [],
    altText: 'Bolsa negra y naranja de café de hongos con melena de león, reishi y aceite MCT. Vista frontal.',
    imageApprovalStatus: 'pending_review',
    imageRightsStatus: 'pending_authorization',
  },
  {
    id: 'prod_melatonin_max',
    shopifyProductGid: 'gid://shopify/Product/2222222222',
    shopifyVariantGid: 'gid://shopify/ProductVariant/22222222222',
    slug: 'melatonina-max-55mg-formula-por-verificar',
    status: 'draft',
    complianceStatus: 'high_priority_review',
    commerceModel: 'unconfigured',
    title: 'Melatonin Max 55 mg — presentación y fórmula por verificar',
    subtitle: 'Fórmula compleja de melatolina con minerales y vitaminas para el descanso nocturno',
    brand: 'Melatonin Max',
    manufacturer: 'Pendiente de verificar',
    distributor: 'Pendiente de verificar',
    importer: 'Pendiente de verificar',
    countryOfOrigin: 'EUA (por confirmar)',
    productType: 'Suplemento Alimenticio (Sujeto a revisión de dosis límite en México)',
    category: 'Sueño & Descanso',
    vendor: 'Pendiente de verificar',
    barcode: 'Pendiente',
    sku: 'MEL-MAX-55MG-TEMP',
    dosageForm: 'Cápsulas (por confirmar)',
    netContent: 'Por verificar',
    unitCount: 0,
    servingSize: 'Por verificar',
    servingsPerContainer: 0,
    flavor: 'Sin sabor',
    variantTitle: 'Frasco por verificar',
    weight: 0.15,
    dimensions: '6 x 6 x 11 cm',
    ingredients: 'Melatolina, Metilsulfonilmetano (MSM), Zinc, Vitamina D3, Vitamina B6. (Fórmula completa por verificar en laboratorio).',
    activeComponents: 'Melatonina.',
    inactiveIngredients: 'Pendiente de ficha técnica.',
    allergens: 'Pendiente de verificación.',
    nutritionFacts: 'Pendiente de etiqueta nutricional del fabricante.',
    supplementalFacts: 'Melatolina: Declarado 55 mg (Concentración extremadamente alta que requiere revisión toxicológica urgente), MSM, Zinc, Vitamina D3, Vitamina B6.',
    caffeinePerServing: '0 mg',
    formulaSource: 'Imagen preliminar de botella morada.',
    manufacturerDirections: 'Por verificar. No consumir sin prescripción o indicación médica explícita.',
    warnings: '¡ADVERTENCIA URGENTE! 55 mg de melatonina es una dosis atípica y potencialmente riesgosa para automedicación. Puede provocar somnolencia severa, mareos, náuseas, cambios de humor o hipotermia. No conduzca vehículos ni opere maquinaria bajo su uso.',
    contraindications: 'Contraindicado en menores de edad, mujeres embarazadas o lactando, personas con enfermedades autoinmunes, depresión clínica, epilepsia, o hipertensión no controlada.',
    interactions: 'Interactúa fuertemente con benzodiacepinas, antidepresivos, inmunosupresores, anticoagulantes y alcohol.',
    ageRestrictions: 'Estrictamente prohibido para menores de 18 años.',
    pregnancyWarning: '¡ESTRICTAMENTE CONTRAINDICADO!',
    storageInstructions: 'Manténgase bajo llave, fuera del alcance de los niños.',
    tamperSealInformation: 'Pendiente de verificar físicamente el sello de rosca hermético.',
    adverseEventContact: 'saludforte.mx/contacto',
    regulatoryClassification: 'Clasificación Crítica (La melatonina en dosis altas puede considerarse fármaco en México y requerir registro de medicamento ante COFEPRIS en vez de suplemento).',
    classificationDocument: 'Pendiente',
    advertisingPermitStatus: 'PROHIBIDA PUBLICIDAD sin registro sanitario válido',
    advertisingPermitReference: 'Ninguna',
    importDocumentationStatus: 'Sujeto a restricción aduanera de sustancias hormonales o psicotrópicas',
    spanishLabelStatus: 'Rechazado - Requiere revisión de un toxicólogo',
    trademarkUseStatus: 'Pendiente de verificación',
    supplierVerified: false,
    authenticityVerified: false,
    claimReviewStatus: 'Rechazado. Prohibido afirmar que "Regula la presión arterial", "Cura el insomnio", "Elimina el estrés" o "Es segura para todos".',
    complianceNotes: 'Bloqueo absoluto de venta en México hasta dictaminar si requiere receta médica o registro sanitario de medicamento por su dosis declarada de 55 mg.',
    price: 850,
    compareAtPrice: null,
    currency: 'MXN',
    taxable: true,
    inventoryTracked: true,
    inventoryQuantity: 0,
    allowBackorder: false,
    shippingRequired: true,
    shippingProfile: 'Medicamentos y Suplementos Especiales',
    fulfillmentService: 'manual',
    returnEligibility: false,
    returnWindow: 0,
    purchaseLimit: 1,
    lotNumber: 'No recibido',
    expirationDate: 'No recibido',
    imageId: 'IMG-202-PRODUCTO-MELATONINA',
    featuredImage: '/images/products/melatonin_max.webp',
    galleryImages: [],
    altText: 'Frasco morado de Melatonin Max 55 mg. Vista frontal provisional.',
    imageApprovalStatus: 'pending_review',
    imageRightsStatus: 'pending_authorization',
  },
  {
    id: 'prod_alxfresh_calcium',
    shopifyProductGid: 'gid://shopify/Product/3333333333',
    shopifyVariantGid: 'gid://shopify/ProductVariant/33333333333',
    slug: 'alxfresh-calcio-magnesio-zinc-vitamina-d3',
    status: 'draft',
    complianceStatus: 'pending_review',
    commerceModel: 'unconfigured',
    title: 'ALXFRESH Calcio, Magnesio y Zinc con Vitamina D3',
    subtitle: 'Complejo mineral esencial con vitamina D3 en cápsulas',
    brand: 'ALXFRESH',
    manufacturer: 'Pendiente de verificar',
    distributor: 'Pendiente de verificar',
    importer: 'Pendiente de verificar',
    countryOfOrigin: 'Por confirmar',
    productType: 'Suplemento Alimenticio',
    category: 'Minerales',
    vendor: 'ALXFRESH Distribuidor Autorizado',
    barcode: 'Pendiente',
    sku: 'ALX-CA-MG-ZN-60C',
    dosageForm: 'Cápsulas blandas',
    netContent: '60 cápsulas',
    unitCount: 60,
    servingSize: '2 Cápsulas',
    servingsPerContainer: 30,
    flavor: 'Sin sabor',
    variantTitle: 'Frasco de 60 cápsulas',
    weight: 0.12,
    dimensions: '5.5 x 5.5 x 10 cm',
    ingredients: 'Carbonato de calcio, citrato de calcio, óxido de magnesio, citrato de magnesio, óxido de zinc, gluconato de zinc, colecalciferol (vitamina D3).',
    activeComponents: 'Calcio elemental, Magnesio elemental, Zinc elemental, Vitamina D3.',
    inactiveIngredients: 'Celulosa microcristalina, estearato de magnesio, dióxido de silicio, gelatina (de la cápsula).',
    allergens: 'Contiene soya (por verificar en el reverso de la etiqueta).',
    nutritionFacts: 'Por porción (2 cápsulas): Calcio elemental: 1000 mg (100% IDR), Magnesio elemental: 400 mg (100% IDR), Zinc elemental: 25 mg (167% IDR), Vitamina D3: 600 UI (150% IDR).',
    supplementalFacts: 'Supplement Facts verificado a partir de la contraetiqueta adjunta.',
    caffeinePerServing: '0 mg',
    formulaSource: 'Imagen adjunta de Supplement Facts del producto.',
    manufacturerDirections: 'Tomar dos (2) cápsulas diariamente con un vaso de agua, de preferencia acompañando los alimentos.',
    warnings: 'No exceder la dosis recomendada. Su uso por tiempo prolongado debe ser monitoreado por un médico debido al riesgo de hipercalcemia o cálculos renales.',
    contraindications: 'Contraindicado en personas con hipercalcemia, insuficiencia renal severa o hipersensibilidad a los componentes de la fórmula.',
    interactions: 'Puede interferir con la absorción de antibióticos tipo tetraciclinas o quinolonas. Dejar un intervalo de 2 horas entre tomas.',
    ageRestrictions: 'Mayores de 12 años (bajo supervisión de tutor/médico).',
    pregnancyWarning: 'Consulte a su ginecólogo antes de consumirlo.',
    storageInstructions: 'Almacenar en un lugar fresco, seco y protegido de la luz directa. Mantener a temperatura ambiente inferior a 30°C.',
    tamperSealInformation: 'Sello exterior termoencogible en la tapa y sello de aluminio de seguridad interno bajo la rosca.',
    adverseEventContact: 'saludforte.mx/contacto',
    regulatoryClassification: 'Suplemento Alimenticio (Ley General de Salud Art. 215)',
    classificationDocument: 'Pendiente',
    advertisingPermitStatus: 'Pendiente de trámite',
    advertisingPermitReference: 'Ninguna',
    importDocumentationStatus: 'Pendiente de acreditar origen e importación formal',
    spanishLabelStatus: 'Pendiente de adherir etiqueta complementaria autorizada',
    trademarkUseStatus: 'Pendiente de autorización del titular de la marca ALXFRESH',
    supplierVerified: false,
    authenticityVerified: false,
    claimReviewStatus: 'En revisión. Queda prohibido afirmar que "Previene la osteoporosis", "Cura deficiencias óseas" o usar frases publicitarias de carácter terapéutico.',
    complianceNotes: 'Se requiere certificar físicamente que contiene las concentraciones elementales declaradas de minerales mediante un análisis de laboratorio independiente.',
    price: 490,
    compareAtPrice: null,
    currency: 'MXN',
    taxable: true,
    inventoryTracked: true,
    inventoryQuantity: 0,
    allowBackorder: false,
    shippingRequired: true,
    shippingProfile: 'Suplementos Envío Regular',
    fulfillmentService: 'manual',
    returnEligibility: true,
    returnWindow: 14,
    purchaseLimit: 5,
    lotNumber: 'Pendiente',
    expirationDate: 'Pendiente',
    imageId: 'IMG-201-PRODUCTO-CALCIO-D3',
    featuredImage: '/images/products/alxfresh_calcium.webp',
    galleryImages: [],
    altText: 'Frasco blanco y verde de ALXFRESH Calcio, Magnesio y Zinc con Vitamina D3. Vista frontal.',
    imageApprovalStatus: 'pending_review',
    imageRightsStatus: 'pending_authorization',
  },
  {
    id: 'prod_centrum_men',
    shopifyProductGid: 'gid://shopify/Product/4444444444',
    shopifyVariantGid: 'gid://shopify/ProductVariant/44444444444',
    slug: 'centrum-men-presentacion-por-verificar',
    status: 'draft',
    complianceStatus: 'pending_review',
    commerceModel: 'unconfigured',
    title: 'Centrum Men — presentación por verificar',
    subtitle: 'Suplemento multivitamínico y multimineral formulado para hombres',
    brand: 'Centrum',
    manufacturer: 'Pfizer / Haleon (por verificar)',
    distributor: 'Pendiente de verificar',
    importer: 'Haleon México S. de R.L. (por verificar)',
    countryOfOrigin: 'EUA / México (por confirmar lote)',
    productType: 'Suplemento Alimenticio / Medicamento de venta libre',
    category: 'Multivitamínicos',
    vendor: 'Pendiente de verificar',
    barcode: 'Pendiente',
    sku: 'CEN-MEN-120C-TEMP',
    dosageForm: 'Tabletas',
    netContent: '120 cápsulas (por verificar en el empaque físico)',
    unitCount: 120,
    servingSize: '2 cápsulas / tabletas (por verificar según etiqueta del lote importado)',
    servingsPerContainer: 60,
    flavor: 'Sin sabor',
    variantTitle: 'Frasco de 120 cápsulas/tabletas',
    weight: 0.22,
    dimensions: '7 x 7 x 13 cm',
    ingredients: 'Carbonato de calcio, óxido de magnesio, cloruro de potasio, ácido ascórbico (Vit. C), fosfato dibásico de calcio, acetato de DL-alfa tocoferilo (Vit. E), biotina, pantotenato de calcio, colecalciferol (Vit. D3), etc. (Ver lista completa en etiqueta adjunta).',
    activeComponents: 'Vitaminas A, C, D3, E, K, Tiamina, Riboflavina, Niacina, Vitamina B6, B12, Ácido fólico, Ácido pantoténico, Calcio, Hierro, Fósforo, Yodo, Magnesio, Zinc, Selenio, Cobre, Manganeso, Cromo, Molibdeno, Cloruro, Potasio, Licopeno.',
    inactiveIngredients: 'Celulosa microcristalina, almidón de maíz modificado, almidón de maíz, estearato de magnesio, dióxido de silicio, dióxido de titanio, polietilenglicol, etc.',
    allergens: 'Contiene Soya.',
    nutritionFacts: 'Verificado según la tabla de Supplement Facts del empaque estadounidense adjunto.',
    supplementalFacts: 'Aporta micronutrientes equilibrados diseñados para las necesidades metabólicas masculinas de mantenimiento.',
    caffeinePerServing: '0 mg',
    formulaSource: 'Fotografía de la tabla nutricional de Centrum Men.',
    manufacturerDirections: 'Tomar una (1) o dos (2) tabletas al día acompañadas de los alimentos. No exceder la sugerencia de uso.',
    warnings: 'El consumo accidental de productos que contienen hierro es una causa principal de intoxicación fatal en niños menores de 6 años. Manténgase alejado del alcance infantil.',
    contraindications: 'Hipersensibilidad a cualquiera de los componentes activos de la fórmula. Pacientes con hemocromatosis o acumulación excesiva de hierro.',
    interactions: 'No administrar simultáneamente con antiácidos ni suplementos de calcio individuales concentrados que puedan bloquear el hierro.',
    ageRestrictions: 'Mayores de 18 años.',
    pregnancyWarning: 'Formulado exclusivamente para hombres.',
    storageInstructions: 'Consérvese a no más de 30°C. Mantenga el frasco bien cerrado para protegerlo de la humedad.',
    tamperSealInformation: 'Sello exterior con logotipo de seguridad de Centrum y sello interior de aluminio hermético sellado al calor.',
    adverseEventContact: 'saludforte.mx/contacto',
    regulatoryClassification: 'Clasificado como Suplemento Alimenticio o Medicamento de Libre Venta según fórmula autorizada por la Secretaría de Salud de México.',
    classificationDocument: 'Pendiente',
    advertisingPermitStatus: 'Sujeto a los permisos corporativos de publicidad de Haleon México',
    advertisingPermitReference: 'Pendiente de verificar contrato',
    importDocumentationStatus: 'Pendiente de verificar factura de adquisición del lote nacional u origen lícito de importación',
    spanishLabelStatus: 'Falta etiqueta oficial en español con la tabla nutrimental adaptada a porciones del mercado mexicano',
    trademarkUseStatus: 'Uso de marca registrada Centrum propiedad de Haleon de forma meramente informativa sin fines de suplantación',
    supplierVerified: false,
    authenticityVerified: false,
    claimReviewStatus: 'En revisión. Prohibido sugerir que el Dr. Mauricio Galindo aprueba o recomienda este producto de forma personalizada en este sitio web sin validación médica formal.',
    complianceNotes: 'Se debe contrastar la fórmula de la versión estadounidense importada de la imagen contra la versión registrada de Centrum Men en México.',
    price: 520,
    compareAtPrice: null,
    currency: 'MXN',
    taxable: true,
    inventoryTracked: true,
    inventoryQuantity: 0,
    allowBackorder: false,
    shippingRequired: true,
    shippingProfile: 'Suplementos Envío Regular',
    fulfillmentService: 'manual',
    returnEligibility: true,
    returnWindow: 30,
    purchaseLimit: 3,
    lotNumber: 'Pendiente',
    expirationDate: 'Pendiente',
    imageId: 'IMG-203-PRODUCTO-MULTIVITAMINICO',
    featuredImage: '/images/products/centrum_men.webp',
    galleryImages: [],
    altText: 'Frasco blanco de Centrum Men Multivitamínico de 120 tabletas. Vista frontal.',
    imageApprovalStatus: 'pending_review',
    imageRightsStatus: 'pending_authorization',
  },
  {
    id: 'prod_vitamin_d3_pending',
    shopifyProductGid: 'gid://shopify/Product/5555555555',
    shopifyVariantGid: 'gid://shopify/ProductVariant/55555555555',
    slug: 'vitamina-d3-pendiente',
    status: 'draft',
    complianceStatus: 'pending_review',
    commerceModel: 'unconfigured',
    title: 'Vitamina D3 — marca, concentración y presentación pendientes',
    subtitle: 'Registro preliminar para suplemento concentrado de Vitamina D3',
    brand: 'Por definir',
    manufacturer: 'Pendiente de verificar',
    distributor: 'Pendiente de verificar',
    importer: 'Pendiente de verificar',
    countryOfOrigin: 'Pendiente',
    productType: 'Suplemento Alimenticio',
    category: 'Vitaminas',
    vendor: 'Pendiente',
    barcode: 'Pendiente',
    sku: 'VIT-D3-PEND-TEMP',
    dosageForm: 'Cápsulas (por confirmar)',
    netContent: 'Pendiente de confirmación física',
    unitCount: 0,
    servingSize: 'Pendiente',
    servingsPerContainer: 0,
    flavor: 'Sin sabor',
    variantTitle: 'Por definir',
    weight: 0.1,
    dimensions: '5 x 5 x 9 cm',
    ingredients: 'Vitamina D3 (Colecalciferol). (Fórmula completa pendiente).',
    activeComponents: 'Vitamina D3.',
    inactiveIngredients: 'Pendiente.',
    allergens: 'Pendiente de evaluar.',
    nutritionFacts: 'No disponible por falta de empaque físico.',
    supplementalFacts: 'Pendiente.',
    caffeinePerServing: '0 mg',
    formulaSource: 'Registro creado automáticamente a partir de requerimiento comercial preliminar.',
    manufacturerDirections: 'Pendiente.',
    warnings: 'Su consumo indiscriminado puede ocasionar acumulación excesiva de calcio en la sangre.',
    contraindications: 'No consumir en caso de hipercalcemia o sospecha de toxicidad por vitamina D.',
    interactions: 'Pendiente.',
    ageRestrictions: 'Adultos.',
    pregnancyWarning: 'Consulte a su médico.',
    storageInstructions: 'Almacenar bien cerrado en un lugar seco y fresco.',
    tamperSealInformation: 'Pendiente.',
    adverseEventContact: 'saludforte.mx/contacto',
    regulatoryClassification: 'Suplemento Alimenticio',
    classificationDocument: 'Pendiente',
    advertisingPermitStatus: 'Ninguno',
    advertisingPermitReference: 'Ninguna',
    importDocumentationStatus: 'Pendiente',
    spanishLabelStatus: 'Pendiente',
    trademarkUseStatus: 'Pendiente',
    supplierVerified: false,
    authenticityVerified: false,
    complianceNotes: 'Este producto se mantiene estrictamente en borrador y totalmente oculto para el público. No se cuenta con fotografías de frente, reverso, ingredientes ni datos de fórmula.',
    claimReviewStatus: 'Pendiente de análisis clínico y legal.',
    price: 0,
    compareAtPrice: null,
    currency: 'MXN',
    taxable: true,
    inventoryTracked: true,
    inventoryQuantity: 0,
    allowBackorder: false,
    shippingRequired: true,
    shippingProfile: 'Suplementos Envío Regular',
    fulfillmentService: 'manual',
    returnEligibility: false,
    returnWindow: 0,
    purchaseLimit: 1,
    lotNumber: 'Pendiente',
    expirationDate: 'Pendiente',
    imageId: 'IMG-920-PENDIENTE-PRODUCTO-VITAMINA-D3',
    featuredImage: '/images/products/placeholder_d3.webp',
    galleryImages: [],
    altText: 'Imagen provisional pendiente de subir del producto Vitamina D3.',
    imageApprovalStatus: 'pending_review',
    imageRightsStatus: 'pending_authorization',
  },
];

// Comprueba si un producto cumple con todas las reglas de la puerta de publicación
export function validateProductForPublishing(product: Product): ProductChecklist {
  const isMelatonin = product.slug.includes('melatolina') || product.slug.includes('melatonin');

  // Una variante es válida si tiene una GID real de Shopify (no una provisional vacía o genérica terminada en 'TEMP')
  const isShopifyVariantValid =
    product.shopifyVariantGid !== '' &&
    product.shopifyVariantGid.startsWith('gid://shopify/ProductVariant/') &&
    !product.shopifyVariantGid.includes('TEMP');

  const hasPrice = product.price > 0;
  const hasSku = product.sku !== '' && !product.sku.includes('TEMP');
  const hasStock = product.inventoryQuantity >= 0 && product.inventoryTracked;
  const hasWeight = product.weight > 0;

  // Un suplemento requiere fotos físicas aprobadas del empaque y su tabla nutricional
  const hasApprovedImage =
    product.featuredImage !== '' &&
    !product.featuredImage.includes('placeholder_d3.webp') &&
    product.imageApprovalStatus === 'approved';

  const hasVerifiedImageRights = product.imageRightsStatus === 'approved';
  const hasVerifiedSupplier = product.supplierVerified;
  const hasVerifiedAuthenticity = product.authenticityVerified;

  // Fórmula completa requiere que los ingredientes no digan "pendiente"
  const hasCompleteFormula =
    product.ingredients !== '' &&
    !product.ingredients.toLowerCase().includes('pendiente') &&
    product.nutritionFacts !== '' &&
    !product.nutritionFacts.toLowerCase().includes('pendiente');

  const hasWarnings =
    product.warnings !== '' && !product.warnings.toLowerCase().includes('pendiente');

  // Lotes y caducidades son esenciales si se maneja stock físico
  const hasLotAndExpiration =
    product.lotNumber !== '' &&
    product.lotNumber !== 'Pendiente' &&
    product.expirationDate !== '' &&
    product.expirationDate !== 'Pendiente';

  const hasRegulatoryClassification =
    product.regulatoryClassification !== '' &&
    !product.regulatoryClassification.toLowerCase().includes('pendiente');

  const hasSpanishLabel =
    product.spanishLabelStatus === 'approved' ||
    product.spanishLabelStatus.toLowerCase().includes('adherida') ||
    product.spanishLabelStatus.toLowerCase().includes('completa');

  const hasApprovedClaims = product.claimReviewStatus === 'approved';
  const hasReturnPolicy = product.returnEligibility || (!product.returnEligibility && product.returnWindow >= 0);
  const hasCommerceModel = product.commerceModel !== 'unconfigured';

  // Evaluación especial de melatonina
  const hasMelatoninSpecialReview = !isMelatonin || (isMelatonin && product.complianceStatus === 'approved');

  return {
    isShopifyVariantValid,
    hasPrice,
    hasSku,
    hasStock,
    hasWeight,
    hasApprovedImage,
    hasVerifiedImageRights,
    hasVerifiedSupplier,
    hasVerifiedAuthenticity,
    hasCompleteFormula,
    hasWarnings,
    hasLotAndExpiration,
    hasRegulatoryClassification,
    hasSpanishLabel,
    hasApprovedClaims,
    hasReturnPolicy,
    hasCommerceModel,
    hasMelatoninSpecialReview,
  };
}

export function isProductPublishable(product: Product): boolean {
  const checklist = validateProductForPublishing(product);
  return Object.values(checklist).every((val) => val === true);
}

// Almacenamiento local en navegador o memoria
class ProductsDatabase {
  private products: Product[] = [];
  private isLoaded = false;

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('salud_forte_products_db');
        if (stored) {
          this.products = JSON.parse(stored);
          this.isLoaded = true;
          return;
        }
      } catch (e) {
        console.error('Failed to load products database:', e);
      }
    }
    this.products = [...INITIAL_PRODUCTS];
    this.isLoaded = true;
  }

  private save() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('salud_forte_products_db', JSON.stringify(this.products));
      } catch (e) {
        console.error('Failed to save products database:', e);
      }
    }
  }

  public getProducts(): Product[] {
    if (!this.isLoaded) this.load();
    return this.products;
  }

  public getProductBySlug(slug: string): Product | undefined {
    if (!this.isLoaded) this.load();
    return this.products.find((p) => p.slug === slug);
  }

  public createProduct(product: Product): void {
    if (!this.isLoaded) this.load();
    this.products.push(product);
    this.save();
  }

  public updateProduct(id: string, updated: Partial<Product>): boolean {
    if (!this.isLoaded) this.load();
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updated } as Product;
      this.save();
      return true;
    }
    return false;
  }

  public deleteProduct(id: string): boolean {
    if (!this.isLoaded) this.load();
    const initialLength = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    this.save();
    return this.products.length < initialLength;
  }

  public resetToDefault(): void {
    this.products = [...INITIAL_PRODUCTS];
    this.save();
  }
}

export const productsDb = new ProductsDatabase();
