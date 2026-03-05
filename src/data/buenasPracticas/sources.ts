import type { Country, Category } from './countries';

export type SourceConfidence = 'real-complete' | 'real-partial' | 'example';

export interface CountrySourceMeta {
  countryId: Country['id'];
  label: string;
  url: string;
  confidence: SourceConfidence;
  note?: string;
}

// URL base del portal de mejores prácticas de REGULATEL
const REGULATEL_BASE = 'https://regulatel.indotel.gob.do';
const DETAIL_PATH = `${REGULATEL_BASE}/pagina/detalle`;
const MAIN_PAGE = `${REGULATEL_BASE}/pagina/mejores-practicas-regulatorias`;

export const countrySources: Record<Country['id'], CountrySourceMeta> = {
  rep_dominicana: {
    countryId: 'rep_dominicana',
    label: 'REGULATEL – Ficha de INDOTEL (República Dominicana)',
    url: `${DETAIL_PATH}?id=199`,
    confidence: 'real-partial',
    note:
      'Las descripciones por categoría se han elaborado a partir de la Ley General de Telecomunicaciones núm. 153-98 y reglamentos de INDOTEL (uso del espectro, servicio telefónico, acceso a Internet, fondo de desarrollo, reventa de servicios, sistema de información de alertas y procedimientos de homologación); la ficha de REGULATEL puede incluir prácticas adicionales que aún no se han incorporado.',
  },
  argentina: {
    countryId: 'argentina',
    label: 'REGULATEL – Ficha de ENACOM (Argentina)',
    url: `${DETAIL_PATH}?id=174`,
    confidence: 'real-complete',
    note:
      'Las 8 categorías de Argentina en el dashboard están construidas a partir de los documentos listados en la ficha de ENACOM en REGULATEL (CABFRA, Reglamento Nacional de Contingencia, Reglamento de Clientes TIC, STeFI, etc.).',
  },
  chile: {
    countryId: 'chile',
    label: 'REGULATEL – Mejores prácticas regulatorias (panel general)',
    url: MAIN_PAGE,
    confidence: 'real-partial',
    note:
      'Las descripciones por categoría para Chile se han elaborado a partir de la Ley General de Telecomunicaciones N.º 18.168, el Plan General de Uso del Espectro Radioeléctrico, la normativa de portabilidad numérica, la Ley Marco de Ciberseguridad N.º 21.663, la regulación de calidad de servicio, la Ley de Velocidad Mínima Garantizada y los procedimientos de homologación y SAE de SUBTEL; la ficha de REGULATEL puede incluir prácticas adicionales que aún no se han incorporado.',
  },
  brasil: {
    countryId: 'brasil',
    label: 'REGULATEL – Ficha de ANATEL (Brasil)',
    url: `${DETAIL_PATH}?id=183`,
    confidence: 'real-partial',
    note:
      'Las descripciones por categoría se han elaborado a partir de la Lei Geral de Telecomunicações, del Marco Civil da Internet, de la Lei Geral de Proteção de Dados (LGPD), del Regulamento Geral de Direitos do Consumidor de Serviços de Telecomunicações, del Plano Geral de Metas de Competição (PGMC) y del Regulamento de Numeração; la ficha de REGULATEL puede incluir prácticas adicionales que aún no se han incorporado.',
  },
  bolivia: {
    countryId: 'bolivia',
    label: 'REGULATEL – Ficha de ATT (Bolivia)',
    url: `${DETAIL_PATH}?id=180`,
    confidence: 'real-partial',
    note:
      "Las descripciones por categoría se han construido a partir de la Ley N.º 164, su Reglamento General, el Reglamento para el Otorgamiento de Licencias, el reglamento de regulación tarifaria, el reglamento TIC y las normas de homologación de ATT; la ficha de REGULATEL puede contener prácticas adicionales que aún no se han incorporado.",
  },
  colombia: {
    countryId: 'colombia',
    label: 'REGULATEL – Ficha de CRC (Colombia)',
    url: `${DETAIL_PATH}?id=184`,
    confidence: 'example',
    note:
      'El contenido mostrado para Colombia es un resumen de ejemplo coherente con las funciones de la CRC, pero aún no proviene de un scraping completo de la ficha de REGULATEL.',
  },
  ecuador: {
    countryId: 'ecuador',
    label: 'REGULATEL – Ficha de ARCOTEL (Ecuador)',
    url: `${DETAIL_PATH}?id=187`,
    confidence: 'real-partial',
    note:
      'Las descripciones por categoría se han elaborado a partir de la Ley Orgánica de Telecomunicaciones, su Reglamento General, el Plan Nacional de Frecuencias, el sistema ECU 911 y comunicaciones oficiales de ARCOTEL sobre derechos de usuarios y homologación; la ficha de REGULATEL puede incluir prácticas adicionales que aún no se han incorporado.',
  },
  mexico: {
    countryId: 'mexico',
    label: 'REGULATEL – Ficha del IFT (México)',
    url: `${DETAIL_PATH}?id=193`,
    confidence: 'example',
    note:
      'Datos de ejemplo; aún no se ha volcado de forma estructurada el detalle de la ficha del IFT disponible en REGULATEL.',
  },
  panama: {
    countryId: 'panama',
    label: 'REGULATEL – Ficha de ASEP (Panamá)',
    url: `${DETAIL_PATH}?id=194`,
    confidence: 'real-partial',
    note:
      'Las descripciones por categoría se han elaborado a partir de la ficha de ASEP en REGULATEL y de normativa reciente publicada por la ASEP y la AIG (PNAF, reglamento de Internet No. 211, reglamento de torres, procedimiento de homologación, CSIRT Panamá, etc.); la ficha puede incluir prácticas adicionales que aún no se han incorporado.',
  },
  peru: {
    countryId: 'peru',
    label: 'REGULATEL – Ficha de OSIPTEL (Perú)',
    url: `${DETAIL_PATH}?id=196`,
    confidence: 'real-partial',
    note:
      'Las descripciones por categoría para Perú se han elaborado a partir del PNAF del MTC, la Ley N.º 26285 que crea OSIPTEL, la Ley de Promoción de la Banda Ancha N.º 29904, la Ley N.º 31809 "Perú Conectado", la Ley N.º 28295 sobre uso de infraestructura, la Norma de Condiciones de Uso, el Reglamento de Reclamos, el Reglamento General de Calidad, la normativa de portabilidad numérica y las reglas de prevención de fraudes y SIM swapping; la ficha de REGULATEL puede incluir prácticas adicionales que aún no se han incorporado.',
  },
  uruguay: {
    countryId: 'uruguay',
    label: 'REGULATEL – Mejores prácticas regulatorias (panel general)',
    url: MAIN_PAGE,
    confidence: 'example',
    note:
      'Datos de ejemplo inspirados en el rol de URSEC; hasta que no se integre la ficha específica, se recomienda validar siempre contra REGULATEL y las normas oficiales.',
  },
  paraguay: {
    countryId: 'paraguay',
    label: 'REGULATEL – Ficha de CONATEL (Paraguay)',
    url: `${DETAIL_PATH}?id=195`,
    confidence: 'example',
    note:
      'Datos de ejemplo; el detalle debe ajustarse a lo publicado por CONATEL y a la ficha de REGULATEL cuando se incorpore el scraping completo.',
  },
};

// Fuente normativa por país y categoría.
// De momento está detallado sólo para Argentina, que es el caso con datos completos.

export interface CategorySource {
  title: string;
  url: string;
}

export const countryCategorySources: Partial<
  Record<Country['id'], Partial<Record<Category, CategorySource[]>>>
> = {
  argentina: {
    'Espectro radioeléctrico': [
      {
        title:
          'Cuadro de Atribución de Bandas de Frecuencias de la República Argentina (CABFRA)',
        url: 'https://www.enacom.gob.ar/cuadro-de-atribucion-de-bandas-de-frecuencias-de-la-republica-argentina-cabfra-_p1588',
      },
      {
        title: 'Administración del espectro - Bandas',
        url: 'https://www.enacom.gob.ar/bandas_p1589',
      },
      {
        title: 'Modalidad compartida',
        url: 'https://www.enacom.gob.ar/modalidad-compartida_p549',
      },
      {
        title: 'Asuntos Satelitales',
        url: 'https://www.enacom.gob.ar/la-actividad-espacial-en-argentina_p540',
      },
      {
        title:
          'Reglamento Sobre Administración, Gestión y Control del Espectro Radioeléctrico',
        url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/286358/20230515',
      },
      {
        title: 'Problemas de Interferencias',
        url: 'https://www.enacom.gob.ar/problemas-de-interferencias_p114',
      },
      {
        title:
          'Radioaficionados, Estaciones Repetidoras y Señales Distintivas Especiales',
        url: 'https://www.enacom.gob.ar/radioaficionados_p127',
      },
      {
        title: 'Hertz: Sistema de Gestión del Espectro Radioeléctrico',
        url: 'https://www.enacom.gob.ar/hertz-sistema-de-gestion-del-espectro-radioelectrico_p2891',
      },
    ],
    'Competencia Económica': [
      {
        title: 'Indicadores de Mercado',
        url: 'https://www.enacom.gob.ar/indicadores-de-mercado_p2877',
      },
      {
        title: 'Normativa Fundamental (TIC)',
        url: 'https://www.enacom.gob.ar/normativas/grupos',
      },
      {
        title: 'Servicio Universal',
        url: 'https://www.enacom.gob.ar/su',
      },
    ],
    Ciberseguridad: [
      {
        title: 'Conversatorio sobre ciberseguridad',
        url: 'https://www.enacom.gob.ar/institucional/conversatorio-sobre-ciberseguridad_n4323',
      },
    ],
    'Protección del usuario': [
      {
        title: 'Reglamento de Clientes de los Servicios TIC',
        url: 'https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-733-2017-305484/texto',
      },
      {
        title:
          'Programa de Alfabetización en Medios y Tecnologías de la Información y la Comunicación',
        url: 'https://www.enacom.gob.ar/programa-de-alfabetizacion',
      },
      {
        title: 'IMEI (denuncias al 910)',
        url: 'https://www.enacom.gob.ar/denuncia-al-910_p4034',
      },
      {
        title: "Programa 'Tu Línea es Tuya'",
        url: 'https://www.enacom.gob.ar/tu-linea-es-tuya_p3874',
      },
      {
        title: 'Adquisición de Equipos',
        url: 'https://www.enacom.gob.ar/adquisicion-de-equipos_p374',
      },
      {
        title: 'Portabilidad Numérica',
        url: 'https://www.enacom.gob.ar/portabilidad-numerica_p160',
      },
      {
        title: 'Atención a Usuarios y Reclamos',
        url: 'https://www.enacom.gob.ar/problemas-con-el-servicio-reclamos-por-telefonia-movil_p89',
      },
      {
        title: 'Consejos para usuarios',
        url: 'https://www.enacom.gob.ar/banner/113/0f269ef6a7a358f862deb76563e1ab88',
      },
      {
        title:
          'Programa Nacional de Prevención y Concientización del Grooming o Ciberacoso',
        url: 'https://www.enacom.gob.ar/multimedia/normativas/2022/Decreto%20407_22.pdf',
      },
    ],
    'Tecnologías emergentes': [
      {
        title:
          'Reglamento General del Servicio de Telecomunicaciones Fiables e Inteligentes (STeFI)',
        url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/278444/20221228?busqueda=1',
      },
      {
        title: 'Muestra 5G',
        url: 'https://www.enacom.gob.ar/muestra5g',
      },
    ],
    'Compartición de la infraestructura': [
      {
        title: 'Compartición de Infraestructura Pasiva',
        url: 'https://www.enacom.gob.ar/comparticion-de-infraestructura-pasiva_p5668',
      },
      {
        title: 'Buscador de Convenios de Interconexión',
        url: 'https://www.enacom.gob.ar/convenios',
      },
      {
        title: 'Interconexión y Acceso',
        url: 'https://www.enacom.gob.ar/interconexion_p135',
      },
    ],
    'Telecomunicaciones de emergencia': [
      {
        title: 'Reglamento Nacional de Contingencia',
        url: 'https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-51-2018-316087/texto',
      },
      {
        title:
          'Programa de Asistencia a Prestadores de Servicios TIC ante emergencias y catástrofes',
        url: 'https://www.enacom.gob.ar/programa-de-asistencia-a-prestadores-de-servicios-tic-ante-emergencias-y-catastrofes_p5480',
      },
      {
        title:
          'Suspensión de cortes de servicios esenciales a clientes vulnerables por falta de pago',
        url: 'https://www.enacom.gob.ar/institucional/suspension-de-cortes-de-servicios-esenciales-a-clientes-vulnerables-por-falta-de-pago_n2310',
      },
      {
        title:
          'Convenio ENACOM – Ministerio de Seguridad sobre localización de llamadas de emergencia',
        url: 'https://www.enacom.gob.ar/institucional/enacom-y-el-ministerio-de-seguridad-firmaron-un-convenio-para-implementar-el-servicio-gratuito-de-localizacion-de-llamadas-de-emergencia_n3258',
      },
    ],
    'Homologación de productos y dispositivos': [
      {
        title: 'Homologación de Equipos',
        url: 'https://www.enacom.gob.ar/homologacion-de-equipos_p347',
      },
      {
        title: 'Inscripción de equipos y procedimientos',
        url: 'https://www.enacom.gob.ar/inscripcion-de-equipos_p3076',
      },
      {
        title: 'Novedades',
        url: 'https://www.enacom.gob.ar/novedades_p1673',
      },
    ],
  },
  bolivia: {
    'Espectro radioeléctrico': [
      {
        title:
          'Ley N.º 164 General de Telecomunicaciones, Tecnologías de Información y Comunicación',
        url: 'https://www.lexivox.org/norms/BO-L-N164.html',
      },
      {
        title: 'Decreto Supremo N.º 1391 – Reglamento General a la Ley N.º 164',
        url: 'https://www.lexivox.org/norms/BO-DS-N1391.html',
      },
      {
        title:
          'Reglamento para el Otorgamiento de Licencias en Telecomunicaciones (RM MOPSV 323/2012)',
        url: 'https://www.lexivox.org/norms/BO-RBM-323.html',
      },
      {
        title:
          'Reglamento para la Autorización de Prestadores de Servicio de Estación Espacial (RM 38/2016)',
        url: 'https://www.lexivox.org/norms/BO-RM-38-2016.html',
      },
    ],
    'Competencia Económica': [
      {
        title:
          'Ley N.º 164 General de Telecomunicaciones, TIC y Servicio Postal – régimen de competencia',
        url: 'https://www.lexivox.org/norms/BO-L-N164.html',
      },
      {
        title:
          'Decreto Supremo N.º 1391 – Reglamento General a la Ley N.º 164 (interconexión y acceso)',
        url: 'https://www.lexivox.org/norms/BO-DS-N1391.html',
      },
      {
        title:
          'Reglamento del Régimen de Regulación Tarifaria de los Servicios Públicos de Telecomunicaciones y de TIC (RM MOPSV 088/2013)',
        url: 'https://www.lexivox.org/norms/BO-RM-MOPSV088-2013.html',
      },
    ],
    Ciberseguridad: [
      {
        title:
          'Ley N.º 164 – disposiciones sobre inviolabilidad de comunicaciones y documentos y firmas digitales',
        url: 'https://www.lexivox.org/norms/BO-L-N164.html',
      },
      {
        title:
          'Decreto Supremo N.º 1793 – Reglamento para el Acceso, Uso y Desarrollo de las TIC',
        url: 'https://www.lexivox.org/norms/BO-DS-N1793.html',
      },
    ],
    'Protección del usuario': [
      {
        title:
          'Ley N.º 164 – derechos y obligaciones de los usuarios de servicios de telecomunicaciones y TIC',
        url: 'https://www.lexivox.org/norms/BO-L-N164.html',
      },
      {
        title:
          'Decreto Supremo N.º 1391 – Reglamento General a la Ley N.º 164 (título de derechos de usuarios)',
        url: 'https://www.lexivox.org/norms/BO-DS-N1391.html',
      },
      {
        title:
          'Decreto Supremo N.º 4669 – Mejora del servicio de acceso a Internet y acumulación de saldo y crédito',
        url: 'https://www.lexivox.org/norms/BO-DS-N4669.html',
      },
    ],
    'Tecnologías emergentes': [
      {
        title:
          'Ley N.º 164 – régimen de Telecomunicaciones y TIC como servicios estratégicos',
        url: 'https://www.lexivox.org/norms/BO-L-N164.html',
      },
      {
        title:
          'Decreto Supremo N.º 1793 – Reglamento para el Acceso, Uso y Desarrollo de las TIC',
        url: 'https://www.lexivox.org/norms/BO-DS-N1793.html',
      },
    ],
    'Compartición de la infraestructura': [
      {
        title:
          'Ley N.º 164 – interconexión y uso compartido de facilidades esenciales',
        url: 'https://www.lexivox.org/norms/BO-L-N164.html',
      },
      {
        title:
          'Decreto Supremo N.º 1391 – Reglamento General a la Ley N.º 164 (compartición de infraestructura)',
        url: 'https://www.lexivox.org/norms/BO-DS-N1391.html',
      },
      {
        title:
          'Reglamento de las Telecomunicaciones (RT) – disposiciones sobre Puntos de Interconexión de Tráfico (PIT)',
        url: 'https://www.lexivox.org/norms/BO-DGTLT-RT.html',
      },
    ],
    'Telecomunicaciones de emergencia': [
      {
        title:
          'Reglamento de las Telecomunicaciones (RT) – capítulo de servicios de seguridad, emergencia y defensa',
        url: 'https://www.lexivox.org/norms/BO-DGTLT-RT.html',
      },
      {
        title:
          'Ley N.º 164 – disposiciones generales sobre continuidad de servicios y gestión de riesgos',
        url: 'https://www.lexivox.org/norms/BO-L-N164.html',
      },
    ],
    'Homologación de productos y dispositivos': [
      {
        title:
          'Ley N.º 164 – funciones de la ATT en materia de homologación de equipos y sistemas',
        url: 'https://www.lexivox.org/norms/BO-L-N164.html',
      },
      {
        title:
          'Resolución ATT-DJ-RAR-TL 539/2024 – Instructivo para el registro y homologación de equipos de telecomunicaciones y TIC',
        url: 'https://www.lexivox.org/norms/BO-ATT-DJ-RAR-TL-539-2024.html',
      },
    ],
  },
  ecuador: {
    'Espectro radioeléctrico': [
      {
        title:
          'Ley Orgánica de Telecomunicaciones (Registro Oficial Suplemento 439, 2015)',
        url: 'https://www.asambleanacional.gob.ec/es/multimedios-legislativos/39027-ley-organica-de-telecomunicaciones',
      },
      {
        title:
          'Reglamento General a la Ley Orgánica de Telecomunicaciones (Decreto Ejecutivo 864)',
        url: 'https://vlex.ec/vid/expidese-reglamento-general-ley-593044718',
      },
      {
        title:
          'Cuadro Nacional de Atribución de Frecuencias – aplicación de consulta de ARCOTEL',
        url: 'https://www.arcotel.gob.ec/cuadro-nacional-de-atribucion-de-frecuencias-puede-ser-consultado-en-una-aplicacion/',
      },
    ],
    'Competencia Económica': [
      {
        title:
          'Ley Orgánica de Telecomunicaciones – principios de competencia y regulación sectorial',
        url: 'https://www.asambleanacional.gob.ec/es/multimedios-legislativos/39027-ley-organica-de-telecomunicaciones',
      },
      {
        title:
          'Reglamento General a la LOT – reglas de interconexión y acceso a infraestructuras esenciales',
        url: 'https://derechoecuador.com/registro-oficial-no351-miercoles-16-de-diciembre-de-2020/',
      },
      {
        title: 'Plan Regulatorio Institucional de ARCOTEL',
        url: 'https://www.arcotel.gob.ec/plan-regulatorio-institucional/',
      },
    ],
    Ciberseguridad: [
      {
        title:
          'Ley Orgánica de Telecomunicaciones – inviolabilidad y secreto de las comunicaciones',
        url: 'https://www.asambleanacional.gob.ec/es/multimedios-legislativos/39027-ley-organica-de-telecomunicaciones',
      },
      {
        title: 'Política Nacional de Ciberseguridad del Ecuador (MINTEL)',
        url: 'https://www.telecomunicaciones.gob.ec/wp-content/uploads/2018/01/Politica-Nacional-de-Ciberseguridad-Ecuador.pdf',
      },
    ],
    'Protección del usuario': [
      {
        title:
          'Ley Orgánica de Telecomunicaciones – Artículo 22, derechos de los usuarios',
        url: 'https://www.asambleanacional.gob.ec/es/multimedios-legislativos/39027-ley-organica-de-telecomunicaciones',
      },
      {
        title:
          'ARCOTEL – campaña sobre derechos de los usuarios de servicios de telecomunicaciones',
        url: 'https://www.arcotel.gob.ec/la-arcotel-difunde-campana-sobre-derechos-de-los-usuarios/',
      },
      {
        title:
          'ARCOTEL – capacitación sobre derechos y obligaciones de los usuarios y homologación de equipos terminales',
        url: 'https://www.arcotel.gob.ec/arcotel-capacito-sobre-derechos-y-obligaciones-de-los-usuarios-y-homologacion-de-equipos-terminales-de-telecomunicaciones/',
      },
    ],
    'Tecnologías emergentes': [
      {
        title:
          'Ley Orgánica de Telecomunicaciones – objetivos sobre banda ancha y servicios avanzados',
        url: 'https://www.asambleanacional.gob.ec/es/multimedios-legislativos/39027-ley-organica-de-telecomunicaciones',
      },
      {
        title: 'Plan Regulatorio Institucional de ARCOTEL',
        url: 'https://www.arcotel.gob.ec/plan-regulatorio-institucional/',
      },
      {
        title:
          'Plan Nacional de Frecuencias – noticias sobre actualización de bandas y servicios',
        url: 'https://www.arcotel.gob.ec/plan-nacional-de-frecuencias-sera-modificado/',
      },
    ],
    'Compartición de la infraestructura': [
      {
        title:
          'Reglamento General a la LOT – artículos 97 a 99 sobre compartición de infraestructura',
        url: 'https://derechoecuador.com/registro-oficial-no351-miercoles-16-de-diciembre-de-2020/',
      },
    ],
    'Telecomunicaciones de emergencia': [
      {
        title:
          'ECU 911 – Sistema de Alerta Temprana (SAT) y sirenas de emergencia',
        url: 'https://www.ecu911.gob.ec/sat-sistema-de-alerta-temprana-sirenas/',
      },
      {
        title:
          'ECU 911 – expansión de la cobertura del SAT a nivel nacional',
        url: 'https://www.ecu911.gob.ec/ecu-911-trabaja-en-la-expansion-de-la-cobertura-del-sat-a-nivel-nacional/',
      },
    ],
    'Homologación de productos y dispositivos': [
      {
        title:
          'ARCOTEL – capacitación sobre derechos y homologación de equipos terminales de telecomunicaciones',
        url: 'https://www.arcotel.gob.ec/arcotel-capacito-sobre-derechos-y-obligaciones-de-los-usuarios-y-homologacion-de-equipos-terminales-de-telecomunicaciones/',
      },
      {
        title:
          'Ley Orgánica de Telecomunicaciones – facultades de ARCOTEL para homologar equipos',
        url: 'https://www.asambleanacional.gob.ec/es/multimedios-legislativos/39027-ley-organica-de-telecomunicaciones',
      },
    ],
  },
  rep_dominicana: {
    'Espectro radioeléctrico': [
      {
        title: 'Ley General de Telecomunicaciones núm. 153-98',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/ley-general-de-telecomunicaciones-no-153-98/',
      },
      {
        title:
          'Reglamento General de Uso del Espectro Radioeléctrico (Resolución núm. 034-2020)',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/reglamento-general-de-uso-del-espectro-radioelectrico-resolucion-no-034-2020/',
      },
      {
        title: 'Plan Nacional de Atribución de Frecuencias (PNAF)',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/plan-nacional-de-atribucion-de-frecuencias-pnaf/',
      },
    ],
    'Competencia Económica': [
      {
        title: 'Ley General de Telecomunicaciones núm. 153-98 – régimen de competencia',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/ley-general-de-telecomunicaciones-no-153-98/',
      },
      {
        title:
          'Reglamento del Fondo de Desarrollo de las Telecomunicaciones (FDT) – Res. núm. 023-10 y su modificación Res. núm. 128-23',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/reglamento-fondo-de-desarrollo-de-las-telecomunicaciones-fdt-res-no-023-10-y-la-modificacion-de-la-resolucion-no-128-23/',
      },
      {
        title:
          'Reglamento de Reventa de los Servicios Públicos de Telecomunicaciones (Resolución núm. 116-2024)',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/reglamento-de-reventa-de-los-servicios-publicos-de-telecomunicaciones-res-no-116-2024/',
      },
    ],
    Ciberseguridad: [
      {
        title: 'Ley General de Telecomunicaciones núm. 153-98 – deberes de seguridad y confidencialidad',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/ley-general-de-telecomunicaciones-no-153-98/',
      },
      {
        title: 'Estrategia Nacional de Ciberseguridad 2030 – Comisión Nacional de Ciberseguridad',
        url: 'https://cncs.gob.do/estrategia-nacional-de-ciberseguridad-2030/',
      },
    ],
    'Protección del usuario': [
      {
        title:
          'Reglamento para la Solución de Controversias entre los Usuarios y las Prestadoras de los Servicios Públicos de Telecomunicaciones (Res. núm. 124-05)',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/reglamento-para-la-solucion-de-controversias-entre-los-usuarios-y-las-prestadoras-de-los-servicios-publicos-de-telecomunicaciones-resolucion-no-124-05/',
      },
      {
        title:
          'Reglamento General del Servicio Telefónico (Resolución núm. 110-12)',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/reglamento-general-del-servicio-telefonico-resolucion-no-110-12/',
      },
      {
        title: 'Ley General de Telecomunicaciones núm. 153-98 – derechos de los usuarios',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/ley-general-de-telecomunicaciones-no-153-98/',
      },
    ],
    'Tecnologías emergentes': [
      {
        title:
          'Reglamento General del Servicio de Acceso a Internet (Resolución núm. 033-2020)',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/reglamento-general-del-servicio-de-acceso-a-internet-res-n-033-2020/',
      },
      {
        title:
          'Reglamento de Reventa de los Servicios Públicos de Telecomunicaciones (Res. núm. 116-2024)',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/reglamento-de-reventa-de-los-servicios-publicos-de-telecomunicaciones-res-no-116-2024/',
      },
      {
        title:
          'Reglamento que establece el Roaming Automático Nacional (Resolución núm. 070-2023)',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/reglamento-que-establece-el-roaming-automatico-nacional-resolucion-no-070-2023/',
      },
    ],
    'Compartición de la infraestructura': [
      {
        title: 'Ley General de Telecomunicaciones núm. 153-98 – derechos de paso y uso de dominio público',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/ley-general-de-telecomunicaciones-no-153-98/',
      },
      {
        title:
          'Resolución núm. 145-2024 – Estandarización de los procesos administrativos municipales para la instalación y desmontaje de infraestructura de telecomunicaciones en el dominio público',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/resolucion-no-145-2024-sobre-procesos-municipales-para-infraestructura-de-telecomunicaciones/',
      },
    ],
    'Telecomunicaciones de emergencia': [
      {
        title:
          'Norma que regula el Sistema de Información de Alertas (Resolución núm. 110-2024)',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/norma-que-regula-el-sistema-de-informacion-de-alertas-resolucion-no-110-2024/',
      },
      {
        title: 'Plan Nacional de Atribución de Frecuencias (PNAF)',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/plan-nacional-de-atribucion-de-frecuencias-pnaf/',
      },
    ],
    'Homologación de productos y dispositivos': [
      {
        title:
          'Ley General de Telecomunicaciones núm. 153-98 – capítulo de homologación de equipos y aparatos',
        url: 'https://indotel.gob.do/leyes-y-reglamentos/ley-general-de-telecomunicaciones-no-153-98/',
      },
      {
        title: 'Solicitud de expedición de certificado de homologación de equipos y aparatos',
        url: 'https://indotel.gob.do/servicios/certificado-de-homologacion-de-equipos-y-aparatos/',
      },
    ],
  },
};
