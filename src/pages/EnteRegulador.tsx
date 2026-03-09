import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Globe, ExternalLink, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

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
        <div className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: 'var(--regu-gray-900)' }}>{name}</div>
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

interface AuthorityInfo {
  name: string;
  role: string;
}

interface EnteInfo {
  name: string;
  country: string;
  fullName?: string;
  route: string;
  externalUrl: string;
  website?: string;
  description?: string;
  authorities?: AuthorityInfo[];
}

// Mapeo de sitios web oficiales de cada ente regulador
const websiteMap: Record<string, string> = {
  'enacom': 'https://www.enacom.gob.ar',
  'att': 'https://www.att.gob.bo',
  'anatel': 'https://www.gov.br/anatel',
  'subtel': 'https://www.subtel.gob.cl',
  'crc': 'https://www.crcom.gov.co',
  'sutel': 'https://www.sutel.go.cr',
  'arcotel': 'https://www.arcotel.gob.ec',
  'cnmc': 'https://www.cnmc.es',
  'agcom': 'https://www.agcom.it',
  'conatel': 'https://www.conatel.gob.hn',
  'indotel': 'https://www.indotel.gob.do',
  'ift': 'https://www.ift.org.mx',
  'mtc': 'https://www.gob.pe/mtc',
  'conatel-gt': 'https://www.conatel.gob.gt',
  'sit': 'https://www.siget.gob.sv',
  'min-com': 'https://www.telecomunicaciones.gob.ec',
  'sub-secretaria-telecom': 'https://www.argentina.gob.ar/secretaria-de-innovacion-publica/subsecretaria-de-telecomunicaciones',
  'super-tel': 'https://www.super.gob.ec',
};

// Mapeo de autoridades de cada ente regulador
const authoritiesMap: Record<string, AuthorityInfo[]> = {
  'enacom': [
    { name: 'Juan Martín Ozores', role: 'Interventor' }
  ],
  'att': [
    { name: 'Carlos Alberto Agreda Lema', role: 'Director Ejecutivo' }
  ],
  'anatel': [
    { name: 'Carlos Manuel Baigorri', role: 'Presidente' }
  ],
  'subtel': [
    { name: 'Claudio Araya San Martín', role: 'Subsecretario' }
  ],
  'crc': [
    { name: 'Claudia Ximena Bustamante Osorio', role: 'Directora Ejecutiva' }
  ],
  'sutel': [
    { name: 'Federico Chacón Loaiza', role: 'Presidente' }
  ],
  'arcotel': [
    { name: 'Jorge Roberto Hoyos Zavala', role: 'Director Ejecutivo' }
  ],
  'sit': [
    { name: 'Herbert Armando Rubio Montes', role: 'Superintendente' }
  ],
  'cnmc': [
    { name: 'Alejandra de Iturriaga', role: 'Directora de Telecomunicaciones y Servicios Audiovisuales' },
    { name: 'Bernardo Lorenzo', role: 'Miembro del Consejo' }
  ],
  'conatel': [
    { name: 'Lorenzo Sauceda Calix', role: 'Presidente' }
  ],
  'agcom': [
    { name: 'Giacomo Lasorella', role: 'Presidente' }
  ],
  'indotel': [
    { name: 'Guido Orlando Gómez Mazara', role: 'Presidente del Consejo Directivo' },
    { name: 'Julissa Cruz', role: 'Directora Ejecutiva' }
  ],
  'ift': [
    { name: 'Norma Solano Rodríguez', role: 'Presidente' }
  ],
  'conatel-gt': [
    { name: 'Herbert Armando Rubio Montes', role: 'Superintendente' }
  ],
  'sub-secretaria-telecom': [
    // Información no disponible en regulatel.org/miembros
  ],
  'min-com': [
    { name: 'Wilfredo López Rodríguez', role: 'Director de Regulaciones' }
  ],
  'super-tel': [
    { name: 'Jorge Roberto Hoyos Zavala', role: 'Director Ejecutivo' }
  ],
};

const entesInfo: Record<string, EnteInfo> = {
  'sub-secretaria-telecom': {
    name: 'SUB SECRETARIA TELECOM',
    country: 'Argentina',
    route: '/sub-secretaria-telecom',
    externalUrl: 'https://www.regulatel.org/sub-secretaria-telecom',
    website: websiteMap['sub-secretaria-telecom'],
    description: 'Subsecretaría de Telecomunicaciones de Argentina.'
  },
  'anatel': {
    name: 'ANATEL',
    country: 'Brasil',
    fullName: 'Agência Nacional de Telecomunicações',
    route: '/anatel',
    externalUrl: 'https://www.regulatel.org/anatel',
    website: websiteMap['anatel'],
    description: 'Agência Nacional de Telecomunicações de Brasil.',
    authorities: authoritiesMap['anatel']
  },
  'att': {
    name: 'ATT',
    country: 'Bolivia',
    fullName: 'Autoridad de Regulación y Fiscalización de Telecomunicaciones y Transportes',
    route: '/att',
    externalUrl: 'https://www.regulatel.org/att',
    website: websiteMap['att'],
    description: 'Autoridad de Regulación y Fiscalización de Telecomunicaciones y Transportes de Bolivia.',
    authorities: authoritiesMap['att']
  },
  'enacom': {
    name: 'ENACOM',
    country: 'Argentina',
    fullName: 'Ente Nacional de Comunicaciones',
    route: '/enacom',
    externalUrl: 'https://www.regulatel.org/enacom',
    website: websiteMap['enacom'],
    description: 'Ente Nacional de Comunicaciones de Argentina.',
    authorities: authoritiesMap['enacom']
  },
  'sutel': {
    name: 'SUTEL',
    country: 'Costa Rica',
    fullName: 'Superintendencia de Telecomunicaciones',
    route: '/sutel',
    externalUrl: 'https://www.regulatel.org/sutel',
    website: websiteMap['sutel'],
    description: 'Superintendencia de Telecomunicaciones de Costa Rica.',
    authorities: authoritiesMap['sutel']
  },
  'min-com': {
    name: 'MINISTERIO DE COMUNICACIONES',
    country: 'Ecuador',
    route: '/min-com',
    externalUrl: 'https://www.regulatel.org/min-com',
    website: websiteMap['min-com'],
    description: 'Ministerio de Comunicaciones de Ecuador.',
    authorities: authoritiesMap['min-com']
  },
  'agcom': {
    name: 'AGCOM',
    country: 'Italia',
    fullName: 'Autorità per le Garanzie nelle Comunicazioni',
    route: '/agcom',
    externalUrl: 'https://www.regulatel.org/agcom',
    website: websiteMap['agcom'],
    description: 'Autorità per le Garanzie nelle Comunicaciones de Italia.',
    authorities: authoritiesMap['agcom']
  },
  'arcotel': {
    name: 'ARCOTEL',
    country: 'Ecuador',
    fullName: 'Agencia de Regulación y Control de las Telecomunicaciones',
    route: '/arcotel',
    externalUrl: 'https://www.regulatel.org/arcotel',
    website: websiteMap['arcotel'],
    description: 'Agencia de Regulación y Control de las Telecomunicaciones de Ecuador.',
    authorities: authoritiesMap['arcotel']
  },
  'crc': {
    name: 'CRC',
    country: 'Colombia',
    fullName: 'Comisión de Regulación de Comunicaciones',
    route: '/crc',
    externalUrl: 'https://www.regulatel.org/crc',
    website: websiteMap['crc'],
    description: 'Comisión de Regulación de Comunicaciones de Colombia.',
    authorities: authoritiesMap['crc']
  },
  'cnmc': {
    name: 'CNMC',
    country: 'España',
    fullName: 'Comisión Nacional de los Mercados y la Competencia',
    route: '/cnmc',
    externalUrl: 'https://www.regulatel.org/cnmc',
    website: websiteMap['cnmc'],
    description: 'Comisión Nacional de los Mercados y la Competencia de España.',
    authorities: authoritiesMap['cnmc']
  },
  'sit': {
    name: 'SIT',
    country: 'El Salvador',
    fullName: 'Superintendencia General de Electricidad y Telecomunicaciones',
    route: '/sit',
    externalUrl: 'https://www.regulatel.org/sit',
    website: websiteMap['sit'],
    description: 'Superintendencia General de Electricidad y Telecomunicaciones de El Salvador.',
    authorities: authoritiesMap['sit']
  },
  'conatel': {
    name: 'CONATEL',
    country: 'Honduras',
    fullName: 'Comisión Nacional de Telecomunicaciones',
    route: '/conatel',
    externalUrl: 'https://www.regulatel.org/conatel',
    website: websiteMap['conatel'],
    description: 'Comisión Nacional de Telecomunicaciones de Honduras.',
    authorities: authoritiesMap['conatel']
  },
  'indotel': {
    name: 'INDOTEL',
    country: 'República Dominicana',
    fullName: 'Instituto Dominicano de las Telecomunicaciones',
    route: '/indotel',
    externalUrl: 'https://www.regulatel.org/indotel',
    website: websiteMap['indotel'],
    description: 'Instituto Dominicano de las Telecomunicaciones.',
    authorities: authoritiesMap['indotel']
  },
  'ift': {
    name: 'IFT',
    country: 'México',
    fullName: 'Instituto Federal de Telecomunicaciones',
    route: '/ift',
    externalUrl: 'https://www.regulatel.org/ift',
    website: websiteMap['ift'],
    description: 'Instituto Federal de Telecomunicaciones de México.',
    authorities: authoritiesMap['ift']
  },
  'subtel': {
    name: 'SUBTEL',
    country: 'Chile',
    fullName: 'Subsecretaría de Telecomunicaciones',
    route: '/subtel',
    externalUrl: 'https://www.regulatel.org/subtel',
    website: websiteMap['subtel'],
    description: 'Subsecretaría de Telecomunicaciones de Chile.',
    authorities: authoritiesMap['subtel']
  },
  'mtc': {
    name: 'MTC',
    country: 'Perú',
    fullName: 'Ministerio de Transportes y Comunicaciones',
    route: '/mtc',
    externalUrl: 'https://www.regulatel.org/mtc',
    website: websiteMap['mtc'],
    description: 'Ministerio de Transportes y Comunicaciones de Perú.'
  },
  'conatel-gt': {
    name: 'CONATEL',
    country: 'Guatemala',
    fullName: 'Comisión Nacional de Telecomunicaciones',
    route: '/conatel-gt',
    externalUrl: 'https://www.regulatel.org/conatel-gt',
    website: websiteMap['conatel-gt'],
    description: 'Comisión Nacional de Telecomunicaciones de Guatemala.',
    authorities: authoritiesMap['conatel-gt']
  },
  'super-tel': {
    name: 'SUPERTEL',
    country: 'Ecuador',
    fullName: 'Superintendencia de Telecomunicaciones',
    route: '/super-tel',
    externalUrl: 'https://www.regulatel.org/super-tel',
    website: websiteMap['super-tel'],
    description: 'Superintendencia de Telecomunicaciones de Ecuador.',
    authorities: authoritiesMap['super-tel']
  },
};

const EnteRegulador: React.FC = () => {
  const location = useLocation();
  const routePath = location.pathname;
  // Mapeo directo de rutas a claves
  const routeToKey: Record<string, string> = {
    '/sub-secretaria-telecom': 'sub-secretaria-telecom',
    '/anatel': 'anatel',
    '/att': 'att',
    '/enacom': 'enacom',
    '/sutel': 'sutel',
    '/min-com': 'min-com',
    '/agcom': 'agcom',
    '/arcotel': 'arcotel',
    '/crc': 'crc',
    '/cnmc': 'cnmc',
    '/sit': 'sit',
    '/conatel': 'conatel',
    '/indotel': 'indotel',
    '/ift': 'ift',
    '/subtel': 'subtel',
    '/mtc': 'mtc',
    '/conatel-gt': 'conatel-gt',
    '/super-tel': 'super-tel',
  };
  
  const key = routeToKey[routePath] || routePath.replace('/', '');
  const ente = key ? entesInfo[key] : null;

  if (!ente) {
    return (
      <div className="w-full py-12 md:py-24 lg:py-32" style={{ background: 'linear-gradient(to bottom, var(--regu-offwhite), var(--regu-gray-100))' }}>
        <div className="container px-4 md:px-6 mx-auto max-w-6xl text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--regu-gray-900)' }}>Ente no encontrado</h1>
          <Link to="/miembros">
            <Button className="text-white" style={{ backgroundColor: 'var(--regu-blue)' }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Miembros
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 md:py-24 lg:py-32" style={{ background: 'linear-gradient(to bottom, var(--regu-offwhite), var(--regu-gray-100))' }}>
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mb-8"
        >
          <Link to="/miembros">
            <Button variant="ghost" className="mb-6" style={{ color: 'var(--regu-blue)' }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Miembros
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white/90 rounded-2xl p-8 md:p-12 shadow-md border"
          style={{ borderColor: 'var(--regu-gray-100)' }}
        >
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center bg-white rounded-xl border p-6 shadow-sm" style={{ borderColor: 'var(--regu-gray-100)' }}>
                <LogoImage name={ente.name} route={ente.route} />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--regu-gray-900)' }}>{ente.name}</h1>
              {ente.fullName && (
                <p className="text-lg mb-4 font-medium" style={{ color: 'var(--regu-gray-700)' }}>{ente.fullName}</p>
              )}
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-green-600" />
                <p className="text-lg font-medium" style={{ color: 'var(--regu-gray-900)' }}>{ente.country}</p>
              </div>
              
              {ente.authorities && ente.authorities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--regu-gray-900)' }}>{ente.name} – {ente.country}</h3>
                  <div className="space-y-3">
                    {ente.authorities.map((authority, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <User className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-base font-medium" style={{ color: 'var(--regu-gray-900)' }}>{authority.name}</p>
                          <p className="text-sm" style={{ color: 'var(--regu-gray-700)' }}>{authority.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {ente.description && (
                <p className="mb-6" style={{ color: 'var(--regu-gray-700)' }}>{ente.description}</p>
              )}
              {ente.website && (
                <a
                  href={ente.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium transition-colors mb-6"
                  style={{ color: 'var(--regu-blue)' }}
                >
                  <ExternalLink className="w-5 h-5" />
                  Visitar sitio web oficial
                </a>
              )}
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mt-8 pt-8 border-t"
            style={{ borderColor: 'var(--regu-gray-100)' }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--regu-gray-900)' }}>Sobre {ente.name}</h2>
            <div className="space-y-4" style={{ color: 'var(--regu-gray-700)' }}>
              <p>
                {ente.name} es un organismo regulador de telecomunicaciones en {ente.country}, 
                miembro activo de REGULATEL, el Foro Latinoamericano de Entes Reguladores de Telecomunicaciones.
              </p>
              <p>
                Como parte de REGULATEL, {ente.name} participa activamente en el intercambio de 
                experiencias y buenas prácticas en el sector de las telecomunicaciones, contribuyendo 
                al desarrollo y fortalecimiento del ecosistema digital en la región.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnteRegulador;
