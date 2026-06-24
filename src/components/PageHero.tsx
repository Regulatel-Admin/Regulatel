import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ChevronRight } from 'lucide-react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb?: {
    label: string;
    path?: string;
  }[];
  description?: string;
}

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, breadcrumb, description }) => {
  const { t } = useTranslation();
  const homeLabel = t("pages.shared.breadcrumbHome").toUpperCase();

  return (
    <section
      className="page-hero relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/breadcrumb.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: 'clamp(240px, 38vw, 380px)',
      }}
    >

      {/* Content */}
      <div className="relative z-[2] container px-4 md:px-6 mx-auto max-w-6xl py-12 md:py-20 lg:py-24">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center gap-2.5 md:gap-3 mb-6 text-base md:text-lg text-white/90"
          >
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-2 font-medium">
              <Home className="w-5 h-5 md:w-5 md:h-5 shrink-0" aria-hidden />
              <span>{homeLabel}</span>
            </Link>
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="w-5 h-5 text-white/70 shrink-0" aria-hidden />
                {item.path ? (
                  <Link to={item.path} className="hover:text-white transition-colors font-medium">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-white font-semibold border-b-2 pb-1"
                    style={{ borderColor: 'var(--regu-lime)' }}
                  >
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </motion.div>
        )}

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg md:text-xl text-white/90 mb-4 font-medium"
            >
              {subtitle}
            </motion.p>
          )}
          
          <h1 className="text-white font-bold mb-6 tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw + 1rem, 3.25rem)', lineHeight: 1.15 }}>
            {title}
          </h1>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-white/90 text-lg md:text-xl mx-auto leading-relaxed"
              style={{ maxWidth: '820px', lineHeight: 1.65 }}
            >
              {description}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
