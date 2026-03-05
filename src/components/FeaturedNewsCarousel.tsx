import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedNewsItem {
  slug: string;
  title: string;
  excerpt: string;
  dateFormatted: string;
  category: string;
  imageUrl: string;
}

interface FeaturedNewsCarouselProps {
  items: FeaturedNewsItem[];
  autoplayInterval?: number; // Default: 7000ms
}

const FeaturedNewsCarousel: React.FC<FeaturedNewsCarouselProps> = ({ 
  items, 
  autoplayInterval = 7000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (items.length <= 1 || isPaused || prefersReducedMotion) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoplayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [items.length, isPaused, prefersReducedMotion, autoplayInterval]);

  // Pause on hover/focus
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Manual navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!carouselRef.current?.contains(document.activeElement)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];
  const hasMultipleItems = items.length > 1;

  const transitionConfig = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: 'easeInOut' };

  return (
    <div
      ref={carouselRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <Card className="bg-white/95 border-2 border-indigo-200 overflow-hidden shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all group h-full flex flex-col !p-0 !gap-0 !py-0">
        {/* Image Section - Increased height for more presence (10-15% larger) */}
        <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 w-full overflow-hidden bg-gradient-to-br from-lime-500/10 to-indigo-500/10 flex-shrink-0 m-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitionConfig}
              className="absolute inset-0"
            >
              {currentItem.imageUrl ? (
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.title}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  style={{ objectPosition: 'center', display: 'block', margin: 0, padding: 0 }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const target = e.currentTarget as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.image-placeholder')) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'image-placeholder absolute inset-0 bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center';
                      placeholder.innerHTML = '<div class="text-indigo-400 text-sm font-medium">Imagen no disponible</div>';
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                  <div className="text-indigo-400 text-sm font-medium">Imagen no disponible</div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Featured Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 rounded-full bg-lime-500 text-white text-xs font-semibold shadow-md backdrop-blur-sm">
              Destacada
            </span>
          </div>

          {/* Navigation Arrows - Premium subtle controls */}
          {hasMultipleItems && (
            <>
              <button
                onClick={goToPrevious}
                aria-label="Noticia anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-md hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <ChevronLeft className="w-4 h-4 text-indigo-700" strokeWidth={2.5} />
              </button>
              <button
                onClick={goToNext}
                aria-label="Siguiente noticia"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-md rounded-full shadow-md hover:bg-white hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <ChevronRight className="w-4 h-4 text-indigo-700" strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-6 relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={transitionConfig}
            >
              {/* Date and Category */}
              <div className="flex items-center gap-3 text-sm text-indigo-600 mb-3">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{currentItem.dateFormatted}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                  {currentItem.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-indigo-900 mb-3 line-clamp-2 leading-tight">
                {currentItem.title}
              </h3>

              {/* Excerpt */}
              <p className="text-indigo-700 text-sm md:text-base mb-4 line-clamp-2 leading-relaxed">
                {currentItem.excerpt}
              </p>

              {/* Read More Link */}
              <Link to={`/noticias/${currentItem.slug}`}>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-lime-500 text-lime-700 hover:bg-lime-50 font-medium"
                >
                  Leer noticia
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator - Premium styling */}
          {hasMultipleItems && (
            <div className="flex items-center justify-center gap-2.5 mt-4 pt-4 border-t border-indigo-100/60">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  aria-label={`Ir a noticia ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    index === currentIndex
                      ? 'w-8 bg-lime-500 shadow-sm'
                      : 'w-2 bg-indigo-300/70 hover:bg-indigo-400 hover:w-2.5'
                  }`}
                  aria-current={index === currentIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturedNewsCarousel;