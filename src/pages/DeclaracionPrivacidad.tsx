import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Mail } from "lucide-react";
import PageHero from "@/components/PageHero";

const SECTIONS = [
  {
    id: "finalidad",
    title: "1. Finalidad de la recopilación de datos",
    content: "Los datos personales que REGULATEL recaba a través de este sitio tienen como finalidad la gestión institucional del Foro, incluyendo el envío de comunicaciones sobre actividades, noticias y eventos; la atención de consultas y solicitudes de contacto; la administración de suscripciones a boletines o listas de distribución; y el cumplimiento de obligaciones derivadas de la participación en las actividades del Foro. No utilizamos la información para fines distintos de los indicados ni la cedemos a terceros con propósitos comerciales.",
  },
  {
    id: "datos",
    title: "2. Datos que pueden recopilarse",
    intro: "En formularios de suscripción, contacto o registro podremos solicitar, según el caso, datos tales como:",
    items: [
      "Nombre y apellidos",
      "Correo electrónico",
      "País o institución de pertenencia",
      "Cargo o función (cuando sea relevante para la gestión de la solicitud)",
      "Cualquier otro dato que el titular facilite voluntariamente en mensajes o formularios",
    ],
    outro: "Solo recopilamos los datos necesarios para la finalidad indicada en cada formulario. Los campos obligatorios se señalan como tales; el resto son opcionales.",
  },
  {
    id: "uso",
    title: "3. Uso de la información",
    content: "La información proporcionada se utiliza exclusivamente para los fines descritos en cada canal de recogida: envío de actualizaciones del portal, respuestas a consultas, gestión de suscripciones a listas de medios o comunicaciones institucionales, y mejora de los servicios del Foro. REGULATEL no utiliza los datos personales para publicidad comercial ni los transmite a terceros para fines de marketing.",
  },
  {
    id: "conservacion",
    title: "4. Conservación y protección de datos",
    content: "Conservamos los datos personales durante el tiempo necesario para cumplir con las finalidades para las que fueron recabados y, cuando corresponda, para atender obligaciones legales o institucionales. Se adoptan medidas técnicas y organizativas adecuadas para proteger la información frente a accesos no autorizados, pérdida o alteración, en consonancia con las prácticas propias de una organización institucional.",
  },
  {
    id: "derechos",
    title: "5. Derechos del titular de los datos",
    content: "Las personas que hayan facilitado sus datos a REGULATEL pueden, en los términos aplicables, ejercer los derechos de acceso, rectificación, supresión o limitación del tratamiento, así como oponerse al tratamiento o solicitar la portabilidad de sus datos. Para ejercer estos derechos o formular consultas en materia de privacidad, puede utilizarse el canal de contacto indicado al final de esta declaración.",
  },
  {
    id: "baja",
    title: "6. Baja de comunicaciones",
    content: "Quienes reciban comunicaciones por correo electrónico (boletines, avisos o listas de distribución) pueden darse de baja en cualquier momento mediante el enlace de baja que se incluye en dichos mensajes, o bien solicitando la baja directamente a través del canal de contacto. La baja no afectará al tratamiento de los datos cuando su conservación sea necesaria por obligación legal o institucional.",
  },
  {
    id: "fines",
    title: "7. Uso limitado a fines institucionales",
    content: "REGULATEL utiliza la información recabada únicamente en el ámbito de sus funciones como foro de entes reguladores de telecomunicaciones. No se realizan tratamientos masivos con fines comerciales ni se comparten datos con terceros para usos ajenos a la gestión institucional del Foro, salvo que la ley lo exija o el titular haya dado su consentimiento expreso.",
  },
  {
    id: "contacto",
    title: "8. Contacto y consultas sobre privacidad",
    content: "Para cualquier consulta relacionada con el tratamiento de sus datos personales o con esta declaración de privacidad, puede dirigirse a la Secretaría Ejecutiva de REGULATEL a través de la sección de Contacto de este portal o por los canales oficiales que se indican en la misma. Atenderemos su solicitud con la diligencia debida y en consonancia con las prácticas institucionales del Foro.",
  },
];

export default function DeclaracionPrivacidad() {
  return (
    <>
      <PageHero
        title="Declaración de privacidad"
        subtitle="Tratamiento y protección de datos personales en el portal REGULATEL"
        breadcrumb={[{ label: "Declaración de privacidad" }]}
      />

      <div
        className="w-full"
        style={{
          backgroundColor: "#FAFBFC",
          borderTop: "1px solid rgba(22,61,89,0.07)",
          fontFamily: "var(--token-font-body)",
        }}
      >
        <div className="mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16" style={{ maxWidth: "820px" }}>
          {/* Intro card */}
          <div
            className="mb-10 overflow-hidden rounded-2xl border bg-white"
            style={{
              borderColor: "rgba(22,61,89,0.10)",
              boxShadow: "0 4px 24px rgba(22,61,89,0.06)",
              borderTop: "3px solid var(--regu-blue)",
            }}
          >
            <div className="p-6 md:p-8">
              <div className="mb-5 flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "rgba(68,137,198,0.10)" }}
                >
                  <Shield className="h-6 w-6" style={{ color: "var(--regu-blue)" }} />
                </div>
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.12em] mb-0.5"
                    style={{ color: "var(--regu-gray-400)" }}
                  >
                    Compromiso institucional
                  </p>
                  <p
                    className="text-base leading-relaxed md:text-lg"
                    style={{ color: "var(--regu-gray-700)" }}
                  >
                    El Foro Latinoamericano de Entes Reguladores de Telecomunicaciones (REGULATEL) se compromete a proteger la privacidad de las personas que utilizan este portal y de quienes facilitan sus datos a través de formularios de suscripción, contacto o demás canales oficiales. La presente declaración describe cómo recopilamos, utilizamos y protegemos la información personal, en cumplimiento de principios de transparencia y buenas prácticas institucionales.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.id} className="scroll-mt-6">
                <h2
                  className="mb-4 flex items-start gap-3 text-lg font-bold md:text-xl"
                  style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}
                >
                  <span
                    className="mt-1.5 h-5 w-[3px] flex-shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--regu-blue)" }}
                    aria-hidden
                  />
                  {section.title}
                </h2>
                {section.content && (
                  <p
                    className="text-[0.9375rem] leading-relaxed md:text-base"
                    style={{ color: "var(--regu-gray-700)" }}
                  >
                    {section.content}
                  </p>
                )}
                {section.intro && (
                  <>
                    <p
                      className="mb-3 text-[0.9375rem] leading-relaxed md:text-base"
                      style={{ color: "var(--regu-gray-700)" }}
                    >
                      {section.intro}
                    </p>
                    <ul className="mb-3 space-y-2 pl-0 list-none">
                      {section.items!.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-[0.9375rem] leading-relaxed md:text-base"
                          style={{ color: "var(--regu-gray-700)" }}
                        >
                          <span
                            className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: "var(--regu-blue)" }}
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p
                      className="text-[0.9375rem] leading-relaxed md:text-base"
                      style={{ color: "var(--regu-gray-700)" }}
                    >
                      {section.outro}
                    </p>
                  </>
                )}
              </section>
            ))}
          </div>

          {/* Last update + CTA */}
          <div
            className="mt-12 rounded-2xl border px-6 py-5 md:px-8"
            style={{
              borderColor: "rgba(22,61,89,0.10)",
              backgroundColor: "rgba(68,137,198,0.04)",
              borderLeft: "4px solid var(--regu-blue)",
            }}
          >
            <p
              className="text-xs mb-4"
              style={{ color: "var(--regu-gray-500)" }}
            >
              Última actualización: 2026. REGULATEL se reserva el derecho de actualizar esta declaración cuando sea necesario; se recomienda su consulta periódica.
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: "var(--regu-blue)" }}
            >
              <Mail className="h-4 w-4" />
              Ir a Contacto
            </Link>
          </div>

          {/* Back link */}
          <nav
            className="mt-10 pt-8 border-t flex justify-center"
            style={{ borderColor: "rgba(22,61,89,0.08)" }}
            aria-label="Navegación final"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-75"
              style={{ color: "var(--regu-blue)" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a inicio
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
