import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, Download, Briefcase, Network, TrendingUp, Shield, Sparkles, BarChart3, Wifi, Eye, X, Maximize2 } from 'lucide-react';
import PageHero from '@/components/PageHero';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

/** Variante de color institucional: primary (azul/navy) o accent (lima/teal) */
type GrupoColorVariant = 'primary' | 'accent';

interface GrupoTrabajo {
  title: string;
  description: string;
  coordinadores: string[];
  miembros: string[];
  icon: React.ElementType;
  color: GrupoColorVariant;
  imageUrl: string;
  termsUrl?: string;
}

const GruposTrabajo: React.FC = () => {
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  // Mapeo de URLs de imágenes de grupos de trabajo (usando imágenes locales)
  const gruposImages: Record<string, string> = {
    'proteccion-empoderamiento-usuarios': '/grupos-trabajo/proteccion-empoderamiento-usuarios.jpg',
    'cierre-brecha-calidad': '/grupos-trabajo/cierre-brecha-calidad.jpg',
    'indicadores-telecomunicaciones-tic': '/grupos-trabajo/indicadores-telecomunicaciones-tic.jpg',
    'fortalecimiento-institucional': '/grupos-trabajo/fortalecimiento-institucional.jpg',
    'asuntos-internet': '/grupos-trabajo/asuntos-internet.jpg',
    'mercados-digitales': '/grupos-trabajo/mercados-digitales.jpg',
    'innovacion-mejora-regulatoria': '/grupos-trabajo/innovacion-mejora-regulatoria.jpg',
    'paridad-sociedad-informacion': '/grupos-trabajo/paridad-sociedad-informacion.jpg',
    'ciberseguridad': '/grupos-trabajo/ciberseguridad.jpg',
  };

  // Mapeo de URLs de términos de referencia (usando PDFs locales)
  const gruposTerms: Record<string, string> = {
    'proteccion-empoderamiento-usuarios': '/documents/grupos-trabajo/terminos-referencia-proteccion-empoderamiento-usuarios.pdf',
    'cierre-brecha-calidad': '/documents/grupos-trabajo/terminos-referencia-cierre-brecha-calidad.pdf',
    'indicadores-telecomunicaciones-tic': '/documents/grupos-trabajo/terminos-referencia-indicadores-telecomunicaciones-tic.pdf',
    'fortalecimiento-institucional': '/documents/grupos-trabajo/terminos-referencia-fortalecimiento-institucional.pdf',
    'asuntos-internet': '/documents/grupos-trabajo/terminos-referencia-asuntos-internet.pdf',
    'mercados-digitales': '/documents/grupos-trabajo/terminos-referencia-mercados-digitales.pdf',
    'innovacion-mejora-regulatoria': '/documents/grupos-trabajo/terminos-referencia-innovacion-mejora-regulatoria.pdf',
    'paridad-sociedad-informacion': '/documents/grupos-trabajo/terminos-referencia-paridad-sociedad-informacion.pdf',
    'ciberseguridad': '/documents/grupos-trabajo/TdR_CIberseguirdad_2026.pdf',
  };

  const grupos: GrupoTrabajo[] = [
    {
      title: 'Protección y empoderamiento de los usuarios',
      description: 'Buenas prácticas regulatorias en atención al usuario, seguridad de dispositivos y control de fraudes en telecomunicaciones.',
      coordinadores: ['OSIPTEL, Perú'],
      miembros: ['SUTEL, Costa Rica', 'ATT, Bolivia', 'INDOTEL, República Dominicana', 'CRC, Colombia'],
      icon: Shield,
      color: 'accent',
      imageUrl: gruposImages['proteccion-empoderamiento-usuarios'],
      termsUrl: gruposTerms['proteccion-empoderamiento-usuarios']
    },
    {
      title: 'Cierre de brecha y calidad de servicios de telecomunicaciones',
      description: 'Intercambio de experiencias sobre calidad, despliegue y compartición de infraestructura para cerrar la brecha digital.',
      coordinadores: ['CRC, Colombia'],
      miembros: ['ASEP, Panamá', 'ATT, Bolivia'],
      icon: Wifi,
      color: 'primary',
      imageUrl: gruposImages['cierre-brecha-calidad'],
      termsUrl: gruposTerms['cierre-brecha-calidad']
    },
    {
      title: 'Indicadores de Telecomunicaciones/TIC',
      description: 'Estadísticas regionales y tecnologías emergentes para optimizar y visualizar datos de conectividad.',
      coordinadores: ['CRT, México', 'SUTEL, Costa Rica'],
      miembros: ['INDOTEL, República Dominicana', 'ATT, Bolivia'],
      icon: BarChart3,
      color: 'primary',
      imageUrl: gruposImages['indicadores-telecomunicaciones-tic'],
      termsUrl: gruposTerms['indicadores-telecomunicaciones-tic']
    },
    {
      title: 'Fortalecimiento Institucional',
      description: 'Iniciativas para la autoevaluación, transparencia y financiamiento del Foro en favor de la eficiencia regulatoria.',
      coordinadores: ['OSIPTEL, Perú'],
      miembros: ['ANATEL, Brasil', 'INDOTEL, República Dominicana'],
      icon: TrendingUp,
      color: 'accent',
      imageUrl: gruposImages['fortalecimiento-institucional'],
      termsUrl: gruposTerms['fortalecimiento-institucional']
    },
    {
      title: 'Asuntos de Internet',
      description: 'Intercambiar experiencias sobre asuntos relacionados con Internet, tanto desde una perspectiva regulatoria como técnica y de gobernanza.',
      coordinadores: ['ENACOM, Argentina', 'ANATEL, Brasil'],
      miembros: ['ASEP, Panamá'],
      icon: Network,
      color: 'primary',
      imageUrl: gruposImages['asuntos-internet'],
      termsUrl: gruposTerms['asuntos-internet']
    },
    {
      title: 'Mercados Digitales',
      description: 'Espacio de diálogo para anticipar retos y oportunidades en mercados y servicios digitales.',
      coordinadores: ['CRC, Colombia', 'ANATEL, Brasil'],
      miembros: ['OSIPTEL, Perú (TBC)'],
      icon: Briefcase,
      color: 'accent',
      imageUrl: gruposImages['mercados-digitales'],
      termsUrl: gruposTerms['mercados-digitales']
    },
    {
      title: 'Innovación y mejora regulatoria',
      description: 'Promover marcos regulatorios eficientes, transparentes y efectivos que impulsen la innovación, la competencia y el bienestar del usuario mediante la simplificación normativa.',
      coordinadores: ['CRC, Colombia'],
      miembros: ['INDOTEL, República Dominicana', 'ENACOM, Argentina', 'ASEP, Panamá'],
      icon: Sparkles,
      color: 'primary',
      imageUrl: gruposImages['innovacion-mejora-regulatoria'],
      termsUrl: gruposTerms['innovacion-mejora-regulatoria']
    },
    {
      title: 'Paridad en la Sociedad de la Información',
      description: 'Fomento de medidas regulatorias para la equidad en TIC y la igualdad de género alineadas con los Objetivos de Desarrollo Sostenible.',
      coordinadores: ['INDOTEL, República Dominicana', 'CONATEL, Paraguay'],
      miembros: ['ATT, Bolivia'],
      icon: Users,
      color: 'accent',
      imageUrl: gruposImages['paridad-sociedad-informacion'],
      termsUrl: gruposTerms['paridad-sociedad-informacion']
    },
    {
      title: 'Ciberseguridad',
      description: 'Impulsar el análisis regulatorio y la adopción de buenas prácticas que contribuyan al fortalecimiento de la seguridad digital en el sector de las telecomunicaciones a nivel regional.',
      coordinadores: ['INDOTEL, República Dominicana'],
      miembros: ['ANATEL, Brasil'],
      icon: Shield,
      color: 'primary',
      imageUrl: gruposImages['ciberseguridad'],
      termsUrl: gruposTerms['ciberseguridad']
    },
  ];

  return (
    <>
      <PageHero
        title="GRUPOS DE TRABAJO"
        breadcrumb={[{ label: 'GRUPOS DE TRABAJO' }]}
        description="Los grupos de trabajo de REGULATEL son espacios de colaboración donde los países miembros 
        trabajan en temas específicos del sector de las telecomunicaciones, compartiendo experiencias 
        y desarrollando soluciones comunes."
      />
      <div
        className="w-full py-12 md:py-24 lg:py-32"
        style={{
          background: `linear-gradient(180deg, var(--regu-offwhite) 0%, var(--regu-gray-100) 100%)`,
        }}
      >
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">

        <div className="space-y-8 mb-12">
          {grupos.map((grupo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <Card
                className="bg-white transition-all shadow-md hover:shadow-lg group"
                style={{
                  borderColor: 'var(--token-border)',
                  borderWidth: '1px',
                }}
              >
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Imagen del grupo de trabajo */}
                    <div className="flex-shrink-0 md:w-48">
                      <div className="w-full aspect-square rounded-xl overflow-hidden group-hover:scale-105 transition-transform shadow-md">
                        <img
                          src={grupo.imageUrl}
                          alt={`Logo de ${grupo.title}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Si la imagen falla, mostrar el icono como fallback
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.icon-fallback');
                            if (fallback) {
                              (fallback as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        <div
                          className="icon-fallback w-full h-full rounded-xl flex items-center justify-center hidden"
                          style={{
                            backgroundColor: grupo.color === 'accent' ? 'rgba(197, 220, 11, 0.12)' : 'rgba(68, 137, 198, 0.12)',
                          }}
                        >
                          <grupo.icon
                            className="w-16 h-16"
                            style={{ color: grupo.color === 'accent' ? 'var(--regu-lime)' : 'var(--regu-blue)' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold mb-3 leading-tight" style={{ color: 'var(--regu-gray-900)' }}>
                        {grupo.title}
                      </h3>
                      <p className="mb-6 leading-relaxed" style={{ color: 'var(--regu-gray-700)' }}>
                        {grupo.description}
                      </p>

                      {/* Coordinadores y Miembros */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-4 h-4" style={{ color: grupo.color === 'accent' ? 'var(--regu-teal)' : 'var(--regu-blue)' }} />
                            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--regu-gray-700)' }}>
                              Coordinadores
                            </span>
                          </div>
                          <div className="space-y-1">
                            {grupo.coordinadores.map((coord, idx) => (
                              <p key={idx} className="text-sm font-medium" style={{ color: 'var(--regu-gray-900)' }}>
                                {coord}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4" style={{ color: grupo.color === 'accent' ? 'var(--regu-teal)' : 'var(--regu-blue)' }} />
                            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--regu-gray-700)' }}>
                              Miembros
                            </span>
                          </div>
                          <div className="space-y-1">
                            {grupo.miembros.map((miembro, idx) => (
                              <p key={idx} className="text-sm" style={{ color: 'var(--regu-gray-900)' }}>
                                {miembro}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Botones de términos de referencia */}
                      {grupo.termsUrl && (
                        <div className="flex gap-3 flex-wrap">
                          <button
                            onClick={() => setPreviewDoc({ url: grupo.termsUrl!, title: `Términos de Referencia - ${grupo.title}` })}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm hover:opacity-90"
                            style={{ backgroundColor: 'var(--regu-blue)', color: 'white' }}
                          >
                            <Eye className="w-4 h-4" />
                            Vista previa
                          </button>
                          <a
                            href={grupo.termsUrl}
                            download
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm hover:opacity-90"
                            style={{ backgroundColor: 'var(--regu-teal)', color: 'white' }}
                          >
                            <Download className="w-4 h-4" />
                            Descargar términos de referencia
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white rounded-2xl p-8 shadow-md"
          style={{ border: '1px solid var(--token-border)' }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--regu-gray-900)' }}>Sobre los Grupos de Trabajo</h2>
          <div className="space-y-4" style={{ color: 'var(--regu-gray-700)' }}>
            <p>
              Los grupos de trabajo de REGULATEL son espacios especializados de colaboración donde los países miembros trabajan en temas específicos del sector de las telecomunicaciones, compartiendo experiencias y desarrollando soluciones comunes.
            </p>
            <p>
              Cada grupo cuenta con al menos un organismo coordinador que lideran las actividades y miembros que participan activamente en el intercambio de conocimientos, mejores prácticas y desarrollo de documentos técnicos y recomendaciones, en base a unos términos de referencia.
            </p>
            <p>
              La participación activa en los grupos de trabajo permite a los países miembros contribuir al desarrollo de políticas regionales, fortalecer la cooperación técnica y beneficiarse del intercambio de conocimientos y experiencias exitosas.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Modal de Preview de PDF */}
      <AnimatePresence>
        {previewDoc && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewDoc(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-8 lg:inset-12 z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header del Modal */}
              <div
                className="flex items-center justify-between p-4 md:p-6 border-b"
                style={{ borderColor: 'var(--token-border)', background: 'var(--regu-offwhite)' }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(68, 137, 198, 0.15)' }}
                  >
                    <FileText className="w-5 h-5" style={{ color: 'var(--regu-blue)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold truncate" style={{ color: 'var(--regu-gray-900)' }}>
                      {previewDoc.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--regu-gray-500)' }}>Vista previa del documento</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={previewDoc.url}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md hover:shadow-lg text-sm md:text-base"
                    style={{ backgroundColor: 'var(--regu-blue)' }}
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Descargar</span>
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'var(--regu-gray-100)', color: 'var(--regu-gray-700)' }}
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenido del PDF */}
              <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--regu-gray-100)' }}>
                <iframe
                  src={`${previewDoc.url}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full border-0"
                  title={`Preview de ${previewDoc.title}`}
                  style={{ minHeight: '400px' }}
                />
              </div>

              {/* Footer del Modal */}
              <div className="p-4 border-t" style={{ borderColor: 'var(--token-border)', backgroundColor: 'var(--regu-offwhite)' }}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm" style={{ color: 'var(--regu-gray-700)' }}>
                    <span className="font-medium">Nota:</span> Usa los controles del visor para navegar el documento
                  </p>
                  <button
                    onClick={() => window.open(previewDoc.url, '_blank')}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors hover:opacity-90"
                    style={{ color: 'var(--regu-blue)' }}
                  >
                    <Maximize2 className="w-4 h-4" />
                    Abrir en nueva pestaña
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default GruposTrabajo;
