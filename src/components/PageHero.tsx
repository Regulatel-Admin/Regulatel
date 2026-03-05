import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  return (
    <section
      className="page-hero relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/world-map-dots.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: 'clamp(240px, 38vw, 380px)',
      }}
    >
      {/* Overlay más oscuro + scrim para legibilidad del texto */}
      <div
        className="hero-overlay absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 35%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 70%),
            linear-gradient(180deg, rgba(0, 10, 20, 0.78) 0%, rgba(0, 20, 35, 0.62) 45%, rgba(0, 10, 20, 0.78) 100%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-[2] container px-4 md:px-6 mx-auto max-w-6xl py-12 md:py-20 lg:py-24">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 mb-6 text-sm text-white/80"
          >
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              HOME
            </Link>
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="w-4 h-4 text-white/60" />
                {item.path ? (
                  <Link to={item.path} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-white font-medium border-b-2 pb-0.5"
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
