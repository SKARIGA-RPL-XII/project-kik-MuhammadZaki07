import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerService } from "@/services/banner.service";

export interface Banner {
  id: number;
  title: string;
  description: string;
  banner_image: string;
}

interface BannerCarouselProps {
  autoLoop?: boolean;
  loopInterval?: number;
  banners:Banner;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoLoop = true,
  loopInterval = 3000,
}) => {
  const [current, setCurrent] = useState(0);
  

  useEffect(() => {
    if (!autoLoop || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, loopInterval);
    return () => clearInterval(interval);
  }, [banners, autoLoop, loopInterval]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-xl">
      <AnimatePresence initial={false}>
        {banners.map(
          (banner, index) =>
            index === current && (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -100) handleNext();
                  if (info.offset.x > 100) handlePrev();
                }}
                className="absolute cursor-grabbing inset-0 w-full h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900"
              >
                <img
                  src={banner.banner_image}
                  alt={banner.title}
                  draggable="false"
                  className="w-full h-64 md:h-96 object-cover rounded-xl"
                />
                <div className="absolute left-6 md:left-12 bottom-6 md:bottom-12 text-white dark:text-white/90 p-4 rounded-md max-w-md">
                  <h2 className="text-xl md:text-5xl font-bold">
                    {banner.title}
                  </h2>
                  <p className="text-sm md:text-base mt-1">
                    {banner.description}
                  </p>
                </div>
              </motion.div>
            ),
        )}
      </AnimatePresence>

      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 dark:bg-white/20 text-white dark:text-black p-2 rounded-full hover:bg-black/50 dark:hover:bg-white/40 transition"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 dark:bg-white/20 text-white dark:text-black p-2 rounded-full hover:bg-black/50 dark:hover:bg-white/40 transition"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              i === current
                ? "bg-white dark:bg-brand-500"
                : "bg-white/50 dark:bg-white/30"
            }`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
