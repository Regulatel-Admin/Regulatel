import React, { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Mail,
  Building2,
  Clock,
  Send,
  ArrowLeft,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import PageHero from '@/components/PageHero';

const fadeIn = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Contacto: React.FC = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const infoItems = [
    {
      icon: <Building2 className="h-5 w-5" />,
      label: t('pages.contacto.fields.executiveSecretary'),
      value: 'Amparo Arango Echeverri',
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: t('pages.contacto.fields.email'),
      value: 'aarango@indotel.gob.do',
      href: 'mailto:aarango@indotel.gob.do',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: t('pages.contacto.fields.hours'),
      value: t('pages.contacto.values.hours'),
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: t('pages.contacto.fields.headquarters'),
      value: t('pages.contacto.values.headquarters'),
    },
  ];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageHero
        title={t('pages.contacto.title')}
        subtitle={t('pages.contacto.subtitle')}
        breadcrumb={[{ label: t('pages.contacto.breadcrumb') }]}
      />

      <div
        className="w-full"
        style={{
          backgroundColor: '#FAFBFC',
          borderTop: '1px solid rgba(22,61,89,0.07)',
          fontFamily: 'var(--token-font-body)',
        }}
      >
        <div
          className="mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16"
          style={{ maxWidth: '1060px' }}
        >
          <div className="grid gap-8 md:grid-cols-3">

            <motion.aside
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="md:col-span-1"
            >
              <div
                className="h-full overflow-hidden rounded-2xl border bg-white"
                style={{
                  borderColor: 'rgba(22,61,89,0.10)',
                  boxShadow: '0 4px 24px rgba(22,61,89,0.06)',
                  borderTop: '3px solid var(--regu-blue)',
                }}
              >
                <div className="p-6 md:p-7">
                  <div className="mb-6 flex items-start gap-3">
                    <div
                      className="mt-0.5 h-6 w-[3px] flex-shrink-0 rounded-full"
                      style={{ backgroundColor: 'var(--regu-blue)' }}
                      aria-hidden
                    />
                    <div>
                      <p
                        className="text-[10px] font-bold uppercase tracking-[0.12em] mb-0.5"
                        style={{ color: 'var(--regu-gray-400)' }}
                      >
                        {t('pages.contacto.infoLabel')}
                      </p>
                      <h2
                        className="text-lg font-bold"
                        style={{ color: 'var(--regu-navy)', fontFamily: 'var(--token-font-heading)' }}
                      >
                        {t('pages.contacto.officeTitle')}
                      </h2>
                    </div>
                  </div>

                  <ul className="space-y-5">
                    {infoItems.map((item, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-3 ${i < infoItems.length - 1 ? 'pb-5 border-b' : ''}`}
                        style={{ borderColor: 'rgba(22,61,89,0.07)' }}
                      >
                        <div
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: 'rgba(68,137,198,0.10)', color: 'var(--regu-blue)' }}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <p
                            className="text-[10px] font-bold uppercase tracking-[0.10em] mb-0.5"
                            style={{ color: 'var(--regu-gray-400)' }}
                          >
                            {item.label}
                          </p>
                          {item.href ? (
                            <a
                              href={item.href}
                              className="text-sm font-semibold break-all transition-colors hover:opacity-75"
                              style={{ color: 'var(--regu-blue)' }}
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-sm font-medium" style={{ color: 'var(--regu-navy)' }}>
                              {item.value}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                </div>
              </div>
            </motion.aside>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { duration: 0.4, delay: 0.08 } } }}
              className="md:col-span-2"
            >
              <div
                className="overflow-hidden rounded-2xl border bg-white"
                style={{
                  borderColor: 'rgba(22,61,89,0.10)',
                  boxShadow: '0 4px 24px rgba(22,61,89,0.06)',
                  borderTop: '3px solid var(--regu-blue)',
                }}
              >
                <div className="p-6 md:p-8">
                  <div className="mb-6 flex items-start gap-3">
                    <div
                      className="mt-0.5 h-6 w-[3px] flex-shrink-0 rounded-full"
                      style={{ backgroundColor: 'var(--regu-blue)' }}
                      aria-hidden
                    />
                    <div>
                      <p
                        className="text-[10px] font-bold uppercase tracking-[0.12em] mb-0.5"
                        style={{ color: 'var(--regu-gray-400)' }}
                      >
                        {t('pages.contacto.writeUs')}
                      </p>
                      <h2
                        className="text-lg font-bold"
                        style={{ color: 'var(--regu-navy)', fontFamily: 'var(--token-font-heading)' }}
                      >
                        {t('pages.contacto.formTitle')}
                      </h2>
                    </div>
                  </div>

                  {submitted ? (
                    <div className="py-10 text-center">
                      <div
                        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: 'rgba(68,137,198,0.10)' }}
                      >
                        <CheckCircle2 className="h-8 w-8" style={{ color: 'var(--regu-blue)' }} />
                      </div>
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: 'var(--regu-navy)', fontFamily: 'var(--token-font-heading)' }}
                      >
                        {t('pages.contacto.successTitle')}
                      </h3>
                      <p className="text-sm mb-6" style={{ color: 'var(--regu-gray-500)' }}>
                        {t('pages.contacto.successMessage')}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-85"
                        style={{ backgroundColor: 'var(--regu-blue)' }}
                      >
                        {t('pages.contacto.sendAnother')}
                      </button>
                    </div>
                  ) : (
                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="nombre"
                            className="text-xs font-bold uppercase tracking-[0.08em]"
                            style={{ color: 'var(--regu-gray-600)' }}
                          >
                            {t('pages.contacto.fields.fullName')} <span style={{ color: 'var(--regu-blue)' }}>*</span>
                          </label>
                          <input
                            id="nombre"
                            type="text"
                            placeholder={t('pages.contacto.placeholders.fullName')}
                            required
                            className="h-11 rounded-xl border bg-[#F4F6F8] px-4 text-sm outline-none transition-all placeholder:text-[var(--regu-gray-400)] focus:bg-white focus:ring-2 focus:ring-[rgba(68,137,198,0.30)]"
                            style={{ borderColor: 'rgba(22,61,89,0.12)', color: 'var(--regu-navy)' }}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="email"
                            className="text-xs font-bold uppercase tracking-[0.08em]"
                            style={{ color: 'var(--regu-gray-600)' }}
                          >
                            {t('pages.contacto.fields.email')} <span style={{ color: 'var(--regu-blue)' }}>*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            placeholder={t('pages.contacto.placeholders.email')}
                            required
                            className="h-11 rounded-xl border bg-[#F4F6F8] px-4 text-sm outline-none transition-all placeholder:text-[var(--regu-gray-400)] focus:bg-white focus:ring-2 focus:ring-[rgba(68,137,198,0.30)]"
                            style={{ borderColor: 'rgba(22,61,89,0.12)', color: 'var(--regu-navy)' }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="organizacion"
                          className="text-xs font-bold uppercase tracking-[0.08em]"
                          style={{ color: 'var(--regu-gray-600)' }}
                        >
                          {t('pages.contacto.fields.organization')}{' '}
                          <span className="font-normal normal-case" style={{ color: 'var(--regu-gray-400)' }}>
                            {t('pages.contacto.fields.organizationOptional')}
                          </span>
                        </label>
                        <input
                          id="organizacion"
                          type="text"
                          placeholder={t('pages.contacto.placeholders.organization')}
                          className="h-11 rounded-xl border bg-[#F4F6F8] px-4 text-sm outline-none transition-all placeholder:text-[var(--regu-gray-400)] focus:bg-white focus:ring-2 focus:ring-[rgba(68,137,198,0.30)]"
                          style={{ borderColor: 'rgba(22,61,89,0.12)', color: 'var(--regu-navy)' }}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="asunto"
                          className="text-xs font-bold uppercase tracking-[0.08em]"
                          style={{ color: 'var(--regu-gray-600)' }}
                        >
                          {t('pages.contacto.fields.subject')} <span style={{ color: 'var(--regu-blue)' }}>*</span>
                        </label>
                        <input
                          id="asunto"
                          type="text"
                          placeholder={t('pages.contacto.placeholders.subject')}
                          required
                          className="h-11 rounded-xl border bg-[#F4F6F8] px-4 text-sm outline-none transition-all placeholder:text-[var(--regu-gray-400)] focus:bg-white focus:ring-2 focus:ring-[rgba(68,137,198,0.30)]"
                          style={{ borderColor: 'rgba(22,61,89,0.12)', color: 'var(--regu-navy)' }}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="mensaje"
                          className="text-xs font-bold uppercase tracking-[0.08em]"
                          style={{ color: 'var(--regu-gray-600)' }}
                        >
                          {t('pages.contacto.fields.message')} <span style={{ color: 'var(--regu-blue)' }}>*</span>
                        </label>
                        <textarea
                          id="mensaje"
                          placeholder={t('pages.contacto.placeholders.message')}
                          required
                          rows={6}
                          className="rounded-xl border bg-[#F4F6F8] px-4 py-3 text-sm outline-none transition-all resize-none placeholder:text-[var(--regu-gray-400)] focus:bg-white focus:ring-2 focus:ring-[rgba(68,137,198,0.30)]"
                          style={{ borderColor: 'rgba(22,61,89,0.12)', color: 'var(--regu-navy)' }}
                        />
                        <p className="text-[11px]" style={{ color: 'var(--regu-gray-400)' }}>
                          {t('common.requiredFields')}
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--regu-blue)] focus-visible:ring-offset-2"
                          style={{ backgroundColor: 'var(--regu-blue)' }}
                        >
                          <Send className="h-4 w-4" />
                          {t('pages.contacto.submit')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { duration: 0.4, delay: 0.12 } } }}
            className="mt-8"
          >
            <div
              className="rounded-2xl border px-6 py-5 md:px-8"
              style={{
                borderColor: 'rgba(22,61,89,0.10)',
                backgroundColor: 'rgba(68,137,198,0.04)',
                borderLeft: '4px solid var(--regu-blue)',
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: 'var(--regu-gray-700)' }}>
                <strong className="font-bold" style={{ color: 'var(--regu-navy)' }}>REGULATEL</strong>{' '}
                {t('pages.contacto.commitment')}
              </p>
            </div>
          </motion.div>

          <nav
            className="mt-14 pt-8 border-t flex items-center justify-between flex-wrap gap-4"
            style={{ borderColor: 'rgba(22,61,89,0.08)' }}
            aria-label={t('common.finalNavigation')}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[var(--regu-blue)]"
              style={{ color: 'var(--regu-gray-500)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.backToHomeShort')}
            </Link>
            <Link
              to="/miembros"
              className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-75"
              style={{ color: 'var(--regu-blue)' }}
            >
              {t('pages.contacto.viewMembers')}
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Contacto;
