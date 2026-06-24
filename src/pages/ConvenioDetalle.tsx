import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageHero from "@/components/PageHero";
import ConvenioDetail from "@/components/convenios/ConvenioDetail";
import { getConvenioBySlug } from "@/data/convenios";
import { useConveniosPublic } from "@/contexts/SiteSettingsContext";
import { useLocalizedConvenio, useLocalizedConvenios } from "@/hooks/useLocalizedConvenios";

export default function ConvenioDetalle() {
  const { t } = useTranslation();
  const rawConvenios = useConveniosPublic();
  const convenios = useLocalizedConvenios(rawConvenios);
  const { slug } = useParams<{ slug: string }>();
  const rawConvenio = slug ? getConvenioBySlug(slug, rawConvenios) : undefined;
  const convenio = useLocalizedConvenio(rawConvenio);

  if (!convenio) {
    return <Navigate to="/convenios" replace />;
  }

  return (
    <>
      <PageHero
        title={convenio.acronym}
        subtitle={convenio.title}
        breadcrumb={[
          { label: t("pages.conveniosPage.breadcrumbLabel"), path: "/convenios" },
          { label: convenio.acronym },
        ]}
      />
      <ConvenioDetail convenio={convenio} allConvenios={convenios} />
    </>
  );
}
