import { useState, useMemo } from "react";
import { Search, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import PageMeta from "@/components/common/PageMeta";
import { useMenus } from "@/hooks/react-query/useMenu";
import { useCategories } from "@/hooks/react-query/useCategory";
import { useCashierCart, MenuItem } from "@/hooks/useCashierCart";

import { CategoryBar } from "./components/CategoryBar";
import { CartSidebar } from "./components/CartSidebar";
import { EmptyState } from "@/components/resto/EmptyState";
import { useTransaction } from "@/hooks/react-query/useTransaction";
import ScanOrderDialog from "@/components/dialog/ScanOrderDialog";
import useDebounce from "@/hooks/useDebounce";
import { MenuListSkeleton } from "@/components/skeleton/MenuCardSkeleton";
import { MenuCard } from "@/components/resto";

export default function CashierPage() {
  const navigate = useNavigate();
  const { data: categories , isLoading : loadingCategory } = useCategories();
  const { cartItems, addToCart, updateQuantity, clearCart, removeFromCart } =
    useCashierCart();

  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [tempAttributes, setTempAttributes] = useState<Record<string, number>>(
    {},
  );
  const { data: menus, isLoading: menuLoading } = useMenus({
    search: debouncedSearch,
    category: activeCategory === "All Items" ? undefined : activeCategory,
  });

  const categoryList = useMemo(
    () =>
      Array.isArray(categories) ? categories : (categories as any)?.data || [],
    [categories],
  );

  const menuList = useMemo(() => {
    return Array.isArray(menus) ? menus : (menus as any)?.data || [];
  }, [menus]);

  const uniqueAttributes = useMemo(() => {
    if (!selectedProduct?.attributes) return [];
    const seen = new Set();
    return selectedProduct.attributes.filter((attr: any) => {
      const duplicate = seen.has(attr.id);
      seen.add(attr.id);
      return !duplicate;
    });
  }, [selectedProduct]);

  const handleProductClick = (product: any) => {
  if (product.attributes && Array.isArray(product.attributes) && product.attributes.length > 0) {
    setSelectedProduct(product);
    const initialAttrs: Record<string, number> = {};
    
    product.attributes.forEach((attr: any) => {
      if (attr.levels && attr.levels.length > 0) {
        initialAttrs[attr.id] = attr.levels[0].id;
      }
    });
    
    setTempAttributes(initialAttrs);
  } else {
    addToCart(product, 1, {}); 
  }
};


  const handleConfirmAttributes = () => {
    if (selectedProduct) {
      const itemToCart: MenuItem = {
        ...selectedProduct,
        selectedAttributes: tempAttributes,
      };
      addToCart(itemToCart, 1);
      setSelectedProduct(null);
    }
  };

  const handleNavigation = async (orderType: string) => {
    if (cartItems.length === 0) return;

    if (orderType === "dine_in") {
      navigate("/tables", { state: { fromCart: true } });
    } else {
      navigate("/payment", { state: { orderType: "take_away" } });
    }
  };

  const { useGetOrders } = useTransaction();
  const { data: orders } = useGetOrders();

  return (
    <div className="flex w-full overflow-hidden">
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <PageMeta title="Cashier POS" description="" />
        <header className="pb-6 px-6 border-b flex flex-col sticky top-0 z-20">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-zinc-900 dark:text-neutral-200 tracking-tight uppercase">
              Transaction <span className="text-red-600">Terminal</span>
            </h1>
            <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
              Manage real-time customer orders.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mt-6">
            <div className="relative w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-500 transition-colors duration-200" />
              <Input
                placeholder="Search product by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 focus-visible:ring-red-500 rounded transition-all duration-200 shadow-sm"
              />
            </div>

            <div className="relative inline-flex">
              <Button
                variant="outline"
                onClick={() => navigate("/operations/orders")}
                className="flex items-center gap-2 h-10"
              >
                <ClipboardList className="h-4 w-4" />
                <span>Order Queue</span>
              </Button>
              {orders?.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex justify-center items-center ring-2 ring-white shadow-sm pointer-events-none">
                  {orders?.length > 99 ? "99+" : orders?.length}
                </div>
              )}
            </div>
            <ScanOrderDialog />
          </div>
        </header>

        <CategoryBar
          categories={categoryList}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          loading={loadingCategory}
        />

        <ScrollArea className="flex-1 px-6 py-6 min-h-0 overflow-y-auto">
          {menuLoading ? (
            <MenuListSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {menuList.map((item: any) => (
               <MenuCard
                  key={item.id}
                  item={item}
                  onOpenDetail={handleProductClick}
                />
              ))}
            </div>
          )}
          {menuList.length === 0 && !menuLoading && <EmptyState />}
        </ScrollArea>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(!isCartOpen)}
        items={cartItems}
        onUpdateQty={updateQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        handleCheckout={handleNavigation}
        isPending={false}
      />

      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent className="sm:max-w-[380px] p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {uniqueAttributes.map((attr: any) => (
              <div key={attr.id} className="space-y-3">
                <Label className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                  {attr.name}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {attr.levels?.map((level: any) => (
                    <div
                      key={level.id}
                      onClick={() =>
                        setTempAttributes((prev) => ({
                          ...prev,
                          [attr.id]: level.id,
                        }))
                      }
                      className={`p-2 rounded-md border-2 text-center cursor-pointer transition-all duration-200 ${
                        tempAttributes[attr.id] === level.id
                          ? "border-red-600 bg-red-50 text-red-600 shadow-sm"
                          : "border-zinc-100 text-zinc-500 hover:border-zinc-200"
                      }`}
                    >
                      <span className="text-xs font-medium uppercase tracking-tight">
                        {level.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white py-5"
              onClick={handleConfirmAttributes}
            >
              Add to order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
