import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HeroCarousel } from "@/components/resto/HeroCarousel";
import { NavigationBar } from "@/components/resto/NavigationBar";
import { MenuCard } from "@/components/resto/MenuCard";
import { MENU_ITEMS } from "@/data/menu";
import { useCart } from "@/hooks/useCart";
import BannerCarousel, { Banner } from "@/components/carousel/BannerCarousel";
import { MdFoodBank } from "react-icons/md";
import { BannerService } from "@/services/banner.service";

export default function CustomerPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { cartItems, addToCart } = useCart();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await BannerService.getBanners();
    if (data) {
      const mapped = data.data.map((b: any) => ({
        ...b,
        banner_image: `${import.meta.env.VITE_STORAGE_URL}/${b.banner_image}`,
      }));
      setBanners(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);
  

  return (
    <>
    {banners.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <BannerCarousel banners={banners} autoLoop loopInterval={3000} />
      </motion.div>
    )}

      <NavigationBar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSearch={setSearchQuery}
      />

      {filteredItems.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAddToCart={addToCart}
              isAdded={cartItems.some((ci) => ci.item.id === item.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4 flex justify-center">
        <MdFoodBank size={50} className="text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-muted-foreground">
        No dishes found
      </h3>
      <p className="text-slate-600">
        Try adjusting your search or category filters
      </p>
    </div>
  );
}
