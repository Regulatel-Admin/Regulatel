import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, ExternalLink, Search, X, ChevronRight, ChevronLeft, ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PageHero from '@/components/PageHero';
import { api } from '@/lib/api';
import {
  DIRECTORIO_AUTORIDADES_SETTINGS_KEY,
  defaultDirectorioAutoridades,
  parseDirectorioFromSettingValue,
  type DirectorioAutoridad,
} from '@/data/directorioAutoridades';
import { useEntesReguladoresMiembros } from '@/contexts/SiteSettingsContext';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

// Logos locales (public/images/logos)
const logoUrlMap: Record<string, string> = {
  'sub-secretaria-telecom': '/images/logos/sub-secretaria-telecom.png',
  'anatel': '/images/comite-ejecutivo/anatel.png',
  'att': '/images/logos/att.png',
  'enacom': '/images/logos/enacom.png',
  'sutel': '/images/logos/sutel.png',
  'min-com': '/images/logos/min-com.png',
  'agcom': '/images/logos/agcom.png',
  'arcotel': '/images/logos/arcotel.png',
  'crc': '/images/logos/crc.png',
  'cnmc': '/images/logos/cnmc.png',
  'sit': '/images/logos/sit.png',
  'conatel': '/images/logos/conatel.png',
  'indotel': '/images/logos/indotel.png',
  'ift': '/images/logos/CRT-Mexico.png',
  'subtel': '/images/logos/subtel.png',
  'osiptel': '/images/logos/osiptel.png',
  'conatel-gt': '/images/logos/conatel-gt.png',
  'conatel-py': '/images/logos/conatel-py.png',
  'anacom': '/images/logos/anacom.png',
  'net': '/images/logos/net.png',
  'ursec': '/images/logos/ursec.png',
  'conatel-ve': '/images/logos/conatel-ve.png',
  'asep': '/images/logos/asep.png',
  'telcor': '/images/logos/telcor.png',
};

// Componente inteligente para cargar logos con múltiples intentos
const LogoImage: React.FC<{ name: string; route: string; logoUrl?: string }> = ({ name, route, logoUrl }) => {
  const [imgSrc, setImgSrc] = React.useState<string>('');
  const [hasError, setHasError] = React.useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const routeKey = route.replace(/^\//, '').split('/')[0] ?? '';

  const possibleUrls = React.useMemo(() => {
    const custom = logoUrl?.trim();
    if (custom) return [custom];
    const url = logoUrlMap[routeKey];
    return url ? [url] : [];
  }, [routeKey, logoUrl]);
  
  useEffect(() => {
    if (possibleUrls.length > 0) {
      setImgSrc(possibleUrls[0]);
      setCurrentUrlIndex(0);
      setHasError(false);
    }
  }, [possibleUrls]);
  
  const handleError = () => {
    if (currentUrlIndex < possibleUrls.length - 1) {
      const nextIndex = currentUrlIndex + 1;
      setCurrentUrlIndex(nextIndex);
      setImgSrc(possibleUrls[nextIndex]);
    } else {
      setHasError(true);
    }
  };
  
  if (hasError || !imgSrc) {
    return (
      <div className="text-center w-full">
        <div className="text-base font-bold leading-tight" style={{ color: "var(--regu-gray-900)" }}>{name}</div>
      </div>
    );
  }
  
  return (
    <img 
      src={imgSrc} 
      alt={`${name} logo`}
      className="max-w-full max-h-full object-contain"
      onError={handleError}
      loading="lazy"
    />
  );
};

const Miembros: React.FC = () => {
  const entesReguladoresBase = useEntesReguladoresMiembros();
  const [directorioAutoridades, setDirectorioAutoridades] = useState<DirectorioAutoridad[]>(defaultDirectorioAutoridades);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [enteSearchTerm, setEnteSearchTerm] = useState('');
  const [selectedEnteCountry, setSelectedEnteCountry] = useState<string | null>(null);

  const loadDirectorio = useCallback(async () => {
    const res = await api.settings.get(DIRECTORIO_AUTORIDADES_SETTINGS_KEY);
    if (res.ok && res.data && res.data.value != null) {
      const parsed = parseDirectorioFromSettingValue(res.data.value);
      if (parsed !== null) {
        setDirectorioAutoridades(parsed);
        return;
      }
    }
    setDirectorioAutoridades(defaultDirectorioAutoridades);
  }, []);

  useEffect(() => {
    void loadDirectorio();
  }, [loadDirectorio]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void loadDirectorio();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [loadDirectorio]);
  
  const filteredDirectorio = useMemo(() => {
    if (!searchTerm && !selectedCountry) return directorioAutoridades;
    
    return directorioAutoridades.filter(item => {
      const matchesSearch = !searchTerm || 
        item.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.presidente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.corresponsal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cargo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = !selectedCountry || item.pais === selectedCountry;
      
      return matchesSearch && matchesCountry;
    });
  }, [directorioAutoridades, searchTerm, selectedCountry]);
  
  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(directorioAutoridades.map(item => item.pais))).sort();
  }, [directorioAutoridades]);

  const entesReguladores = useMemo(
    () => [...entesReguladoresBase].sort((a, b) => a.country.localeCompare(b.country, 'es')),
    [entesReguladoresBase]
  );

  // Filter for entes reguladores (sorted by country)
  const filteredEntesReguladores = useMemo(() => {
    return entesReguladores.filter(ente => {
      const matchesSearch = !enteSearchTerm || 
        ente.name.toLowerCase().includes(enteSearchTerm.toLowerCase()) ||
        ente.country.toLowerCase().includes(enteSearchTerm.toLowerCase()) ||
        (ente.fullName && ente.fullName.toLowerCase().includes(enteSearchTerm.toLowerCase()));
      
      const matchesCountry = !selectedEnteCountry || ente.country === selectedEnteCountry;
      
      return matchesSearch && matchesCountry;
    });
  }, [entesReguladores, enteSearchTerm, selectedEnteCountry]);

  const uniqueEnteCountries = useMemo(() => {
    return Array.from(new Set(entesReguladores.map((ente) => ente.country))).sort();
  }, [entesReguladores]);

  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [carouselCanScrollLeft, setCarouselCanScrollLeft] = useState(false);
  const [carouselCanScrollRight, setCarouselCanScrollRight] = useState(true);
  const updateCarouselScrollState = React.useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCarouselCanScrollLeft(el.scrollLeft > 0);
    setCarouselCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);
  React.useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateCarouselScrollState();
    el.addEventListener('scroll', updateCarouselScrollState);
    const ro = new ResizeObserver(updateCarouselScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateCarouselScrollState);
      ro.disconnect();
    };
  }, [updateCarouselScrollState, filteredEntesReguladores.length]);

  const CAROUSEL_SCROLL_PX = 320;
  const scrollCarousel = (direction: 'left' | 'right') => {
    carouselRef.current?.scrollBy({
      left: direction === 'left' ? -CAROUSEL_SCROLL_PX : CAROUSEL_SCROLL_PX,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <PageHero
        title="Miembros"
        subtitle="QUIÉNES SOMOS"
        breadcrumb={[{ label: "Miembros" }]}
        description="23 entes reguladores de América Latina y Europa trabajan juntos a través del Foro REGULATEL."
      />
      <div className="w-full py-12 md:py-16 lg:py-20" style={{ backgroundColor: "#FAFBFC", borderTop: "1px solid rgba(22,61,89,0.07)", fontFamily: "var(--token-font-body)" }}>
        <div className="container px-4 md:px-6 mx-auto" style={{ maxWidth: "1180px" }}>

        {/* Header sección entes reguladores */}
        <div className="mb-8 flex items-start gap-4">
          <div className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--regu-blue)" }} aria-hidden />
          <div>
            <h2 className="text-xl font-bold md:text-2xl" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>Entes Reguladores Miembros</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>Organismos oficiales de telecomunicaciones por país</p>
          </div>
        </div>

        {/* Búsqueda y filtro */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="mb-5">
          <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 6px rgba(22,61,89,0.04)" }}>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="flex-1 w-full md:w-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--regu-gray-500)" }} />
                <Input
                  type="text"
                  placeholder="Buscar por país o agencia..."
                  value={enteSearchTerm}
                  onChange={(e) => setEnteSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full rounded-lg border focus:ring-2 focus:ring-offset-0"
                  style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-900)" }}
                />
                {enteSearchTerm && (
                  <button
                    onClick={() => setEnteSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                    style={{ color: "var(--regu-gray-500)" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Country Filter */}
              <div className="w-full md:w-auto">
                <select
                  value={selectedEnteCountry || ''}
                  onChange={(e) => setSelectedEnteCountry(e.target.value || null)}
                  className="w-full md:w-48 px-4 py-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-offset-0"
                  style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-900)" }}
                >
                  <option value="">Todos los países</option>
                  {uniqueEnteCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            {(enteSearchTerm || selectedEnteCountry) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm"
                style={{ color: "var(--regu-blue)" }}
              >
                {filteredEntesReguladores.length} {filteredEntesReguladores.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="mb-14">
          <div className="relative overflow-hidden rounded-2xl border bg-white p-8 md:p-10" style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.06)" }}>
            {filteredEntesReguladores.length > 0 ? (
              <>
                <div className="relative flex items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() => scrollCarousel('left')}
                    disabled={!carouselCanScrollLeft}
                    aria-label="Ver miembros anteriores"
                    className="carousel-arrow absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-11 h-11 items-center justify-center rounded-full border-2 bg-white shadow-md transition-all hover:bg-[var(--regu-gray-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
                    style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-blue)" }}
                  >
                    <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                  </button>
                  <div
                    ref={carouselRef}
                    className="overflow-x-auto overflow-y-hidden scrollbar-thin scroll-smooth flex-1 min-w-0"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "var(--regu-gray-500) rgba(22, 61, 89, 0.1)", WebkitOverflowScrolling: "touch" }}
                    id="miembros-carousel"
                  >
                    <div className="flex gap-6 md:gap-8 items-stretch min-w-max pb-4 px-1 md:pl-14 md:pr-14 py-2">
                      {filteredEntesReguladores.map((ente, index) => {
                        const key = `${ente.country}-${ente.name}-${index}`;
                        const motionCard = (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.03 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02, y: -3 }}
                            className="flex flex-col items-center justify-start w-[296px] md:w-[352px] h-full min-h-[360px] md:min-h-[420px] px-5 py-7 rounded-xl border transition-all cursor-pointer group"
                            style={{ backgroundColor: "var(--regu-offwhite)", borderColor: "var(--regu-gray-100)" }}
                          >
                            <div className="w-[256px] h-[256px] md:w-[312px] md:h-[312px] flex-shrink-0 mb-5 flex items-center justify-center bg-white rounded-xl p-2 md:p-3 shadow-sm group-hover:shadow-md transition-shadow border" style={{ borderColor: "var(--regu-gray-100)" }}>
                              <LogoImage name={ente.name} route={ente.route} logoUrl={ente.logoUrl} />
                            </div>
                            <div className="text-center flex-1 flex flex-col justify-end min-h-0">
                              {ente.fullName && (
                                <p className="text-sm md:text-base mb-1.5 leading-snug line-clamp-2" style={{ color: "var(--regu-blue)" }}>{ente.fullName}</p>
                              )}
                              <p className="text-sm md:text-base font-medium mt-auto" style={{ color: "var(--regu-gray-700)" }}>{ente.country}</p>
                              <div className="text-xs font-medium flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-2" style={{ color: "var(--regu-blue)" }}>
                                Ver más <ExternalLink className="w-3 h-3" />
                              </div>
                            </div>
                          </motion.div>
                        );
                        if (ente.linkExternalOnly) {
                          return (
                            <a key={key} href={ente.externalUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                              {motionCard}
                            </a>
                          );
                        }
                        return (
                          <Link key={key} to={ente.route} className="flex-shrink-0">
                            {motionCard}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollCarousel('right')}
                    disabled={!carouselCanScrollRight}
                    aria-label="Ver más miembros"
                    className="carousel-arrow absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-11 h-11 items-center justify-center rounded-full border-2 bg-white shadow-md transition-all hover:bg-[var(--regu-gray-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
                    style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-blue)" }}
                  >
                    <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t" style={{ borderColor: "var(--regu-gray-100)" }}>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--regu-gray-500)" }}>
                    <ChevronRight className="w-4 h-4 md:hidden" style={{ color: "var(--regu-blue)" }} aria-hidden />
                    Desliza para ver más
                  </span>
                  <div className="flex items-center gap-2 md:hidden">
                    <button
                      type="button"
                      onClick={() => scrollCarousel('left')}
                      disabled={!carouselCanScrollLeft}
                      aria-label="Anterior"
                      className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center disabled:opacity-40"
                      style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-blue)" }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel('right')}
                      disabled={!carouselCanScrollRight}
                      aria-label="Siguiente"
                      className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center disabled:opacity-40"
                      style={{ borderColor: "var(--regu-gray-200)", color: "var(--regu-blue)" }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--regu-gray-500)" }} />
                <p className="text-lg font-medium" style={{ color: "var(--regu-gray-700)" }}>No se encontraron resultados</p>
                <p className="text-sm mt-2" style={{ color: "var(--regu-gray-500)" }}>Intenta con otros términos de búsqueda</p>
                <button
                  onClick={() => {
                    setEnteSearchTerm('');
                    setSelectedEnteCountry(null);
                  }}
                  className="mt-4 font-medium text-sm hover:opacity-90"
                  style={{ color: "var(--regu-blue)" }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Directorio */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="mb-12">
          <div className="mb-8 flex items-start gap-4">
            <div className="mt-1 h-8 w-[3px] flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--regu-blue)" }} aria-hidden />
            <div>
              <h2 className="text-xl font-bold md:text-2xl" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>Directorio de Autoridades</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--regu-gray-500)" }}>Contactos oficiales por país miembro</p>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="rounded-2xl border bg-white p-5 mb-6" style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 6px rgba(22,61,89,0.04)" }}>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--regu-gray-500)" }} />
                <Input
                  type="text"
                  placeholder="Buscar por país, nombre, cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-lg border focus:ring-2 focus:ring-offset-0"
                  style={{ borderColor: "var(--regu-gray-100)", color: "var(--regu-gray-900)" }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {uniqueCountries.slice(0, 8).map((country) => (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(selectedCountry === country ? null : country)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={
                      selectedCountry === country
                        ? { backgroundColor: "var(--regu-blue)", color: "white", boxShadow: "0 2px 8px rgba(22, 61, 89, 0.15)" }
                        : { backgroundColor: "var(--regu-gray-100)", color: "var(--regu-gray-700)" }
                    }
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
            
            {selectedCountry && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm" style={{ color: "var(--regu-gray-700)" }}>Filtro activo:</span>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                  style={{ backgroundColor: "rgba(68, 137, 198, 0.12)", color: "var(--regu-blue)" }}
                >
                  {selectedCountry}
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Grid de directorio — formato institucional: ACRÓNIMO - PAÍS / Presidente / Cargo / Corresponsal / Correo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="wait">
              {filteredDirectorio.map((item, index) => (
                <motion.div
                  key={`${item.pais}-${item.acronym}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="relative overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 6px rgba(22,61,89,0.04), 0 6px 20px rgba(22,61,89,0.06)" }}
                >
                  <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: "var(--regu-blue)" }} aria-hidden />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-base font-bold leading-snug" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>
                        {item.acronym} – {item.pais}
                      </h3>
                      <Globe className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-50" style={{ color: "var(--regu-blue)" }} aria-hidden />
                    </div>
                    <div className="space-y-4" style={{ color: "var(--regu-gray-900)" }}>
                      <p className="text-sm font-medium leading-snug">{item.presidente}</p>
                      <p className="text-sm leading-snug" style={{ color: "var(--regu-gray-700)" }}>{item.cargo}</p>
                      <div className="pt-2 border-t" style={{ borderColor: "rgba(22,61,89,0.08)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--regu-gray-600)" }}>Corresponsal</p>
                        <p className="text-sm font-medium">{item.corresponsal}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--regu-gray-600)" }}>Correo</p>
                        <a
                          href={`mailto:${item.correo}`}
                          className="text-sm break-all transition-colors hover:opacity-90"
                          style={{ color: "var(--regu-blue)" }}
                        >
                          {item.correo}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredDirectorio.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg mb-4 font-medium" style={{ color: "var(--regu-gray-700)" }}>No se encontraron resultados</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCountry(null);
                }}
                className="font-medium hover:opacity-90"
                style={{ color: "var(--regu-blue)" }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          className="rounded-2xl border bg-white p-8 md:p-10"
          style={{ borderColor: "rgba(22,61,89,0.10)", boxShadow: "0 2px 6px rgba(22,61,89,0.04)" }}
        >
          <h2 className="mb-5 flex items-center gap-3 text-lg font-bold md:text-xl" style={{ color: "var(--regu-navy)", fontFamily: "var(--token-font-heading)" }}>
            <span className="inline-block h-5 w-[3px] flex-shrink-0 rounded-full" style={{ backgroundColor: "var(--regu-blue)" }} aria-hidden />
            Sobre los Miembros
          </h2>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--regu-gray-600)" }}>
            <p>
              Los países miembros de REGULATEL representan a los principales entes reguladores de
              telecomunicaciones de América Latina y Europa. Cada miembro contribuye con su experiencia
              y conocimiento para avanzar en los objetivos comunes del Foro.
            </p>
            <p>
              La membresía está abierta a los entes reguladores de telecomunicaciones que compartan
              los principios y objetivos del Foro, promoviendo la cooperación y el intercambio de
              experiencias en el sector.
            </p>
          </div>
        </motion.div>

        <nav
          className="mt-10 flex flex-wrap items-center gap-4 border-t pt-8"
          style={{ borderColor: "rgba(22,61,89,0.08)" }}
          aria-label="Navegación final"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-colors hover:bg-[rgba(68,137,198,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
            style={{ color: "var(--regu-blue)", borderColor: "var(--regu-blue)", backgroundColor: "rgba(68,137,198,0.06)" }}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
            Inicio
          </Link>
          <Link
            to="/comite-ejecutivo"
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
            style={{ color: "var(--regu-gray-500)" }}
          >
            Ver Comité Ejecutivo <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </nav>
      </div>
    </div>
    </>
  );
};

export default Miembros;
