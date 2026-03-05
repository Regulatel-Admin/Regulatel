import { useParams, Navigate } from "react-router-dom";
import PageHero from "@/components/PageHero";
import ConvenioDetail from "@/components/convenios/ConvenioDetail";
import { getConvenioBySlug } from "@/data/convenios";

export default function ConvenioDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const convenio = slug ? getConvenioBySlug(slug) : undefined;

  if (!convenio) {
    return <Navigate to="/convenios" replace />;
  }

  return (
    <>
      <PageHero
        title={convenio.acronym}
        subtitle={convenio.title}
        breadcrumb={[
          { label: "CONVENIOS", path: "/convenios" },
          { label: convenio.acronym },
        ]}
      />
      <ConvenioDetail convenio={convenio} />
    </>
  );
}
