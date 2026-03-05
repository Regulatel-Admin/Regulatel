export interface Quote {
  text: string;
  author?: string;
}

export interface Highlight {
  title?: string;
  text: string;
}

export interface NoticiaData {
  slug: string;
  title: string;
  date: string;
  dateFormatted: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  author?: string;
  content: string[];
  quotes?: Quote[];
  highlights?: Highlight[];
  tags?: string[];
}

export const noticiasData: NoticiaData[] = [
  {
    slug: 'regulatel-cierra-su-periodo-2025-con-avances-clave-bajo-la-presidencia-de-la-crc',
    title: 'REGULATEL cierra su periodo 2025 con avances clave bajo la Presidencia de la CRC',
    date: '2025-12-12',
    dateFormatted: '12 Dic, 2025',
    category: 'Noticias',
    excerpt: 'REGULATEL culmina exitosamente el período 2025 bajo el liderazgo de la Comisión de Regulación de Comunicaciones de Colombia, alcanzando importantes logros en cooperación regional.',
    imageUrl: '/images/noticias/regulatel-cierra-periodo-2025-crc.jpg',
    author: 'REGULATEL',
    content: [
      'En el marco de la 28ª Asamblea Plenaria del Foro Latinoamericano de Entes Reguladores de Telecomunicaciones (REGULATEL), la Comisión de Regulación de Comunicaciones de Colombia (CRC) presentó el balance oficial de su Presidencia 2025 y formalizó el traslado del liderazgo al Instituto Dominicano de las Telecomunicaciones (INDOTEL), entidad que asume la Presidencia para el periodo 2026.',
      'Durante el encuentro, realizado en Punta Cana, la Directora Ejecutiva de la CRC y Presidente de REGULATEL, Claudia Ximena Bustamante, destacó los avances logrados por los grupos de trabajo y el fortalecimiento del Foro como plataforma de cooperación técnica y articulación regional.',
      'La 28ª Asamblea Plenaria reunió a representantes de más de 20 países miembros de REGULATEL, quienes participaron en sesiones técnicas y de alto nivel. El encuentro contó con la intervención de autoridades del Comité Ejecutivo del Foro, entre ellas Guido Gómez Mazara, Vicepresidente de REGULATEL y Presidente del Consejo Directivo del INDOTEL; Alan Borda, responsable de Relaciones Internacionales de la ATT de Bolivia; y Ángel García Castillejo, representante de la CNMC de España. A lo largo de la jornada intervinieron además delegaciones técnicas de reguladores como OSIPTEL (Perú), SUTEL (Costa Rica), ENACOM (Argentina), ANATEL (Brasil) y CONATEL (Paraguay), entre otros, quienes presentaron los avances de los grupos de trabajo y los resultados alcanzados durante 2025. Este intercambio multidisciplinario reflejó el compromiso de la región con una agenda común para el desarrollo digital.',
      '**Articulación y gobernanza fortalecida**',
      'Durante 2025, REGULATEL vivió un proceso de articulación sin precedentes, impulsado por una gobernanza dinámica y cercana entre los países miembros. La realización de diez (10) Comités Ejecutivos y reuniones mensuales de seguimiento permitió mantener un diálogo permanente entre los reguladores, anticipar necesidades técnicas y coordinar respuestas conjuntas. Gracias a este ejercicio sostenido de coordinación, la Presidencia logró canalizar y responder dieciocho (18) consultas especializadas, fortaleciendo el rol del Foro como espacio de referencia para resolver inquietudes regulatorias de alto impacto. Este mecanismo no solo mejoró la capacidad de respuesta colectiva, sino que consolidó a REGULATEL como una instancia capaz de ofrecer orientación técnica oportuna y confiable en temas prioritarios para el desarrollo de proyectos y análisis que adelanten los reguladores de la región.',
      '**Impulso a proyectos estratégicos regionales**',
      'La agenda del año también estuvo marcada por el impulso a proyectos estratégicos que amplían la influencia del Foro en la región y en escenarios globales. La reactivación de la cooperación con CAF para desarrollar orientaciones comunes que eleven la calidad de las políticas públicas en telecomunicaciones en América Latina constituyó un hito relevante, al permitir enfocar los esfuerzos del Foro en aquellos temas estratégicos que responden de manera más efectiva a las necesidades y prioridades de los países miembros. Paralelamente, la revisión de memorandos y acuerdos suscritos con otros organismo internacionales como COMTELCA y la PRAI reforzó la cooperación internacional, permitiendo que los países miembros accedan a mejores prácticas globales y a espacios de diálogo con organizaciones que lideran la evolución normativa y técnica del sector. La participación activa en cumbres con ASIET, PRAI, COMTELCA y otros organismos sumó visibilidad y conexiones estratégicas, proyectando a REGULATEL como un actor clave en la conversación digital de la región.',
      '**Fortalecimiento del ecosistema de conocimiento de REGULATEL**',
      'Otro de los logros más significativos fue el fortalecimiento del ecosistema de conocimiento del Foro. El cumplimiento del 100% de los planes de trabajo en todos los grupos temáticos (usuarios, brechas, calidad, mejora regulatoria, mercados digitales, institucionalidad, internet y paridad) evidenció un compromiso técnico colectivo y permitió construir insumos comparados que hoy son referencia en la región. La publicación de la Revista Digital de REGULATEL, en sus cuatro versiones, con aportes de reguladores latinoamericanos y europeos, consolidó un espacio editorial que documenta avances y tendencias regulatorias. A esto se sumó una estrategia activa de divulgación, en redes y medios digitales que amplificó resultados, dio visibilidad a los países y promovió la apropiación pública del conocimiento generado.',
      '**Impulso a la participación de los reguladores**',
      'Finalmente, el Foro logró dinamizar la participación de los reguladores mediante una agenda de eventos técnicos de alto nivel que conectó a América Latina con líderes globales del sector. Encuentros como el diálogo con organismos europeos (BEREC-EMERG-EaPeReg), la Cumbre Regulatel–ASIET y el foro Regulatel–AIA-ALAI durante la Semana de Políticas del IIC consolidaron espacios de intercambio que fortalecen capacidades, permiten compartir experiencias regulatorias relevantes y acercan a la región a discusiones estratégicas sobre innovación, mercados digitales, derechos de los usuarios e infraestructura. Estos espacios no solo ampliaron la presencia internacional del Foro, sino que potenciaron la interlocución técnica entre reguladores, operadores, organismos multilaterales y actores del ecosistema digital.',
      '**Un legado construido de forma colaborativa**',
      'La CRC resaltó en su intervención que los avances de 2025 fueron posibles gracias al trabajo de los grupos de trabajo, integrados por expertos de los países miembros, quienes lograron consolidar productos técnicos, análisis comparados y recomendaciones que fortalecen la toma de decisiones regulatorias en la región.',
      '**Transición a INDOTEL y compromiso como Vicepresidencia 2026**',
      'Durante la sesión de transición, Guido Gómez Mazara, Presidente del Consejo Directivo del INDOTEL y nuevo Presidente de REGULATEL, destacó el trabajo realizado por la CRC y se comprometió a continuar fortaleciendo el Foro durante su mandato. "Agradecemos a la CRC por el excelente trabajo realizado y nos comprometemos a seguir construyendo sobre estos sólidos cimientos, promoviendo la cooperación regional y el desarrollo del sector de las telecomunicaciones en América Latina", afirmó Gómez Mazara.',
      'Por su parte, Claudia Ximena Bustamante asumirá la Vicepresidencia de REGULATEL para 2026, asegurando la continuidad y el apoyo al nuevo liderazgo. "Es un honor haber servido como Presidenta de REGULATEL durante 2025 y es un privilegio continuar apoyando al Foro como Vicepresidenta. Juntos seguiremos fortaleciendo la cooperación regional y promoviendo mejores prácticas regulatorias que beneficien a todos los ciudadanos de la región", señaló Bustamante.',
      'La transición de liderazgo representa un nuevo capítulo en la historia de REGULATEL, consolidando el Foro como una plataforma de cooperación técnica de clase mundial que conecta a América Latina con el mundo y promueve el desarrollo digital inclusivo y sostenible.'
    ],
    quotes: [
      {
        text: 'REGULATEL demostró que la cooperación es el mejor acelerador de políticas públicas modernas y centradas en el ciudadano. Cada país aportó su experiencia para robustecer una agenda común de digitalización, innovación y protección de los usuarios',
        author: 'Claudia Ximena Bustamante, Directora Ejecutiva de la CRC y Presidente de REGULATEL 2025'
      },
      {
        text: 'Agradecemos a la CRC por el excelente trabajo realizado y nos comprometemos a seguir construyendo sobre estos sólidos cimientos, promoviendo la cooperación regional y el desarrollo del sector de las telecomunicaciones en América Latina',
        author: 'Guido Gómez Mazara, Presidente del Consejo Directivo del INDOTEL y Presidente de REGULATEL 2026'
      },
      {
        text: 'Es un honor haber servido como Presidenta de REGULATEL durante 2025 y es un privilegio continuar apoyando al Foro como Vicepresidenta. Juntos seguiremos fortaleciendo la cooperación regional y promoviendo mejores prácticas regulatorias que beneficien a todos los ciudadanos de la región',
        author: 'Claudia Ximena Bustamante, Vicepresidenta de REGULATEL 2026'
      }
    ],
    highlights: [
      {
        title: '10 Comités Ejecutivos',
        text: 'Reuniones mensuales de seguimiento que permitieron mantener un diálogo permanente entre los reguladores'
      },
      {
        title: '18 Consultas Especializadas',
        text: 'Respuestas técnicas coordinadas que fortalecieron el rol del Foro como espacio de referencia'
      },
      {
        title: '100% de Cumplimiento',
        text: 'Todos los grupos temáticos completaron sus planes de trabajo con productos técnicos de referencia regional'
      },
      {
        title: '4 Revistas Digitales',
        text: 'Publicaciones que consolidaron un espacio editorial documentando avances y tendencias regulatorias'
      }
    ],
    tags: ['CRC', 'INDOTEL', 'Asamblea Plenaria', 'Cooperación Regional', 'Gobernanza', '2025', '2026']
  },
  {
    slug: 'la-cumbre-regulatel-asiet-y-comtelca-se-consolida-como-un-espacio-regional',
    title: 'La cumbre Regulatel, ASIET y Comtelca se consolida como un espacio regional del ecosistema digital de diálogo y colaboración para pasar a la acción',
    date: '2025-12-11',
    dateFormatted: '11 Dic, 2025',
    category: 'Noticias',
    excerpt: 'Más de 100 asistentes de 17 países participaron de esta Cumbre bajo el lema "Conectando el futuro digital de la región", profundizando en temas estratégicos de regulación inteligente, políticas públicas e inclusión digital.',
    imageUrl: '/images/noticias/cumbre-regulatel-asiet-comtelca-consolidacion.png',
    author: 'REGULATEL',
    content: [
      'Se realizó en Punta Cana, República Dominicana, una nueva edición de la Cumbre Regulatel, ASIET y Comtelca, con la participación de líderes de la industria y reguladores de América Latina y Europa para dialogar entre sector público y privado, entre privados y entre entidades de gobierno sobre los retos y oportunidades del ecosistema digital regional para el desarrollo económico y social.',
      'Más de 100 asistentes de 17 países participaron de esta Cumbre bajo el lema "Conectando el futuro digital de la región". Se profundizó en temas estratégicos en materia de regulación inteligente, políticas públicas, infraestructura digital, mejora regulatoria, desarrollo de tecnologías emergentes e inclusión digital.',
      'Se invitó a enfocar los esfuerzos que son limitados, priorizando una actualización regulatoria urgente basada en el entendimiento de los mercados para asegurar el cierre de la brecha digital y la incorporación colaborativa de otras industrias o sectores económicos para un mejor aprovechamiento de la tecnología.',
      '**Palabras de bienvenida**',
      'La apertura del evento contó con las palabras de bienvenida de Claudia Ximena Bustamante, Directora Ejecutiva de la CRC y Presidente de Regulatel, y Guido Gómez Mazara, Presidente del Consejo Directivo de INDOTEL, Vicepresidente de Regulatel.',
      'Para la CRC, participar en esta Cumbre es una oportunidad estratégica para compartir los avances alcanzados en materia de mejora regulatoria y contrastar nuestras experiencias con las de otros países. Estos espacios fortalecen la cooperación regional y permiten que los logros de Colombia se integren a una conversación más amplia sobre cómo construir marcos regulatorios modernos y sostenibles", aseguró Claudia Ximena.',
      'Hoy, en este espacio regional, los invito a trabajar juntos. El progreso tecnológico debe convertirse en progreso social, y eso solo ocurre cuando la conectividad es segura, asequible, significativa y centrada en las personas. Que esta Cumbre fortalezca nuestra cooperación y nos acerque al futuro digital que la región merece", concluyó Guido Gómez Mazara.',
      '**Reflexiones iniciales**',
      'Para continuar con la Cumbre, Maryleana Méndez, Secretaria General de ASIET, y Ángeles Ayala, Secretaria Ejecutiva de Comtelca, compartieron reflexiones iniciales para dar comienzo al diálogo de las sesiones precedentes. Coincidieron en que las telecomunicaciones viabilizan la digitalización, pero sin un uso productivo no se podrá alcanzar una conectividad significativa centrando los usuarios de los servicios de telecomunicaciones/TIC en el foco de la convergencia.',
      'Reconocieron la diversidad cultural, geográfica y económica de Latinoamérica, pero también los retos comunes, como la necesaria revisión de la regulación para esta nueva era digital y la importancia de contar con los incentivos correctos para asegurar la sostenibilidad financiera de las empresas de telecomunicaciones.',
      '**Presentaciones iniciales**',
      'Esta Cumbre contó con presentaciones iniciales de Ángel García Castillejo, Vicepresidente de la CNMC, España y miembro de BEREC, y Lucas Gallitto, Director para América Latina de la GSMA.',
      'Esta cumbre nos brinda la oportunidad de reflexionar sobre la conectividad digital como el tejido que une a nuestros países, nuestras comunidades y nos posiciona para competir globalmente", concluyó Ángel García Castillejo.',
      'Por su parte, Lucas Gallitto ahondó en cómo se construye la conectividad y aseguró que es la inversión la que permite conectar más personas de forma más rápida con la mejor tecnología posible. "Tenemos que revisar la regulación de extremo a extremo" aseguró.',
      '**Sesión especial sobre mejora regulatoria**',
      'Luego tuvo lugar la sesión especial sobre mejora regulatoria para la inclusión digital con enfoque territorial, donde Ana Valero, Presidenta del Consejo de ASIET y Directora de Políticas Públicas de Telefónica Hispanoamérica, compartió su visión sobre la cooperación de todos los actores del ecosistema como motor para la inclusión digital sostenible.',
      'Lo que dio paso a una presentación Oscar León, Secretario Ejecutivo de CITEL, para explorar las políticas públicas y mejores prácticas regulatorias que permitan cerrar brechas digitales en zonas rurales y comunidades vulnerables, o aún no conectadas. Se compartieron las experiencias territoriales de República Dominica, Panamá y Colombia, a cargo de Julissa Cruz, Edwin Castillo y Claudia Ximena Bustamante, respectivamente.',
      '**Panel sobre infraestructura digital**',
      'En el primer panel, actores del sector público y privado del ecosistema digital dialogaron sobre la importancia de la infraestructura digital para la productividad y la integración regional. El consultor Cristhian Lizcano moderó esta sesión con una presentación donde resaltó los principales factores críticos o desafíos en esta materia, como el balance entre la promoción de la inversión y de la innovación digital repensando el rol y las funciones de los reguladores en el entorno digital, la importancia de promover la gestión eficiente del espectro con miras al bienestar social, las barreras persistentes al despliegue de infraestructura digital o el creciente interés legislativo y de gobiernos de establecer más cargas fiscales al despliegue de las redes de infraestructura.',
      'En este panel, dialogaron: Hubert Vargas Picado, Viceministro de Telecomunicaciones, Ministerio de Ciencia, Innovación, Tecnología y Telecomunicaciones de Costa Rica; Alejandra de Iturriaga Gandini, Directora de Telecomunicaciones y del Sector Audiovisual de la CNMC de España; Karim Lesina, EVP Chief External Affairs Officer de Millicom; y Elizabeth Jauregui, Head of Government and Industry Relations for Latam North de Ericsson.',
      '**Regulación inteligente para 5G y tecnologías emergentes**',
      'En la primera sesión de la tarde, se abordó el reto de la regulación inteligente para habilitar el despliegue de 5G y tecnologías emergentes, con moderación de Carolina Limbatto, Head of Service – Americas en Cullen International. Especialistas analizaron cómo marcos regulatorios flexibles, incentivos adecuados y esquemas fiscales favorables van a ayudar al desarrollo de nuevas tecnologías impulsando la innovación, la competencia y la sostenibilidad de las inversiones.',
      'De este diálogo, participaron: Carlos Baigorri, Presidente de Anatel Brasil; Federico Chacón Loaiza, Presidente del Consejo de Sutel Costa Rica; Robinson Peña, Director de Regulación de Claro República Dominicana; y Adriana Servin, Directora de Asuntos Gubernamentales de Cisco.',
      'Los panelistas insistieron en la necesidad de generar un ambiente propicio para la inversión, la monetización y la inclusión, quitando trabas al despliegue de infraestructura digital y observando la realidad actual de los mercados.'
    ],
    quotes: [
      {
        text: 'Para la CRC, participar en esta Cumbre es una oportunidad estratégica para compartir los avances alcanzados en materia de mejora regulatoria y contrastar nuestras experiencias con las de otros países. Estos espacios fortalecen la cooperación regional y permiten que los logros de Colombia se integren a una conversación más amplia sobre cómo construir marcos regulatorios modernos y sostenibles',
        author: 'Claudia Ximena Bustamante, Directora Ejecutiva de la CRC y Presidente de Regulatel'
      },
      {
        text: 'Hoy, en este espacio regional, los invito a trabajar juntos. El progreso tecnológico debe convertirse en progreso social, y eso solo ocurre cuando la conectividad es segura, asequible, significativa y centrada en las personas. Que esta Cumbre fortalezca nuestra cooperación y nos acerque al futuro digital que la región merece',
        author: 'Guido Gómez Mazara, Presidente del Consejo Directivo de INDOTEL y Vicepresidente de Regulatel'
      },
      {
        text: 'Hemos comprobado que la transformación digital no depende únicamente de la infraestructura, sino también del conocimiento del entorno y de una coordinación intersectorial que permita convertir una visión de largo plazo en resultados concretos',
        author: 'Claudia Ximena Bustamante, Directora Ejecutiva de la CRC y Presidente de Regulatel'
      },
      {
        text: 'Estamos en un cruce de caminos regulatorios y se nos advierte que debemos avanzar en el camino de la inteligencia regulatoria, necesitamos operadores sólidos con capacidad financiera para invertir',
        author: 'Maryleana Méndez, Secretaria General de ASIET'
      },
      {
        text: 'La conclusión es unánime, la región demanda un liderazgo firme y decidido, condensado en cuatro ejes estratégicos que hemos visto con pasión durante esta jornada: voluntad política para la conectividad asequible, reducir impuestos sectoriales podría abrir el acceso a servicios para más de 30 millones de latinoamericanos, promover marcos regulatorios ágiles que sigan el ritmo del cambio tecnológico, y un regulador como arquitecto de la innovación, constructores de ecosistema digitales inclusivos y resilientes',
        author: 'Guido Gómez Mazara, Presidente del Consejo Directivo de INDOTEL y Vicepresidente de Regulatel'
      }
    ],
    highlights: [
      {
        title: '100+ Asistentes',
        text: 'Más de 100 participantes de 17 países se reunieron para debatir el futuro digital de la región'
      },
      {
        title: '5 Sesiones Técnicas',
        text: 'Múltiples sesiones abordaron temas desde infraestructura hasta regulación inteligente para 5G'
      },
      {
        title: 'Cooperación Multisectorial',
        text: 'Diálogo entre sector público, privado y entidades de gobierno para el desarrollo económico y social'
      },
      {
        title: '30+ Millones de Beneficiarios',
        text: 'La reducción de impuestos sectoriales podría abrir el acceso a servicios para más de 30 millones de latinoamericanos'
      }
    ],
    tags: ['Cumbre', 'ASIET', 'COMTELCA', 'Cooperación Regional', 'Ecosistema Digital', 'Regulación Inteligente', '5G', 'Inclusión Digital']
  },
  {
    slug: 'cumbre-regulatel-asiet-comtelca',
    title: 'Cumbre Regulatel, Asiet, Comtelca',
    date: '2024-12-11',
    dateFormatted: '11 Dic, 2024',
    category: 'Noticias',
    excerpt: 'La Cumbre Regulatel, ASIET y Comtelca se consolidó como un espacio regional de diálogo y colaboración para pasar a la acción. El evento reunió a líderes de la industria y reguladores de América Latina y Europa para abordar los retos y oportunidades del ecosistema digital regional.',
    imageUrl: 'https://www.regulatel.org/sites/default/files/gallery/CUMBRE-REGULATEL-ASIET-COMTELCA-2025-HOME.png',
    author: 'REGULATEL',
    content: [
      'El Instituto Dominicano de las Telecomunicaciones (INDOTEL), REGULATEL, ASIET (Asociación Interamericana de Empresas de Telecomunicaciones) y COMTELCA (Comisión Técnica Regional de Telecomunicaciones) organizaron la Cumbre REGULATEL-ASIET-COMTELCA.',
      'El evento se realizó el 11 de diciembre de 2024, de 8:00 a.m. a 6:00 p.m., en el Hotel Barceló Bávaro Palace, Punta Cana, República Dominicana, bajo el lema "Conectando el futuro digital de la región".',
      'La Cumbre Regulatel, ASIET y Comtelca se consolidó como un espacio regional de diálogo y colaboración para pasar a la acción. El evento reunió a líderes de la industria y reguladores de América Latina y Europa para abordar los retos y oportunidades del ecosistema digital regional.',
      '**Ejes Temáticos Estratégicos**',
      'Durante la Cumbre se abordaron tres ejes temáticos estratégicos fundamentales:',
      '- **Regulación inteligente** y mejora regulatoria para la inclusión digital: Promoción de marcos regulatorios modernos que impulsen la innovación y garanticen la protección de los usuarios, con especial énfasis en cerrar brechas digitales y promover la inclusión de comunidades vulnerables.',
      '- **Infraestructura digital** y despliegue de tecnologías emergentes (5G): Análisis del rol de la infraestructura digital como motor del desarrollo económico y social, incluyendo estrategias para el despliegue de tecnologías emergentes como 5G y su impacto en la competitividad regional.',
      '- **Políticas públicas** para cerrar la brecha digital en zonas vulnerables: Desarrollo de políticas públicas y mejores prácticas regulatorias que permitan cerrar brechas digitales en zonas rurales y comunidades vulnerables o aún no conectadas, promoviendo la inclusión digital como pilar del desarrollo sostenible.',
      '**Objetivos del evento**',
      'La Cumbre se posicionó como una plataforma de alto nivel para fortalecer la cooperación, articular políticas y promover una agenda común de digitalización en la región. El evento tuvo como objetivos principales:',
      '- Reunir a líderes de la industria y autoridades regulatorias de Europa y América Latina para dialogar sobre temas estratégicos del ecosistema digital.',
      '- Promover la regulación inteligente y las tecnologías emergentes para el progreso económico y la competitividad.',
      '- Analizar el despliegue y aprovechamiento de nuevas tecnologías.',
      '- Fortalecer la mejora regulatoria y la inclusión digital como pilares del desarrollo sostenible.',
      '- Discutir el papel de la infraestructura digital en el desarrollo económico y social y su impacto en la integración regional.',
      '**Importancia del evento**',
      'Las telecomunicaciones viabilizan los cambios tecnológicos, económicos y sociales para la transformación digital, haciendo que la conectividad significativa sea una prioridad regional. Esta Cumbre representó un espacio único para fortalecer la cooperación entre reguladores, operadores y otros actores clave del sector.',
      '**Recursos y documentación**',
      'El evento contó con una transmisión oficial completa disponible para revivir todas las sesiones y paneles desarrollados durante la Cumbre. Esta transmisión permite acceder a todo el contenido del evento de forma completa.',
      'Durante la Cumbre se compartieron presentaciones de los principales expositores y panelistas, incluyendo a Cristhian Lizcano, Lucas Gallitto (GSMA), Ana Valero (ASIET/Telefónica), Óscar León (CITEL), Julissa Cruz (INDOTEL), Claudia Ximena Bustamante (CRC/REGULATEL), Edwin Castillo (Panamá), Carolina Limbatto (Cullen International), Carlos Lugo y Robert Mourik (BEREC).',
      'Todas las presentaciones, galerías de fotos oficiales en Flickr y documentación oficial del evento están disponibles en la sección de recursos al final de esta página.',
      '**Ubicación del evento**',
      'El evento se llevó a cabo en el Centro de Convenciones del Complejo Barceló Bávaro, ubicado en Punta Cana, República Dominicana. Este espacio de primer nivel, reconocido por su infraestructura de clase mundial, reunió a los principales actores del sector de las telecomunicaciones de la región en un ambiente propicio para el diálogo, la colaboración y el intercambio de experiencias.'
    ],
    quotes: [
      {
        text: 'La Cumbre Regulatel, ASIET y Comtelca se consolidó como un espacio regional de diálogo y colaboración para pasar a la acción',
        author: 'INDOTEL - REGULATEL'
      }
    ],
    highlights: [
      {
        title: 'Regulación Inteligente',
        text: 'Promoción de marcos regulatorios modernos que impulsen la innovación y garanticen la protección de los usuarios'
      },
      {
        title: 'Infraestructura Digital',
        text: 'Análisis del rol de la infraestructura digital como motor del desarrollo económico y social, incluyendo 5G'
      },
      {
        title: 'Inclusión Digital',
        text: 'Desarrollo de políticas públicas para cerrar brechas digitales en zonas rurales y comunidades vulnerables'
      },
      {
        title: 'Cooperación Regional',
        text: 'Fortalece la cooperación entre reguladores, operadores y otros actores clave del sector'
      }
    ],
    tags: ['Cumbre', 'ASIET', 'COMTELCA', 'Cooperación Regional', 'INDOTEL', 'República Dominicana', 'Punta Cana', 'Regulación Inteligente', '5G', 'Inclusión Digital']
  },
  {
    slug: 'crc-asume-la-presidencia-de-regulatel',
    title: 'CRC asume la Presidencia de REGULATEL',
    date: '2024-12-12',
    dateFormatted: '12 Dic, 2024',
    category: 'Noticias',
    excerpt: 'En la 27ª Asamblea Plenaria celebrada en Cartagena de Indias, Colombia, la CRC toma liderazgo de REGULATEL para el periodo 2025, destacando la necesidad de cooperación regional en innovación, mejora regulatoria y protección al usuario.',
    imageUrl: '/images/noticias/crc-asume-presidencia-regulatel.png',
    author: 'REGULATEL',
    content: [
      'En el marco de la 27ª Asamblea Plenaria de REGULATEL, celebrada en Cartagena de Indias, Colombia, la Comisión de Regulación de Comunicaciones de Colombia (CRC) asumió oficialmente la Presidencia del Foro Latinoamericano de Entes Reguladores de Telecomunicaciones para el período 2025.',
      'La Directora Ejecutiva de la CRC, Claudia Ximena Bustamante, recibió el mandato de liderar el Foro durante el próximo año, comprometiéndose a continuar fortaleciendo la cooperación regional y promoviendo mejores prácticas regulatorias en el sector de las telecomunicaciones.',
      'Durante su discurso de aceptación, Bustamante destacó la importancia de mantener el impulso de trabajo colaborativo que caracteriza a REGULATEL y se comprometió a promover agendas comunes que beneficien a todos los países miembros del Foro.',
      '**Plan de trabajo 2025**',
      'El plan de trabajo presentado por la CRC para 2025 se enfoca en cinco ejes estratégicos fundamentales:',
      '- Innovación regulatoria: Desarrollo de normativas más modernas y sostenibles',
      '- Empoderamiento del usuario: Protección y fortalecimiento de los derechos de los usuarios',
      '- Mejora en calidad de servicio: Garantizar conectividad de calidad para todos los ciudadanos',
      '- Mercado digital: Promover el desarrollo de mercados digitales inclusivos',
      '- Superar brechas territoriales y sociales: Cierre de brechas digitales en zonas rurales y comunidades vulnerables',
      '**Compromiso regional**',
      'La transición de liderazgo representa un nuevo capítulo en la historia de REGULATEL, consolidando el Foro como una plataforma de cooperación técnica de clase mundial que conecta a América Latina con el mundo.',
      'Durante 2025, bajo la presidencia de la CRC, REGULATEL avanzará en varios ejes estratégicos del sector telecomunicaciones en América Latina. Se fortaleció la innovación regulatoria, mejorando normativas y promoviendo iniciativas que protejan y empoderen a los usuarios. Asimismo, se impulsó la calidad en los servicios, con especial atención al cierre de brechas digitales, fundamental para garantizar la inclusión. Se consolidaron mercados digitales y se promovió una colaboración regional efectiva.',
      '**Proyectos estratégicos**',
      'Se implementaron normativas más modernas y sostenibles, diálogo con distintos actores públicos y privados, y proyectos para garantizar conectividad de calidad para todos los ciudadanos.'
    ],
    quotes: [
      {
        text: 'Nos comprometemos a trabajar incansablemente por el fortalecimiento de REGULATEL como plataforma de cooperación regional. Juntos, los países miembros continuaremos promoviendo mejores prácticas regulatorias que beneficien a todos los ciudadanos de la región',
        author: 'Claudia Ximena Bustamante, Directora Ejecutiva de la CRC y Presidenta de REGULATEL 2025'
      }
    ],
    highlights: [
      {
        title: '5 Ejes Estratégicos',
        text: 'Plan de trabajo enfocado en innovación regulatoria, empoderamiento del usuario, calidad de servicio, mercados digitales y cierre de brechas'
      },
      {
        title: 'Cooperación Regional',
        text: 'Fortalecimiento del trabajo colaborativo entre todos los países miembros del Foro'
      }
    ],
    tags: ['CRC', 'Presidencia', '2025', 'Colombia', 'Innovación Regulatoria', 'Cooperación Regional']
  },
  {
    slug: 'concluye-con-exito-la-historica-cumbre-regulatel-berec-en-bolivia-2024',
    title: 'Concluye con éxito la histórica Cumbre REGULATEL - BEREC en Bolivia 2024',
    date: '2024-06-25',
    dateFormatted: '25 Jun, 2024',
    category: 'Reuniones',
    excerpt: 'Santa Cruz, 24 de junio del 2024. El 21 de junio de 2024, Bolivia no solo celebró el cierre exitoso de la Cumbre REGULATEL - BEREC 2024, sino también el Año Nuevo Andino Amazónico, marcando una jornada histórica y significativa para el país.',
    imageUrl: '/images/cumbre-berec-santa-cruz-2024.jpg',
    author: 'REGULATEL',
    content: [
      'Santa Cruz, 24 de junio del 2024 (PRENSA REGULATEL). – El 21 de junio de 2024, Bolivia no solo celebró el cierre exitoso de la Cumbre REGULATEL - BEREC 2024, sino también el Año Nuevo Andino Amazónico, marcando una jornada histórica y significativa para el país. Este evento internacional, organizado por la Autoridad de Regulación y Fiscalización de Telecomunicaciones y Transportes – ATT de Bolivia, que preside REGULATEL, reunió a las principales autoridades de regulación de telecomunicaciones de Latinoamérica y Europa.',
      'Durante dos días, los participantes discutieron temas relevantes y actuales como el Fair Share y la ciberseguridad, buscando soluciones conjuntas para los desafíos globales en el sector de las telecomunicaciones.',
      '"Es un honor para Bolivia haber sido sede de este evento histórico en una fecha tan significativa. La cumbre ha permitido un intercambio profundo de ideas y mejores prácticas, particularmente en áreas como la distribución equitativa de costos de infraestructura y la ciberseguridad. Estamos orgullosos de los avances logrados y del impacto positivo que esto tendrá para nuestro país y la región, señaló el presidente de REGULATEL y el director ejecutivo de la ATT, Néstor Ríos.',
      'La autoridad afirmó que la Cumbre concluyó con un compromiso firme de los participantes para continuar trabajando juntos en la creación de un entorno regulatorio que promueva la innovación, la equidad y la sostenibilidad en el ámbito de las telecomunicaciones y la inteligencia artificial.',
      'Por su parte, Robert Mourik, presidente 2025 de BEREC, destacó cálida hospitalidad boliviana, resaltando el espíritu acogedor del país. "ATT hizo un trabajo fantástico y los temas que discutimos fueron muy interesantes y relevantes. Nos llevamos no solo valiosas experiencias y conocimientos, sino también el recuerdo de un país acogedor y colaborativo. Esta cumbre marca un hito en nuestras relaciones y abre la puerta a futuras colaboraciones", enfatizó.',
      'Asimismo, las autoridades de la Cumbre destacaron la importancia de continuar colaborando estrechamente para enfrentar desafíos comunes y aprovechar las oportunidades en el sector de las telecomunicaciones. Además, que este histórico evento también subrayó el potencial de Bolivia como un país competitivo y digitalizado, capaz de atraer inversiones y liderar iniciativas innovadoras en la región.'
    ],
    quotes: [
      {
        text: 'Es un honor para Bolivia haber sido sede de este evento histórico en una fecha tan significativa. La cumbre ha permitido un intercambio profundo de ideas y mejores prácticas, particularmente en áreas como la distribución equitativa de costos de infraestructura y la ciberseguridad. Estamos orgullosos de los avances logrados y del impacto positivo que esto tendrá para nuestro país y la región',
        author: 'Néstor Ríos, Presidente de REGULATEL y Director Ejecutivo de la ATT de Bolivia'
      },
      {
        text: 'ATT hizo un trabajo fantástico y los temas que discutimos fueron muy interesantes y relevantes. Nos llevamos no solo valiosas experiencias y conocimientos, sino también el recuerdo de un país acogedor y colaborativo. Esta cumbre marca un hito en nuestras relaciones y abre la puerta a futuras colaboraciones',
        author: 'Robert Mourik, Presidente 2025 de BEREC'
      }
    ],
    highlights: [
      {
        title: '30+ Países',
        text: 'Reunión histórica de representantes de más de 30 países de América Latina y Europa'
      },
      {
        title: 'Primera Sede en Bolivia',
        text: 'Por primera vez, Bolivia fue sede de este prestigioso evento internacional'
      },
      {
        title: 'Año Nuevo Andino Amazónico',
        text: 'Celebración simultánea del Año Nuevo Andino Amazónico, marcando una jornada histórica'
      },
      {
        title: 'Compromiso Firme',
        text: 'Acuerdo para crear un entorno regulatorio que promueva innovación, equidad y sostenibilidad'
      }
    ],
    tags: ['Cumbre', 'BEREC', 'Bolivia', 'Cooperación Internacional', 'Europa', 'Fair Share', 'Ciberseguridad', 'ATT']
  },
  {
    slug: 'reguladores-de-latinoamerica-impulsan-la-cooperacion-y-la-innovacion-en-telecomunicaciones',
    title: 'Reguladores de Latinoamérica impulsan la cooperación y la innovación en telecomunicaciones en la reunión de REGULATEL 2024',
    date: '2024-04-16',
    dateFormatted: '16 Abr, 2024',
    category: 'Reuniones',
    excerpt: 'Los reguladores de telecomunicaciones de América Latina se reúnen para fortalecer la cooperación regional y promover la innovación en el sector.',
    imageUrl: '/images/noticias/montevideo-06.jpeg',
    author: 'REGULATEL',
    content: [
      'En el marco de la Reunión de Grupos de Trabajo de REGULATEL 2024, los principales reguladores de telecomunicaciones de América Latina se reunieron para fortalecer la cooperación regional y promover la innovación en el sector.',
      'Durante el encuentro, los participantes analizaron los avances de los diferentes grupos de trabajo y definieron estrategias comunes para enfrentar los desafíos que presenta el sector de las telecomunicaciones en la región.',
      '**Temas clave abordados**',
      'Entre los temas principales que se discutieron durante la reunión se encuentran:',
      '- Fortalecimiento de la cooperación regional entre reguladores',
      '- Promoción de la innovación y nuevas tecnologías',
      '- Mejora en la calidad de los servicios de telecomunicaciones',
      '- Protección de los derechos de los usuarios',
      '- Cierre de brechas digitales en la región',
      '**Resultados y compromisos**',
      'Los participantes se comprometieron a continuar trabajando de manera coordinada para promover el desarrollo del sector de las telecomunicaciones en América Latina, fortaleciendo la cooperación regional y compartiendo mejores prácticas.',
      'La reunión estableció las bases para futuros proyectos de colaboración conjunta entre los países miembros de REGULATEL, consolidando el Foro como una plataforma clave para el intercambio de experiencias y el fortalecimiento de las capacidades regulatorias en la región.'
    ],
    tags: ['Reuniones', 'Grupos de Trabajo', 'Cooperación Regional', 'Innovación']
  },
  {
    slug: 'la-presidencia-de-regulatel-continua-fortaleciendo-la-cooperacion-internacional-en-el-mobile-world-congress',
    title: 'La presidencia de REGULATEL continúa fortaleciendo la cooperación internacional en el Mobile World Congress 2024',
    date: '2024-03-05',
    dateFormatted: '5 Mar, 2024',
    category: 'Mesas',
    excerpt: 'La Presidencia de REGULATEL participa activamente en el Mobile World Congress 2024, fortaleciendo los lazos de cooperación internacional con reguladores y líderes del sector de las telecomunicaciones.',
    imageUrl: '/images/noticias/regu.jpeg',
    author: 'REGULATEL',
    content: [
      'La Presidencia de REGULATEL participó activamente en el Mobile World Congress (MWC) 2024, celebrado en Barcelona, España, fortaleciendo los lazos de cooperación internacional con reguladores y líderes del sector de las telecomunicaciones a nivel mundial.',
      'Durante el evento, la delegación de REGULATEL mantuvo reuniones estratégicas con representantes de organizaciones regulatorias internacionales, operadores de telecomunicaciones y líderes de la industria para promover la cooperación regional y el intercambio de mejores prácticas.',
      '**Actividades realizadas**',
      'Entre las principales actividades realizadas durante el MWC 2024 se encuentran:',
      '- Reuniones bilaterales con reguladores de diferentes regiones',
      '- Participación en mesas redondas sobre temas regulatorios',
      '- Intercambio de experiencias y mejores prácticas',
      '- Establecimiento de acuerdos de cooperación',
      '**Impacto y resultados**',
      'La participación de REGULATEL en el MWC 2024 permitió fortalecer la presencia internacional del Foro y establecer conexiones estratégicas con actores clave del sector de las telecomunicaciones a nivel mundial.',
      'Estos espacios de diálogo y colaboración son fundamentales para promover el desarrollo del sector de las telecomunicaciones en América Latina y fortalecer la posición de la región en el contexto internacional.'
    ],
    tags: ['Mesas', 'MWC', 'Cooperación Internacional', 'Barcelona', 'España']
  },
  {
    slug: 'lideres-de-las-telecomunicaciones-se-reunen-en-barcelona-para-fortalecer-la-conectividad-en-america-latina-y-el-caribe',
    title: 'Líderes de las telecomunicaciones se reúnen en Barcelona para fortalecer la conectividad en América Latina y el Caribe',
    date: '2024-02-28',
    dateFormatted: '28 Feb, 2024',
    category: 'Mesas',
    excerpt: 'Durante el Mobile World Congress 2024, líderes del sector de las telecomunicaciones de América Latina y el Caribe se reunieron para dialogar sobre estrategias para fortalecer la conectividad en la región.',
    imageUrl: '/images/noticias/mesa-redonda-asiet-regulatel-01.jpg',
    author: 'REGULATEL',
    content: [
      'Durante el Mobile World Congress 2024 celebrado en Barcelona, España, líderes del sector de las telecomunicaciones de América Latina y el Caribe se reunieron para dialogar sobre estrategias para fortalecer la conectividad en la región.',
      'El encuentro, organizado en el marco del MWC 2024, reunió a representantes de reguladores, operadores de telecomunicaciones y líderes de la industria para analizar los desafíos y oportunidades que enfrenta el sector en la región.',
      '**Temas de discusión**',
      'Durante la mesa redonda, los participantes abordaron temas estratégicos como:',
      '- Despliegue de infraestructura de telecomunicaciones',
      '- Cierre de brechas digitales',
      '- Promoción de la competencia en el sector',
      '- Protección de los derechos de los usuarios',
      '- Fomento de la innovación y nuevas tecnologías',
      '**Compromisos y resultados**',
      'Los participantes coincidieron en la importancia de trabajar de manera coordinada para promover el desarrollo del sector de las telecomunicaciones en América Latina y el Caribe, fortaleciendo la cooperación regional y compartiendo mejores prácticas.',
      'El encuentro estableció las bases para futuros proyectos de colaboración conjunta que permitan fortalecer la conectividad y promover el desarrollo digital inclusivo en la región.'
    ],
    tags: ['Mesas', 'Barcelona', 'Conectividad', 'América Latina', 'Caribe']
  },
  {
    slug: 'bolivia-por-primera-vez-es-la-sede-de-la-cumbre-regulatel-berec-2024',
    title: 'Bolivia, por primera vez, es la sede de la Cumbre REGULATEL – BEREC 2024',
    date: '2024-06-13',
    dateFormatted: '13 Jun, 2024',
    category: 'Eventos',
    excerpt: 'Por primera vez, Bolivia será la sede de la prestigiosa Cumbre REGULATEL – BEREC 2024. Este evento internacional reunirá en Santa Cruz, los días 20 y 21 de junio, a las principales autoridades de regulación de telecomunicaciones de Latinoamérica y Europa.',
    imageUrl: '/images/noticias/bolivia.jpg',
    author: 'REGULATEL',
    content: [
      'La Paz, 13 de junio (REGULATEL - PRENSA). - Por primera vez, Bolivia será la sede de la prestigiosa Cumbre REGULATEL – BEREC 2024. Este evento internacional reunirá en Santa Cruz, el 20 y 21 de junio, a las principales autoridades de regulación de telecomunicaciones de Latinoamérica y Europa.',
      'Este acontecimiento histórico se da en el marco de la presidencia de REGULATEL, actualmente a cargo de la Autoridad de Regulación y Fiscalización de Telecomunicaciones y Transportes - ATT de Bolivia, bajo el liderazgo del director ejecutivo, Néstor Ríos.',
      '**Sobre la Cumbre REGULATEL – BEREC**',
      'La Cumbre REGULATEL – BEREC es un evento anual que reúne a representantes de estas dos importantes organizaciones de regulación en el ámbito de las telecomunicaciones. El objetivo principal es fomentar la cooperación y el intercambio de conocimientos y experiencias entre los reguladores de telecomunicaciones de Latinoamérica y Europa.',
      'La autoridad indica que, durante la Cumbre, los participantes tratarán "temas relevantes para la regulación de las telecomunicaciones, tales como el Fair Share (distribución equitativa), la protección de los consumidores, la gestión del espectro radioeléctrico, la promoción de la innovación y la inversión en infraestructura".',
      '**Impacto para Bolivia**',
      'El impacto de la Cumbre REGULATEL – BEREC fortalecerá las relaciones de Bolivia con otros países y organismos internacionales, promoviendo la cooperación en temas estratégicos en el sector de las telecomunicaciones.',
      'Además, Bolivia, al ser sede de este histórico Cumbre, atraerá la atención de actores clave del sector de las telecomunicaciones, estimulando inversiones en el país. Las discusiones y acuerdos alcanzados durante este evento pueden abrir puertas para proyectos de infraestructura en este sector que beneficien a los bolivianos.',
      '**Sobre REGULATEL y BEREC**',
      'El Foro Latinoamericano de Entes Reguladores de Telecomunicaciones (REGULATEL) es una organización internacional que agrupa a los entes reguladores de telecomunicaciones de 23 países, incluyendo 20 países latinoamericanos y 3 europeos, que tiene el objetivo de facilitar el intercambio de información sobre el marco y la gestión regulatoria, los servicios y el mercado de telecomunicaciones entre los países miembros; además de promover la armonización de la regulación de las telecomunicaciones para contribuir a la integración regional.',
      'Mientras que el Organismo de Reguladores Europeos de las Comunicaciones Electrónicas (BEREC, por sus siglas en inglés) es el organismo especializado de la Unión Europea encargado de coordinar y apoyar la implementación de políticas de regulación en el sector de las comunicaciones electrónicas dentro de la UE. Su principal objetivo es asegurar una competencia justa y promover el desarrollo del mercado único europeo de comunicaciones electrónicas.'
    ],
    tags: ['Eventos', 'Cumbre', 'BEREC', 'Bolivia', 'Santa Cruz', 'ATT']
  }
];
