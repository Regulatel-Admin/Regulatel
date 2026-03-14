import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Globe, ExternalLink, User, ArrowRight, Building2 } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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

const LogoImage: React.FC<{ name: string; routeKey: string }> = ({ name, routeKey }) => {
  const [imgSrc, setImgSrc] = React.useState<string>('');
  const [hasError, setHasError] = React.useState(false);

  useEffect(() => {
    const url = logoUrlMap[routeKey];
    if (url) {
      setImgSrc(url);
      setHasError(false);
    } else {
      setHasError(true);
    }
  }, [routeKey]);

  if (hasError || !imgSrc) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span
          className="text-2xl font-bold text-center leading-tight"
          style={{ color: 'var(--regu-navy)' }}
        >
          {name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={`${name} logo`}
      className="max-w-full max-h-full object-contain"
      onError={() => setHasError(true)}
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
  displayTitle?: string;
  route: string;
  externalUrl: string;
  website?: string;
  description?: string;
  authorities?: AuthorityInfo[];
}

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
  'osiptel': 'https://www.osiptel.gob.pe',
  'conatel-gt': 'https://www.conatel.gob.gt',
  'sit': 'https://www.siget.gob.sv',
  'min-com': 'https://www.mincom.gob.cu',
  'sub-secretaria-telecom': 'https://www.argentina.gob.ar/secretaria-de-innovacion-publica/subsecretaria-de-telecomunicaciones',
  'conatel-py': 'https://www.conatel.gov.py',
  'anacom': 'https://www.anacom.pt',
  'net': 'https://www.jrsp.pr.gov',
  'ursec': 'https://www.ursec.gub.uy',
  'conatel-ve': 'https://www.conatel.gob.ve',
  'asep': 'https://www.asep.gob.pa',
  'telcor': 'https://www.telcor.gob.ni',
};

const authoritiesMap: Record<string, AuthorityInfo[]> = {
  'enacom': [{ name: 'Juan Martín Ozores', role: 'Interventor' }],
  'att': [{ name: 'Carlos Alberto Agreda Lema', role: 'Director Ejecutivo' }],
  'anatel': [{ name: 'Carlos Manuel Baigorri', role: 'Presidente' }],
  'subtel': [{ name: 'Claudio Araya San Martín', role: 'Subsecretario' }],
  'crc': [{ name: 'Felipe Augusto Díaz Suaza', role: 'Director Ejecutivo' }],
  'sutel': [{ name: 'Carlos Watson Carazo', role: 'Presidente' }],
  'arcotel': [{ name: 'Jorge Roberto Hoyos Zavala', role: 'Director Ejecutivo' }],
  'sit': [{ name: 'Manuel Aguilar', role: 'Superintendente' }],
  'cnmc': [
    { name: 'Alejandra de Iturriaga', role: 'Directora de Telecomunicaciones y Servicios Audiovisuales' },
    { name: 'Bernardo Lorenzo', role: 'Miembro del Consejo' },
  ],
  'conatel': [{ name: 'Lorenzo Sauceda Calix', role: 'Presidente' }],
  'agcom': [{ name: 'Giacomo Lasorella', role: 'Presidente' }],
  'osiptel': [{ name: 'Jesus Guillén Marroquín', role: 'Presidente ejecutivo (e)' }],
  'conatel-py': [{ name: 'Juan Carlos Duarte Duré', role: 'Presidente' }],
  'anacom': [{ name: 'Sandra Maximiano', role: 'Presidente del Consejo de Administración' }],
  'net': [{ name: 'Romina Garrido Iglesias', role: 'Comisionado Presidente' }],
  'ursec': [
    { name: 'Gonzalo Balseiro', role: 'Presidente' },
    { name: 'Bruno Fernandez', role: 'Vicepresidente' },
    { name: 'Leandro Claramunt', role: 'Director' },
  ],
  'conatel-ve': [{ name: 'Enrique José Quintana Sifontes', role: 'Director General' }],
  'asep': [{ name: 'Zelmar Rodríguez Crespo', role: 'Administradora General' }],
  'telcor': [{ name: 'Nahima Díaz Flores', role: 'Directora General' }],
  'indotel': [{ name: 'Guido Orlando Gómez Mazara', role: 'Presidente del Consejo Directivo' }],
  'ift': [{ name: 'Norma Solano Rodríguez', role: 'Presidente' }],
  'conatel-gt': [{ name: 'Herbert Armando Rubio Montes', role: 'Superintendente' }],
  'sub-secretaria-telecom': [],
  'min-com': [{ name: 'Wilfredo López Rodríguez', role: 'Director de Regulaciones' }],
};

const entesInfo: Record<string, EnteInfo> = {
  'sub-secretaria-telecom': { name: 'SUB SECRETARIA TELECOM', country: 'Argentina', route: '/sub-secretaria-telecom', externalUrl: 'https://www.regulatel.org/sub-secretaria-telecom', website: websiteMap['sub-secretaria-telecom'], description: 'Subsecretaría de Telecomunicaciones de Argentina, responsable de la formulación de políticas públicas en el sector de las telecomunicaciones.' },
  'anatel': { name: 'ANATEL', country: 'Brasil', fullName: 'Agência Nacional de Telecomunicações', route: '/anatel', externalUrl: 'https://www.regulatel.org/anatel', website: websiteMap['anatel'], description: 'ANATEL es la Agência Nacional de Telecomunicações de Brasil, responsable de la regulación y supervisión del sector de telecomunicaciones en el mayor país de América Latina.', authorities: authoritiesMap['anatel'] },
  'att': { name: 'ATT', country: 'Bolivia', fullName: 'Autoridad de Regulación y Fiscalización de Telecomunicaciones y Transportes', route: '/att', externalUrl: 'https://www.regulatel.org/att', website: websiteMap['att'], description: 'La ATT es la entidad reguladora de Bolivia encargada de la supervisión y regulación del sector de telecomunicaciones y transportes, promoviendo la competencia y protección del usuario.', authorities: authoritiesMap['att'] },
  'enacom': { name: 'ENACOM', country: 'Argentina', fullName: 'Ente Nacional de Comunicaciones', route: '/enacom', externalUrl: 'https://www.regulatel.org/enacom', website: websiteMap['enacom'], description: 'ENACOM es el ente regulador de las comunicaciones en Argentina, responsable de garantizar la prestación de los servicios de comunicaciones con calidad, accesibilidad y precios justos para todos los ciudadanos.', authorities: authoritiesMap['enacom'] },
  'sutel': { name: 'SUTEL', country: 'Costa Rica', fullName: 'Superintendencia de Telecomunicaciones', route: '/sutel', externalUrl: 'https://www.regulatel.org/sutel', website: websiteMap['sutel'], description: 'SUTEL regula, aplica y controla el marco regulatorio del sector de telecomunicaciones de Costa Rica, promoviendo la competencia efectiva, el desarrollo de la infraestructura y el acceso universal a los servicios.', authorities: authoritiesMap['sutel'] },
  'min-com': { name: 'MINCOM', country: 'Cuba', fullName: 'Ministerio de Comunicaciones', displayTitle: 'MINCOM – CUBA', route: '/min-com', externalUrl: 'https://www.mincom.gob.cu', website: websiteMap['min-com'], description: 'El Ministerio de Comunicaciones de Cuba dirige, regula y controla la política del Estado y el Gobierno en materia de comunicaciones, informática y electrónica en el país.', authorities: authoritiesMap['min-com'] },
  'agcom': { name: 'AGCOM', country: 'Italia', fullName: 'Autorità per le Garanzie nelle Comunicazioni', displayTitle: 'AGCOM – ITALIA', route: '/agcom', externalUrl: 'https://www.regulatel.org/agcom', website: websiteMap['agcom'], description: 'AGCOM es la autoridad reguladora independiente de Italia para las comunicaciones electrónicas, los medios de comunicación y los servicios postales, miembro observador de REGULATEL.', authorities: authoritiesMap['agcom'] },
  'arcotel': { name: 'ARCOTEL', country: 'Ecuador', fullName: 'Agencia de Regulación y Control de las Telecomunicaciones', displayTitle: 'ARCOTEL – ECUADOR', route: '/arcotel', externalUrl: 'https://www.regulatel.org/arcotel', website: websiteMap['arcotel'], description: 'ARCOTEL es la entidad encargada de la administración, regulación y control de las telecomunicaciones en Ecuador, así como del espectro radioeléctrico y los aspectos técnicos de los medios de comunicación.', authorities: authoritiesMap['arcotel'] },
  'crc': { name: 'CRC', country: 'Colombia', fullName: 'Comisión de Regulación de Comunicaciones', route: '/crc', externalUrl: 'https://www.regulatel.org/crc', website: websiteMap['crc'], description: 'La CRC es la entidad encargada de promover la competencia, evitar el abuso de posición dominante y regular los mercados de las redes y los servicios de comunicaciones en Colombia. Presidió REGULATEL en 2025.', authorities: authoritiesMap['crc'] },
  'cnmc': { name: 'CNMC', country: 'España', fullName: 'Comisión Nacional de los Mercados y la Competencia', route: '/cnmc', externalUrl: 'https://www.regulatel.org/cnmc', website: websiteMap['cnmc'], description: 'La CNMC es el organismo independiente regulador y supervisor de los mercados y la competencia en España, incluyendo el sector de telecomunicaciones y servicios audiovisuales.', authorities: authoritiesMap['cnmc'] },
  'sit': { name: 'SIGET', country: 'El Salvador', fullName: 'Superintendencia General de Electricidad y Telecomunicaciones', displayTitle: 'SIGET – EL SALVADOR', route: '/sit', externalUrl: 'https://www.siget.gob.sv', website: websiteMap['sit'], description: 'SIGET es la institución gubernamental de El Salvador encargada de aplicar las normas contenidas en la Ley General de Electricidad y la Ley de Telecomunicaciones, velando por el correcto funcionamiento de los sectores.', authorities: authoritiesMap['sit'] },
  'conatel': { name: 'CONATEL', country: 'Honduras', fullName: 'Comisión Nacional de Telecomunicaciones', route: '/conatel', externalUrl: 'https://www.regulatel.org/conatel', website: websiteMap['conatel'], description: 'CONATEL es el organismo regulador de Honduras, responsable de normar, regular y supervisar los servicios de telecomunicaciones en el país, promoviendo la competencia y el acceso a las comunicaciones.', authorities: authoritiesMap['conatel'] },
  'indotel': { name: 'INDOTEL', country: 'República Dominicana', fullName: 'Instituto Dominicano de las Telecomunicaciones', route: '/indotel', externalUrl: 'https://www.regulatel.org/indotel', website: websiteMap['indotel'], description: 'INDOTEL es el ente regulador de las telecomunicaciones en República Dominicana, actualmente presidiendo REGULATEL para el periodo 2026. Lidera la transformación digital y la protección de los derechos de los usuarios en el país.', authorities: authoritiesMap['indotel'] },
  'ift': { name: 'CRT', country: 'México', fullName: 'Comisión Reguladora de Telecomunicaciones', displayTitle: 'CRT – MEXICO', route: '/ift', externalUrl: 'https://www.regulatel.org/ift', website: websiteMap['ift'], description: 'La CRT es la Comisión Reguladora de Telecomunicaciones de México, responsable de regular y promover la competencia y el desarrollo eficiente del sector de las telecomunicaciones.', authorities: authoritiesMap['ift'] },
  'subtel': { name: 'SUBTEL', country: 'Chile', fullName: 'Subsecretaría de Telecomunicaciones', route: '/subtel', externalUrl: 'https://www.regulatel.org/subtel', website: websiteMap['subtel'], description: 'SUBTEL es la repartición técnica del Ministerio de Transportes y Telecomunicaciones de Chile, encargada de proponer y controlar las políticas de telecomunicaciones del país y fiscalizar el cumplimiento de la normativa sectorial.', authorities: authoritiesMap['subtel'] },
  'osiptel': { name: 'OSIPTEL', country: 'Perú', fullName: 'Organismo Supervisor de Inversión Privada en Telecomunicaciones', displayTitle: 'OSIPTEL – PERÚ', route: '/osiptel', externalUrl: 'https://www.osiptel.gob.pe', website: websiteMap['osiptel'], description: 'OSIPTEL es el organismo regulador encargado de regular y supervisar el mercado de servicios públicos de telecomunicaciones en Perú, protegiendo los derechos de los usuarios y promoviendo la competencia.', authorities: authoritiesMap['osiptel'] },
  'conatel-py': { name: 'CONATEL', country: 'Paraguay', fullName: 'Comisión Nacional de Telecomunicaciones', displayTitle: 'CONATEL – PARAGUAY', route: '/conatel-py', externalUrl: 'https://www.conatel.gov.py', website: websiteMap['conatel-py'], description: 'CONATEL es el organismo regulador de Paraguay, encargado de regular, supervisar y fiscalizar las telecomunicaciones en el territorio nacional, promoviendo el desarrollo del sector y la protección de los usuarios.', authorities: authoritiesMap['conatel-py'] },
  'anacom': { name: 'ANACOM', country: 'Portugal', fullName: 'Autoridade Nacional de Comunicações', displayTitle: 'ANACOM – PORTUGAL', route: '/anacom', externalUrl: 'https://www.anacom.pt', website: websiteMap['anacom'], description: 'ANACOM es la autoridad reguladora y supervisora del sector de comunicaciones de Portugal, responsable de garantizar el funcionamiento eficiente de las redes y servicios de comunicaciones electrónicas.', authorities: authoritiesMap['anacom'] },
  'net': { name: 'NET', country: 'Puerto Rico', fullName: 'Negociado de Telecomunicaciones de Puerto Rico', displayTitle: 'NET – PUERTO RICO', route: '/net', externalUrl: 'https://www.jrsp.pr.gov', website: websiteMap['net'], description: 'El NET es el organismo regulador de telecomunicaciones de Puerto Rico, encargado de regular los servicios de telecomunicaciones en el territorio, garantizando la competencia y protección del consumidor.', authorities: authoritiesMap['net'] },
  'ursec': { name: 'URSEC', country: 'Uruguay', fullName: 'Unidad Reguladora de Servicios de Comunicaciones', displayTitle: 'URSEC – URUGUAY', route: '/ursec', externalUrl: 'https://www.ursec.gub.uy', website: websiteMap['ursec'], description: 'URSEC es la unidad reguladora de Uruguay, responsable de regular los servicios de telecomunicaciones y comunicaciones electrónicas, garantizando la calidad del servicio y los derechos de los usuarios.', authorities: authoritiesMap['ursec'] },
  'conatel-ve': { name: 'CONATEL', country: 'Venezuela', fullName: 'Comisión Nacional de Telecomunicaciones', displayTitle: 'CONATEL – VENEZUELA', route: '/conatel-ve', externalUrl: 'https://www.conatel.gob.ve', website: websiteMap['conatel-ve'], description: 'CONATEL es el organismo del Estado venezolano responsable de la regulación, supervisión y control del sector de telecomunicaciones en Venezuela.', authorities: authoritiesMap['conatel-ve'] },
  'asep': { name: 'ASEP', country: 'Panamá', fullName: 'Autoridad Nacional de los Servicios Públicos', displayTitle: 'ASEP – PANAMÁ', route: '/asep', externalUrl: 'https://www.asep.gob.pa', website: websiteMap['asep'], description: 'ASEP es la entidad reguladora de Panamá, responsable de regular, fiscalizar y controlar la prestación eficiente de los servicios públicos, incluidas las telecomunicaciones, electricidad, gas natural y agua potable.', authorities: authoritiesMap['asep'] },
  'telcor': { name: 'TELCOR', country: 'Nicaragua', fullName: 'Instituto Nicaraguense de Telecomunicaciones y Correo', displayTitle: 'TELCOR – NICARAGUA', route: '/telcor', externalUrl: 'https://www.telcor.gob.ni', website: websiteMap['telcor'], description: 'TELCOR es el instituto regulador de Nicaragua que norma, regula y supervisa los servicios de telecomunicaciones y servicios postales, promoviendo el acceso y la calidad de las comunicaciones.', authorities: authoritiesMap['telcor'] },
  'conatel-gt': { name: 'CONATEL', country: 'Guatemala', fullName: 'Comisión Nacional de Telecomunicaciones', route: '/conatel-gt', externalUrl: 'https://www.regulatel.org/conatel-gt', website: websiteMap['conatel-gt'], description: 'CONATEL es la entidad reguladora de Guatemala, encargada de regular el sector de telecomunicaciones en el país, promoviendo la competencia, la inversión y el acceso a las comunicaciones para todos los guatemaltecos.', authorities: authoritiesMap['conatel-gt'] },
};

// Quick lookup list for "Otros miembros" section
const ALL_ENTES_KEYS = Object.keys(entesInfo);

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
  '/osiptel': 'osiptel',
  '/conatel-gt': 'conatel-gt',
  '/conatel-py': 'conatel-py',
  '/anacom': 'anacom',
  '/net': 'net',
  '/ursec': 'ursec',
  '/conatel-ve': 'conatel-ve',
  '/asep': 'asep',
  '/telcor': 'telcor',
};

const EnteRegulador: React.FC = () => {
  const location = useLocation();
  const routePath = location.pathname;
  const key = routeToKey[routePath] || routePath.replace('/', '');
  const ente = key ? entesInfo[key] : null;

  // Pick 6 other members to show at the bottom
  const otherKeys = ALL_ENTES_KEYS.filter((k) => k !== key).slice(0, 6);

  if (!ente) {
    return (
      <div
        className="w-full min-h-[50vh] flex flex-col items-center justify-center py-24"
        style={{ backgroundColor: '#FAFBFC', borderTop: '1px solid rgba(22,61,89,0.07)', fontFamily: 'var(--token-font-body)' }}
      >
        <Building2 className="h-10 w-10 mb-4" style={{ color: 'var(--regu-gray-300)' }} />
        <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--regu-navy)' }}>Ente no encontrado</h1>
        <Link
          to="/miembros"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: 'var(--regu-blue)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Miembros
        </Link>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      style={{ backgroundColor: '#FAFBFC', borderTop: '1px solid rgba(22,61,89,0.07)', fontFamily: 'var(--token-font-body)' }}
    >
      {/* Blue accent bar */}
      <div style={{ backgroundColor: 'var(--regu-blue)', height: '4px' }} aria-hidden />

      <div className="mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14" style={{ maxWidth: '1080px' }}>

        {/* Back link */}
        <Link
          to="/miembros"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[var(--regu-blue)]"
          style={{ color: 'var(--regu-gray-500)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Miembros
        </Link>

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          {/* Main card */}
          <div
            className="overflow-hidden rounded-2xl border bg-white"
            style={{
              borderColor: 'rgba(22,61,89,0.10)',
              boxShadow: '0 4px 24px rgba(22,61,89,0.06)',
              borderTop: '3px solid var(--regu-blue)',
            }}
          >
            <div className="p-6 md:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-start">

                {/* Logo */}
                <div className="flex-shrink-0">
                  <div
                    className="logoCard flex items-center justify-center overflow-hidden"
                    style={{ width: '176px', height: '176px', minWidth: '176px' }}
                  >
                    <LogoImage name={ente.name} routeKey={key} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Country badge */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em]"
                      style={{ backgroundColor: 'rgba(68,137,198,0.10)', color: 'var(--regu-blue)' }}
                    >
                      <Globe className="h-3 w-3" aria-hidden />
                      {ente.country}
                    </span>
                    <span
                      className="inline-block rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em]"
                      style={{ backgroundColor: 'rgba(22,61,89,0.06)', color: 'var(--regu-gray-500)' }}
                    >
                      Miembro REGULATEL
                    </span>
                  </div>

                  {/* Name */}
                  <h1
                    className="mb-1 font-bold leading-tight"
                    style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--regu-navy)', fontFamily: 'var(--token-font-heading)' }}
                  >
                    {ente.name}
                  </h1>

                  {/* Full name */}
                  {ente.fullName && (
                    <p className="mb-5 text-base font-medium" style={{ color: 'var(--regu-gray-600)' }}>
                      {ente.fullName}
                    </p>
                  )}

                  {/* Authorities */}
                  {ente.authorities && ente.authorities.length > 0 && (
                    <div className="mb-6">
                      <p
                        className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: 'var(--regu-gray-400)' }}
                      >
                        Autoridad{ente.authorities.length > 1 ? 'es' : ''}
                      </p>
                      <div className="space-y-2">
                        {ente.authorities.map((authority, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 rounded-xl border px-4 py-3"
                            style={{ borderColor: 'rgba(22,61,89,0.08)', backgroundColor: 'rgba(68,137,198,0.03)' }}
                          >
                            <User className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--regu-blue)' }} />
                            <div>
                              <p className="text-sm font-bold" style={{ color: 'var(--regu-navy)' }}>{authority.name}</p>
                              <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--regu-gray-500)' }}>{authority.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Website CTA */}
                  {ente.website && (
                    <a
                      href={ente.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-85"
                      style={{ backgroundColor: 'var(--regu-blue)' }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visitar sitio web oficial
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* About section */}
            {ente.description && (
              <div
                className="border-t px-6 py-6 md:px-10 md:py-8"
                style={{ borderColor: 'rgba(22,61,89,0.08)', backgroundColor: 'rgba(22,61,89,0.015)' }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="mt-1 h-6 w-[3px] flex-shrink-0 rounded-full"
                    style={{ backgroundColor: 'var(--regu-blue)' }}
                    aria-hidden
                  />
                  <div>
                    <h2
                      className="mb-3 text-lg font-bold"
                      style={{ color: 'var(--regu-navy)', fontFamily: 'var(--token-font-heading)' }}
                    >
                      Sobre {ente.name}
                    </h2>
                    <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--regu-gray-700)' }}>
                      {ente.description}
                    </p>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed" style={{ color: 'var(--regu-gray-600)' }}>
                      Como parte de REGULATEL, {ente.name} participa activamente en el intercambio de experiencias y buenas prácticas en el sector de las telecomunicaciones, contribuyendo al desarrollo y fortalecimiento del ecosistema digital en la región.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other members */}
          {otherKeys.length > 0 && (
            <div className="mt-12">
              <div className="mb-6 flex items-start gap-4">
                <div
                  className="mt-1 h-6 w-[3px] flex-shrink-0 rounded-full"
                  style={{ backgroundColor: 'var(--regu-blue)' }}
                  aria-hidden
                />
                <h2
                  className="text-lg font-bold"
                  style={{ color: 'var(--regu-navy)', fontFamily: 'var(--token-font-heading)' }}
                >
                  Otros miembros de REGULATEL
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {otherKeys.map((k) => {
                  const e = entesInfo[k];
                  if (!e) return null;
                  return (
                    <Link
                      key={k}
                      to={e.route}
                      className="group flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center transition-all hover:border-[var(--regu-blue)] hover:shadow-md"
                      style={{ borderColor: 'rgba(22,61,89,0.10)' }}
                    >
                      <div
                        className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border p-1.5"
                        style={{ borderColor: 'rgba(22,61,89,0.08)' }}
                      >
                        <LogoImage name={e.name} routeKey={k} />
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight group-hover:text-[var(--regu-blue)] transition-colors" style={{ color: 'var(--regu-navy)' }}>
                          {e.name}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--regu-gray-400)' }}>
                          {e.country}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 text-right">
                <Link
                  to="/miembros"
                  className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-80"
                  style={{ color: 'var(--regu-blue)' }}
                >
                  Ver todos los miembros
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EnteRegulador;
