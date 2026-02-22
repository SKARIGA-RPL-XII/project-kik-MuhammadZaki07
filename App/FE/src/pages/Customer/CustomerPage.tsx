import BannerCarousel, { Banner } from "@/components/carousel/BannerCarousel";
import { MenuCard, NavigationBar } from "@/components/resto";
import { EmptyState } from "@/components/resto/EmptyState";
import { MenuDetailView } from "@/components/resto/MenuDetailView";
import { MenuListSkeleton } from "@/components/skeleton/MenuCardSkeleton";
import { useCart } from "@/hooks/useCart";
import { BannerService } from "@/services/banner.service";
import { MenuService } from "@/services/menu.service";
import { useEffect, useState, useCallback } from "react";

export default function CustomerPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [menuData, setMenuData] = useState<any[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);  
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);

  const { cartItems, addToCart } = useCart();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchBanners = async () => {
      setLoadingBanner(true);
      try {
        const { data } = await BannerService.getBanners();
        if (data?.data) {
          const mapped = data.data.map((b: any) => ({
            ...b,
            banner_image: `${import.meta.env.VITE_STORAGE_URL}/${b.banner_image}`,
          }));
          setBanners(mapped);
        }
      } finally {
        setLoadingBanner(false);
      }
    };
    fetchBanners();
  }, []);

  const fetchMenus = useCallback(async () => {
    setLoadingMenu(true);
    try {
      const res = await MenuService.getMenus({
        page,
        search: debouncedSearch,
        category: selectedCategory === "all" ? undefined : selectedCategory,
      });

      if (res.data) {
        setMenuData(res.data);
        setTotal(res.total || 0);
      }
    } finally {
      setLoadingMenu(false);
    }
  }, [page, debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleOpenDetail = useCallback((item: any) => {
    setSelectedMenu(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMenu(null);
  }, []);

  return (
    <div className="flex flex-col gap-10">
      {(loadingBanner || banners.length > 0) && (
        <BannerCarousel 
          isLoading={loadingBanner} 
          banners={banners} 
          autoLoop 
          loopInterval={5000} 
        />
      )}

      <NavigationBar
        selectedCategory={selectedCategory}
        onCategoryChange={(cat: string) => {
          setSelectedCategory(cat);
          setPage(1);
        }}
        onSearch={setSearchQuery}
      />

      {loadingMenu ? (
        <MenuListSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuData.map((item) => (
              <MenuCard
                key={item?.id}
                item={item}
                onOpenDetail={handleOpenDetail}
                isAdded={cartItems?.some((ci) => ci?.item?.id === item?.id)}
              />
            ))}
          </div>

          {menuData.length === 0 && <EmptyState />}

          {total > 10 && (
            <div className="flex justify-center gap-3 mt-12 mb-10">
              <button
                disabled={page === 1}
                onClick={() => {
                  setPage((prev) => prev - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3 bg-white border border-neutral-200 rounded-2xl disabled:opacity-30 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-neutral-50 active:scale-95"
              >
                Prev
              </button>
              <button
                disabled={menuData.length < 10}
                onClick={() => {
                  setPage((prev) => prev + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3 bg-white border border-neutral-200 rounded-2xl disabled:opacity-30 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-neutral-50 active:scale-95"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <MenuDetailView
        menu={selectedMenu}
        isOpen={isModalOpen}
        onClose={handleCloseDetail}
        onAddToCart={(data: any) => {
          const { quantity, ...menuItem } = data;
          addToCart(menuItem, quantity);
        }}
      />
    </div>
  );
}