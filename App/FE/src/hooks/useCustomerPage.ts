import { useState, useEffect, useCallback } from "react";
import { useMenus } from "@/hooks/react-query/useMenu";
import { useBanners } from "@/hooks/react-query/useBanner";
import { useCart } from "@/hooks/useCart";

export function useCustomerPageLogic() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSorts, setSelectedSorts] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { cartItems, addToCart } = useCart();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: menuResponse, isLoading: loadingMenu } = useMenus({
    page,
    size: 12,
    search: debouncedSearch,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    sort_by: selectedSorts.length > 0 ? selectedSorts.join(",") : undefined,
  });

  const { data: bannerResponse, isLoading: loadingBanner } = useBanners();

  const menuData = menuResponse?.data || [];
  const total = menuResponse?.total || 0;
  const banners = bannerResponse?.data?.data || [];
  const totalPages = Math.ceil(total / 12);

  const handleOpenDetail = useCallback((item: any) => {
    setSelectedMenu(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMenu(null);
  }, []);

  const changePage = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    state: {
      selectedCategory,
      selectedSorts,
      page,
      selectedMenu,
      isModalOpen,
      loadingMenu,
      loadingBanner,
      menuData,
      banners,
      totalPages,
      cartItems,
    },
    actions: {
      setSelectedCategory,
      setSelectedSorts,
      setSearchQuery,
      handleOpenDetail,
      handleCloseDetail,
      addToCart,
      changePage,
      setPage,
    },
  };
}