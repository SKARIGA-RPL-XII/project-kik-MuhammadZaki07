import { useEffect, useState, useCallback } from "react";
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
  loopInterval = 5000,
  isLoading = false,
}) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      setCurrent((prev) => (prev + newDirection + banners.length) % banners.length);
    },
    [banners.length]
  );

  useEffect(() => {
    if (isLoading || !autoLoop || banners.length <= 1) return;
    const interval = setInterval(() => {
      paginate(1);
    }, loopInterval);
    return () => clearInterval(interval);
  }, [banners.length, autoLoop, loopInterval, isLoading, paginate]);

  if (isLoading) {
    return (
      <div className="relative w-full h-72 md:h-96 overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900  border">
        <m.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-neutral-500 to-transparent"
        />
        <div className="absolute left-8 bottom-10 space-y-4 w-full">
          <div className="h-10 w-2/5 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
          <div className="h-4 w-3/5 bg-neutral-200 rounded-lg dark:bg-neutral-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full h-72 md:h-88 overflow-hidden rounded-2xl shadow-xl group">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <m.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
            scale: { duration: 0.6 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <m.img
            src={`${import.meta.env.VITE_STORAGE_URL}/${banners[current].banner_image}`}
            alt={banners[current].title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-8 md:px-16 md:pb-14">
            <m.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-2xl space-y-2"
            >
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-tighter">
                {banners[current].title}
              </h2>
              <p className="text-sm md:text-base text-neutral-200 font-normal line-clamp-2 max-w-lg">
                {banners[current].description}
              </p>
            </m.div>
          </div>
        </m.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-20 pointer-events-none">
            <button
              onClick={() => paginate(-1)}
              className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-full transition-all border border-white/20 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => paginate(1)}
              className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-full transition-all border border-white/20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className="relative h-1.5 rounded-full bg-neutral-100/20 animate-pulse overflow-hidden transition-all duration-500"
                style={{ width: i === current ? "40px" : "12px" }}
              >
                {i === current && autoLoop && (
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: loopInterval / 1000, ease: "linear" }}
                    className="absolute inset-y-0 left-0 bg-white"
                  />
                )}
                {i === current && !autoLoop && (
                  <div className="absolute inset-0 bg-white" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;