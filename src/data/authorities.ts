export interface AuthoritySection {
  title: string;
  content: string;
}

export interface Authority {
  id: string;
  slug: string;
  name: string;
  role: string;
  institution: string;
  /** Sitio web oficial del ente (abre en nueva pestaña desde la ficha). */
  institutionUrl?: string;
  country: string;
  period?: string;
  image: string;
  bio: string;
  fullBio: string;
  email?: string;
  linkedin?: string;
  sections?: AuthoritySection[];
}

export const authorities: Authority[] = [
  {
    id: "1",
    slug: "guido-gomez-mazara",
    name: "Guido Gómez Mazara",
    role: "Presidente",
    institution: "INDOTEL",
    institutionUrl: "https://www.indotel.gob.do",
    country: "República Dominicana",
    // Retrato oficial histórico REGULATEL (archivo local; recuperado vía web.archive.org del Drupal original).
    image: "/images/autoridades/guido-gomez-mazara.jpg",
    bio: "Abogado, político y profesor universitario con una sólida trayectoria profesional en el sector de las telecomunicaciones.",
    fullBio: `Abogado, político y profesor universitario con una sólida formación académica y una amplia trayectoria profesional. Es Doctor en Derecho por la Universidad Iberoamericana (UNIBE), cuenta con una Maestría en Ciencias Políticas y Administración Pública de New School for Social Research en Nueva York y cursos en políticas públicas de la Universidad Carlos III de Madrid, España.

Mientras estudiaba en la ciudad de Nueva York, Gómez Mazara fue director del periódico Listín USA y trabajó en la cadena de televisión Telemundo. A su regreso a la República Dominicana en 1994, se integró activamente en la política, desempeñando diversos roles dentro de su organización política, incluyendo el de Consultor Jurídico del Poder Ejecutivo durante la gestión 2000-2004.

Durante toda su trayectoria profesional y política Gómez Mazara ha demostrado un firme compromiso con la modernización del Estado, el avance institucional, la lucha en contra de la corrupción y a favor de los valores democráticos en el país. Además de su carrera política, Guido es un reconocido productor y conductor de programas televisivos y radiales. Ha sido profesor de Derecho, ha publicado varios libros sobre política y es articulista del periódico «Hoy».

En su cargo como presidente del Consejo Directivo del Instituto Dominicano de las Telecomunicaciones (INDOTEL), lidera importantes reformas en este sector con énfasis en el impulso del Plan Nacional de Banda Ancha y la implementación de la red 5G en la República Dominicana.

Bajo su liderazgo, INDOTEL trabaja incansablemente para reducir la brecha digital y facilitar el acceso a las tecnologías, promoviendo el progreso colectivo y la equidad en todo el país.`,
    sections: [
      { title: "Perfil", content: "Abogado, político y profesor universitario con una sólida formación académica y una amplia trayectoria profesional. Es Doctor en Derecho por la Universidad Iberoamericana (UNIBE), cuenta con una Maestría en Ciencias Políticas y Administración Pública de New School for Social Research en Nueva York y cursos en políticas públicas de la Universidad Carlos III de Madrid, España." },
      { title: "Experiencia profesional", content: "Mientras estudiaba en Nueva York, fue director del periódico Listín USA y trabajó en Telemundo. A su regreso a la República Dominicana en 1994, se integró en la política, incluyendo el cargo de Consultor Jurídico del Poder Ejecutivo (2000-2004). Reconocido productor y conductor de programas televisivos y radiales; profesor de Derecho; autor de libros sobre política y articulista del periódico «Hoy»." },
      { title: "Rol en REGULATEL", content: "Como presidente del Consejo Directivo de INDOTEL, lidera reformas en el sector con énfasis en el Plan Nacional de Banda Ancha y la implementación de la red 5G. Bajo su liderazgo, INDOTEL trabaja para reducir la brecha digital y facilitar el acceso a las tecnologías en todo el país." },
    ],
  },
  {
    id: "2",
    slug: "felipe-augusto-diaz-suaza",
    name: "Felipe Augusto Díaz Suaza",
    role: "Vicepresidente",
    institution: "CRC",
    institutionUrl: "https://www.crcom.gov.co",
    country: "Colombia",
    image: "/images/felipe-diaz-suaza.jpg",
    bio: "Economista de la Universidad de Cartagena, Magíster y candidato a Doctor en Ciencias Económicas de la Universidad Nacional de Colombia. Cuenta con formación complementaria en NIIF, econometría, defensa de la competencia y ciencia de datos.",
    fullBio: `Economista de la Universidad de Cartagena, Magíster y candidato a Doctor en Ciencias Económicas de la Universidad Nacional de Colombia. Cuenta con formación complementaria mediante diplomados en Normas Internacionales de Información Financiera (NIIF), econometría, defensa de la competencia y ciencia de datos.

Posee una trayectoria en el sector público desde 2010, desempeñándose como economista asesor en distintas entidades. Antes de su vinculación a la CRC, hizo parte de la Superintendencia de Industria y Comercio, donde trabajó en temas de libre competencia y se desempeñó como Coordinador del Grupo de Integraciones Empresariales, rol en el que lideró el análisis económico de operaciones de concentración y dinámicas de mercado.`,
    sections: [
      { title: "Perfil", content: "Economista de la Universidad de Cartagena, Magíster y candidato a Doctor en Ciencias Económicas de la Universidad Nacional de Colombia. Formación complementaria en NIIF, econometría, defensa de la competencia y ciencia de datos." },
      { title: "Experiencia profesional", content: "Trayectoria en el sector público desde 2010 como economista asesor. En la Superintendencia de Industria y Comercio trabajó en libre competencia y fue Coordinador del Grupo de Integraciones Empresariales, liderando el análisis económico de operaciones de concentración y dinámicas de mercado." },
    ],
  },
  {
    id: "3",
    slug: "raquel-brizida-castro",
    name: "Raquel Brízida Castro",
    role: "Vicepresidenta",
    institution: "ANACOM",
    institutionUrl: "https://www.anacom.pt",
    country: "Portugal",
    // Retrato vicepresidencia ANACOM (archivo local optimizado; fuente streaming oficial).
    image: "/images/autoridades/raquel-brizida-castro.jpg",
    bio: "Experta en regulación y políticas de telecomunicaciones con amplia experiencia internacional.",
    fullBio: `Es doctora en Derecho, constitucionalista, profesora de la Facultad de Derecho de la Universidad de Lisboa e investigadora. Desde el 1 de febrero es también vicepresidenta de ANACOM, la Autoridad Nacional de Comunicaciones.

Es investigadora titular integrada en el Centro de Investigación de Derecho Público de la Facultad de Derecho de la Universidad de Lisboa (FDUL), investigadora asociada del Centro de Investigación Jurídica del Ciberespacio de la FDUL y del Centro de Investigación del Instituto Superior de Ciencias Policiales y Seguridad Interna (ICPOL). Es responsable de proyectos de investigación nacionales e internacionales.

Además de constitucionalista, es especialista en Derecho Público, Derecho del Ciberespacio y de las Nuevas Tecnologías, Derecho Regulatorio y Derecho de Contratación Pública. Imparte clases en cursos de posgrado y, sobre los temas de su especialidad, es autora de una amplia e influyente bibliografía científica y ha participado como ponente en varios congresos y seminarios nacionales e internacionales.

En el ámbito de la abogacía, ha desarrollado su actividad principalmente en las áreas del Derecho Público y del Derecho Tecnológico: Derecho Constitucional, Derecho Administrativo y de Contratación Pública, Protección de Datos. En los últimos cinco años, ha sido distinguida por sus pares, en un sistema de revisión por pares, como una de las mejores abogadas portuguesas en las áreas en las que ejerce su actividad, en el marco de Best Lawyers, una de las competiciones internacionales más distinguidas: Derecho de las Telecomunicaciones, Derecho Público, Derecho de las Tecnologías de la Información, Derecho de la Privacidad y Seguridad de los Datos.

Entre 2011 y 2016, fue miembro del Consejo Regulador de la ERC (Autoridad Reguladora de la Comunicación Social). Fue periodista durante 25 años, 20 de ellos en la televisión.

Durante los últimos 15 años, ha estudiado la regulación digital y tecnológica y cómo estos marcos regulatorios desafían los principios fundamentales del Estado Democrático de Derecho. Uno de los principales temas a los que ha dedicado mayor atención es la Inteligencia Artificial, en particular el reto de conciliar eficazmente el uso y desarrollo de esta tecnología con su regulación.`,
    sections: [
      { title: "Perfil", content: "Doctora en Derecho, constitucionalista, profesora de la Facultad de Derecho de la Universidad de Lisboa e investigadora. Vicepresidenta de ANACOM, la Autoridad Nacional de Comunicaciones." },
      { title: "Formación académica", content: "Investigadora titular en el Centro de Investigación de Derecho Público (FDUL), investigadora asociada del Centro de Investigación Jurídica del Ciberespacio y del ICPOL. Responsable de proyectos de investigación nacionales e internacionales." },
      { title: "Áreas de especialidad", content: "Derecho Público, Derecho del Ciberespacio y de las Nuevas Tecnologías, Derecho Regulatorio y de Contratación Pública. Distinguida en Best Lawyers en Derecho de las Telecomunicaciones, Derecho Público, Tecnologías de la Información, Privacidad y Seguridad de los Datos." },
      { title: "Participación internacional", content: "Autora de bibliografía científica y ponente en congresos y seminarios nacionales e internacionales. Miembro del Consejo Regulador de la ERC (2011-2016). Enfoque reciente en regulación digital, tecnológica e Inteligencia Artificial." },
    ],
  },
];

/** Clave en site_settings; valor: { authorities: Authority[] } */
export const AUTORIDADES_ACTUALES_SETTINGS_KEY = "autoridades_actuales" as const;

function unwrapSettingJson(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  return value;
}

export function parseAuthoritiesFromSettingValue(value: unknown): Authority[] | null {
  const root = unwrapSettingJson(value);
  if (root == null || typeof root !== "object") return null;
  const arr = (root as { authorities?: unknown }).authorities;
  if (!Array.isArray(arr)) return null;
  const out: Authority[] = [];
  for (let i = 0; i < arr.length; i++) {
    const row = arr[i];
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const sectionsRaw = r.sections;
    let sections: AuthoritySection[] | undefined;
    if (Array.isArray(sectionsRaw)) {
      const parsedSec: AuthoritySection[] = [];
      for (const s of sectionsRaw) {
        if (!s || typeof s !== "object") continue;
        const o = s as Record<string, unknown>;
        parsedSec.push({
          title: typeof o.title === "string" ? o.title : "",
          content: typeof o.content === "string" ? o.content : "",
        });
      }
      sections = parsedSec.length ? parsedSec : undefined;
    }
    const slug = typeof r.slug === "string" ? r.slug.trim() : "";
    const name = typeof r.name === "string" ? r.name : "";
    if (!slug || !name) continue;
    out.push({
      id: typeof r.id === "string" && r.id ? r.id : String(i + 1),
      slug,
      name,
      role: typeof r.role === "string" ? r.role : "",
      institution: typeof r.institution === "string" ? r.institution : "",
      institutionUrl: typeof r.institutionUrl === "string" ? r.institutionUrl : undefined,
      country: typeof r.country === "string" ? r.country : "",
      period: typeof r.period === "string" ? r.period : undefined,
      image: typeof r.image === "string" ? r.image : "",
      bio: typeof r.bio === "string" ? r.bio : "",
      fullBio: typeof r.fullBio === "string" ? r.fullBio : "",
      email: typeof r.email === "string" ? r.email : undefined,
      linkedin: typeof r.linkedin === "string" ? r.linkedin : undefined,
      sections,
    });
  }
  return out;
}

export function getAuthorityBySlug(slug: string, list: Authority[] = authorities): Authority | undefined {
  return list.find((a) => a.slug === slug);
}

export function getOtherAuthorities(currentSlug: string, limit = 4, list: Authority[] = authorities): Authority[] {
  return list.filter((a) => a.slug !== currentSlug).slice(0, limit);
}
