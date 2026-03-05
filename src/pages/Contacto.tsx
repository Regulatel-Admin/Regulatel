import React, { type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Building2, Clock, Send, FileText } from 'lucide-react';
import PageHero from '@/components/PageHero';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const Contacto: React.FC = () => {
  return (
    <>
      <PageHero
        title="Póngase en Contacto"
        subtitle="CONTACTA CON NOSOTROS PARA CUALQUIER INFORMACIÓN O CONSULTA"
        breadcrumb={[{ label: 'CONTACTO' }]}
      />
      <div className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Información de Contacto Oficial */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="md:col-span-1"
          >
            <Card className="bg-white border border-gray-300 shadow-sm h-full">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(68, 137, 198, 0.12)', color: 'var(--regu-blue)' }}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                        Oficina de Contacto
                      </h3>
                    </div>
                    <div className="pl-13 space-y-3 border-l-2 border-gray-200 ml-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                          Secretaría Ejecutiva
                        </p>
                        <p className="text-sm text-gray-800">
                          Amparo Arango Echeverri
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Mail className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--regu-blue)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Correo Electrónico
                        </p>
                        <a
                          href="mailto:aarango@indotel.gob.do"
                          className="text-sm font-medium break-all transition-colors hover:opacity-90"
                          style={{ color: 'var(--regu-blue)' }}
                        >
                          aarango@indotel.gob.do
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Horario de Atención
                        </p>
                        <p className="text-sm text-gray-700">
                          Lunes a Viernes<br />
                          8:00 AM - 5:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Formulario de Contacto */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="md:col-span-2"
          >
            <Card className="bg-white border border-gray-300 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-300">
                  <FileText className="w-5 h-5" style={{ color: 'var(--regu-blue)' }} />
                  <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                    Formulario de Contacto
                  </h3>
                </div>

                <form className="space-y-6" onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}>
                  <div className="grid md:grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                        Nombre Completo *
                      </label>
                      <Input
                        id="nombre"
                        type="text"
                        placeholder="Ingrese su nombre completo"
                        className="w-full bg-white border-gray-400 text-gray-900 placeholder-gray-400 rounded-none h-11 focus:border-[var(--regu-blue)] focus:ring-[var(--regu-blue)]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                        Correo Electrónico *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        className="w-full bg-white border-gray-400 text-gray-900 placeholder-gray-400 rounded-none h-11 focus:border-[var(--regu-blue)] focus:ring-[var(--regu-blue)]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="asunto" className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                        Asunto *
                      </label>
                      <Input
                        id="asunto"
                        type="text"
                        placeholder="Describa brevemente el asunto"
                        className="w-full bg-white border-gray-400 text-gray-900 placeholder-gray-400 rounded-none h-11 focus:border-[var(--regu-blue)] focus:ring-[var(--regu-blue)]"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                        Mensaje *
                      </label>
                      <Textarea
                        id="mensaje"
                        placeholder="Escriba su mensaje aquí..."
                        className="w-full min-h-[180px] bg-white border-gray-400 text-gray-900 placeholder-gray-400 resize-none rounded-none focus:border-[var(--regu-blue)] focus:ring-[var(--regu-blue)]"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        * Campos obligatorios
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      type="submit"
                      className="w-full text-white font-semibold py-3 px-6 rounded-none uppercase tracking-wide shadow-sm transition-colors hover:opacity-95"
                      style={{ backgroundColor: 'var(--regu-blue)' }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Formulario
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Información adicional */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white border border-gray-300 shadow-sm p-6"
        >
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-gray-700 mb-2">
              <strong className="font-semibold">REGULATEL</strong> se compromete a responder todas las consultas 
              en el menor tiempo posible. Los tiempos de respuesta pueden variar según la complejidad de la consulta.
            </p>
            <p className="text-xs text-gray-600 mt-4">
              Para consultas urgentes, favor contactar directamente a través del correo electrónico indicado.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Contacto;
