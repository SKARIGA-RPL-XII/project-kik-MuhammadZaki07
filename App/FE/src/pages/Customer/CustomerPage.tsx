import { useEffect, useState, useCallback } from "react";
import BannerCarousel from "@/components/carousel/BannerCarousel";
import PageMeta from "@/components/common/PageMeta";
import { MenuCard, NavigationBar } from "@/components/resto";
import { EmptyState } from "@/components/resto/EmptyState";
import { MenuDetailView } from "@/components/resto/MenuDetailView";
import { MenuListSkeleton } from "@/components/skeleton/MenuCardSkeleton";
import { useCart } from "@/hooks/useCart";
import { useMenus } from "@/hooks/react-query/useMenu";
import { useBanners } from "@/hooks/react-query/useBanner";

export default function CustomerPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // FIX: Ubah sortBy jadi Array [] supaya bisa multi-select
  const [selectedSorts, setSelectedSorts] = useState<string[]>([]); 
  
  const [page, setPage] = useState(1);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { cartItems, addToCart } = useCart();

  // Logic Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Hook useMenus: Ubah array jadi string koma untuk dikirim ke API
  const { data: menuResponse, isLoading: loadingMenu } = useMenus({
    page,
    size: 12,
    search: debouncedSearch,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    // Kita join array jadi string, misal: "best_seller,price_lowest"
    sort_by: selectedSorts.length > 0 ? selectedSorts.join(",") : undefined,
  });

  const { data: bannerResponse, isLoading: loadingBanner } = useBanners();

  const menuData = menuResponse?.data || [];
  const total = menuResponse?.total || 0;
  const banners = bannerResponse?.data?.data || [];

  const handleOpenDetail = useCallback((item: any) => {
    setSelectedMenu(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMenu(null);
  }, []);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="flex flex-col gap-6 sm:gap-10 pb-20">
      <PageMeta
        title="Digital Menu"
        description="View our full selection of premium food and beverages."
      />

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
        selectedSorts={selectedSorts} 
        onCategoryChange={(cat: string) => {
          setSelectedCategory(cat);
          setPage(1);
        }}
        onSearch={setSearchQuery}
        onSortChange={(sorts: string[]) => {
          setSelectedSorts(sorts);
          setPage(1);
        }}
      />

      <div className="min-h-[45vh] px-4">
        {loadingMenu ? (
          <MenuListSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
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

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-10">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    setPage((prev) => prev - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-12 px-6 bg-white border border-neutral-200 rounded-xl disabled:opacity-30 font-bold text-xs uppercase tracking-widest transition-all hover:bg-neutral-50 active:scale-95"
                >
                  Prev
                </button>
                
                <span className="text-xs font-black text-neutral-400 uppercase tracking-tighter">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((prev) => prev + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-12 px-6 bg-white border border-neutral-200 rounded-xl disabled:opacity-30 font-bold text-xs uppercase tracking-widest transition-all hover:bg-neutral-50 active:scale-95"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

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