import type { Category } from "@/data/buenasPracticas/countries";
import { categories } from "@/data/buenasPracticas/countries";
import InfoTooltip from "./InfoTooltip";

interface CategoryTabsProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  countryAName?: string | null;
  countryBName?: string | null;
}

const categoryShortNames: Record<Category, string> = {
  "Espectro radioeléctrico": "Espectro",
  "Competencia Económica": "Competencia",
  Ciberseguridad: "Ciberseguridad",
  "Protección del usuario": "Protección",
  "Tecnologías emergentes": "Tecnologías",
  "Compartición de la infraestructura": "Infraestructura",
  "Telecomunicaciones de emergencia": "Emergencia",
  "Homologación de productos y dispositivos": "Homologación",
};

const categoryDescriptions: Record<
  Category,
  { descripcion: string; recomendacion: string }
> = {
  "Espectro radioeléctrico": {
    descripcion:
      "Cómo se asignan, administran y reorganizan las bandas de frecuencias para servicios móviles, fijos y satelitales.",
    recomendacion:
      "Revisar el calendario de subastas y los criterios de reserva de espectro para nuevos entrantes y 5G.",
  },
  "Competencia Económica": {
    descripcion:
      "Reglas para evitar concentración, promover nuevos entrantes y asegurar condiciones equitativas entre operadores.",
    recomendacion:
      "Evaluar si se requieren obligaciones adicionales de acceso mayorista u OMV para dinamizar el mercado.",
  },
  Ciberseguridad: {
    descripcion:
      "Estrategias, obligaciones y coordinación para proteger redes y servicios críticos frente a incidentes digitales.",
    recomendacion:
      "Fortalecer protocolos de reporte de incidentes y coordinación público-privada en infraestructura crítica.",
  },
  "Protección del usuario": {
    descripcion:
      "Derechos de los usuarios de servicios TIC, transparencia, calidad de servicio y mecanismos de reclamo.",
    recomendacion:
      "Actualizar reglamentos de derechos de los clientes y simplificar canales de reclamo y resolución de controversias.",
  },
  "Tecnologías emergentes": {
    descripcion:
      "Enfoque regulatorio para IoT, 5G, servicios digitales y modelos innovadores (sandbox, pilotos, etc.).",
    recomendacion:
      "Diseñar un programa piloto para probar servicios 5G/IoT con reglas claras y plazos definidos.",
  },
  "Compartición de la infraestructura": {
    descripcion:
      "Reglas para compartir torres, fibra y demás infraestructura, reduciendo costos y acelerando el despliegue.",
    recomendacion:
      "Reforzar obligaciones de compartición en zonas rurales y revisar incentivos para acuerdos voluntarios urbanos.",
  },
  "Telecomunicaciones de emergencia": {
    descripcion:
      "Mecanismos regulatorios para asegurar comunicaciones confiables durante desastres y emergencias.",
    recomendacion:
      "Consolidar un sistema de alertas tempranas por difusión celular coordinado con las autoridades de emergencia.",
  },
  "Homologación de productos y dispositivos": {
    descripcion:
      "Procedimientos para certificar equipos de telecomunicaciones según estándares técnicos y de seguridad.",
    recomendacion:
      "Digitalizar por completo la homologación y reconocer certificaciones de laboratorios internacionales acreditados.",
  },
};

export default function CategoryTabs({
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="w-full">
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "#6B7280" }}
      >
        Categoría de análisis
      </p>
      <div className="categoryTabs">
        {categories.map((category) => {
          const desc = categoryDescriptions[category];
          const isActive = selectedCategory === category;
          return (
            <InfoTooltip
              key={category}
              hideFooter
              content={
                <div className="space-y-2 text-sm">
                  <p>{desc.descripcion}</p>
                  <div className="text-xs opacity-90">
                    <span className="font-semibold">Recomendación adaptable:</span>
                    <br />
                    <span>{desc.recomendacion}</span>
                  </div>
                </div>
              }
            >
              <button
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`categoryTab ${isActive ? "categoryTabActive" : ""}`}
              >
                {categoryShortNames[category]}
              </button>
            </InfoTooltip>
          );
        })}
      </div>
    </div>
  );
}
