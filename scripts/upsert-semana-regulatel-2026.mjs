/**
 * Añade la columna attachments a events, publica los documentos de la
 * Cumbre REGULATEL-ASIET-COMTELCA 2026 y la nota de prensa asociada.
 * No pisa el enlace de inscripción si el evento ya existía.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import postgres from "postgres";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local"), override: true });

const EVENT_ID = "cumbre-regulatel-asiet-comtelca-2026";
const NEWS_ID = "admin-semana-regulatel-montevideo-2026";
const NEWS_SLUG = "semana-regulatel-montevideo-2026";
const IMAGE = "/images/noticias/semana-regulatel-montevideo-2026.png";

const ATTACHMENTS = [
  {
    id: "boletin-semana-regulatel-2026",
    title: "Boletín informativo — Semana REGULATEL Uruguay",
    url: "/documents/semana-regulatel-montevideo-2026/boletin-informativo-semana-regulatel-uruguay.pdf",
    fileName: "boletin-informativo-semana-regulatel-uruguay.pdf",
    fileType: "application/pdf",
  },
  {
    id: "nota-prensa-semana-regulatel-2026",
    title: "Nota de prensa — REGULATEL reunirá en Montevideo a reguladores y organizaciones aliadas",
    url: "/documents/semana-regulatel-montevideo-2026/regulatel-reunira-en-montevideo-a-reguladores.docx",
    fileName: "regulatel-reunira-en-montevideo-a-reguladores.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
];

const EVENT_TITLE = "Cumbre REGULATEL - ASIET - COMTELCA";
const EVENT_DESCRIPTION =
  "XVIII Cumbre REGULATEL–ASIET–COMTELCA, el 16 de octubre de 2026 en el CAF (Montevideo), en el marco de la Semana REGULATEL 2026.";
const NEWS_TITLE =
  "REGULATEL reunirá en Montevideo a reguladores y organizaciones aliadas durante la Semana REGULATEL 2026";
const NEWS_EXCERPT =
  "La agenda regional, prevista del 13 al 16 de octubre, integrará reuniones de trabajo y cumbres junto a BEREC, PRAI, ASIET y COMTELCA para fortalecer la cooperación y el intercambio de experiencias ante los desafíos de la transformación digital.";
const NEWS_BODY = [
  "Montevideo, Uruguay.– El Foro Latinoamericano de Entes Reguladores de Telecomunicaciones (REGULATEL) reunirá del 13 al 16 de octubre de 2026 en Montevideo a representantes de organismos reguladores y organizaciones aliadas durante la Semana REGULATEL 2026, un espacio regional orientado a fortalecer la cooperación, intercambiar experiencias y avanzar en respuestas conjuntas ante los desafíos y oportunidades del ecosistema digital.",
  "Durante cuatro días, la capital uruguaya será escenario de reuniones técnicas y encuentros de alto nivel que congregarán a REGULATEL, el Organismo de Reguladores Europeos de las Comunicaciones Electrónicas (BEREC), la Plataforma de Reguladores del Sector Audiovisual de Iberoamérica (PRAI), la Asociación Interamericana de Empresas de Telecomunicaciones (ASIET) y la Comisión Técnica Regional de Telecomunicaciones (COMTELCA).",
  "La Semana REGULATEL 2026 iniciará los días 13 y 14 de octubre con las reuniones de los Grupos de Trabajo y del Comité Ejecutivo del Foro, espacios destinados al seguimiento de las iniciativas regionales, el intercambio de buenas prácticas y la coordinación de acciones entre sus miembros.",
  "El 15 de octubre se celebrarán la Cumbre BEREC–REGULATEL y la Cumbre BEREC–PRAI, encuentros que permitirán ampliar el diálogo entre los organismos reguladores de América Latina, el Caribe y Europa y compartir experiencias sobre los principales retos que plantea la evolución de los mercados y servicios digitales.",
  "Ambas cumbres tendrán lugar en las instalaciones del Centro de Formación de la Cooperación Española (AECID), en Montevideo.",
  "La agenda concluirá el 16 de octubre con la XVIII Cumbre REGULATEL–ASIET–COMTELCA, que reunirá a representantes de los sectores público y privado para abordar temas de interés común y continuar impulsando mecanismos de articulación que contribuyan al desarrollo de las telecomunicaciones y la transformación digital en la región.",
  "Este encuentro se desarrollará en las instalaciones del Banco de Desarrollo de América Latina y el Caribe (CAF), en la capital uruguaya.",
  "La Semana REGULATEL 2026 busca consolidar un espacio de diálogo regional que permita estrechar los vínculos entre reguladores, organizaciones internacionales y actores del sector, así como promover el intercambio de conocimientos y experiencias frente a un entorno tecnológico en constante evolución.",
  "La celebración conjunta de estas reuniones y cumbres permitirá articular distintas perspectivas regulatorias e institucionales y fortalecer la cooperación entre América Latina, el Caribe y Europa en torno a los desafíos que acompañan la transformación digital.",
  "El Instituto Dominicano de las Telecomunicaciones (Indotel), en su condición de organismo que ejerce la Presidencia de REGULATEL, participa en la organización de la Semana junto con las entidades involucradas en las distintas actividades previstas en Montevideo.",
].join("\n\n");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log("DATABASE_URL no está definido. Se omite el upsert en Neon; el contenido queda en el código y en public/.");
    return;
  }

  const sql = postgres(databaseUrl, { max: 1, idle_timeout: 20, connect_timeout: 15 });
  const now = new Date().toISOString();
  try {
    await sql.unsafe(`ALTER TABLE events ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'`);

    const found = await sql`
      SELECT id, title, registration_url, image_url
      FROM events
      WHERE id = ${EVENT_ID}
         OR (start_date = DATE '2026-10-16' AND title ILIKE ${"%ASIET%"} AND title ILIKE ${"%COMTELCA%"})
         OR (year = 2026 AND title ILIKE ${"%Cumbre REGULATEL - ASIET - COMTELCA%"})
      ORDER BY CASE WHEN id = ${EVENT_ID} THEN 0 ELSE 1 END
      LIMIT 1
    `;

    const existing = found[0];
    const eventId = existing?.id ?? EVENT_ID;
    const registrationUrl = existing?.registration_url ?? null;

    await sql`
      INSERT INTO events (
        id, title, organizer, location, start_date, end_date, year, status,
        registration_url, details_url, is_featured, tags, description, image_url,
        attachments, created_at, updated_at
      ) VALUES (
        ${eventId},
        ${EVENT_TITLE},
        ${"REGULATEL"},
        ${"Montevideo, Uruguay"},
        ${"2026-10-16"}::date,
        NULL,
        ${2026},
        ${"upcoming"},
        ${registrationUrl},
        NULL,
        ${true},
        ${sql.json(["ASIET", "COMTELCA", "Montevideo"])},
        ${EVENT_DESCRIPTION},
        ${null},
        ${sql.json(ATTACHMENTS)},
        ${now}::timestamptz,
        ${now}::timestamptz
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        organizer = EXCLUDED.organizer,
        location = EXCLUDED.location,
        start_date = EXCLUDED.start_date,
        year = EXCLUDED.year,
        status = EXCLUDED.status,
        is_featured = EXCLUDED.is_featured,
        description = EXCLUDED.description,
        image_url = NULL,
        attachments = EXCLUDED.attachments,
        updated_at = EXCLUDED.updated_at
    `;
    console.log(`Evento listo: ${eventId}`);

    const newsExisting = await sql`SELECT id FROM news WHERE slug = ${NEWS_SLUG} OR id = ${NEWS_ID} LIMIT 1`;
    const newsId = newsExisting[0]?.id ?? NEWS_ID;
    await sql`
      INSERT INTO news (
        id, slug, title, date, date_formatted, category, excerpt,
        image_url, body, author, link, published, created_at, updated_at
      ) VALUES (
        ${newsId},
        ${NEWS_SLUG},
        ${NEWS_TITLE},
        ${"2026-09-08"}::date,
        ${"8 septiembre 2026"},
        ${"Noticias"},
        ${NEWS_EXCERPT},
        ${IMAGE},
        ${NEWS_BODY},
        ${"REGULATEL"},
        ${"/eventos/" + eventId},
        ${true},
        ${now}::timestamptz,
        ${now}::timestamptz
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        title = EXCLUDED.title,
        date = EXCLUDED.date,
        date_formatted = EXCLUDED.date_formatted,
        excerpt = EXCLUDED.excerpt,
        image_url = EXCLUDED.image_url,
        body = EXCLUDED.body,
        author = EXCLUDED.author,
        link = EXCLUDED.link,
        published = true,
        updated_at = EXCLUDED.updated_at
    `;
    console.log(`Noticia lista: ${newsId} (${NEWS_SLUG})`);

    const carouselRow = await sql`SELECT value FROM site_settings WHERE key = ${"featured_carousel"} LIMIT 1`;
    const carouselItem = {
      id: EVENT_ID,
      type: "eventos",
      date: "16 de octubre de 2026",
      title: EVENT_TITLE,
      imageUrl: "/images/noticias/semana-regulatel-montevideo-2026.png",
      href: `/eventos/${eventId}`,
      ctaPrimaryLabel: "Ver Cumbre",
      location: "Montevideo, Uruguay",
      imagePosition: "center",
      imageFit: "contain",
      active: true,
    };
    let carousel = [];
    if (carouselRow[0]?.value) {
      const raw = carouselRow[0].value;
      carousel = Array.isArray(raw) ? raw : typeof raw === "string" ? JSON.parse(raw) : [];
    }
    if (carousel.length > 0) {
      carousel = carousel.filter((item) => item && item.id !== EVENT_ID);
      carousel.unshift(carouselItem);
      await sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES (${"featured_carousel"}, ${sql.json(carousel)}, ${now}::timestamptz)
        ON CONFLICT (key) DO UPDATE SET
          value = ${sql.json(carousel)},
          updated_at = ${now}::timestamptz
      `;
      console.log(`Cumbres destacadas: ${carousel.length} slides (nueva cumbre al inicio)`);
    } else {
      console.log("Cumbres destacadas: sin fila en BD; se usa el listado del código (incluye Montevideo 2026).");
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
