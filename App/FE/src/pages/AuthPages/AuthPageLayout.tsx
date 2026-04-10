import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { useSettings } from "@/context/SettingsContext";
import { useBanners } from "@/hooks/react-query/useBanner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSettings();
  const { data: bannerResponse, isLoading } = useBanners();
  const [activeSlide, setActiveSlide] = useState(0);
  const banners = bannerResponse?.data?.data || [];

  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);


  return (
    <div className="relative p-6 bg-white z-1 dark:bg-neutral-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-neutral-900 sm:p-0">
        {children}
        <div className="relative hidden w-full h-full lg:w-1/2 bg-red-500 dark:bg-neutral-950 lg:flex flex-col overflow-hidden p-12 font-sans">
          <div className="relative z-20 flex items-center justify-between w-full pb-5">
            <div className="flex items-center gap-4">
              <Link to="/">
                <img
                  src={
                    settings?.logo_light
                      ? `${import.meta.env.VITE_STORAGE_URL}/${settings.logo_light}`
                      : "/image-dumy.png"
                  }
                  alt="Logo"
                  className="h-8 w-auto brightness-0 invert opacity-90"
                />
              </Link>
              <div className="h-6 w-[1px] bg-white/20" />
              <div className="space-y-0.5">
                <h1 className="text-lg font-semibold text-white leading-none">
                  {settings?.store_name || "store_name"}
                </h1>
                <p className="text-[10px] text-white/70 font-medium">
                  {settings?.company_name || "Authentic Food & Drinks"}
                </p>
              </div>
            </div>

            <div className="text-right pl-6 border-l border-white/10">
              <p className="text-[10px] text-white/80 font-normal leading-relaxed max-w-[200px]">
                {settings?.address || "Alamat tidak tersedia"}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center py-10">
            <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl border border-white/10 shadow-lg group">
              {isLoading ? (
                <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
                  <span className="text-white/30 text-[10px] tracking-widest uppercase font-medium">
                    Loading banners...
                  </span>
                </div>
              ) : banners.length > 0 ? (
                banners.map((slide: any, index: number) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === activeSlide
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-105"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
                    <img
                      src={`${import.meta.env.VITE_STORAGE_URL}/${slide.banner_image}`}
                      alt={slide.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-6 left-8 z-20">
                      <h3 className="text-lg font-medium text-white/95 mb-1">
                        {slide.title}
                      </h3>
                      <p className="text-[11px] text-white/60 line-clamp-1 max-w-[300px] font-normal mb-3">
                        {slide.description}
                      </p>
                      <div className="flex gap-1.5">
                        {banners.map((_: any, i: number) => (
                          <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${
                              i === activeSlide
                                ? "w-6 bg-white"
                                : "w-1.5 bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                  <span className="text-white/20 text-xs">
                    Tidak ada banner aktif
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-20 flex justify-center items-center text-[11px] text-white font-medium pt-6">
            <span>
              © {new Date().getFullYear()}{" "}
              {settings?.store_name || "-"}
            </span>
          </div>
        </div>

        <div className="fixed z-50 hidden bottom-6 left-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
