export const categories = [
  "Espectro radioeléctrico",
  "Competencia Económica",
  "Ciberseguridad",
  "Protección del usuario",
  "Tecnologías emergentes",
  "Compartición de la infraestructura",
  "Telecomunicaciones de emergencia",
  "Homologación de productos y dispositivos",
] as const;

export type Category = (typeof categories)[number];

export interface Practice {
  summary: string;        // resumen corto para mostrar
  details: string;        // texto completo (si lo necesitas en modal)
  tags: string[];         // etiquetas para similitudes: "sandbox", "5G", "OMV", etc.
}

export interface Country {
  id: string;             // "rep_dominicana"
  name: string;           // "República Dominicana"
  flag: string;           // emoji o ruta a la imagen
  practices: Record<Category, Practice>;
}

export const countries: Country[] = [
  {
    id: "rep_dominicana",
    name: "República Dominicana",
    flag: "rep_dominicana.png",
    practices: {
      "Espectro radioeléctrico": {
        summary:
          "INDOTEL administra el espectro conforme a la Ley General de Telecomunicaciones 153-98, el Reglamento General de Uso del Espectro Radioeléctrico y el Plan Nacional de Atribución de Frecuencias (PNAF), priorizando el uso eficiente y los servicios de emergencia y seguridad.",
        details:
          "El Instituto Dominicano de las Telecomunicaciones (INDOTEL) gestiona el espectro radioeléctrico con base en la Ley General de Telecomunicaciones núm. 153-98, que declara el espectro un recurso de dominio público administrado por el Estado y dispone la elaboración del Plan Nacional de Atribución de Frecuencias (PNAF). El Reglamento General de Uso del Espectro Radioeléctrico, aprobado mediante Resolución núm. 034-2020 y sus modificaciones, desarrolla los principios de eficiencia, neutralidad tecnológica y no discriminación para la asignación de frecuencias, fija las modalidades de títulos habilitantes y regula el uso de bandas de uso libre, enlaces punto a punto y servicios de radiocomunicación. A través del PNAF, INDOTEL publica la atribución de bandas a servicios específicos y reserva segmentos para servicios públicos de emergencia, defensa y protección civil, asegurando que los sistemas de alerta temprana y seguridad nacional cuenten con recursos radioeléctricos suficientes.",
        tags: [
          "ley_153_98",
          "reglamento_uso_espectro_034_2020",
          "pnaf",
          "dominio_publico",
          "eficiencia",
          "servicios_emergencia",
        ],
      },
      "Competencia Económica": {
        summary:
          "El régimen de competencia en telecomunicaciones se apoya en la Ley 153-98, el Reglamento del Fondo de Desarrollo de las Telecomunicaciones (FDT) y normas como el Reglamento de Reventa de Servicios Públicos, que fomentan la entrada de nuevos prestadores y la expansión de cobertura.",
        details:
          "La Ley General de Telecomunicaciones núm. 153-98 establece la libre y leal competencia en la provisión de servicios públicos de telecomunicaciones y faculta a INDOTEL para prevenir prácticas anticompetitivas, regular el acceso a redes esenciales y velar por la interconexión. A través del Reglamento del Fondo de Desarrollo de las Telecomunicaciones (FDT), aprobado originalmente mediante Resolución núm. 023-10 y actualizado por la Resolución núm. 128-23, se financian proyectos de expansión de redes en zonas rurales y de bajo ingreso, lo que reduce barreras de entrada y refuerza la competencia en cobertura. Adicionalmente, el Reglamento de Reventa de los Servicios Públicos de Telecomunicaciones (Resolución núm. 116-2024) permite que terceros comercialicen servicios sobre redes de los operadores titulares bajo condiciones reguladas, abriendo espacio a nuevos modelos de negocio similares a los OMV y mejorando las opciones para los usuarios.",
        tags: [
          "ley_153_98",
          "fondo_desarrollo_telecom",
          "fdt",
          "res_023_10",
          "res_128_23",
          "reventa_servicios",
          "res_116_2024",
          "competencia",
        ],
      },
      "Ciberseguridad": {
        summary:
          "República Dominicana cuenta con una Estrategia Nacional de Ciberseguridad 2030 y una Comisión Nacional de Ciberseguridad que coordinan la protección de infraestructuras críticas, en la que las redes de telecomunicaciones reguladas por INDOTEL son un componente esencial.",
        details:
          "La Ley 153-98 exige a los prestadores de servicios públicos de telecomunicaciones proteger la integridad y confidencialidad de las comunicaciones y colaborar con las autoridades en caso de amenazas a la seguridad. Sobre esa base, el país adoptó en 2018 su primera Estrategia Nacional de Ciberseguridad (Decreto núm. 230-18) y en 2022 aprobó la Estrategia Nacional de Ciberseguridad 2030 (Decreto núm. 313-22), que crean la Comisión Nacional de Ciberseguridad (CNCS) y el Centro Nacional de Ciberseguridad para coordinar la gestión de incidentes a nivel nacional. Estas políticas establecen líneas de acción específicas para la protección de infraestructuras críticas, la gestión de incidentes en redes de telecomunicaciones, el desarrollo de capacidades de respuesta y la sensibilización de ciudadanos y empresas, en estrecha coordinación con INDOTEL y otros reguladores del sector financiero y energético.",
        tags: [
          "estrategia_nacional_ciberseguridad",
          "decreto_230_18",
          "decreto_313_22",
          "cncs",
          "centro_nacional_ciberseguridad",
          "infraestructura_critica",
          "gestion_incidentes",
        ],
      },
      "Protección del usuario": {
        summary:
          "INDOTEL aplica la Ley 153-98 y reglamentos específicos —como el Reglamento para la Solución de Controversias y el Reglamento General del Servicio Telefónico— para garantizar derechos de los usuarios, calidad de servicio y procedimientos formales de reclamo.",
        details:
          "La Ley General de Telecomunicaciones núm. 153-98 reconoce a los usuarios de servicios públicos de telecomunicaciones derechos como recibir un servicio de calidad, ser facturados de forma transparente y oportuna, y disponer de mecanismos administrativos eficaces para la solución de controversias. El Reglamento para la Solución de Controversias entre los Usuarios y las Prestadoras de los Servicios Públicos de Telecomunicaciones (Resolución núm. 124-05) estructura el proceso de reclamos, plazos de respuesta de las prestadoras y recursos ante INDOTEL. Complementariamente, el Reglamento General del Servicio Telefónico (Resolución núm. 110-12) detalla condiciones de contratación, suspensión y terminación del servicio, parámetros de calidad y obligaciones de información al usuario. INDOTEL realiza campañas de difusión de derechos, supervisa la atención de reclamos y puede imponer sanciones cuando los operadores incumplen las normas de protección al usuario.",
        tags: [
          "ley_153_98",
          "reglamento_controversias_124_05",
          "reglamento_servicio_telefonico_110_12",
          "derechos_usuarios",
          "reclamos",
          "calidad_servicio",
          "facturacion_transparente",
        ],
      },
      "Tecnologías emergentes": {
        summary:
          "El marco dominicano regula el servicio de acceso a Internet y habilita nuevas modalidades comerciales como la reventa de servicios y el roaming automático nacional, creando condiciones para servicios avanzados sobre redes de banda ancha.",
        details:
          "Además de la Ley 153-98, el Reglamento General del Servicio de Acceso a Internet (Resolución núm. 033-2020) define las condiciones técnicas y comerciales para la provisión de acceso a Internet fijo y móvil, incluyendo parámetros mínimos de calidad, gestión de tráfico y deberes de información. La normativa sobre roaming automático nacional (por ejemplo la Resolución núm. 070-2023) obliga a los operadores con cobertura nacional a ofrecer capacidad de red a otros prestadores para extender servicios de voz y datos en áreas donde estos no tienen infraestructura, facilitando la expansión de servicios avanzados. El Reglamento de Reventa de los Servicios Públicos de Telecomunicaciones permite, a su vez, que nuevos actores comercialicen paquetes convergentes apoyándose en la infraestructura de operadores establecidos. Estas herramientas, junto con las políticas de banda ancha y gobierno digital, crean un entorno regulatorio que favorece la introducción de tecnologías emergentes como IoT, 5G y servicios OTT.",
        tags: [
          "servicio_acceso_internet_033_2020",
          "roaming_automatico_nacional",
          "reventa_servicios",
          "banda_ancha",
          "iot",
          "5g",
          "ott",
          "innovacion_regulatoria",
        ],
      },
      "Compartición de la infraestructura": {
        summary:
          "La Ley 153-98 y resoluciones recientes de INDOTEL sobre despliegue en dominio público establecen principios para el uso compartido de infraestructura y la coordinación con los ayuntamientos en la instalación de torres, postes y ductos.",
        details:
          "La Ley General de Telecomunicaciones define las redes de telecomunicaciones como de interés público y otorga a los prestadores derechos de paso y uso de bienes del dominio público para el despliegue de infraestructura, sujetos a coordinación con las autoridades competentes. INDOTEL ha emitido resoluciones y lineamientos —como la Resolución núm. 145-2024, que recomienda la estandarización de los procesos administrativos para la instalación y desmontaje de infraestructura de telecomunicaciones en el dominio público— con el fin de reducir la dispersión de requisitos municipales y facilitar el despliegue ordenado de redes. El regulador también puede imponer obligaciones de compartición de infraestructura pasiva cuando ello sea necesario para promover la competencia y evitar duplicación ineficiente de obras civiles, asegurando que las condiciones económicas sean objetivas y no discriminatorias.",
        tags: [
          "ley_153_98",
          "derechos_de_paso",
          "dominio_publico",
          "res_145_2024",
          "infraestructura_pasiva",
          "comparticion",
          "coordinacion_municipal",
        ],
      },
      "Telecomunicaciones de emergencia": {
        summary:
          "República Dominicana cuenta con un Sistema de Información de Alertas regulado por INDOTEL y soportado en el Plan Nacional de Frecuencias, que utiliza redes de telecomunicaciones para difundir alertas tempranas y coordinar la respuesta ante emergencias.",
        details:
          "El régimen de espectro dominicano reserva bandas específicas para servicios de seguridad, defensa y protección civil, de modo que sistemas como radiocomunicaciones de emergencia, sirenas y enlaces de coordinación tengan prioridad y protección frente a interferencias. La Resolución núm. 110-2024 aprueba la Norma que regula el Sistema de Información de Alertas, que establece el marco técnico y operativo para el uso de redes de telecomunicaciones en la difusión de mensajes de alerta temprana a la población frente a fenómenos naturales u otras amenazas. Esta norma define roles y responsabilidades de INDOTEL, de los operadores de redes y de las autoridades de gestión de riesgos, así como procedimientos de activación, pruebas periódicas y coordinación con el Centro de Operaciones de Emergencias (COE). De esta forma, las telecomunicaciones se integran formalmente en el sistema nacional de gestión de riesgos y emergencias.",
        tags: [
          "sistema_informacion_alertas_110_2024",
          "pnaf",
          "numeros_emergencia",
          "coe",
          "alertas_tempranas",
          "servicios_prioritarios",
        ],
      },
      "Homologación de productos y dispositivos": {
        summary:
          "INDOTEL, con base en la Ley 153-98, exige la homologación de equipos y aparatos de telecomunicaciones antes de su comercialización, emitiendo certificados de homologación y coordinando con Aduanas el control de importaciones.",
        details:
          "La Ley General de Telecomunicaciones núm. 153-98 dedica un capítulo específico a la homologación de equipos y aparatos de telecomunicaciones, estableciendo que solo podrán conectarse a las redes públicas aquellos dispositivos que cuenten con certificado de homologación emitido por INDOTEL y cumplan con las normas técnicas aplicables. El regulador dispone de procedimientos formales para la 'Solicitud de expedición de certificado de homologación de equipos y aparatos', en los que los interesados presentan documentación, certificaciones de laboratorio y pruebas de conformidad. INDOTEL mantiene un registro de equipos homologados y coordina con la Dirección General de Aduanas medidas como la exigencia de cartas de no objeción para evitar la importación de equipos no certificados. Este esquema protege la integridad de las redes, previene interferencias y garantiza la seguridad de los usuarios.",
        tags: [
          "ley_153_98",
          "certificado_homologacion",
          "registro_equipos",
          "control_aduanero",
          "carta_no_objecion",
          "seguridad_red",
        ],
      },
    },
  },
  {
    id: "argentina",
    name: "Argentina",
    flag: "argentina.png",
    practices: {
      "Espectro radioeléctrico": {
        summary: "ENACOM gestiona el espectro mediante el Cuadro de Atribución de Bandas de Frecuencias (CABFRA), administración de bandas, modalidad compartida, asuntos satelitales, y el sistema Hertz de gestión del espectro radioeléctrico.",
        details: "El Ente Nacional de Comunicaciones (ENACOM) de Argentina gestiona el espectro radioeléctrico mediante el Cuadro de Atribución de Bandas de Frecuencias de la República Argentina (CABFRA), que establece la administración del espectro y las bandas disponibles. Se implementa modalidad compartida de espectro, se gestionan asuntos satelitales, y existe un Reglamento sobre Administración, Gestión y Control del Espectro Radioeléctrico. Se abordan problemas de interferencias, se regula a radioaficionados, estaciones repetidoras y señales distintivas especiales, y se utiliza el sistema Hertz para la gestión del espectro radioeléctrico.",
        tags: ["cabfra", "administracion_espectro", "modalidad_compartida", "satelital", "hertz", "interferencias"]
      },
      "Competencia Económica": {
        summary: "ENACOM monitorea la competencia mediante indicadores de mercado y establece normativa fundamental para el sector de TIC.",
        details: "Argentina cuenta con un marco regulatorio que promueve la competencia económica mediante el monitoreo de indicadores de mercado. Se establece normativa fundamental para las Tecnologías de la Información y Comunicación (TIC) y se implementa el servicio universal para garantizar acceso equitativo a los servicios de telecomunicaciones.",
        tags: ["indicadores_mercado", "normativa_fundamental", "servicio_universal", "competencia"]
      },
      "Ciberseguridad": {
        summary: "ENACOM promueve la ciberseguridad mediante conversatorios y actividades de concientización sobre seguridad digital.",
        details: "Argentina aborda la ciberseguridad mediante conversatorios organizados por ENACOM sobre temas de seguridad digital, promoviendo la concientización y el intercambio de conocimientos entre los actores del sector de telecomunicaciones.",
        tags: ["ciberseguridad", "conversatorios", "concientizacion"]
      },
      "Protección del usuario": {
        summary: "ENACOM protege a los usuarios mediante el Reglamento de Clientes de Servicios TIC, portabilidad numérica, programas de alfabetización digital, y mecanismos de atención y reclamos.",
        details: "Argentina cuenta con un marco robusto de protección al usuario que incluye el Reglamento de Clientes de los Servicios TIC, programas de alfabetización en medios y tecnologías de la información y comunicación, gestión del IMEI, el programa 'Tu Línea es Tuya', regulaciones sobre adquisición de equipos, portabilidad numérica, atención a usuarios y reclamos, consejos para usuarios, y el Programa Nacional de Prevención y Concientización del Grooming o Ciberacoso contra Niñas, Niños y Adolescentes.",
        tags: ["reglamento_clientes", "portabilidad", "alfabetizacion_digital", "imei", "reclamos", "grooming"]
      },
      "Tecnologías emergentes": {
        summary: "ENACOM regula tecnologías emergentes mediante el Reglamento del Servicio de Telecomunicaciones Fiables e Inteligentes (STeFI) y promueve la tecnología 5G.",
        details: "Argentina regula las tecnologías emergentes mediante el Reglamento General del Servicio de Telecomunicaciones Fiables e Inteligentes (STeFI), que establece el marco para servicios avanzados. Se promueve activamente la tecnología 5G mediante muestras y demostraciones, facilitando la adopción de nuevas tecnologías en el país.",
        tags: ["stefi", "5g", "tecnologias_inteligentes", "innovacion"]
      },
      "Compartición de la infraestructura": {
        summary: "ENACOM promueve la compartición de infraestructura pasiva, convenios de interconexión y acceso a redes.",
        details: "Argentina promueve la compartición de infraestructura mediante regulaciones sobre compartición de infraestructura pasiva, un buscador de convenios de interconexión que facilita la transparencia, y normativas sobre interconexión y acceso que garantizan condiciones equitativas para todos los operadores.",
        tags: ["infraestructura_pasiva", "convenios_interconexion", "interconexion", "acceso"]
      },
      "Telecomunicaciones de emergencia": {
        summary: "ENACOM coordina telecomunicaciones de emergencia mediante el Reglamento Nacional de Contingencia, programas de asistencia ante catástrofes, y convenios para localización de llamadas de emergencia.",
        details: "Argentina cuenta con un sistema robusto de telecomunicaciones de emergencia que incluye el Reglamento Nacional de Contingencia, el Programa de Asistencia a Prestadores de Servicios TIC ante emergencias y catástrofes, medidas de suspensión de cortes de servicios esenciales a clientes vulnerables por falta de pago, y un convenio entre ENACOM y el Ministerio de Seguridad para implementar el servicio gratuito de localización de llamadas de emergencia.",
        tags: ["reglamento_contingencia", "asistencia_catastrofes", "localizacion_emergencia", "servicios_esenciales"]
      },
      "Homologación de productos y dispositivos": {
        summary: "ENACOM administra la homologación de equipos mediante procesos de inscripción y seguimiento de novedades regulatorias.",
        details: "Argentina cuenta con un sistema de homologación de equipos de telecomunicaciones administrado por ENACOM, que incluye procesos de homologación de equipos, inscripción de equipos y procedimientos establecidos, y un sistema de novedades que mantiene actualizada la información sobre cambios regulatorios y nuevos requisitos.",
        tags: ["homologacion", "inscripcion_equipos", "procedimientos", "certificacion"]
      }
    }
  },
  {
    id: "chile",
    name: "Chile",
    flag: "chile.png",
    practices: {
      "Espectro radioeléctrico": {
        summary:
          "SUBTEL administra el espectro radioeléctrico como bien nacional de uso público conforme a la Ley General de Telecomunicaciones y al Plan General de Uso del Espectro Radioeléctrico, utilizando concursos y reordenamientos de bandas para servicios 4G y 5G.",
        details:
          "La Subsecretaría de Telecomunicaciones (SUBTEL), en el marco de la Ley N.º 18.168, es la autoridad encargada de aplicar y controlar la normativa sobre telecomunicaciones y de gestionar el espectro radioeléctrico como bien nacional de uso público. El Plan General de Uso del Espectro Radioeléctrico, aprobado originalmente por el Decreto Supremo N.º 127 de 2006 y actualizado en distintas oportunidades, define el cuadro de atribución de bandas, las condiciones técnicas y los usos permitidos para cada servicio. Sobre esta base, el Ministerio de Transportes y Telecomunicaciones y SUBTEL han impulsado procesos competitivos para licitar bandas bajas, medias y milimétricas destinadas a servicios móviles avanzados (IMT), incluyendo espectro para 4G y 5G, así como reordenamientos de bandas para mejorar la eficiencia y reducir interferencias. La política sectorial combina la planificación de largo plazo, la coordinación con la UIT y CITEL y mecanismos como la imposición de obligaciones de cobertura, de manera de alinear la gestión del espectro con objetivos de conectividad y desarrollo digital.",
        tags: [
          "ley_18168",
          "plan_general_uso_espectro",
          "pger",
          "espectro_bien_nacional",
          "subastas",
          "imt",
          "4g",
          "5g",
        ],
      },
      "Competencia Económica": {
        summary:
          "El marco competitivo se articula en torno a la Ley General de Telecomunicaciones, la portabilidad numérica y obligaciones de acceso mayorista y desagregación para operadores con más espectro o posición relevante.",
        details:
          "Chile consolidó un modelo de competencia en telecomunicaciones basado en la Ley General de Telecomunicaciones, que garantiza libertad de acceso a concesiones y separación entre funciones regulatorias y operativas. En este marco se han dictado normas que obligan a los concesionarios con mayores recursos de espectro a ofrecer facilidades mayoristas como roaming automático nacional y operación de OMV, bajo criterios objetivos y no discriminatorios, reforzando la entrada de nuevos operadores. La portabilidad numérica, regulada por la Ley N.º 20.471 y el Decreto N.º 379 de 2010, permite a los usuarios cambiar de empresa fija o móvil manteniendo su número, lo que ha generado un mercado muy dinámico. SUBTEL también ha impulsado medidas como el desbloqueo obligatorio de terminales móviles y la separación entre contratos de equipos y servicios, reduciendo los amarres comerciales y facilitando que la competencia se centre en precios, calidad y cobertura.",
        tags: [
          "ley_18168",
          "portabilidad_numerica",
          "ley_20471",
          "decreto_379_2010",
          "omv",
          "roaming_nacional",
          "desbloqueo_equipos",
          "competencia",
        ],
      },
      "Ciberseguridad": {
        summary:
          "Chile combina la Política Nacional de Ciberseguridad 2017–2022 con la nueva Ley Marco de Ciberseguridad N.º 21.663, que crea la Agencia Nacional de Ciberseguridad y refuerza los CSIRT sectoriales.",
        details:
          "Las redes de telecomunicaciones chilenas se consideran infraestructura crítica dentro de la Política Nacional de Ciberseguridad 2017–2022, que establece lineamientos para prevenir, detectar y responder a incidentes que afecten servicios esenciales y a los usuarios del ciberespacio. Sobre esta base, en 2024 se promulgó la Ley N.º 21.663, Ley Marco sobre Ciberseguridad e Infraestructura Crítica de la Información, que crea la Agencia Nacional de Ciberseguridad (ANCI), el Consejo Multisectorial de Ciberseguridad y el CSIRT Nacional, e introduce obligaciones graduales de gestión de riesgos, reporte de incidentes y adopción de estándares mínimos para organismos públicos y operadores de servicios esenciales, entre ellos las telecomunicaciones. SUBTEL participa en la coordinación de estos mecanismos y en la implementación de requisitos de seguridad en redes y servicios, alineando la supervisión sectorial con las políticas nacionales de ciberseguridad.",
        tags: [
          "politica_nacional_ciberseguridad_2017",
          "ley_21663",
          "anci",
          "csirt_nacional",
          "infraestructura_critica",
          "gestion_riesgos",
        ],
      },
      "Protección del usuario": {
        summary:
          "El régimen de protección al usuario se apoya en la Ley de Telecomunicaciones, la normativa de calidad de servicio e iniciativas como la Ley de Velocidad Mínima Garantizada, con fuerte coordinación con SERNAC.",
        details:
          "La protección de los usuarios de servicios de telecomunicaciones en Chile se basa en la Ley General de Telecomunicaciones y en un conjunto de reglamentos y leyes especiales que fijan estándares de calidad, transparencia y atención. SUBTEL ha impulsado reglamentos de calidad de servicio que fijan niveles mínimos obligatorios y crean indicadores comparables entre operadores, así como la Ley de Velocidad Mínima Garantizada de Acceso a Internet y su reglamento, que obligan a informar y cumplir velocidades mínimas y permiten a los usuarios medir su conexión mediante aplicaciones certificadas y exigir compensaciones cuando la calidad no se cumple. En coordinación con el Servicio Nacional del Consumidor (SERNAC), se vigilan cláusulas abusivas, prácticas comerciales engañosas y se exigen contratos claros, además de canales de reclamo accesibles. El desbloqueo obligatorio de equipos móviles y la consolidación de contratos independientes para servicio y terminal refuerzan el empoderamiento del usuario y reducen las barreras para cambiar de proveedor.",
        tags: [
          "calidad_servicio",
          "ley_velocidad_minima",
          "medicion_calidad_internet",
          "transparencia_ofertas",
          "sernac",
          "derechos_usuarios",
        ],
      },
      "Tecnologías emergentes": {
        summary:
          "SUBTEL utiliza planificación de espectro, pilotos y consultas públicas para introducir 5G, IoT y nuevos servicios digitales, priorizando la calidad y la competencia por innovación.",
        details:
          "Chile ha sido uno de los primeros países de la región en licitar bandas clave para 5G, combinando concursos de espectro con exigencias de cobertura y compromisos de inversión en zonas urbanas y rurales. SUBTEL utiliza el Plan General de Uso del Espectro y procesos de consulta pública para definir las condiciones técnicas y de competencia asociadas a nuevas bandas, y coordina con otros organismos la actualización de normas sobre velocidades mínimas, neutralidad de red y protección de datos. A través de pilotos y sandbox regulatorios limitados, se han probado casos de uso de 5G, Internet de las Cosas (IoT) y aplicaciones de ciudades inteligentes, evaluando su impacto sobre la calidad de servicio y la competencia. El regulador busca que la adopción de tecnologías emergentes se traduzca en más opciones y mejor calidad para los usuarios, evitando concentraciones excesivas de espectro o ventajas injustificadas.",
        tags: [
          "5g",
          "iot",
          "subastas_5g",
          "plan_general_uso_espectro",
          "ciudades_inteligentes",
          "sandboxes",
        ],
      },
      "Compartición de la infraestructura": {
        summary:
          "La normativa chilena exige compartición razonable de infraestructura y acceso a facilidades esenciales, en particular para torres, ductos y redes troncales, con tarifas orientadas a costos.",
        details:
          "La Ley General de Telecomunicaciones y su desarrollo reglamentario obligan a los concesionarios dominantes a permitir el acceso y uso de sus facilidades esenciales a otros operadores en condiciones objetivas, transparentes y no discriminatorias. Modificaciones recientes a la ley introdujeron disposiciones específicas para la compartición de infraestructura móvil y el acceso mayorista a redes, incluyendo obligaciones de ofrecer productos de referencia para operadores móviles virtuales y roaming automático nacional. SUBTEL ha regulado además aspectos como el despliegue de antenas y torres en zonas urbanas, buscando conciliar las necesidades de cobertura con criterios urbanísticos y ambientales. Los acuerdos de compartición permiten reducir duplicaciones de torres y obras civiles, facilitar la expansión de la banda ancha y mejorar la calidad del servicio, especialmente en zonas rurales o de difícil acceso.",
        tags: [
          "infraestructura_pasiva",
          "facilidades_esenciales",
          "roaming_nacional",
          "omv",
          "antenas",
          "tarifas_orientadas_a_costos",
        ],
      },
      "Telecomunicaciones de emergencia": {
        summary:
          "Chile opera el Sistema de Alerta de Emergencia (SAE) sobre redes móviles, coordinado por SENAPRED y SUBTEL, y utiliza números únicos y protocolos de continuidad para desastres.",
        details:
          "Dada su alta exposición a terremotos, tsunamis e incendios forestales, Chile ha desarrollado un Sistema de Alerta de Emergencia (SAE) que permite a SENAPRED enviar mensajes de alerta a los teléfonos móviles en áreas específicas mediante difusión celular. SUBTEL coordina con los operadores móviles la compatibilidad de los terminales, la configuración de canales de difusión y la ejecución de pruebas periódicas, de modo que los equipos comercializados en el país soporten el sistema sin costo adicional para los usuarios. Este esquema se complementa con números únicos de emergencia y obligaciones de continuidad de servicio y priorización de tráfico en situaciones de catástrofe. La normativa exige planes de contingencia, redundancia de red y protocolos de restablecimiento rápido, integrando las telecomunicaciones en la arquitectura nacional de gestión de riesgos y protección civil.",
        tags: [
          "sae",
          "sistema_alerta_emergencia",
          "senapred",
          "difusion_celular",
          "continuidad_servicio",
          "numeros_emergencia",
        ],
      },
      "Homologación de productos y dispositivos": {
        summary:
          "SUBTEL administra un sistema de homologación de equipos y terminales móviles, incluyendo requisitos especiales para compatibilidad con el SAE y desbloqueo de equipos.",
        details:
          "Chile exige que los equipos terminales que se conectan a redes públicas de telecomunicaciones cumplan requisitos técnicos y de seguridad definidos por SUBTEL antes de su comercialización. A través de procesos de homologación y certificación, se verifica la compatibilidad de los dispositivos con bandas de frecuencia autorizadas, normas de calidad y, en el caso de teléfonos móviles, con el Sistema de Alerta de Emergencia (SAE). Las resoluciones de SUBTEL también obligan a que los equipos se comercialicen desbloqueados o que puedan desbloquearse sin costo, reduciendo los amarres entre terminal y operador. La lista de equipos homologados y las condiciones para su venta se publican en canales oficiales, lo que permite a operadores y usuarios verificar si un dispositivo es apto para operar en las redes chilenas y recibir todas las funcionalidades de seguridad y emergencia.",
        tags: [
          "homologacion",
          "equipos_terminales",
          "sae",
          "desbloqueo_equipos",
          "lista_equipos_aprobados",
        ],
      },
    },
  },
  {
    id: "brasil",
    name: "Brasil",
    flag: "brasil.png",
    practices: {
      "Espectro radioeléctrico": {
        summary:
          "ANATEL administra el espectro conforme a la Lei Geral de Telecomunicações (LGT), al Regulamento de Uso do Espectro Radioelétrico y al Plan de Destinação de Faixas de Frequências, utilizando licitaciones como la subasta 5G con obligaciones de cobertura y compromisos sociales.",
        details:
          "La Agência Nacional de Telecomunicações (ANATEL) ejerce, en virtud de la Lei Geral de Telecomunicações (Lei nº 9.472/1997), la administración, fiscalización y planificación del uso del espectro radioeléctrico. El Regulamento de Uso do Espectro Radioelétrico y el Plano de Destinação de Faixas de Frequências definen las bandas atribuidas a cada servicio, las condiciones técnicas y los mecanismos de autorización. ANATEL utiliza procedimientos de licitación pública —como el edital de la subasta 5G de 2021— que combinan criterios de precio con obligaciones de cobertura regional, compromisos de expansión de backhaul de fibra y reserva de espectro para nuevos entrantes, garantizando un uso eficiente y competitivo del recurso.",
        tags: [
          "lgt",
          "lei_9472_1997",
          "regulamento_uso_espectro",
          "plano_destinacao_faixas",
          "subasta_5g_2021",
          "obligaciones_cobertura",
          "nuevos_operadores",
        ],
      },
      "Competencia Económica": {
        summary:
          "El régimen de competencia en telecomunicaciones se basa en la LGT y en el Plano Geral de Metas de Competição (PGMC), que identifica prestadores con poder de mercado significativo y les impone obligaciones mayoristas y de acceso a infraestructura.",
        details:
          "La LGT establece un régimen de competencia regulada en el sector de telecomunicaciones y atribuye a ANATEL, en coordinación con el Conselho Administrativo de Defesa Econômica (CADE), la tarea de prevenir la concentración indebida y las prácticas anticompetitivas. El Plano Geral de Metas de Competição (PGMC) identifica mercados relevantes y prestadores con Poder de Mercado Significativo (PMS), imponiéndoles obligaciones de oferta mayorista, transparencia de precios, no discriminación y acceso a facilidades esenciales —incluyendo infraestructura pasiva y enlaces de transporte—. La portabilidad numérica y reglas sobre ofertas minoristas complementan este marco, facilitando la movilidad de los usuarios entre operadores y la entrada de nuevos actores.",
        tags: [
          "lgt",
          "pgmc",
          "poder_mercado_significativo",
          "servicios_mayoristas",
          "facilidades_esenciales",
          "no_discriminacion",
          "portabilidad",
          "cade",
        ],
      },
      "Ciberseguridad": {
        summary:
          "La ciberseguridad y la protección de datos en redes de telecomunicaciones se apoyan en el Marco Civil da Internet y en la Lei Geral de Proteção de Dados (LGPD), complementados por regulaciones específicas de ANATEL.",
        details:
          "El Marco Civil da Internet (Lei nº 12.965/2014) consagra principios de protección de la privacidad, neutralidad de red y seguridad de los registros, imponiendo a los proveedores de conexión y aplicaciones deberes de guardar y proteger datos de tráfico bajo estándares de seguridad. La Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018) introduce obligaciones transversales de protección de datos, bases legales para el tratamiento, derechos de los titulares y deberes de notificación de incidentes de seguridad. Para las redes y servicios de telecomunicaciones, ANATEL incorpora estos principios en reglamentos y actos normativos específicos, coordinándose con la Autoridade Nacional de Proteção de Dados (ANPD) para la supervisión de incidentes y buenas prácticas de seguridad.",
        tags: [
          "marco_civil_internet",
          "lgpd",
          "proteccion_datos",
          "seguridad_registros",
          "incidentes",
          "anpd",
        ],
      },
      "Protección del usuario": {
        summary:
          "La protección del usuario de telecomunicaciones combina el Código de Defensa del Consumidor con el Reglamento General de Derechos del Consumidor de Servicios de Telecomunicaciones (RGC) de ANATEL.",
        details:
          "La protección de los usuarios en Brasil se apoya en el Código de Defesa do Consumidor (Lei nº 8.078/1990) y en el Regulamento Geral de Direitos do Consumidor de Serviços de Telecomunicações (RGC), aprobado por la Resolución nº 632/2014 de ANATEL. El RGC establece derechos como información clara sobre ofertas y contratos, cancelación sencilla de servicios, continuidad y calidad mínima, facturación adecuada, reglas para ofertas promocionales y mecanismos de atención y reparación. ANATEL opera canales de reclamo —central telefónica, portal y aplicación 'Anatel Consumidor'— y utiliza los indicadores de demanda de los usuarios para fiscalizar a las prestadoras, pudiendo imponer sanciones cuando se detectan prácticas abusivas o reincidencia en problemas de calidad y atención.",
        tags: [
          "cdc",
          "rgc_res_632_2014",
          "derechos_consumidor",
          "anatel_consumidor",
          "facturacion_clara",
          "atencion_reclamos",
        ],
      },
      "Tecnologías emergentes": {
        summary:
          "Brasil impulsa 4G, 5G e IoT mediante licitaciones con obligaciones de cobertura, licencias experimentales y medidas de fomento a dispositivos de Internet de las Cosas.",
        details:
          "ANATEL ha utilizado consultas públicas, licencias experimentales y condiciones específicas en los editais de licitación para fomentar la adopción de 4G y 5G, la expansión de redes de fibra óptica y el desarrollo de casos de uso de IoT. La subasta 5G de 2021 incluyó compromisos de cobertura de carreteras, escuelas y localidades rurales, así como obligaciones de despliegue de redes de transporte ópticas y backhaul. En paralelo, el marco legal para Internet de las Cosas redujo cargas tributarias sobre dispositivos de IoT de baja potencia, y los planes estratégicos de la agencia incorporan líneas de acción sobre innovación regulatoria —como sandboxes y entornos de prueba— y evaluación de impactos de nuevas tecnologías sobre competencia y protección de usuarios.",
        tags: [
          "4g",
          "5g",
          "iot",
          "licencias_experimentales",
          "consulta_publica",
          "sandbox",
          "plan_estrategico_anatel",
          "subasta_5g_2021",
        ],
      },
      "Compartición de la infraestructura": {
        summary:
          "La LGT, la Lei das Antenas y el PGMC promueven el uso compartido de infraestructura pasiva y el acceso a facilidades esenciales con tarifas orientadas a costos.",
        details:
          "El marco brasileño combina la LGT, la Lei das Antenas (Lei nº 13.116/2015) y el Plano Geral de Metas de Competição para promover el uso compartido de infraestructura pasiva y la racionalización de nuevas obras. La Lei das Antenas establece reglas generales para la instalación de estaciones radio base y soportes de antenas, determinando que los entes federativos deben observar criterios de razonabilidad en las licencias urbanas y fomentando el compartilhamento de torres, postes y ductos siempre que sea técnica y ambientalmente viable. El PGMC impone a prestadores con poder de mercado significativo obligaciones de oferta de facilidades esenciales y productos mayoristas de acceso a infraestructura y backhaul, con tarifas orientadas a costos y condiciones no discriminatorias.",
        tags: [
          "lgt",
          "lei_13116_2015",
          "lei_antenas",
          "compartilhamento_infraestrutura",
          "infraestructura_pasiva",
          "pgmc",
          "facilidades_esenciales",
        ],
      },
      "Telecomunicaciones de emergencia": {
        summary:
          "El Regulamento de Numeração de Serviços de Telecomunicações define los códigos de servicios de utilidad pública y números de emergencia, que deben ser gratuitos y accesibles desde cualquier red.",
        details:
          "El Regulamento de Numeração de Serviços de Telecomunicações, aprobado por resolución de ANATEL, define los códigos de servicios de utilidade pública (SUP) y números de emergencia como el 190 (policía), 192 (atención médica) y 193 (bomberos), que deben ser accesibles de forma gratuita desde cualquier terminal fijo o móvil, aun sin saldo. El regulador administra un sistema de gestión de recursos de numeración que garantiza la unicidad de códigos y la correcta encaminación de las llamadas hacia los centros de atención de emergencias. Las prestadoras están obligadas a priorizar el restablecimiento de estos servicios en situaciones de desastre y a cooperar con el poder público para facilitar la localización de llamadas y la difusión de mensajes masivos de alerta cuando así lo prevean los planes nacionales de protección y defensa civil.",
        tags: [
          "regulamento_numeracao",
          "sup",
          "numeros_emergencia",
          "gratuidade",
          "localizacion_llamadas",
          "prioridad_servicio",
        ],
      },
      "Homologación de productos y dispositivos": {
        summary:
          "ANATEL exige la evaluación de conformidad y homologación de productos para telecomunicaciones, mediante un proceso digital que reconoce ensayos de laboratorios acreditados y publica un catálogo de productos homologados.",
        details:
          "ANATEL regula la homologación de productos de telecomunicaciones mediante el Regulamento de Avaliação da Conformidade e de Homologação de Produtos para Telecomunicações, que establece las familias de equipos sujetas a certificación, los requisitos técnicos y los esquemas de ensayo. Fabricantes e importadores deben obtener un certificado de conformidad emitido por organismos de certificación acreditados y, posteriormente, la homologación de ANATEL antes de comercializar o conectar equipos a redes públicas. El proceso se gestiona íntegramente en línea a través del sistema MOSAICO, que permite el seguimiento del trámite y la consulta pública de los productos homologados, facilitando el control de mercado y la protección de los usuarios frente a equipos no conformes.",
        tags: [
          "homologacao",
          "avaliacao_conformidade",
          "laboratorios_acreditados",
          "mosaico",
          "lista_produtos",
        ],
      },
    },
  },
  {
    id: "bolivia",
    name: "Bolivia",
    flag: "bolivia.png",
    practices: {
      "Espectro radioeléctrico": {
        summary: "ATT administra el espectro conforme a la Ley 164, su Reglamento General, el Reglamento para el Otorgamiento de Licencias y el Plan Nacional de Frecuencias, cubriendo asignaciones, bandas de uso libre y servicios satelitales.",
        details: "La Autoridad de Regulación y Fiscalización de Telecomunicaciones y Transporte (ATT) administra el espectro radioeléctrico sobre la base de la Ley N.º 164 General de Telecomunicaciones, Tecnologías de Información y Comunicación, que declara el espectro recurso estratégico del Estado y dispone su uso conforme al Plan Nacional de Frecuencias. El Reglamento General a la Ley N.º 164 (DS N.º 1391) desarrolla los principios de administración, control y fiscalización del espectro y vincula su asignación a la planificación del sector. El Reglamento para el Otorgamiento de Licencias en Telecomunicaciones (RM MOPSV 323/2012) detalla las licencias para el uso de frecuencias —incluidas redes privadas, radioenlaces terrestres y satelitales—, los procedimientos de asignación directa o por concurso, los plazos de vigencia y los cargos por DAF y DUF. Modificaciones posteriores y el Reglamento para la Autorización de Prestadores de Servicio de Estación Espacial separan la autorización de estaciones espaciales del régimen de licencias de frecuencias, incorporando de forma específica los servicios satelitales. Este marco permite a la ATT gestionar bandas de uso libre, radiodifusión y servicios móviles de manera transparente y alineada con las recomendaciones de la UIT.",
        tags: [
          "ley_164",
          "reglamento_general_1391",
          "reglamento_licencias",
          "plan_nacional_frecuencias",
          "servicios_satelitales",
          "daf",
          "duf",
        ],
      },
      "Competencia Económica": {
        summary: "El marco de competencia se basa en la Ley 164, su Reglamento General y el Reglamento de Regulación Tarifaria, junto con la portabilidad numérica móvil administrada por la ATT.",
        details: "La Ley N.º 164 establece un régimen de libre y leal competencia en los servicios de telecomunicaciones, sujeto a regulación sectorial para evitar la concentración y los abusos de posición de dominio. El Reglamento General a la Ley N.º 164 desarrolla las obligaciones de los operadores en materia de interconexión, acceso a redes esenciales y oferta de servicios mayoristas en condiciones no discriminatorias. Complementariamente, el Reglamento del Régimen de Regulación Tarifaria de los Servicios Públicos de Telecomunicaciones y de TIC define los esquemas de tarifas tope, canastas y controles ex ante para mercados relevantes. En servicios móviles, la portabilidad numérica se implementa mediante normativa específica administrada por la ATT, con bases de datos centralizadas y plazos máximos para el cambio de operador, lo que fortalece la presión competitiva en el mercado.",
        tags: [
          "ley_164",
          "reglamento_general_1391",
          "regulacion_tarifaria",
          "interconexion",
          "servicios_mayoristas",
          "portabilidad_numerica",
        ],
      },
      "Ciberseguridad": {
        summary: "El marco de ciberseguridad se apoya en la Ley 164 y el Reglamento TIC, que regulan la protección de redes, la firma digital y la infraestructura de certificación electrónica.",
        details: "La Ley N.º 164 incorpora principios de inviolabilidad y confidencialidad de las comunicaciones, así como disposiciones sobre contenidos ilícitos y responsabilidades de los proveedores de servicios de telecomunicaciones y TIC. Sobre esta base, el Decreto Supremo N.º 1793 aprueba el Reglamento para el Acceso, Uso y Desarrollo de las Tecnologías de Información y Comunicación, que crea el marco para la infraestructura de firma digital en Bolivia y define a la ATT como autoridad competente para regular y supervisar a los proveedores de certificación. A través de este esquema de firma y certificados digitales se busca garantizar la autenticidad, integridad y no repudio de las transacciones electrónicas, fortaleciendo la seguridad de las aplicaciones públicas y privadas. La coordinación entre la ATT, el ministerio competente y otras entidades de seguridad permite articular medidas para la protección de infraestructuras críticas y la gestión de incidentes vinculados a redes de telecomunicaciones.",
        tags: [
          "ley_164",
          "reglamento_tic_1793",
          "firma_digital",
          "certificacion_digital",
          "infraestructura_critica",
        ],
      },
      "Protección del usuario": {
        summary: "La protección de usuarios se organiza alrededor de los derechos establecidos en la Ley 164 y su Reglamento General, complementados por normas sobre calidad, reclamos y acumulación de saldos y megas.",
        details: "La Ley N.º 164 reconoce a los usuarios derechos como el acceso universal y solidario, la continuidad y calidad de los servicios, la información transparente sobre tarifas y condiciones, y la posibilidad de elegir operador. El Reglamento General a la Ley desarrolla un título específico sobre derechos y obligaciones de los usuarios, estableciendo procedimientos de atención, plazos para la resolución de reclamos, compensaciones y reglas para la suspensión o corte de servicios. Mediante el Decreto Supremo N.º 4669 se modifican artículos del Reglamento General para obligar a los operadores móviles a acumular los saldos y volúmenes de datos no consumidos mientras el usuario mantenga activo su servicio, evitando la caducidad anticipada del crédito. La ATT aprueba además reglamentos y manuales de calidad de servicio y publica canales formales de reclamo y conciliación, lo que refuerza la tutela administrativa de los derechos de los consumidores de telecomunicaciones.",
        tags: [
          "derechos_usuarios",
          "calidad_servicio",
          "reclamos",
          "compensaciones",
          "acumulacion_saldos",
          "ley_164",
          "ds_4669",
        ],
      },
      "Tecnologías emergentes": {
        summary: "Bolivia utiliza la Ley 164 y el Reglamento TIC para habilitar servicios y aplicaciones digitales, incluyendo gobierno electrónico, firma digital y nuevas aplicaciones sobre redes de banda ancha.",
        details: "El desarrollo de tecnologías emergentes en Bolivia se enmarca en la Ley N.º 164, que define las telecomunicaciones y las TIC como servicios estratégicos para la inclusión social y el desarrollo productivo, y en el Reglamento para el Acceso, Uso y Desarrollo de las TIC aprobado por el Decreto Supremo N.º 1793. Este reglamento establece principios para la adopción de nuevas aplicaciones basadas en Internet, servicios en línea del Estado, gobierno electrónico y la masificación de soluciones digitales seguras mediante el uso de la firma digital. Sobre esta base, la ATT y otras entidades sectoriales pueden dictar normas técnicas y lineamientos para nuevas aplicaciones (IoT, servicios sobre 4G/5G, plataformas OTT), asegurando que se integren en el marco de protección de usuarios y seguridad de redes ya existente.",
        tags: [
          "tic",
          "gobierno_electronico",
          "firma_digital",
          "innovacion",
          "iot",
          "5g",
        ],
      },
      "Compartición de la infraestructura": {
        summary: "La Ley 164 y su Reglamento General obligan a los operadores a permitir interconexión y compartición de infraestructura esencial en condiciones no discriminatorias, complementadas por reglas sobre puntos de interconexión de tráfico de Internet.",
        details: "La Ley N.º 164 otorga a la ATT facultades para regular el acceso y uso de infraestructura de redes públicas, incluyendo postes, ductos y torres, y para imponer obligaciones de compartición cuando sea necesario para garantizar eficiencia y competencia. El Reglamento General a la Ley desarrolla disposiciones sobre interconexión, compartición de infraestructura y uso compartido de facilidades esenciales, definiendo principios de transparencia, no discriminación y tarifas basadas en costos. En materia de Internet, el Reglamento de las Telecomunicaciones y normas complementarias contemplan la existencia de Puntos de Interconexión de Tráfico (PIT) e instancias de intercambio de tráfico entre proveedores, lo que reduce costos y mejora la calidad de los servicios. A través de resoluciones específicas la ATT puede establecer condiciones técnicas y económicas para la compartición en zonas rurales o de alto costo.",
        tags: [
          "interconexion",
          "infraestructura_pasiva",
          "facilidades_esenciales",
          "pit",
          "zonas_rurales",
        ],
      },
      "Telecomunicaciones de emergencia": {
        summary: "El Reglamento de las Telecomunicaciones establece obligaciones para garantizar comunicaciones prioritarias y planes de contingencia en situaciones de emergencia y de desastre.",
        details: "El Reglamento de las Telecomunicaciones en Bolivia contiene un título específico sobre servicios de seguridad, emergencia y defensa, que obliga a los operadores a garantizar el acceso permanente a números de emergencia y a participar en los planes nacionales de contingencia. Entre otras disposiciones, se prevé la elaboración de un Plan de Servicios Nacionales de Emergencia y un Plan de Servicios de Comunicaciones Esenciales para asegurar la continuidad de las comunicaciones entre autoridades y organismos de respuesta ante desastres. Estas obligaciones se coordinan con el marco general de la Ley N.º 164 y su Reglamento General, que reconocen la importancia de las telecomunicaciones para la gestión de riesgos y la atención de desastres, y habilitan a la ATT a dictar disposiciones técnicas y operativas adicionales.",
        tags: [
          "numeros_emergencia",
          "plan_contingencia",
          "servicios_esenciales",
          "gestion_riesgos",
        ],
      },
      "Homologación de productos y dispositivos": {
        summary: "La ATT ejerce la función de homologar equipos de telecomunicaciones y TIC mediante instructivos específicos, registros de equipos y un listado público de dispositivos aprobados.",
        details: "La Ley N.º 164 asigna a la ATT la facultad de homologar los equipos y sistemas utilizados en redes y servicios de telecomunicaciones y TIC, a fin de garantizar que cumplan con requisitos técnicos y de seguridad. Sobre esta base, la ATT ha aprobado instructivos como el 'Instructivo para el registro y homologación de equipos de telecomunicaciones y TIC', que establece los procedimientos para la evaluación de conformidad, los requisitos documentales, los ensayos de laboratorio reconocidos y la vigencia de los certificados. La autoridad mantiene además un registro público y listados de equipos homologados, lo que permite a operadores e importadores verificar fácilmente qué dispositivos pueden utilizarse en redes bolivianas. Estas reglas se articulan con las definiciones de espectro y licencias del Reglamento General y del Reglamento para el Otorgamiento de Licencias, asegurando coherencia regulatoria.",
        tags: [
          "homologacion",
          "evaluacion_conformidad",
          "registro_equipos",
          "certificados",
          "ley_164",
        ],
      },
    },
  },
  {
    id: "colombia",
    name: "Colombia",
    flag: "colombia.png",
    practices: {
      "Espectro radioeléctrico": {
        summary:
          "La gestión del espectro se apoya en la Ley 1341 de 2009 y la Ley 1978 de 2019, con la Agencia Nacional del Espectro como administradora técnica y el uso de procesos competitivos para asignar bandas a servicios móviles y de banda ancha.",
        details:
          "El marco colombiano establece en la Ley 1341 de 2009 —modificada por la Ley 1978 de 2019— que el espectro radioeléctrico es un bien público inenajenable e imprescriptible administrado por el Estado. La Agencia Nacional del Espectro (ANE) es responsable de la planeación, atribución y control del espectro, mientras que el Ministerio TIC define políticas y la Comisión de Regulación de Comunicaciones (CRC) regula condiciones de prestación de servicios asociados. La asignación de bandas para servicios móviles y de banda ancha se realiza mediante procesos de selección objetiva y subastas, en los que se combinan criterios económicos con obligaciones de cobertura y compromisos de calidad, así como procesos de refarming y reordenamiento de bandas para habilitar tecnologías 4G y 5G.",
        tags: [
          "ley_1341_2009",
          "ley_1978_2019",
          "ane",
          "min_tic",
          "subastas",
          "refarming",
          "4g",
          "5g",
        ],
      },
      "Competencia Económica": {
        summary:
          "El régimen de competencia combina las facultades de la CRC y la Superintendencia de Industria y Comercio, incluyendo regulación ex ante, portabilidad numérica y obligaciones a operadores con posición dominante.",
        details:
          "La CRC cuenta con facultades para definir mercados relevantes de telecomunicaciones, analizar condiciones de competencia e imponer regulación ex ante a operadores con posición dominante, en coordinación con la Superintendencia de Industria y Comercio (SIC), autoridad general de competencia. El régimen colombiano contempla medidas como topes a las tarifas de interconexión, regulación de ofertas mayoristas, obligaciones de transparencia y la portabilidad numérica para servicios móviles y fijos, que facilita la migración de usuarios entre operadores. La Ley 1978 de 2019 refuerza la competencia al simplificar títulos habilitantes y permitir mayor flexibilidad para el despliegue de redes y la entrada de nuevos prestadores.",
        tags: [
          "crc",
          "sic",
          "regulacion_ex_ante",
          "portabilidad_numerica",
          "operador_dominante",
          "ofertas_mayoristas",
        ],
      },
      "Ciberseguridad": {
        summary:
          "Colombia cuenta con una Política Nacional de Seguridad Digital y estrategias de ciberseguridad que consideran las redes de telecomunicaciones como infraestructura crítica y definen lineamientos para la gestión de incidentes.",
        details:
          "La protección de las redes de telecomunicaciones en Colombia se enmarca en documentos de política como la Política Nacional de Seguridad Digital, que definen acciones para prevenir, detectar, responder y recuperarse frente a incidentes cibernéticos. Estas políticas reconocen a las redes y servicios de comunicaciones como infraestructuras críticas y promueven la creación y fortalecimiento de equipos de respuesta a incidentes (CSIRT) sectoriales y nacionales. Los operadores de telecomunicaciones deben colaborar con las autoridades competentes en la gestión de incidentes, implementar medidas de seguridad razonables y participar en ejercicios de simulación y programas de capacitación orientados a mejorar la resiliencia de la infraestructura.",
        tags: [
          "seguridad_digital",
          "ciberseguridad",
          "infraestructura_critica",
          "csirt",
          "gestion_incidentes",
        ],
      },
      "Protección del usuario": {
        summary:
          "La CRC administra el Régimen de Protección de los Derechos de los Usuarios de Servicios de Comunicaciones, que regula contratos, calidad, facturación, compensaciones y atención de quejas.",
        details:
          "El Régimen de Protección de los Derechos de los Usuarios de Servicios de Comunicaciones, adoptado por la CRC mediante resoluciones de carácter general, desarrolla los principios de transparencia, calidad y trato equitativo consagrados en la Ley 1341 y la Ley 1978. Este régimen regula el contenido mínimo de los contratos, la información que debe suministrarse antes y durante la relación contractual, los parámetros de calidad de servicio, las reglas de facturación y corte, y las condiciones en las que los usuarios pueden terminar sus contratos sin penalidades excesivas. También establece procedimientos y plazos para la atención de peticiones, quejas y recursos (PQR), y mecanismos de compensación automática o a solicitud cuando se verifican fallas en la prestación del servicio.",
        tags: [
          "regimen_proteccion_usuarios",
          "calidad_servicio",
          "facturacion",
          "pqr",
          "compensaciones",
        ],
      },
      "Tecnologías emergentes": {
        summary:
          "Colombia impulsa la adopción de banda ancha fija y móvil de alta velocidad y explora casos de uso de 5G e IoT mediante pilotos, proyectos de innovación y ajustes regulatorios graduales.",
        details:
          "Las políticas sectoriales lideradas por el Ministerio TIC y la CRC promueven el despliegue de redes de alta capacidad —como fibra óptica y 4G/5G— y la experimentación con nuevas tecnologías digitales. Se han realizado pilotos de 5G en ciudades principales y proyectos de innovación en servicios de Internet de las Cosas para sectores como transporte, agroindustria y ciudades inteligentes. La CRC utiliza consultas públicas y análisis de impacto regulatorio para ajustar gradualmente las reglas aplicables a servicios digitales emergentes, buscando un equilibrio entre promoción de la innovación, sostenibilidad de la inversión y protección de los derechos de los usuarios.",
        tags: [
          "banda_ancha",
          "5g",
          "iot",
          "pilotos",
          "analisis_impacto_regulatorio",
        ],
      },
      "Compartición de la infraestructura": {
        summary:
          "La regulación colombiana promueve el uso eficiente de la infraestructura existente mediante obligaciones de compartición de infraestructura pasiva, acuerdos de uso de postes y ductos y coordinación con autoridades territoriales.",
        details:
          "Tanto la Ley 1341 como la Ley 1978 y normas reglamentarias posteriores establecen que los prestadores de servicios de comunicaciones pueden hacer uso de bienes de uso público y de redes de servicios públicos existentes para desplegar infraestructura de telecomunicaciones, sujetos a condiciones de seguridad y planeación urbana. La CRC ha expedido regulación para facilitar la compartición de infraestructura pasiva —postes, ductos, cámaras— entre operadores y con otros sectores (por ejemplo, energía), promoviendo acuerdos de acceso y definiendo principios de no discriminación y tarifas basadas en criterios objetivos. Estas reglas buscan reducir costos de despliegue, minimizar el impacto urbano y acelerar la expansión de la cobertura de banda ancha.",
        tags: [
          "infraestructura_pasiva",
          "comparticion",
          "derechos_de_paso",
          "aprovechamiento_redes_existentes",
        ],
      },
      "Telecomunicaciones de emergencia": {
        summary:
          "Colombia cuenta con líneas únicas de atención de emergencias —como el 123— y con sistemas de alerta temprana que utilizan redes de telecomunicaciones para coordinar la respuesta ante desastres.",
        details:
          "En el marco del Sistema Nacional de Gestión del Riesgo de Desastres, las redes de telecomunicaciones son un insumo fundamental para la recepción de llamadas a los números de emergencia —como el 123— y la operación de sistemas de alerta temprana frente a fenómenos naturales y otras amenazas. Los operadores de servicios de comunicaciones deben garantizar el acceso gratuito a estos números, adoptar medidas de redundancia y planes de continuidad para asegurar su disponibilidad en situaciones críticas y coordinarse con las autoridades encargadas de la gestión del riesgo. Adicionalmente, se avanza en esquemas de mensajes de alerta a la población a través de SMS u otros canales móviles, lo que requiere coordinación regulatoria y técnica para asegurar una difusión rápida y masiva.",
        tags: [
          "linea_123",
          "sistema_gestion_riesgo",
          "alertas_tempranas",
          "gratuito",
          "continuidad_servicio",
        ],
      },
      "Homologación de productos y dispositivos": {
        summary:
          "El país exige la certificación y registro de equipos terminales y dispositivos que se conectan a redes de comunicaciones, reconociendo certificaciones internacionales y gestionando bases de datos de identificación de equipos.",
        details:
          "Las autoridades sectoriales colombianas requieren que los equipos terminales y otros dispositivos que se conectan a redes de comunicaciones cumplan requisitos técnicos y de seguridad antes de su comercialización y activación. Se reconoce la validez de determinadas certificaciones internacionales y se establecen procedimientos para el registro de equipos, incluyendo la gestión de bases de datos de identificación de terminales móviles (como los IMEI) para combatir el hurto de dispositivos y el uso de terminales no homologados. Estos mecanismos se articulan con los regímenes de protección de usuarios y de gestión del espectro, de forma que solo equipos conformes tengan acceso a las redes públicas.",
        tags: [
          "homologacion",
          "certificacion_internacional",
          "registro_equipos",
          "imei",
        ],
      },
    },
  },
  {
    id: "ecuador",
    name: "Ecuador",
    flag: "ecuador.png",
    practices: {
      "Espectro radioeléctrico": {
        summary: "ARCOTEL administra el espectro como recurso estratégico del Estado conforme a la Ley Orgánica de Telecomunicaciones, su Reglamento General y el Plan Nacional de Frecuencias.",
        details: "La Ley Orgánica de Telecomunicaciones (LOT), publicada en el Registro Oficial Suplemento 439 de febrero de 2015, declara al espectro radioeléctrico recurso de propiedad del Estado y encarga su administración y control a la Agencia de Regulación y Control de las Telecomunicaciones (ARCOTEL). La LOT y su Reglamento General, expedido mediante Decreto Ejecutivo 864, establecen que la asignación de frecuencias debe realizarse con criterios de eficiencia, transparencia y promoción de la competencia, a través de títulos habilitantes como concesiones y permisos. ARCOTEL mantiene y actualiza el Plan Nacional de Frecuencias y el Cuadro Nacional de Atribución de Frecuencias, accesibles mediante aplicaciones de consulta pública que detallan las bandas, servicios atribuidos y condiciones técnicas. Este marco permite ordenar el uso del espectro para servicios móviles, radiodifusión, enlaces de microondas y servicios satelitales, alineando la planificación nacional con las recomendaciones de la UIT.",
        tags: [
          "ley_organica_telecom",
          "reglamento_general",
          "plan_nacional_frecuencias",
          "cuadro_atribucion_frecuencias",
          "arcotel",
        ],
      },
      "Competencia Económica": {
        summary: "El régimen de competencia se fundamenta en la LOT y su Reglamento General, que regulan acceso, interconexión, servicios mayoristas y portabilidad numérica para evitar concentración de mercado.",
        details: "La Ley Orgánica de Telecomunicaciones define principios de libre y leal competencia en el sector y faculta a ARCOTEL para regular mercados relevantes, imponer obligaciones de acceso y supervisar conductas anticompetitivas de los operadores con poder de mercado. La ley y su Reglamento General regulan la interconexión de redes, el acceso a infraestructuras esenciales y la oferta de servicios mayoristas, así como las obligaciones de transparencia en las tarifas y condiciones comerciales. El marco contempla además la portabilidad numérica como herramienta para facilitar la movilidad de los usuarios entre operadores fijos y móviles, reforzando la disciplina competitiva. En coordinación con la autoridad nacional de competencia, ARCOTEL puede emitir regulaciones específicas, imponer medidas correctivas y condicionar procesos de concentración económica en el sector.",
        tags: [
          "ley_organica_telecom",
          "interconexion",
          "servicios_mayoristas",
          "portabilidad_numerica",
          "poder_significativo_mercado",
        ],
      },
      "Ciberseguridad": {
        summary: "El marco de ciberseguridad se apoya en la LOT, que garantiza la inviolabilidad de las comunicaciones, y en políticas e instituciones de ciberseguridad que coordinan la gestión de incidentes.",
        details: "La Ley Orgánica de Telecomunicaciones consagra la inviolabilidad y el secreto de las comunicaciones, establece deberes de confidencialidad para los operadores y regula las condiciones bajo las cuales las autoridades pueden acceder excepcionalmente a los datos de tráfico. Sobre esta base, Ecuador ha desarrollado capacidades institucionales de ciberseguridad —incluidos equipos de respuesta a incidentes y CSIRT sectoriales— que coordinan con ARCOTEL y otros organismos del Estado para la gestión de incidentes que involucren redes de telecomunicaciones. Las políticas públicas en materia de seguridad de la información y ciberdefensa incluyen lineamientos para proteger infraestructuras críticas, gestionar vulnerabilidades y promover campañas de sensibilización a usuarios y operadores. Aunque gran parte de estas directrices se articulan fuera de la LOT, su implementación depende en buena medida de las redes y servicios regulados por ARCOTEL.",
        tags: [
          "inviolabilidad_comunicaciones",
          "csirt",
          "infraestructura_critica",
          "politica_ciberseguridad",
        ],
      },
      "Protección del usuario": {
        summary: "ARCOTEL aplica la LOT para garantizar los derechos de los usuarios, como información transparente, calidad, compensaciones, portabilidad numérica y atención eficaz de reclamos.",
        details: "El artículo 22 de la Ley Orgánica de Telecomunicaciones enumera los derechos de los usuarios, entre ellos recibir servicios de calidad continua, acceder a información clara y suficiente sobre tarifas y condiciones, no ser objeto de facturación indebida ni redondeo hacia arriba, y mantener la confidencialidad de sus comunicaciones y datos personales. La LOT reconoce también el derecho a la portabilidad numérica y al acceso gratuito a servicios de emergencia. ARCOTEL desarrolla estos principios a través de regulaciones específicas y campañas de difusión de derechos de los usuarios, así como mediante mecanismos de atención y tramitación de reclamos que incluyen plazos perentorios, etapas de respuesta del operador y la posibilidad de elevar quejas al regulador. El regulador realiza además actividades de capacitación dirigidas a organizaciones de consumidores para fortalecer el conocimiento de sus derechos y obligaciones.",
        tags: [
          "derechos_usuarios",
          "facturacion_correcta",
          "calidad_servicio",
          "reclamos",
          "portabilidad_numerica",
          "proteccion_datos",
        ],
      },
      "Tecnologías emergentes": {
        summary: "La LOT orienta la expansión de redes de banda ancha de alta velocidad y servicios avanzados, y ARCOTEL ajusta su regulación y planificación de espectro para habilitar tecnologías como 4G/5G e IoT.",
        details: "La Ley Orgánica de Telecomunicaciones define como objetivo la masificación de redes y servicios de banda ancha de alta velocidad, de manera que soporten aplicaciones avanzadas y nuevos modelos de negocio digitales. En cumplimiento de estos objetivos, ARCOTEL actualiza periódicamente el Plan Nacional de Frecuencias y el marco regulatorio para habilitar el uso de bandas identificadas internacionalmente para servicios IMT, incluyendo tecnologías 4G y 5G. El Plan Regulatorio Institucional de ARCOTEL incorpora acciones para revisar habilitaciones, condiciones técnicas y obligaciones asociadas a servicios convergentes, aplicaciones de IoT y servicios OTT, de modo que el marco siga siendo neutral tecnológicamente pero apto para la innovación. Estas iniciativas se coordinan con políticas sectoriales de transformación digital impulsadas por el ministerio rector.",
        tags: [
          "banda_ancha",
          "4g",
          "5g",
          "iot",
          "ott",
          "neutralidad_tecnologica",
        ],
      },
      "Compartición de la infraestructura": {
        summary: "El Reglamento General a la LOT obliga a los operadores a permitir el uso compartido de infraestructura pasiva y ductos en condiciones de no discriminación, con cargos basados en costos.",
        details: "Los artículos 97 a 99 del Reglamento General a la Ley Orgánica de Telecomunicaciones regulan la compartición de infraestructura y el uso compartido de facilidades esenciales. Los operadores que dispongan de infraestructura pasiva —como postes, ductos, torres o cámaras— deben permitir el acceso a otros prestadores en condiciones objetivas, transparentes y no discriminatorias, aplicando tarifas basadas en costos eficientes. El reglamento aclara que la compartición no supone la cesión de la propiedad de la infraestructura, sino la habilitación de su uso para facilitar el despliegue de redes y reducir barreras de entrada, especialmente para nuevos prestadores o en zonas de alto costo. ARCOTEL puede emitir resoluciones específicas para fijar metodologías de costos, condiciones técnicas y plazos de respuesta a las solicitudes de compartición.",
        tags: [
          "infraestructura_pasiva",
          "facilidades_esenciales",
          "tarifas_basadas_en_costos",
          "no_discriminacion",
          "nuevos_prestadores",
        ],
      },
      "Telecomunicaciones de emergencia": {
        summary: "Ecuador cuenta con el Servicio Integrado de Seguridad ECU 911, que opera la línea única 911 y una red multi-tecnología para coordinar la respuesta ante emergencias.",
        details: "El sistema ECU 911, creado como Servicio Integrado de Seguridad, articula a las instituciones de respuesta de emergencia mediante una plataforma única que concentra llamadas al número 911, video vigilancia, sensores y sistemas de radio y datos. La red del ECU 911 combina enlaces de fibra óptica, radioenlaces de microondas, redes troncales de radio y conectividad satelital para garantizar redundancia y disponibilidad en todo el territorio, incluso en zonas rurales y de difícil acceso. Este sistema se apoya en la infraestructura y servicios regulados por la LOT y la supervisión de ARCOTEL, que autoriza el uso de frecuencias y redes necesarias para las comunicaciones de emergencia. Mediante pruebas periódicas de sirenas y protocolos de alerta temprana, el ECU 911 verifica la operación coordinada del sistema y la interoperabilidad con redes de telecomunicaciones comerciales.",
        tags: [
          "ecu_911",
          "numero_911",
          "fibra_optica",
          "radioenlaces",
          "satelital",
          "alertas_tempranas",
        ],
      },
      "Homologación de productos y dispositivos": {
        summary: "ARCOTEL administra un régimen de homologación de equipos terminales y de telecomunicaciones, basado en normas técnicas y en el reconocimiento de certificaciones y ensayos internacionales.",
        details: "La Ley Orgánica de Telecomunicaciones faculta a ARCOTEL para homologar equipos, dispositivos y aparatos que se conectan a redes públicas de telecomunicaciones, con el fin de evitar interferencias, daños a la red y riesgos a la seguridad de los usuarios. En desarrollo de esta facultad, ARCOTEL publica listados de equipos homologados y requisitos técnicos que incluyen compatibilidad electromagnética, límites de potencia y cumplimiento de normas internacionales como las recomendaciones de la UIT y estándares de organismos de certificación reconocidos. La entidad también realiza campañas de difusión sobre la importancia de adquirir equipos homologados y ha incorporado procedimientos más ágiles para el reconocimiento de certificaciones de otros países, reduciendo tiempos y costos para fabricantes e importadores. De esta manera, la homologación se integra con las políticas de espectro y de protección al usuario, garantizando que sólo equipos conformes ingresen al mercado.",
        tags: [
          "homologacion",
          "equipos_terminales",
          "reconocimiento_internacional",
          "lista_equipos",
          "seguridad_red",
        ],
      },
    },
  },
  {
    id: "mexico",
    name: "México",
    flag: "mexico.png",
    practices: {
      "Espectro radioeléctrico": {
        summary:
          "El IFT administra el espectro con base en la Constitución, la Ley Federal de Telecomunicaciones y Radiodifusión y el Cuadro Nacional de Atribución de Frecuencias (CNAF), utilizando licitaciones y procesos de refarming para liberar bandas para servicios móviles de nueva generación.",
        details:
          "El Instituto Federal de Telecomunicaciones (IFT), creado por la reforma constitucional en materia de telecomunicaciones de 2013, es el órgano autónomo responsable de la administración, regulación y vigilancia del uso del espectro radioeléctrico en México. La Ley Federal de Telecomunicaciones y Radiodifusión (LFTR) desarrolla este mandato y dispone la elaboración y actualización del Cuadro Nacional de Atribución de Frecuencias (CNAF), que define las bandas y servicios atribuidos, así como sus condiciones técnicas. El IFT utiliza procedimientos de licitación pública para asignar bloques de espectro para servicios móviles y de banda ancha, incorporando obligaciones de cobertura y criterios de maximización del beneficio social. Adicionalmente, implementa procesos de refarming para reorganizar bandas como 800 MHz, 1.9 GHz, 2.5 GHz y otras identificadas para IMT, con el fin de habilitar servicios 4G y 5G y aumentar la eficiencia en el uso del recurso.",
        tags: [
          "reforma_constitucional_2013",
          "lftr",
          "cnaf",
          "licitaciones",
          "refarming",
          "4g",
          "5g",
        ],
      },
      "Competencia Económica": {
        summary:
          "El marco de competencia en telecomunicaciones combina la LFTR con facultades específicas del IFT para imponer regulación asimétrica al agente económico preponderante, regular servicios mayoristas y supervisar portabilidad numérica.",
        details:
          "La LFTR reconoce al IFT como autoridad en materia de competencia económica para los sectores de telecomunicaciones y radiodifusión, con facultades para definir mercados relevantes, determinar agentes económicos preponderantes u operadores con poder sustancial de mercado, e imponer medidas asimétricas. En el segmento móvil, el IFT ha establecido obligaciones de desagregación de redes, ofertas de referencia y límites a las tarifas de interconexión para el agente preponderante, fomentando la competencia en precios y calidad. La portabilidad numérica fija y móvil, regulada por lineamientos del Instituto, facilita la migración de usuarios entre operadores al mantener su número telefónico, lo que aumenta la presión competitiva. El IFT coordina con la Comisión Federal de Competencia Económica (COFECE) en operaciones de concentración que involucren otros mercados vinculados.",
        tags: [
          "lftr",
          "ift_autoridad_competencia",
          "agente_preponderante",
          "regulacion_asimetrica",
          "ofertas_referencia",
          "interconexion",
          "portabilidad_numerica",
          "cofece",
        ],
      },
      "Ciberseguridad": {
        summary:
          "La ciberseguridad en redes de telecomunicaciones se articula a través de políticas nacionales de seguridad digital y disposiciones de la LFTR sobre continuidad, integridad y confidencialidad de las comunicaciones, en coordinación con el IFT.",
        details:
          "El marco mexicano de ciberseguridad descansa en estrategias de seguridad de la información y de seguridad nacional que consideran a las redes de telecomunicaciones como infraestructura crítica. La LFTR establece obligaciones para los concesionarios y autorizados en materia de continuidad, integridad y confidencialidad de las comunicaciones, así como reglas para la conservación de datos de tráfico y cooperación con autoridades competentes. A partir de estas bases, el gobierno federal ha adoptado lineamientos y políticas de seguridad digital que incluyen la gestión de incidentes cibernéticos, el fortalecimiento de capacidades de respuesta (CERT/CSIRT) y la protección de infraestructuras críticas, en coordinación con el IFT y otras dependencias. El regulador incorpora gradualmente criterios de seguridad y resiliencia en la regulación de redes de nueva generación y en la supervisión de servicios de interconexión y transmisión.",
        tags: [
          "lftr",
          "seguridad_redes",
          "infraestructura_critica",
          "csirt",
          "continuidad_servicio",
          "datos_trafico",
        ],
      },
      "Protección del usuario": {
        summary:
          "La protección de los usuarios de telecomunicaciones se basa en la LFTR, la Ley Federal de Protección al Consumidor y las disposiciones del IFT sobre derechos de los usuarios, contratos de adhesión, calidad y transparencia tarifaria.",
        details:
          "Los derechos de los usuarios de servicios de telecomunicaciones están reconocidos tanto en la LFTR como en la Ley Federal de Protección al Consumidor, y se desarrollan en disposiciones y lineamientos emitidos por el IFT y la Procuraduría Federal del Consumidor (PROFECO). Estos instrumentos cubren aspectos como la información clara y veraz sobre tarifas y condiciones, la no discriminación, la entrega de contratos de adhesión registrados, la posibilidad de cancelar servicios sin penalizaciones indebidas, la bonificación por fallas en el servicio y la calidad mínima de servicios de voz y datos. El portal ‘Soy Usuario’, operado conjuntamente por el IFT y PROFECO, funciona como una ventanilla electrónica para presentar quejas y dar seguimiento a su atención por parte de los operadores, reforzando los mecanismos de resolución de controversias.",
        tags: [
          "lftr",
          "ley_proteccion_consumidor",
          "derechos_usuarios",
          "contratos_adhesion",
          "transparencia_tarifaria",
          "soy_usuario",
          "profeco",
        ],
      },
      "Tecnologías emergentes": {
        summary:
          "México impulsa tecnologías emergentes como 5G e IoT mediante licitaciones de espectro, pruebas piloto, consultas públicas y esquemas de colaboración con la industria y la academia.",
        details:
          "El IFT ha desarrollado una agenda para la introducción de 5G y otras tecnologías emergentes que incluye la identificación de bandas medias y milimétricas, la realización de consultas públicas sobre el uso de espectro, y la autorización de pruebas piloto y demostraciones tecnológicas. En paralelo, se promueven aplicaciones de Internet de las Cosas en sectores como transporte, energía y ciudades inteligentes, aprovechando bandas de uso libre y segmentos específicos del espectro. La coordinación con programas de innovación y emprendimiento del gobierno federal y con la academia permite explorar casos de uso y modelos de negocio, mientras que la LFTR proporciona el marco para adaptar las condiciones de autorización, calidad y protección de usuarios a estas nuevas tecnologías.",
        tags: [
          "5g",
          "iot",
          "pruebas_piloto",
          "consultas_publicas",
          "bandas_milimetricas",
          "innovacion",
        ],
      },
      "Compartición de la infraestructura": {
        summary:
          "La LFTR y las disposiciones del IFT promueven la compartición de infraestructura pasiva y el acceso mayorista, incluyendo obligaciones especiales para el agente preponderante y mecanismos como la Red Compartida mayorista.",
        details:
          "El marco mexicano exige a los concesionarios permitir la interconexión y el acceso a infraestructura esencial en condiciones no discriminatorias y con tarifas orientadas a costos. El IFT ha impuesto al agente económico preponderante en telecomunicaciones obligaciones específicas de compartición de infraestructura pasiva y desagregación de la red local, estableciendo ofertas de referencia y metodologías de costos para servicios mayoristas de tráfico, enlaces dedicados y acceso a sitios. Adicionalmente, la creación de una red compartida mayorista en la banda de 700 MHz, operada por un concesionario mayorista independiente, ha introducido un modelo de infraestructura abierta que permite a operadores móviles virtuales y prestadores regionales acceder a capacidad sin desplegar una red propia de acceso radioeléctrico.",
        tags: [
          "infraestructura_pasiva",
          "acceso_mayorista",
          "agente_preponderante",
          "red_compartida",
          "ofertas_referencia",
          "interconexion",
        ],
      },
      "Telecomunicaciones de emergencia": {
        summary:
          "México cuenta con el número único 911 para emergencias y con obligaciones regulatorias para garantizar el acceso gratuito, la continuidad y la localización de las llamadas desde redes fijas y móviles.",
        details:
          "La LFTR establece la obligación de que los concesionarios de servicios de telecomunicaciones cursen de manera gratuita las llamadas al número único de emergencias 911 y otros números de servicios de seguridad y protección civil. Lineamientos específicos emitidos por el IFT regulan aspectos como la disponibilidad permanente del 911, la priorización del tráfico en situaciones de contingencia, la compatibilidad entre redes fijas y móviles y la provisión de información de localización del usuario a las autoridades competentes, con el fin de facilitar la atención oportuna. El número 089 para denuncias anónimas y otros servicios de emergencia también forman parte del sistema nacional, que se coordina con los centros de atención de llamadas estatales y municipales.",
        tags: [
          "lftr",
          "911",
          "089",
          "servicios_emergencia",
          "gratuito",
          "localizacion_llamadas",
        ],
      },
      "Homologación de productos y dispositivos": {
        summary:
          "El IFT exige la homologación de equipos terminales y de radiocomunicación, con procedimientos digitalizados y reconocimiento de certificaciones de conformidad emitidas por organismos acreditados.",
        details:
          "Antes de que un equipo terminal de telecomunicaciones o aparato de radiocomunicación pueda comercializarse o conectarse a redes públicas en México, debe cumplir con las disposiciones técnicas aplicables y obtener la homologación del IFT. El instituto publica catálogos de normas y disposiciones técnicas que establecen parámetros de seguridad, compatibilidad electromagnética y uso adecuado del espectro. Los solicitantes presentan certificados de conformidad emitidos por organismos de certificación y laboratorios de prueba acreditados, y tramitan en línea la obtención del certificado de homologación. El IFT mantiene un registro público de equipos homologados y coordina con autoridades aduaneras y de verificación para evitar la importación y uso de equipos no conformes.",
        tags: [
          "homologacion",
          "disposiciones_tecnicas",
          "certificacion_conformidad",
          "laboratorios_acreditados",
          "registro_equipos",
        ],
      },
    },
  },
  {
    id: "panama",
    name: "Panamá",
    flag: "🇵🇦",
    practices: {
      "Espectro radioeléctrico": {
        summary:
          "ASEP administra el espectro radioeléctrico mediante el Plan Nacional de Atribución de Frecuencias (PNAF) y procesos competitivos como la Licitación Pública No. 01-2023-TELCO para servicios móviles.",
        details:
          "La Autoridad Nacional de los Servicios Públicos (ASEP), en el marco de la Ley 31 de 1996 sobre regulación de las telecomunicaciones, es responsable de la planificación, asignación y control del espectro radioeléctrico. El Plan Nacional de Atribución de Frecuencias (PNAF), adoptado originalmente por la Resolución JD-107 de 1997 y actualizado de forma periódica, define la atribución de bandas a cada servicio y establece cánones anuales por el uso de frecuencias. La ASEP abre ventanas específicas durante el año para tramitar nuevas concesiones o cambios de parámetros técnicos y utiliza procedimientos de licitación pública, como la Licitación No. 01-2023-TELCO para el servicio PCS y la adquisición de activos de DIGICEL, con el objetivo de incorporar un nuevo operador y preservar la competencia. En 2025, la actualización del PNAF mediante la Resolución AN 20335-Telco puso a disposición del mercado cerca de 490 MHz adicionales para servicios IMT, favoreciendo el despliegue de redes 4G y 5G y la ampliación de la banda ancha móvil.",
        tags: [
          "ley_31_1996",
          "pnaf",
          "res_jd_107_1997",
          "licitacion_01_2023_telco",
          "imt",
          "5g",
        ],
      },
      "Competencia Económica": {
        summary:
          "El régimen de competencia se basa en la Ley 31 de 1996 y en la portabilidad numérica, que desde 2011 permite cambiar de operador fijo o móvil conservando el número telefónico.",
        details:
          "La Ley 31 de 1996 regula los servicios públicos de telecomunicaciones con el propósito de modernizar la red, atraer inversión privada, extender la cobertura y promover tarifas justas bajo condiciones de competencia leal. Sobre esta base la ASEP dicta reglamentos y resoluciones que fijan derechos y obligaciones de los concesionarios, fiscaliza el cumplimiento de las concesiones y puede sancionar conductas contrarias a la libre competencia. Un instrumento central es la Portabilidad Numérica, operativa desde 2011 bajo el modelo de 'All Call Query', que permite a los usuarios de telefonía fija y móvil cambiar de operador sin perder su número. Según los reportes de la ASEP y de la prensa especializada, en poco más de una década se han acumulado alrededor de cinco millones de portaciones, cifra que refleja un mercado dinámico donde los operadores deben competir en calidad y precio para retener a sus clientes. La autoridad utiliza además procesos de licitación de espectro y la eventual entrada de un tercer operador móvil como palancas adicionales para fortalecer la competencia.",
        tags: [
          "ley_31_1996",
          "portabilidad_numerica",
          "all_call_query",
          "competencia",
          "regulacion_ex_ante",
        ],
      },
      "Ciberseguridad": {
        summary:
          "Panamá articula su política de ciberseguridad en torno al CSIRT Panamá, operado por la Autoridad Nacional para la Innovación Gubernamental, y a una Estrategia Nacional de Ciberseguridad enfocada en la protección de infraestructuras críticas y servicios digitales públicos.",
        details:
          "CSIRT Panamá, gestionado por la Autoridad Nacional para la Innovación Gubernamental (AIG), actúa como equipo nacional de respuesta a incidentes de seguridad de la información. Entre sus funciones están prevenir, identificar, analizar y coordinar la resolución de incidentes que afecten a la infraestructura crítica del país y a los sistemas de las entidades gubernamentales, además de publicar alertas técnicas para operadores y ciudadanía. El equipo impulsa campañas de concienciación como el Mes de la Ciberseguridad bajo el lema 'Tu Mundo Digital, en Modo Seguro', así como seminarios y jornadas de capacitación dirigidos a servidores públicos y usuarios finales. Estas acciones se enmarcan en una Estrategia Nacional de Ciberseguridad que busca elevar los niveles de seguridad en los recursos y sistemas vinculados a las tecnologías de información y comunicación, fortalecer la resiliencia del Estado frente a amenazas digitales y promover buenas prácticas en el uso de las TIC.",
        tags: [
          "csirt_panama",
          "aig",
          "estrategia_ciberseguridad",
          "infraestructura_critica",
          "campanas_concientizacion",
        ],
      },
      "Protección del usuario": {
        summary:
          "ASEP combina la Ley 31 de 1996 con normas específicas para el Servicio Internet para Uso Público (No. 211), que fijan metas de calidad, metodologías de medición y mecanismos de reclamo a través de la Dirección Nacional de Atención al Usuario (DNAU).",
        details:
          "En materia de protección al usuario, la ASEP aplica los principios de la Ley 31 de 1996 junto con reglamentos sectoriales para servicios específicos. La Resolución AN 10130-Telco de 2016 aprobó las Normas para la Prestación del Servicio Internet para Uso Público (No. 211) y la Resolución AN 11370-Telco de 2017 las modificó y añadió un Reglamento para el control y fiscalización del cumplimiento de las metas de calidad, cuyo contenido ha sido ajustado posteriormente mediante actos como la Resolución AN 11459-Telco. Este marco establece indicadores técnicos, umbrales de calidad y procedimientos de medición que los concesionarios deben cumplir, y la ASEP aprueba para cada operador un listado de codificaciones y metodologías de medición mediante resoluciones individuales. La Dirección Nacional de Atención al Usuario (DNAU) recibe reclamaciones y denuncias de los usuarios sobre la prestación de los servicios de telecomunicaciones, lo que permite identificar problemas recurrentes, exigir correcciones y aplicar sanciones cuando se verifican incumplimientos.",
        tags: [
          "ley_31_1996",
          "servicio_internet_211",
          "res_10130_2016",
          "res_11370_2017",
          "calidad_servicio",
          "dnau",
          "reclamos",
        ],
      },
      "Tecnologías emergentes": {
        summary:
          "La actualización del PNAF para bandas IMT y la agenda de transformación digital liderada por la AIG preparan a Panamá para el despliegue de redes 5G, IoT y servicios avanzados de gobierno digital.",
        details:
          "La política panameña frente a las tecnologías emergentes combina la planificación de espectro de la ASEP con iniciativas de innovación digital coordinadas por la AIG. La reciente actualización del PNAF, que incrementa de forma significativa el espectro atribuido a las Telecomunicaciones Móviles Internacionales (IMT), habilita bandas bajas, medias y altas armonizadas internacionalmente para el despliegue de redes 5G y de servicios de banda ancha móvil. Este entorno regulatorio favorece el desarrollo de aplicaciones de Internet de las Cosas, servicios de ciudad inteligente y soluciones de industria 4.0 que requieren grandes anchos de banda y baja latencia. Paralelamente, programas como Panamá Conecta y la expansión de plataformas de gobierno digital impulsan la demanda de conectividad confiable y segura, de modo que las decisiones sobre espectro y licenciamiento se coordinan con objetivos más amplios de transformación digital y competitividad económica.",
        tags: [
          "pnaf",
          "imt",
          "5g",
          "iot",
          "transformacion_digital",
          "panama_conecta",
        ],
      },
      "Compartición de la infraestructura": {
        summary:
          "El uso compartido de infraestructura se rige por el Decreto Ejecutivo 138 de 1998 y por la Resolución AN 2848-Telco de 2009, que regulan la instalación, operación y co-ubicación de torres y estructuras que soportan antenas de telecomunicaciones.",
        details:
          "La compartición de infraestructura de telecomunicaciones en Panamá se apoya en un marco normativo que combina disposiciones generales sobre instalaciones dedicadas a servicios públicos, recogidas en el Decreto Ejecutivo 138 de 1998, con el Reglamento específico para torres y estructuras de antenas adoptado mediante la Resolución AN 2848-Telco de 2009. Este reglamento establece parámetros técnicos y constructivos, requisitos de seguridad estructural y límites de exposición a radiaciones no ionizantes basados en las recomendaciones de la Comisión Internacional para la Protección de las Radiaciones No Ionizantes (ICNIRP). Los concesionarios e instaladores deben solicitar un visto bueno de la ASEP antes de gestionar los permisos de construcción ante los municipios y demostrar, cuando corresponda, que exploraron alternativas de uso compartido de torres existentes. También se prevén consultas públicas con los moradores del área, requisitos de información sobre emisiones y la facultad de sancionar a las empresas que instalen torres sin cumplir la reglamentación, lo que incentiva la co-ubicación y reduce el impacto urbano del despliegue de redes.",
        tags: [
          "decreto_138_1998",
          "res_2848_2009",
          "uso_compartido_torres",
          "infraestructura_pasiva",
          "radiaciones_no_ionizantes",
        ],
      },
      "Telecomunicaciones de emergencia": {
        summary:
          "El Sistema Nacional de Emergencias 911 unifica las llamadas de emergencia en un número único gratuito, apoyado en centros de monitoreo y obligaciones de localización de llamadas para los operadores de telefonía.",
        details:
          "Panamá avanza hacia un esquema integrado de telecomunicaciones de emergencia basado en el número único 911. Una ley reciente crea el Sistema Nacional de Emergencias 911 como servicio público gratuito y de seguridad nacional, que sustituye a números dispersos como el 103, 104 y 335 y absorbe al anterior SUME 911. El sistema centraliza las llamadas de emergencia de salud, policía, bomberos y otros cuerpos de respuesta y se apoya en centros de monitoreo y videovigilancia dotados de cientos de cámaras en ciudades como Colón y Panamá. La normativa obliga a los operadores de telefonía fija y móvil a cursar sin costo las llamadas al 911, a garantizar la continuidad del servicio y a proporcionar información de identificación y localización geográfica del llamante, permitiendo una reacción más rápida ante incidentes críticos. La infraestructura y operación del sistema se financian con recursos nacionales y municipales y se coordinan desde el Ministerio de Seguridad Pública.",
        tags: [
          "sistema_nacional_emergencias_911",
          "sume_911",
          "localizacion_llamadas",
          "videovigilancia",
        ],
      },
      "Homologación de productos y dispositivos": {
        summary:
          "La homologación de dispositivos inalámbricos se rige por el Procedimiento aprobado mediante la Resolución AN 8105-Telco de 2014, complementado por listados públicos de equipos aprobados y una guía de preguntas frecuentes.",
        details:
          "La homologación de equipos de radiocomunicación y dispositivos inalámbricos de telecomunicaciones está regulada por el 'Procedimiento de Homologación de Dispositivos Inalámbricos de Telecomunicaciones', adoptado mediante la Resolución AN 8105-Telco de 26 de noviembre de 2014. Esta normativa establece que, salvo excepciones expresas, todos los dispositivos inalámbricos deben ser homologados ante la ASEP antes de su comercialización o utilización en el país, a través de una Solicitud de Homologación de Equipo Inalámbrico (SHEI) que incluye información técnica, certificados de conformidad y comprobantes de pago. El procedimiento fija un plazo máximo de treinta días hábiles para la tramitación y un arancel de B/.50 por solicitud, y se complementa con un listado público de dispositivos homologados disponible en el portal de la ASEP. En el caso de teléfonos móviles y tabletas, los operadores celulares pueden tramitar directamente la homologación cuando actúan como importadores, mientras que otros dispositivos con tecnologías como Wi-Fi, Bluetooth o NFC siguen el proceso estándar. Este esquema busca asegurar que sólo equipos conformes y seguros se conecten a las redes panameñas, protegiendo al mismo tiempo a los usuarios y la integridad de la infraestructura.",
        tags: [
          "res_8105_2014",
          "homologacion",
          "shei",
          "dispositivos_inalambricos",
          "lista_equipos_homologados",
        ],
      },
    },
  },
  {
    id: "peru",
    name: "Perú",
    flag: "peru.png",
    practices: {
      "Espectro radioeléctrico": {
        summary:
          "En Perú el MTC administra el espectro radioeléctrico mediante el Plan Nacional de Atribución de Frecuencias (PNAF), reordenamientos de bandas y topes de espectro que favorecen servicios 4G y 5G.",
        details:
          "En el Perú la gestión del espectro radioeléctrico recae en el Ministerio de Transportes y Comunicaciones (MTC), que lo administra como recurso natural de dominio público. El Plan Nacional de Atribución de Frecuencias (PNAF), aprobado y actualizado periódicamente mediante resoluciones ministeriales, define el cuadro nacional de atribución de bandas y las condiciones para la operación de los distintos servicios, incorporando paulatinamente espectro para tecnologías IMT como 4G y 5G. Sobre esta base, el MTC ha realizado reordenamientos de bandas y procesos competitivos para liberar y licitar bloques de frecuencias, así como ha fijado topes de espectro en bandas bajas y medias para evitar el acaparamiento y promover la competencia entre operadores. OSIPTEL, como regulador económico creado por la Ley N.º 26285, interviene en la supervisión de las condiciones de uso y en el análisis de los efectos competitivos de estas decisiones, con un enfoque de cierre de brechas de conectividad y expansión de la banda ancha móvil.",
        tags: [
          "pnaf",
          "mtc",
          "reordenamiento_bandas",
          "topes_espectro",
          "imt",
          "4g",
          "5g",
        ],
      },
      "Competencia Económica": {
        summary:
          "OSIPTEL, creado por la Ley N.º 26285, actúa como regulador económico sectorial, utilizando regulación tarifaria, análisis de impacto regulatorio y portabilidad numérica para promover competencia efectiva.",
        details:
          "La Ley N.º 26285 otorgó a OSIPTEL autonomía funcional y le encargó promover la competencia y eficiencia en los servicios públicos de telecomunicaciones. El regulador define metodologías tarifarias, supervisa las condiciones de interconexión y acceso mayorista y resuelve conflictos entre operadores. En los últimos años ha incorporado herramientas modernas de mejora regulatoria, como los Lineamientos de Calidad Regulatoria y el Sistema de Análisis de Impacto Regulatorio (AIR), evaluados positivamente por la OCDE, que obligan a justificar con evidencia los costos y beneficios de cada norma. La portabilidad numérica fija y móvil, regulada mediante el Reglamento de Portabilidad y administrada a través de una base de datos centralizada, permite a los usuarios cambiar de operador conservando su número y ha generado millones de portaciones, reforzando la presión competitiva. Nuevas reglas introducen mayores exigencias de seguridad para reducir el fraude y proteger a los usuarios sin debilitar la competencia.",
        tags: [
          "ley_26285",
          "analisis_impacto_regulatorio",
          "air",
          "portabilidad_numerica",
          "interconexion",
          "servicios_mayoristas",
          "ocde_evaluacion",
        ],
      },
      "Ciberseguridad": {
        summary:
          "El enfoque de ciberseguridad en telecomunicaciones combina la política digital nacional con medidas específicas de OSIPTEL para prevenir fraudes como el SIM swapping y proteger los datos de los usuarios.",
        details:
          "Aunque la rectoría en ciberseguridad recae en entidades de la Presidencia del Consejo de Ministros, las redes y servicios de telecomunicaciones regulados por OSIPTEL son un componente crítico de la infraestructura digital. El regulador ha desarrollado normas y campañas orientadas a reducir riesgos como la suplantación de identidad en servicios móviles y el uso indebido de líneas prepago, destacando iniciativas como 'Chip callejero no va' y las reglas para prevenir el SIM swapping, que han sido reconocidas como buenas prácticas de gestión pública. Estas medidas exigen verificaciones biométricas más robustas, plazos de activación y notificaciones preventivas, así como controles sobre la venta ambulatoria de chips. En paralelo, la regulación de calidad de servicio y de continuidad de la red incorpora obligaciones de seguridad y resiliencia que se articulan con las estrategias nacionales de seguridad digital.",
        tags: [
          "chip_callejero_no_va",
          "sim_swapping",
          "verificacion_biometrica",
          "fraude_identidad",
          "infraestructura_critica",
        ],
      },
      "Protección del usuario": {
        summary:
          "OSIPTEL cuenta con un régimen detallado de derechos del usuario basado en la Norma de Condiciones de Uso, el Reglamento de Reclamos y el Reglamento General de Calidad, que incluyen compensaciones y contratos cortos digitales.",
        details:
          "La política de protección al usuario se estructura alrededor de la Norma de las Condiciones de Uso de los Servicios Públicos de Telecomunicaciones, el Reglamento para la Atención de Gestiones y Reclamos de Usuarios y el Reglamento General de Calidad. Estos instrumentos definen derechos como recibir información clara sobre tarifas y planes, acceder a contratos escritos y ahora también a 'contratos cortos digitales' en castellano y lenguas originarias, obtener compensaciones automáticas por interrupciones del servicio y presentar reclamos en canales presenciales, telefónicos y digitales. OSIPTEL monitorea la calidad de atención de las empresas, publica rankings y sanciona incumplimientos. Iniciativas recientes, como la masificación de contratos cortos y aplicaciones de consulta de líneas registradas, buscan reducir la asimetría de información, facilitar que los usuarios comparen ofertas y fortalecer su capacidad para exigir mejores condiciones.",
        tags: [
          "condiciones_uso",
          "reglamento_reclamos",
          "reglamento_calidad",
          "contratos_cortos_digitales",
          "compensaciones",
          "empoderamiento_usuarios",
        ],
      },
      "Tecnologías emergentes": {
        summary:
          "Perú articula leyes como la Ley de Promoción de la Banda Ancha y la Ley de Fomento de un Perú Conectado con la planificación de espectro para impulsar 4G, 5G, IoT y servicios digitales avanzados.",
        details:
          "La Ley N.º 29904 de Promoción de la Banda Ancha y construcción de la Red Dorsal Nacional de Fibra Óptica declaró de interés nacional el despliegue de infraestructura de transporte y el uso compartido de redes de otros servicios públicos para masificar la conectividad. Más recientemente, la Ley N.º 31809 'Perú Conectado' y normas complementarias han reforzado los objetivos de cierre de brechas y expansión de la banda ancha fija y móvil, articulando programas de canon por cobertura e incentivos para inversiones en zonas rurales. En paralelo, el MTC trabaja en mecanismos de asignación de espectro y en un marco específico para 5G, mientras que OSIPTEL adecua la regulación de calidad, competencia y protección del usuario a nuevos servicios y modelos digitales (IoT, aplicaciones OTT, redes de muy alta capacidad). El resultado es un ecosistema que intenta equilibrar innovación, sostenibilidad de la inversión y defensa de los usuarios.",
        tags: [
          "ley_29904",
          "ley_31809",
          "red_dorsal_fibra_optica",
          "banda_ancha",
          "4g",
          "5g",
          "iot",
        ],
      },
      "Compartición de la infraestructura": {
        summary:
          "El país cuenta con un marco específico de acceso y uso compartido de infraestructura pública y privada, basado en las Leyes N.º 28295 y 29904 y en normas recientes sobre compartición activa con espectro.",
        details:
          "La Ley N.º 28295 regula el acceso y uso compartido de infraestructura de uso público para la prestación de servicios de telecomunicaciones, permitiendo a los operadores utilizar postes, ductos, torres y otras instalaciones de entidades públicas bajo condiciones de no discriminación y contraprestaciones razonables. La Ley N.º 29904 refuerza este esquema al declarar de interés nacional la utilización de infraestructura de energía y transporte para desplegar redes de fibra óptica y otros soportes de banda ancha. El Decreto Supremo N.º 005-2024-MTC aprobó una norma específica para la compartición de infraestructura activa con espectro radioeléctrico, que habilita acuerdos de compartición de redes móviles entre operadores para ampliar cobertura y capacidad, especialmente en áreas rurales y de difícil acceso. OSIPTEL administra registros de contratos de compartición suscritos bajo estas leyes y supervisa que las condiciones sean transparentes y compatibles con la competencia.",
        tags: [
          "ley_28295",
          "ley_29904",
          "comparticion_infraestructura_pasiva",
          "comparticion_infraestructura_activa",
          "ran_sharing",
          "zonas_rurales",
        ],
      },
      "Telecomunicaciones de emergencia": {
        summary:
          "El marco de emergencias integra la reserva de espectro para seguridad y la obligación de garantizar acceso gratuito a números de emergencia, complementados por planes de continuidad y alertas tempranas.",
        details:
          "Perú utiliza las redes de telecomunicaciones como componente esencial del Sistema Nacional de Gestión del Riesgo de Desastres. El PNAF reserva bandas de frecuencias para servicios de seguridad, defensa civil y comunicaciones de emergencia, mientras que la normativa sectorial exige a las empresas garantizar el acceso gratuito a números únicos de emergencia, la priorización del restablecimiento de estos servicios y la adopción de planes de continuidad operacional. OSIPTEL, a través de su regulación de calidad y de interrupciones de servicio, establece obligaciones de notificación y compensación ante fallas masivas y coordina con otras autoridades la difusión de mensajes de alerta a la población mediante SMS u otros canales de comunicaciones. En zonas rurales, programas de canon por cobertura y compartición de infraestructura buscan que los servicios móviles estén disponibles para soportar sistemas de alerta temprana y coordinación interinstitucional.",
        tags: [
          "numeros_emergencia",
          "pnaf",
          "continuidad_servicio",
          "alertas_tempranas",
          "gestion_riesgos",
        ],
      },
      "Homologación de productos y dispositivos": {
        summary:
          "En Perú se exige la homologación de equipos terminales y de telecomunicaciones, coordinando el control de mercado entre OSIPTEL, el MTC y la autoridad aduanera.",
        details:
          "OSIPTEL y el MTC administran procedimientos de homologación y certificación de equipos que se conectan a redes públicas de telecomunicaciones, con el fin de garantizar que cumplan requisitos técnicos, de seguridad y de compatibilidad electromagnética. Los solicitantes deben presentar información técnica, certificados de conformidad emitidos por laboratorios acreditados y, en el caso de terminales móviles, datos asociados al IMEI para facilitar su trazabilidad. Las listas de equipos homologados se publican en portales oficiales y se coordinan con la Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT) para bloquear la importación de dispositivos no autorizados o con IMEI inválido. Este esquema se complementa con medidas contra el robo y la clonación de terminales y con campañas para informar a los usuarios sobre la importancia de adquirir equipos certificados.",
        tags: [
          "homologacion",
          "imei",
          "laboratorios_acreditados",
          "control_aduanero",
          "seguridad_red",
        ],
      },
    },
  },
  {
    id: "uruguay",
    name: "Uruguay",
    flag: "uruguay.png",
    practices: {
      "Espectro radioeléctrico": {
        summary: "URSEC gestiona el espectro mediante procesos de asignación y refarming.",
        details: "La Unidad Reguladora de Servicios de Comunicaciones (URSEC) de Uruguay gestiona el espectro mediante procesos de asignación y refarming para optimizar el uso de frecuencias.",
        tags: ["asignacion", "refarming"]
      },
      "Competencia Económica": {
        summary: "Marco regulatorio que promueve competencia mediante portabilidad numérica.",
        details: "Uruguay cuenta con un marco regulatorio que promueve la competencia mediante la implementación de portabilidad numérica obligatoria.",
        tags: ["portabilidad", "competencia"]
      },
      "Ciberseguridad": {
        summary: "Normativas de ciberseguridad para protección de infraestructura crítica.",
        details: "Uruguay ha establecido normativas de ciberseguridad para la protección de infraestructura crítica de telecomunicaciones.",
        tags: ["normativas", "infraestructura_critica"]
      },
      "Protección del usuario": {
        summary: "Regulaciones de protección al consumidor en telecomunicaciones.",
        details: "URSEC ha implementado regulaciones de protección al consumidor específicas para el sector de telecomunicaciones.",
        tags: ["proteccion_consumidor"]
      },
      "Tecnologías emergentes": {
        summary: "Enfoque regulatorio para nuevas tecnologías como 5G e IoT.",
        details: "Uruguay está desarrollando un enfoque regulatorio para nuevas tecnologías como 5G e IoT.",
        tags: ["5g", "iot"]
      },
      "Compartición de la infraestructura": {
        summary: "Promoción de compartición de infraestructura para mejorar cobertura.",
        details: "URSEC promueve la compartición de infraestructura entre operadores para mejorar la cobertura de servicios.",
        tags: ["comparticion", "cobertura"]
      },
      "Telecomunicaciones de emergencia": {
        summary: "Sistema de comunicaciones de emergencia.",
        details: "Uruguay cuenta con un sistema de comunicaciones de emergencia con frecuencias dedicadas.",
        tags: ["frecuencias_dedicadas"]
      },
      "Homologación de productos y dispositivos": {
        summary: "Proceso de homologación basado en estándares internacionales.",
        details: "URSEC administra un proceso de homologación de equipos basado en estándares internacionales.",
        tags: ["estandares_internacionales"]
      }
    }
  },
  {
    id: "paraguay",
    name: "Paraguay",
    flag: "paraguay.png",
    practices: {
      "Espectro radioeléctrico": {
        summary: "CONATEL gestiona el espectro mediante procesos de asignación.",
        details: "La Comisión Nacional de Telecomunicaciones (CONATEL) de Paraguay gestiona el espectro mediante procesos de asignación para optimizar el uso de frecuencias.",
        tags: ["asignacion", "optimizacion"]
      },
      "Competencia Económica": {
        summary: "Marco regulatorio que promueve competencia mediante portabilidad numérica.",
        details: "Paraguay cuenta con un marco regulatorio que promueve la competencia mediante la implementación de portabilidad numérica obligatoria.",
        tags: ["portabilidad", "competencia"]
      },
      "Ciberseguridad": {
        summary: "Normativas de ciberseguridad para protección de infraestructura crítica.",
        details: "Paraguay ha establecido normativas de ciberseguridad para la protección de infraestructura crítica de telecomunicaciones.",
        tags: ["normativas", "infraestructura_critica"]
      },
      "Protección del usuario": {
        summary: "Regulaciones de protección al consumidor en telecomunicaciones.",
        details: "CONATEL ha implementado regulaciones de protección al consumidor específicas para el sector de telecomunicaciones.",
        tags: ["proteccion_consumidor"]
      },
      "Tecnologías emergentes": {
        summary: "Enfoque regulatorio para nuevas tecnologías.",
        details: "Paraguay está desarrollando un enfoque regulatorio para nuevas tecnologías como 5G.",
        tags: ["5g"]
      },
      "Compartición de la infraestructura": {
        summary: "Promoción de compartición de infraestructura.",
        details: "CONATEL promueve la compartición de infraestructura entre operadores para mejorar la cobertura.",
        tags: ["comparticion", "cobertura"]
      },
      "Telecomunicaciones de emergencia": {
        summary: "Sistema de comunicaciones de emergencia.",
        details: "Paraguay cuenta con un sistema de comunicaciones de emergencia con frecuencias dedicadas.",
        tags: ["frecuencias_dedicadas"]
      },
      "Homologación de productos y dispositivos": {
        summary: "Proceso de homologación basado en estándares internacionales.",
        details: "CONATEL administra un proceso de homologación de equipos basado en estándares internacionales.",
        tags: ["estandares_internacionales"]
      }
    }
  }
];


