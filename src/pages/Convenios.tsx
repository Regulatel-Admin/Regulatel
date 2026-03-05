import PageHero from "@/components/PageHero";
import ConveniosList from "@/components/convenios/ConveniosList";
import { convenios } from "@/data/convenios";

export default function Convenios() {
  return (
    <>
      <PageHero
        title="CONVENIOS Y MEMORANDUMS"
        breadcrumb={[{ label: "CONVENIOS" }]}
        description="REGULATEL mantiene convenios y memorandums de entendimiento con organizaciones internacionales y regionales para fortalecer la cooperación en el sector de las telecomunicaciones."
      />
      <div
        className="mx-auto w-full px-4 py-12 md:px-6 md:py-16"
        style={{ maxWidth: 900, fontFamily: "var(--token-font-body)" }}
      >
        <ConveniosList convenios={convenios} />
        <section className="mt-14 rounded-xl border bg-white p-6 md:p-8" style={{ borderColor: "var(--token-border)", boxShadow: "var(--token-shadow-card)" }}>
          <h2 className="text-xl font-semibold m-0 mb-4" style={{ color: "var(--token-text-primary)" }}>
            Objetivos de los Convenios
          </h2>
          <p className="text-base leading-relaxed m-0 mb-4" style={{ color: "var(--token-text-secondary)" }}>
            Los convenios y alianzas de REGULATEL buscan fortalecer la cooperación regional e internacional, facilitando el intercambio de información, experiencias y mejores prácticas en el sector de las telecomunicaciones.
          </p>
          <p className="text-base leading-relaxed m-0" style={{ color: "var(--token-text-secondary)" }}>
            A través de estos acuerdos, REGULATEL promueve el desarrollo de políticas comunes, la capacitación de profesionales del sector y la coordinación de esfuerzos para enfrentar los desafíos del sector en América Latina.
          </p>
        </section>
      </div>
    </>
  );
}
