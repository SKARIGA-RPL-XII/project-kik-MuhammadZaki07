import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Banner {
  id: number;
  title: string;
  description: string;
  banner_image: string;
}

interface BannerCarouselProps {
  autoLoop?: boolean;
  loopInterval?: number;
  banners: Banner[];
  isLoading?: boolean;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners = [],
  autoLoop = true,
  loopInterval = 3000,
  isLoading = false,
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (isLoading || !autoLoop || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, loopInterval);
    return () => clearInterval(interval);
  }, [banners, autoLoop, loopInterval, isLoading]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };
  
  if (isLoading) {
    return (
      <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-2xl bg-neutral-100">
        <m.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent will-change-transform"
        />
        <div className="absolute left-6 md:left-12 bottom-6 md:bottom-12 space-y-3 w-full">
          <div className="h-8 md:h-12 w-1/3 bg-neutral-200 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-neutral-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-2xl border border-neutral-100 shadow-sm">
      <AnimatePresence initial={false} mode="wait">
        <m.div
          key={banners[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full will-change-opacity"
        >
          <img
            src={banners[current].banner_image}
            alt={banners[current].title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="absolute left-6 md:left-12 bottom-6 md:bottom-12 text-white p-4 max-w-xl">
            <m.h2 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-4xl font-black uppercase tracking-tight will-change-transform"
            >
              {banners[current].title}
            </m.h2>
            <m.p 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs md:text-sm font-medium mt-2 text-white/80 line-clamp-2 will-change-transform"
            >
              {banners[current].description}
            </m.p>
          </div>
        </m.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all border border-white/20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all border border-white/20"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;