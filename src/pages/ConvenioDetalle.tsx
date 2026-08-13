import { useParams, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageHero from "@/components/PageHero";
import ConvenioDetail from "@/components/convenios/ConvenioDetail";
import { getConvenioBySlug } from "@/data/convenios";
import { useConveniosPublic } from "@/contexts/SiteSettingsContext";
import { useLocalizedConvenio, useLocalizedConvenios } from "@/hooks/useLocalizedConvenios";
import { useSiteEdit } from "@/contexts/SiteEditContext";
import { EditableSpot } from "@/components/site-edit/EditableSpot";

export default function ConvenioDetalle() {
  const { t } = useTranslation();
  const { enabled: siteEditEnabled } = useSiteEdit();
  const rawConvenios = useConveniosPublic();
  const localizedList = useLocalizedConvenios(rawConvenios);
  const convenios = siteEditEnabled ? rawConvenios : localizedList;
  const { slug } = useParams<{ slug: string }>();
  const rawConvenio = slug ? getConvenioBySlug(slug, rawConvenios) : undefined;
  const localizedConvenio = useLocalizedConvenio(rawConvenio);
  const convenio = siteEditEnabled ? rawConvenio : localizedConvenio;

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
      <EditableSpot
        className="rounded-2xl"
        target={{ kind: "convenio", slug: convenio.slug }}
        label={`Editar ${convenio.acronym || "convenio"}`}
      >
        <ConvenioDetail convenio={convenio} allConvenios={convenios} />
      </EditableSpot>
    </>
  );
}
