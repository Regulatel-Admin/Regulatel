import { useState } from "react";
import type { Country, Category } from "@/data/buenasPracticas/countries";
import { getSimilarities } from "@/lib/similarities";
import {
  countrySources,
  countryCategorySources,
} from "@/data/buenasPracticas/sources";
import CountryFlag from "./CountryFlag";
import InfoTooltip from "./InfoTooltip";

interface ComparisonPanelProps {
  countryA: Country | null;
  countryB: Country | null;
  category: Category;
}

const formatTag = (tag: string): string => {
  const map: Record<string, string> = {
    reserva_espectro: "Reserva de espectro para nuevos entrantes",
    nuevos_operadores: "Facilitación de entrada de nuevos operadores",
    inscripcion_equipos: "Inscripción / registro de equipos de telecomunicaciones",
    subastas: "Subastas de espectro",
    omv: "Operadores Móviles Virtuales (OMV)",
    servicio_universal: "Obligaciones de servicio universal",
    infraestructura_pasiva: "Infraestructura pasiva (torres, ductos, sitios)",
    infraestructura_activa: "Infraestructura activa (redes, equipos)",
    comparticion_espectro: "Compartición del espectro radioeléctrico",
    servicios_mayoristas: "Servicios mayoristas de telecomunicaciones",
    proteccion_consumidor: "Protección de los usuarios/consumidores",
    proteccion_datos: "Protección de datos personales",
    regulacion_ex_ante: "Regulación ex ante para competencia",
    posicion_dominante: "Prevención de abuso de posición dominante",
    comparticion_obligatoria: "Compartición obligatoria de infraestructura",
    comparticion_voluntaria: "Compartición voluntaria de infraestructura",
    alertas_emergencia: "Sistema de alertas de emergencia",
    difusion_celular: "Difusión celular de mensajes de alerta",
    alfabetizacion_digital: "Programas de alfabetización y capacitación digital",
    reglamento_clientes: "Reglamento de derechos de clientes TIC",
    servicio_esenciales: "Protección de servicios esenciales",
    plan_nacional_frecuencias: "Plan Nacional de Frecuencias",
    cabfra: "Cuadro de atribución de bandas de frecuencias (CABFRA)",
    sandbox: "Sandbox regulatorio para nuevas tecnologías",
    tecnologias_digitales: "Nuevas tecnologías y servicios digitales",
    "5g": "Redes 5G",
    iot: "Internet de las Cosas (IoT)",
    imt: "Telecomunicaciones móviles internacionales (IMT)",
    ley_31_1996: "Ley 31 de 1996 (marco básico de telecomunicaciones)",
    pnaf: "Plan Nacional de Atribución de Frecuencias (PNAF)",
    res_jd_107_1997: "Resolución JD-107 de 1997 del PNAF",
    licitacion_01_2023_telco: "Licitación Pública 01-2023-TELCO",
    asignacion: "Mecanismos de asignación de frecuencias",
    refarming: "Procesos de refarming de espectro",
  };
  if (map[tag]) return map[tag];
  const cleaned = tag.replace(/_/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const getTagExplanation = (
  tag: string,
  countryName: string,
  otherCountryName: string
): string => {
  const label = formatTag(tag);
  const map: Record<string, string> = {
    asignacion: `El regulador de ${countryName} documenta procedimientos específicos de asignación de frecuencias, mientras que en ${otherCountryName} la ficha no detalla mecanismos equivalentes para esta categoría.`,
    refarming: `Solo ${countryName} menciona explícitamente procesos de refarming; en ${otherCountryName} no se registran medidas de refarming en esta categoría.`,
    ley_31_1996: `${countryName} vincula esta práctica con la Ley 31 de 1996; no aparece de forma análoga en la ficha de ${otherCountryName}.`,
    pnaf: `El PNAF de ${countryName} se usa como instrumento central; en ${otherCountryName} esta herramienta no figura como práctica destacada.`,
    res_jd_107_1997: `La Resolución JD-107 de 1997 se cita como acto fundacional del PNAF de ${countryName}.`,
    licitacion_01_2023_telco: `La Licitación 01-2023-TELCO aparece solo en ${countryName}.`,
    imt: `${countryName} destaca bandas para servicios IMT (4G/5G); ${otherCountryName} no tiene referencias equivalentes.`,
    "5g": `${countryName} incorpora el despliegue de redes 5G; no figura para ${otherCountryName} en la misma categoría.`,
  };
  if (map[tag]) return map[tag];
  return `Solo ${countryName} presenta prácticas relacionadas con "${label}" en esta categoría; en ${otherCountryName} no se registran medidas equivalentes.`;
};

export default function ComparisonPanel({
  countryA,
  countryB,
  category,
}: ComparisonPanelProps) {
  const [showDetailsA, setShowDetailsA] = useState(false);
  const [showDetailsB, setShowDetailsB] = useState(false);

  if (!countryA || !countryB) {
    return (
      <p className="py-10 text-center text-base" style={{ color: "#6B7280" }}>
        Selecciona dos países para comparar
      </p>
    );
  }

  const practiceA = countryA.practices[category];
  const practiceB = countryB.practices[category];
  const categorySourcesA =
    countryCategorySources[countryA.id]?.[category] || null;
  const categorySourcesB =
    countryCategorySources[countryB.id]?.[category] || null;

  if (!practiceA || !practiceB) {
    return (
      <p className="py-10 text-center text-base" style={{ color: "#6B7280" }}>
        No hay información disponible para esta categoría
      </p>
    );
  }

  const similarities = getSimilarities(practiceA, practiceB);

  const renderSourceTooltip = (
    country: Country,
    categorySourcesList: typeof categorySourcesA
  ) => {
    const src = countrySources[country.id];
    if (!src) return null;
    const confidenceText =
      src.confidence === "real-complete"
        ? "Descripción sintetizada a partir de la ficha oficial de REGULATEL para este país."
        : src.confidence === "real-partial"
          ? "Combinación de datos reales de REGULATEL en algunas categorías y descripciones complementarias. Revisar siempre los documentos fuentes."
          : "Descripción de ejemplo; debe contrastarse con la ficha de REGULATEL y las normas del regulador nacional.";
    const sourcesList =
      categorySourcesList && categorySourcesList.length > 0 ? (
        <div className="mb-2 text-xs" style={{ color: "#6B7280" }}>
          <p className="mb-1 font-semibold text-[#111827]">Documentos normativos clave:</p>
          <ul className="list-disc list-inside space-y-1">
            {categorySourcesList.map((s) => (
              <li key={s.url} className="truncate">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:opacity-90"
                  style={{ color: "var(--news-accent)" }}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null;
    return (
      <div className="text-sm">
        <p className="mb-1 font-semibold text-[#111827]">Fuente de la información</p>
        <p className="mb-2 text-[#6B7280]">{confidenceText}</p>
        {sourcesList}
        <a
          href={src.url}
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline"
          style={{ color: "var(--news-accent)" }}
        >
          Ver ficha completa en REGULATEL ({src.label})
        </a>
      </div>
    );
  };

  const summaryBullets = [
    ...similarities.common.slice(0, 2).map((tag) => `Ambos: ${formatTag(tag)}`),
    ...(similarities.onlyA.length > 0
      ? [`Solo ${countryA.name}: ${formatTag(similarities.onlyA[0])}`]
      : []),
    ...(similarities.onlyB.length > 0
      ? [`Solo ${countryB.name}: ${formatTag(similarities.onlyB[0])}`]
      : []),
  ].slice(0, 3);

  return (
    <div className="space-y-10">
      {summaryBullets.length > 0 && (
        <div className="compareText">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>
            Resumen comparativo
          </p>
          <ul className="list-none pl-0 space-y-1 text-sm" style={{ color: "#374151" }}>
            {summaryBullets.map((bullet, i) => (
              <li key={i}>— {bullet}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="compareWrap">
        <div className="compareCol md:pr-6 md:border-r" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <CountryFlag flag={countryA.flag} size="sm" />
            <span className="compareLabel">
              {countryA.name} — Referencia (A)
            </span>
            {countrySources[countryA.id] && (
              <InfoTooltip hideFooter content={renderSourceTooltip(countryA, categorySourcesA)}>
                <button
                  type="button"
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-[0.625rem] font-medium border"
                  style={{ borderColor: "#D1D5DB", color: "#6B7280" }}
                  aria-label="Ver fuente de datos"
                >
                  i
                </button>
              </InfoTooltip>
            )}
          </div>
          <div className="compareText">
            {(() => {
              const text = showDetailsA ? practiceA.details : practiceA.summary;
              const paragraphs = text.split(/\n\n+/).filter(Boolean);
              return paragraphs.length > 1
                ? paragraphs.map((para, i) => (
                    <p key={i} className="mb-3 last:mb-0">
                      {para.trim()}
                    </p>
                  ))
                : <p>{text}</p>;
            })()}
          </div>
          {practiceA.details && practiceA.details !== practiceA.summary && (
            <button
              type="button"
              onClick={() => setShowDetailsA((v) => !v)}
              className="compareLink mt-2 inline-block"
              aria-expanded={showDetailsA}
            >
              {showDetailsA ? "Ocultar detalles" : "Ver texto completo →"}
            </button>
          )}
          {countrySources[countryA.id]?.confidence !== "real-complete" && (
            <p className="mt-4 text-xs" style={{ color: "#6B7280" }}>
              Aviso: esta ficha debe validarse con la documentación oficial.
            </p>
          )}
        </div>

        <div className="compareCol md:pl-6">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <CountryFlag flag={countryB.flag} size="sm" />
            <span className="compareLabel">
              {countryB.name} — Comparador (B)
            </span>
            {countrySources[countryB.id] && (
              <InfoTooltip hideFooter content={renderSourceTooltip(countryB, categorySourcesB)}>
                <button
                  type="button"
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-[0.625rem] font-medium border"
                  style={{ borderColor: "#D1D5DB", color: "#6B7280" }}
                  aria-label="Ver fuente de datos"
                >
                  i
                </button>
              </InfoTooltip>
            )}
          </div>
          <div className="compareText">
            {(() => {
              const text = showDetailsB ? practiceB.details : practiceB.summary;
              const paragraphs = text.split(/\n\n+/).filter(Boolean);
              return paragraphs.length > 1
                ? paragraphs.map((para, i) => (
                    <p key={i} className="mb-3 last:mb-0">
                      {para.trim()}
                    </p>
                  ))
                : <p>{text}</p>;
            })()}
          </div>
          {practiceB.details && practiceB.details !== practiceB.summary && (
            <button
              type="button"
              onClick={() => setShowDetailsB((v) => !v)}
              className="compareLink mt-2 inline-block"
              aria-expanded={showDetailsB}
            >
              {showDetailsB ? "Ocultar detalles" : "Ver texto completo →"}
            </button>
          )}
          {countrySources[countryB.id]?.confidence !== "real-complete" && (
            <p className="mt-4 text-xs" style={{ color: "#6B7280" }}>
              Aviso: esta ficha debe validarse con la documentación oficial.
            </p>
          )}
        </div>
      </div>

      <hr className="obsDivider" />

      <div className="uniqueWrap">
        <div className="uniqueCol">
          <h3 className="uniqueTitle">
            Elementos únicos de {countryA.name}
          </h3>
          {similarities.onlyA.length > 0 ? (
            <ul className="uniqueList">
              {similarities.onlyA.map((tag, index) => (
                <li key={index}>
                  <InfoTooltip
                    hideFooter
                    content={
                      <p className="text-sm">{getTagExplanation(tag, countryA.name, countryB.name)}</p>
                    }
                  >
                    <span
                      className="border-b border-transparent hover:border-current cursor-help"
                      style={{ color: "var(--news-accent)" }}
                    >
                      {formatTag(tag)}
                    </span>
                  </InfoTooltip>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "#6B7280" }}>
              No hay highlights para esta categoría.
            </p>
          )}
        </div>
        <div className="uniqueCol">
          <h3 className="uniqueTitle">
            Elementos únicos de {countryB.name}
          </h3>
          {similarities.onlyB.length > 0 ? (
            <ul className="uniqueList">
              {similarities.onlyB.map((tag, index) => (
                <li key={index}>
                  <InfoTooltip
                    hideFooter
                    content={
                      <p className="text-sm">{getTagExplanation(tag, countryB.name, countryA.name)}</p>
                    }
                  >
                    <span
                      className="border-b border-transparent hover:border-current cursor-help"
                      style={{ color: "var(--news-accent)" }}
                    >
                      {formatTag(tag)}
                    </span>
                  </InfoTooltip>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "#6B7280" }}>
              No hay highlights para esta categoría.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
