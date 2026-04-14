/**
 * Inserta en la tabla `events` los eventos que antes solo existían en `src/data/eventsSeed.ts`
 * (misma lista). Idempotente: ON CONFLICT (id) DO NOTHING — no borra ni sobrescribe lo ya guardado.
 *
 * Uso: DATABASE_URL=... node ./scripts/seed-events-from-legacy.mjs
 *      npm run db:seed-events
 *
 * Si añades o cambias eventos “por defecto”, actualiza también src/data/eventsSeed.ts y esta lista.
 */
import "dotenv/config";
import postgres from "postgres";

/** @type {Array<{
 *   id: string;
 *   title: string;
 *   organizer: string;
 *   location: string;
 *   startDate: string;
 *   endDate: string | null;
 *   registrationUrl: string | null;
 *   detailsUrl: string | null;
 *   isFeatured: boolean;
 *   tags: string[];
 *   description?: string;
 *   imageUrl?: string;
 * }>} */
const LEGACY_EVENTS = [
  {
    id: "cumbre-ministerial-certal-2026",
    title: "Cumbre Ministerial (CERTAL)",
    organizer: "CERTAL",
    location: "Madrid",
    startDate: "2026-02-25",
    endDate: null,
    registrationUrl: "https://certalatam.org/cumbre-preministerial-certal/",
    detailsUrl: null,
    isFeatured: true,
    tags: [],
    description: "Cumbre Preministerial CERTAL 2026 | Madrid, España.",
  },
  {
    id: "digital-summit-latam-2026",
    title: "Digital Summit Latam",
    organizer: "DPL GROUP",
    location: "Madrid",
    startDate: "2026-02-26",
    endDate: "2026-02-27",
    registrationUrl: "https://digitalsummitlatam.com/",
    detailsUrl: null,
    isFeatured: true,
    tags: [],
    description: "Digital Summit Latam.",
  },
  {
    id: "saludo-institucional-berec-regulatel-madrid-2026",
    title: "Saludo Institucional BEREC - REGULATEL, Madrid 2026",
    organizer: "BEREC / REGULATEL",
    location: "Madrid",
    startDate: "2026-02-01",
    endDate: null,
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Encuentro institucional de apertura entre BEREC y REGULATEL.",
  },
  {
    id: "mwc-barcelona-2026",
    title: "MWC Barcelona 2026",
    organizer: "GSMA",
    location: "Barcelona",
    startDate: "2026-03-02",
    endDate: "2026-03-05",
    registrationUrl: "https://www.mwcbarcelona.com/",
    detailsUrl: null,
    isFeatured: true,
    tags: [],
    description: "MWC Barcelona 2026.",
  },
  {
    id: "foro-altas-autoridades-citel-2026",
    title: "Foro de Altas Autoridades (previo a la IX Asamblea Ordinaria de la CITEL)",
    organizer: "CITEL",
    location: "San José, Costa Rica",
    startDate: "2026-03-16",
    endDate: null,
    registrationUrl: "https://www.oas.org/ext/es/principal/oea/nuestra-estructura/entidades-y-organismos/citel/Inicio",
    detailsUrl: null,
    isFeatured: true,
    tags: [],
    description: "Foro de Altas Autoridades previo a la IX Asamblea Ordinaria de la CITEL.",
  },
  {
    id: "ix-asamblea-ordinaria-citel-2026",
    title: "IX Asamblea Ordinaria de la CITEL",
    organizer: "CITEL",
    location: "San José, Costa Rica",
    startDate: "2026-03-17",
    endDate: "2026-03-19",
    registrationUrl: "https://www.oas.org/ext/es/principal/oea/nuestra-estructura/entidades-y-organismos/citel/Inicio",
    detailsUrl: null,
    isFeatured: true,
    tags: [],
    description: "IX Asamblea Ordinaria de la CITEL.",
  },
  {
    id: "48-reunion-ccp1-citel-2026",
    title: "48 Reunión del CCP.I",
    organizer: "CITEL",
    location: "Ciudad de Panamá",
    startDate: "2026-04-20",
    endDate: "2026-04-24",
    registrationUrl: "https://www.oas.org/CITELEvents/es/Events",
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "48 Reunión del CCP.I.",
  },
  {
    id: "49-reunion-ccp1-citel-2026",
    title: "49 Reunión del CCP.I",
    organizer: "CITEL",
    location: "Asunción, Paraguay",
    startDate: "2026-09-07",
    endDate: "2026-09-11",
    registrationUrl: "https://www.oas.org/CITELEvents/es/Events",
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "49 Reunión del CCP.I.",
  },
  {
    id: "47-reunion-ccp2-citel-2026",
    title: "47 Reunión CCP.II",
    organizer: "CITEL",
    location: "Dominica",
    startDate: "2026-04-06",
    endDate: "2026-04-10",
    registrationUrl: "https://www.oas.org/CITELEvents/es/Events",
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "47 Reunión CCP.II.",
  },
  {
    id: "48-reunion-ccp2-citel-2026",
    title: "48 Reunión CCP.II",
    organizer: "CITEL",
    location: "Colombia",
    startDate: "2026-11-30",
    endDate: "2026-12-04",
    registrationUrl: "https://www.oas.org/CITELEvents/es/Events",
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "48 Reunión CCP.II.",
  },
  {
    id: "congreso-latam-transformacion-digital-2026",
    title: "Congreso Latinoamericano de Transformación Digital 2026 y GSMA Mobile 360",
    organizer: "ASIET / GSMA",
    location: "México",
    startDate: "2026-05-13",
    endDate: "2026-05-15",
    registrationUrl: "https://cltd.lat/",
    detailsUrl: null,
    isFeatured: true,
    tags: [],
    description: "Congreso Latinoamericano de Transformación Digital 2026 y GSMA Mobile 360 (CLTD).",
  },
  {
    id: "simposio-mundial-organismos-reguladores-2026",
    title: "Simposio Mundial para Organismos Reguladores (GSR-26)",
    organizer: "UIT",
    location: "Turquía",
    startDate: "2026-05-18",
    endDate: "2026-05-21",
    registrationUrl: "https://www.itu.int/itu-d/meetings/gsr-26/",
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Simposio Mundial para Organismos Reguladores.",
  },
  {
    id: "cumbre-berec-regulatel-2026",
    title: "Cumbre BEREC - REGULATEL",
    organizer: "BEREC",
    location: "Por definir",
    startDate: "2026-06-01",
    endDate: null,
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: true,
    tags: [],
    description: "Cumbre BEREC - REGULATEL.",
  },
  {
    id: "cumbre-regulatel-prai-2026",
    title: "Cumbre REGULATEL - PRAI",
    organizer: "REGULATEL",
    location: "Virtual",
    startDate: "2026-07-01",
    endDate: null,
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Cumbre REGULATEL - PRAI.",
  },
  {
    id: "conferencia-plenipotenciarios-2026",
    title: "Conferencia de Plenipotenciarios de 2026 (PP-26)",
    organizer: "UIT",
    location: "Doha, Qatar",
    startDate: "2026-11-09",
    endDate: "2026-11-27",
    registrationUrl: "https://pp.itu.int/2026/en/",
    detailsUrl: null,
    isFeatured: true,
    tags: [],
    description: "Conferencia de Plenipotenciarios de 2026 (PP-26).",
  },
  {
    id: "29-asamblea-plenaria-regulatel-2026",
    title: "29 Asamblea Plenaria Regulatel",
    organizer: "REGULATEL",
    location: "Portugal",
    startDate: "2026-12-01",
    endDate: null,
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: true,
    tags: [],
    description: "29 Asamblea Plenaria Regulatel.",
  },
  {
    id: "mwc-barcelona-2025",
    title: "MWC Barcelona 2025",
    organizer: "GSMA",
    location: "Barcelona",
    startDate: "2025-03-03",
    endDate: "2025-03-06",
    registrationUrl: "https://www.mwcbarcelona.com/",
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Mobile World Congress Barcelona 2025.",
  },
  {
    id: "cumbre-four-lateral-berec-barcelona-2025",
    title: "4-lateral Summit BEREC-EMERG-Regulatel-EaPeReg 2025",
    organizer: "BEREC / EMERG / REGULATEL / EaPeReg",
    location: "Barcelona",
    startDate: "2025-03-05",
    endDate: null,
    registrationUrl: "https://www.berec.europa.eu/en",
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Espacio de intercambio entre foros regulatorios.",
  },
  {
    id: "reunion-regulatel-grupos-trabajo-berec-2025",
    title: "Reunión REGULATEL - Grupos de trabajo y BEREC",
    organizer: "REGULATEL / AECID",
    location: "Montevideo",
    startDate: "2025-06-17",
    endDate: "2025-06-19",
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Reunión de grupos de trabajo REGULATEL con BEREC.",
  },
  {
    id: "workshop-responsabilidad-intermediarios-internet-2025",
    title: "Workshop: Responsabilidad de los intermediarios en el ámbito de Internet",
    organizer: "REGULATEL",
    location: "Virtual",
    startDate: "2025-10-14",
    endDate: null,
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Taller sobre responsabilidad de intermediarios en Internet.",
  },
  {
    id: "taller-virtual-enfoque-genero-2025",
    title: "Taller Virtual Internacional sobre Enfoque de Género",
    organizer: "REGULATEL",
    location: "Virtual",
    startDate: "2025-10-15",
    endDate: null,
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Taller internacional virtual sobre enfoque de género.",
  },
  {
    id: "cumbre-regulatel-asiet-comtelca-punta-cana-2025",
    title: "Cumbre Regulatel-ASIET-Comtelca",
    organizer: "REGULATEL / ASIET / COMTELCA",
    location: "Punta Cana",
    startDate: "2025-12-11",
    endDate: null,
    registrationUrl: "https://www.flickr.com/photos/indotel/albums/72177720330839315",
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Evento regional sobre conectividad, cooperación y ecosistema digital.",
  },
  {
    id: "28-asamblea-plenaria-regulatel-2025",
    title: "28ª Asamblea Plenaria de REGULATEL",
    organizer: "REGULATEL",
    location: "Punta Cana",
    startDate: "2025-12-12",
    endDate: null,
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "28ª Asamblea Plenaria de REGULATEL.",
  },
  {
    id: "cumbre-regulatel-asiet-cartagena-2024",
    title: "Cumbre Regulatel - ASIET, Cartagena 2024",
    organizer: "REGULATEL / ASIET",
    location: "Cartagena",
    startDate: "2024-06-01",
    endDate: null,
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Sesión de articulación público-privada para transformación digital regional.",
  },
  {
    id: "cumbre-berec-regulatel-santa-cruz-2024",
    title: "Cumbre BEREC - REGULATEL, Santa Cruz, 2024",
    organizer: "BEREC / REGULATEL",
    location: "Santa Cruz",
    startDate: "2024-06-20",
    endDate: null,
    registrationUrl: null,
    detailsUrl: null,
    isFeatured: false,
    tags: [],
    description: "Cumbre enfocada en intercambio de experiencias regulatorias.",
  },
];

function eventStatus(startDate, endDate) {
  const ref = endDate || startDate;
  const today = new Date().toISOString().slice(0, 10);
  return ref >= today ? "upcoming" : "past";
}

function eventYear(startDate) {
  const y = new Date(`${startDate}T12:00:00`).getFullYear();
  return Number.isNaN(y) ? new Date().getFullYear() : y;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definido. Configúralo en .env o exporta la variable.");
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
  });

  const now = new Date().toISOString();
  let inserted = 0;
  let skipped = 0;

  try {
    for (const e of LEGACY_EVENTS) {
      const status = eventStatus(e.startDate, e.endDate);
      const year = eventYear(e.startDate);
      const result = await sql`
        INSERT INTO events (
          id, title, organizer, location, start_date, end_date, year, status,
          registration_url, details_url, is_featured, tags, description, image_url,
          image_file_name, image_mime_type, image_size,
          created_at, updated_at
        ) VALUES (
          ${e.id},
          ${e.title},
          ${e.organizer},
          ${e.location},
          ${e.startDate}::date,
          ${e.endDate ?? null}::date,
          ${year},
          ${status},
          ${e.registrationUrl ?? null},
          ${e.detailsUrl ?? null},
          ${e.isFeatured ?? false},
          ${sql.json(e.tags ?? [])},
          ${e.description ?? null},
          ${e.imageUrl ?? null},
          ${null},
          ${null},
          ${null},
          ${now}::timestamptz,
          ${now}::timestamptz
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id
      `;
      if (result.length) inserted += 1;
      else skipped += 1;
    }
    console.log(
      `Listo: ${inserted} evento(s) insertado(s), ${skipped} omitido(s) (ya existían con el mismo id). Total en lista: ${LEGACY_EVENTS.length}.`
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
