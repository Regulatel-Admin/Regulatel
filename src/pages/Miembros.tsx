import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, ExternalLink, Search, Mail, User, Briefcase, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PageHero from '@/components/PageHero';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

interface EnteRegulador {
  name: string;
  country: string;
  fullName?: string;
  route: string;
  logoUrl?: string;
  externalUrl: string;
}

// Mapeo directo de URLs de logos reales desde regulatel.org
const logoUrlMap: Record<string, string> = {
  'sub-secretaria-telecom': 'https://www.regulatel.org/sites/default/files/gallery/4.%20SUB%20SECRETARIA%20TELECOM.png',
  'anatel': 'https://www.regulatel.org/sites/default/files/gallery/3.%20ANATEL.png',
  'att': 'https://www.regulatel.org/sites/default/files/gallery/2.%20ATT.png',
  'enacom': 'https://www.regulatel.org/sites/default/files/portfolio-images/1.%20ENACOM%202024.png',
  'sutel': 'https://www.regulatel.org/sites/default/files/gallery/6.%20SUTEL.png.png',
  'min-com': 'https://www.regulatel.org/sites/default/files/gallery/7.%20MIN%20COM.png',
  'agcom': 'https://www.regulatel.org/sites/default/files/gallery/13.%20AGCOM.png',
  'arcotel': 'https://www.regulatel.org/sites/default/files/gallery/8.%20ARCOTEL.png',
  'crc': 'https://www.regulatel.org/sites/default/files/portfolio-images/CRC%20Home.png',
  'cnmc': 'https://www.regulatel.org/sites/default/files/gallery/10.%20CNMC.png',
  'sit': 'https://www.regulatel.org/sites/default/files/gallery/11.%20SIT.png',
  'conatel': 'https://www.regulatel.org/sites/default/files/gallery/12.%20CONATEL.png',
  'indotel': '/images/logos/indotel.jpg',
  'ift': 'https://www.regulatel.org/sites/default/files/gallery/ift.png',
  'subtel': 'https://www.regulatel.org/sites/default/files/gallery/subtel.png',
  'mtc': 'https://www.regulatel.org/sites/default/files/gallery/mtc.png',
  'conatel-gt': 'https://www.regulatel.org/sites/default/files/gallery/conatel-gt.png',
  'super-tel': 'https://www.regulatel.org/sites/default/files/gallery/super-tel.png',
  'crt': '/images/comite-ejecutivo/crt.png',
};

// Componente inteligente para cargar logos con múltiples intentos
const LogoImage: React.FC<{ name: string; route: string }> = ({ name, route }) => {
  const [imgSrc, setImgSrc] = React.useState<string>('');
  const [hasError, setHasError] = React.useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const routeKey = route.replace('/', '');
  const baseUrl = 'https://www.regulatel.org';
  
  // Generar todas las posibles URLs - primero el mapeo directo
  const possibleUrls = React.useMemo(() => {
    const urls: string[] = [];
    
    // Primero intentar el mapeo directo (URLs reales)
    if (logoUrlMap[routeKey]) {
      urls.push(logoUrlMap[routeKey]);
    }
    
    // Luego intentar variaciones como fallback
    const extensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif'];
    const paths = [
      `/sites/default/files/gallery/${routeKey}`,
      `/sites/default/files/portfolio-images/${routeKey}`,
      `/sites/default/files/gallery/${routeKey}.png`,
      `/sites/default/files/portfolio-images/${routeKey}.png`,
    ];
    
    paths.forEach(path => {
      extensions.forEach(ext => {
        if (!path.endsWith(ext)) {
          const url = `${baseUrl}${path}${ext}`;
          if (!urls.includes(url)) {
            urls.push(url);
          }
        }
      });
    });
    
    return urls;
  }, [routeKey, baseUrl]);
  
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

interface DirectorioAutoridad {
  pais: string;
  presidente: string;
  corresponsal: string;
  correo: string;
  cargo: string;
}

const directorioAutoridades: DirectorioAutoridad[] = [
  { pais: 'COLOMBIA', presidente: 'Claudia Ximena Bustamante', corresponsal: 'Mariana Sarmiento', correo: 'mariana.sarmiento@crcom.gov.co', cargo: 'Relaciones con grupos de valor' },
  { pais: 'HONDURAS', presidente: 'Lorenzo Sauceda Calix', corresponsal: 'Claudia Rosario Reyes Solis', correo: 'rosario.reyes@conatel.gob.hn', cargo: 'Jefe Unidad de Relaciones Internacionales e Interistitucionales' },
  { pais: 'COSTA RICA', presidente: 'Federico Chacón Loaiza', corresponsal: 'Ivannia Morales', correo: 'ivannia.morales@sutel.go.cr', cargo: 'Asesora del Consejo y Coordinadora de Asuntos Internacionales' },
  { pais: 'CUBA', presidente: 'Wilfredo Reynaldo Lopez Rodriguez', corresponsal: 'Melba Pita Calderon', correo: 'Melba.pita@mincom.gob.cu', cargo: 'Especialista superior' },
  { pais: 'REPÚBLICA DOMINICANA', presidente: 'Guido Orlando Gómez Mazara', corresponsal: 'Amparo Arango Echeverri', correo: 'aarango@indotel.gob.do', cargo: 'Directora Relaciones Internacionales' },
  { pais: 'MÉXICO', presidente: 'Javier Juárez Mojica', corresponsal: 'Diana Haidee Gómez Gallardo', correo: 'diana.gomez@ift.org.mx', cargo: 'Directora de Política Internacional' },
  { pais: 'PERÚ', presidente: 'Jesus Guillén Marroquín', corresponsal: 'Vanessa Castillo Mendives', correo: 'vcastillo@osiptel.gob.pe', cargo: 'Coordinadora de Relaciones Internacionales y Cooperación Técnica' },
  { pais: 'GUATEMALA', presidente: 'Herbert Armando Rubio Montes', corresponsal: 'Ingrid Roxanda García Santiago', correo: 'ingrid.garcia@sit.gob.gt', cargo: 'Asesora Asuntos Nacionales e Internacionales' },
  { pais: 'PORTUGAL', presidente: 'Sandra Maximiano', corresponsal: 'Rita Silva', correo: 'rita.silva@anacom.pt', cargo: 'Head of European Union Affairs' },
  { pais: 'BRASIL', presidente: 'Carlos Baigorri', corresponsal: 'Salerme Oliveira', correo: 'salerme@anatel.gov.br', cargo: 'Assessor' },
  { pais: 'ESPAÑA', presidente: 'Alejandra de Iturriaga', corresponsal: 'Antonio Serra Bastida', correo: 'antonio.serra@cnmc.es', cargo: 'Funcionario' },
  { pais: 'URUGUAY', presidente: 'Gonzalo Balseiro', corresponsal: 'Carol Dolinkas', correo: 'cdolinkas@ursec.gub.uy', cargo: 'Jefa de Relaciones Internacionales' },
  { pais: 'VENEZUELA', presidente: 'Jorge Eliéser Marquez Monsalve', corresponsal: 'Mariana Solymer Calderón Martínez', correo: 'mcalderon@conatel.gob.ve', cargo: 'Jefa de División de Seguimiento Internacional' },
  { pais: 'BOLIVIA', presidente: 'Néstor Ríos Rivero', corresponsal: 'Alan Wilbert Borda Rivera', correo: 'aborda@att.gob.bo', cargo: 'Responsable de Relaciones Internacionales' },
  { pais: 'ECUADOR', presidente: 'Jorge Roberto Hoyos Zavala', corresponsal: 'Jenny Paulina Zhunio Cifuentes', correo: 'paulina.zhunio@arcotel.gob.ec', cargo: 'Especialista Jefe 1' },
  { pais: 'ARGENTINA', presidente: 'Juan Martín Ozores', corresponsal: 'Daniel Jorge Carletti', correo: 'dcarletti@enacom.gob.ar', cargo: 'Subdirección de Asuntos Internacionales' },
  { pais: 'ITALIA', presidente: 'Giacomo Lasorella', corresponsal: 'Antonio De Tommaso', correo: 'Ia.detommaso@agcom.it; sri@agcom.it', cargo: 'Head of EU and International Affairs Office' },
  { pais: 'EL SALVADOR', presidente: 'Manuel Ernesto Aguilar', corresponsal: 'Maria Escobar', correo: 'mescobar@siget.gob.sv', cargo: 'Jefa de Unidad de Organismos Multilaterales' },
  { pais: 'NICARAGUA', presidente: 'Nahima Díaz Flores', corresponsal: 'Alina Rivas', correo: 'arivas@telcor.gob.ni', cargo: 'Enlace para temas internacionales' },
  { pais: 'PANAMÁ', presidente: 'Zelmar Rodríguez de Massiah', corresponsal: 'Ana De la Rosa', correo: 'adelarosa@asep.gob.pa', cargo: 'Enlace Internacional' },
  { pais: 'CHILE', presidente: 'Claudio Araya San Martín', corresponsal: 'Denis Gonzalez Grandjean', correo: 'dgonzalezg@subtel.gob.cl', cargo: 'Abogado Unidad de Asuntos Internacionales' },
  { pais: 'PUERTO RICO', presidente: 'Ferdinand A. Ramos Soegaard', corresponsal: 'Rafael O. García Santiago', correo: 'rgarcia@jrsp.pr.gov', cargo: 'Secretario Auxiliar de la Junta del Negociado de Telecomunicaciones' },
  { pais: 'PARAGUAY', presidente: 'Juan Carlos Duarte Duré', corresponsal: 'Marco Cubilla Da Silva', correo: 'mcubilla@conatel.gov.py', cargo: 'Funcionario' },
];

const Miembros: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [enteSearchTerm, setEnteSearchTerm] = useState('');
  const [selectedEnteCountry, setSelectedEnteCountry] = useState<string | null>(null);
  
  const filteredDirectorio = useMemo(() => {
    if (!searchTerm && !selectedCountry) return directorioAutoridades;
    
    return directorioAutoridades.filter(item => {
      const matchesSearch = !searchTerm || 
        item.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.presidente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.corresponsal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cargo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = !selectedCountry || item.pais === selectedCountry;
      
      return matchesSearch && matchesCountry;
    });
  }, [searchTerm, selectedCountry]);
  
  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(directorioAutoridades.map(item => item.pais))).sort();
  }, []);

  const entesReguladoresBase: EnteRegulador[] = [
    { name: 'ENACOM', country: 'Argentina', fullName: 'Ente Nacional de Comunicaciones', route: '/enacom', externalUrl: 'https://www.regulatel.org/enacom' },
    { name: 'ATT', country: 'Bolivia', fullName: 'Autoridad de Regulación y Fiscalización de Telecomunicaciones y Transportes', route: '/att', externalUrl: 'https://www.regulatel.org/att' },
    { name: 'ANATEL', country: 'Brasil', fullName: 'Agência Nacional de Telecomunicações', route: '/anatel', externalUrl: 'https://www.regulatel.org/anatel' },
    { name: 'SUBTEL', country: 'Chile', fullName: 'Subsecretaría de Telecomunicaciones', route: '/subtel', externalUrl: 'https://www.regulatel.org/subtel' },
    { name: 'CRC', country: 'Colombia', fullName: 'Comisión de Regulación de Comunicaciones', route: '/crc', externalUrl: 'https://www.regulatel.org/crc' },
    { name: 'CRT', country: 'Costa Rica', fullName: 'Comisión Reguladora de Telecomunicaciones', route: '/crt', externalUrl: 'https://www.crt.go.cr' },
    { name: 'SUTEL', country: 'Costa Rica', fullName: 'Superintendencia de Telecomunicaciones', route: '/sutel', externalUrl: 'https://www.regulatel.org/sutel' },
    { name: 'SIT', country: 'El Salvador', fullName: 'Superintendencia General de Electricidad y Telecomunicaciones', route: '/sit', externalUrl: 'https://www.regulatel.org/sit' },
    { name: 'ARCOTEL', country: 'Ecuador', fullName: 'Agencia de Regulación y Control de las Telecomunicaciones', route: '/arcotel', externalUrl: 'https://www.regulatel.org/arcotel' },
    { name: 'MINISTERIO DE COMUNICACIONES', country: 'Ecuador', route: '/min-com', externalUrl: 'https://www.regulatel.org/min-com' },
    { name: 'SUPERTEL', country: 'Ecuador', fullName: 'Superintendencia de Telecomunicaciones', route: '/super-tel', externalUrl: 'https://www.regulatel.org/super-tel' },
    { name: 'CNMC', country: 'España', fullName: 'Comisión Nacional de los Mercados y la Competencia', route: '/cnmc', externalUrl: 'https://www.regulatel.org/cnmc' },
    { name: 'CONATEL', country: 'Guatemala', fullName: 'Comisión Nacional de Telecomunicaciones', route: '/conatel-gt', externalUrl: 'https://www.regulatel.org/conatel-gt' },
    { name: 'CONATEL', country: 'Honduras', fullName: 'Comisión Nacional de Telecomunicaciones', route: '/conatel', externalUrl: 'https://www.regulatel.org/conatel' },
    { name: 'AGCOM', country: 'Italia', fullName: 'Autorità per le Garanzie nelle Comunicazioni', route: '/agcom', externalUrl: 'https://www.regulatel.org/agcom' },
    { name: 'IFT', country: 'México', fullName: 'Instituto Federal de Telecomunicaciones', route: '/ift', externalUrl: 'https://www.regulatel.org/ift' },
    { name: 'MTC', country: 'Perú', fullName: 'Ministerio de Transportes y Comunicaciones', route: '/mtc', externalUrl: 'https://www.regulatel.org/mtc' },
    { name: 'INDOTEL', country: 'República Dominicana', fullName: 'Instituto Dominicano de las Telecomunicaciones', route: '/indotel', externalUrl: 'https://www.regulatel.org/indotel' },
  ];
  const entesReguladores = useMemo(
    () => [...entesReguladoresBase].sort((a, b) => a.country.localeCompare(b.country, 'es')),
    []
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
    return Array.from(new Set(entesReguladoresBase.map(ente => ente.country))).sort();
  }, [entesReguladoresBase]);

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
        title="MIEMBROS"
        breadcrumb={[{ label: 'MIEMBROS' }]}
        description="El Foro Latinoamericano de Entes Reguladores de Telecomunicaciones está conformado por 23 países 
        de Latinoamérica y Europa (Italia, Portugal y España)."
      />
      <div className="w-full py-12 md:py-24 lg:py-32" style={{ background: "linear-gradient(to bottom, var(--regu-offwhite), var(--regu-gray-100))" }}>
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">

        {/* Search and Filter Section for Entes Reguladores */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-md border" style={{ borderColor: "var(--regu-gray-100)", boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)" }}>
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

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-md border relative" style={{ borderColor: "var(--regu-gray-100)", boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)" }}>
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
                      {filteredEntesReguladores.map((ente, index) => (
                        <Link key={`${ente.route}-${index}`} to={ente.route} className="flex-shrink-0">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.03 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.02, y: -3 }}
                            className="flex flex-col items-center justify-start w-[248px] md:w-[272px] h-full min-h-[300px] md:min-h-[320px] px-6 py-7 rounded-xl border transition-all cursor-pointer group"
                            style={{ backgroundColor: "var(--regu-offwhite)", borderColor: "var(--regu-gray-100)" }}
                          >
                            <div className="w-48 h-48 md:w-52 md:h-52 flex-shrink-0 mb-5 flex items-center justify-center bg-white rounded-xl p-5 shadow-sm group-hover:shadow-md transition-shadow border" style={{ borderColor: "var(--regu-gray-100)" }}>
                              <LogoImage name={ente.name} route={ente.route} />
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
                        </Link>
                      ))}
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

        {/* Sección Directorio por Autoridades */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <div className="inline-block rounded-full border px-4 py-1 text-sm font-medium mb-4" style={{ backgroundColor: "rgba(68, 137, 198, 0.12)", borderColor: "var(--regu-blue)", color: "var(--regu-blue)" }}>
              Directorio
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--regu-gray-900)" }}>
              Directorio por Autoridades
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: "var(--regu-gray-700)" }}>
              Consulte aquí el directorio completo de la organización con información de contacto de cada país miembro.
            </p>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-2xl p-6 shadow-md border mb-8" style={{ borderColor: "var(--regu-gray-100)", boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)" }}>
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

          {/* Grid de directorio */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {filteredDirectorio.map((item, index) => (
                <motion.div
                  key={item.pais}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="bg-white border h-full shadow-md hover:shadow-lg transition-all" style={{ borderColor: "var(--regu-gray-100)", boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)" }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2" style={{ color: "var(--regu-gray-900)" }}>{item.pais}</h3>
                        </div>
                        <Globe className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: "var(--regu-blue)" }} />
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" style={{ color: "var(--regu-blue)" }} />
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--regu-gray-700)" }}>Presidente</span>
                          </div>
                          <p className="text-sm font-medium pl-6" style={{ color: "var(--regu-gray-900)" }}>{item.presidente}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" style={{ color: "var(--regu-blue)" }} />
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--regu-gray-700)" }}>Corresponsal</span>
                          </div>
                          <p className="text-sm font-medium pl-6" style={{ color: "var(--regu-gray-900)" }}>{item.corresponsal}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4" style={{ color: "var(--regu-blue)" }} />
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--regu-gray-700)" }}>Correo</span>
                          </div>
                          <a
                            href={`mailto:${item.correo}`}
                            className="text-sm font-medium pl-6 break-all transition-colors hover:opacity-90"
                            style={{ color: "var(--regu-blue)" }}
                          >
                            {item.correo}
                          </a>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-4 h-4" style={{ color: "var(--regu-blue)" }} />
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--regu-gray-700)" }}>Cargo</span>
                          </div>
                          <p className="text-sm pl-6 leading-relaxed" style={{ color: "var(--regu-gray-700)" }}>{item.cargo}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white border rounded-2xl p-8 shadow-md"
          style={{ borderColor: "var(--regu-gray-100)", boxShadow: "0 4px 20px rgba(22, 61, 89, 0.06)" }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--regu-gray-900)" }}>Sobre los Miembros</h2>
          <div className="space-y-4" style={{ color: "var(--regu-gray-700)" }}>
            <p>
              Los países miembros de REGULATEL representan a los principales entes reguladores de 
              telecomunicaciones de América Latina. Cada miembro contribuye con su experiencia y 
              conocimiento para avanzar en los objetivos comunes del Foro.
            </p>
            <p>
              La membresía en REGULATEL está abierta a los entes reguladores de telecomunicaciones 
              de los países de América Latina que compartan los principios y objetivos del Foro, 
              promoviendo la cooperación y el intercambio de experiencias en el sector.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Miembros;
