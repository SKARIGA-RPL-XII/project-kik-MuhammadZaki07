import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronRight,
  FastForward,
  Loader2,
  ShoppingBasket,
} from "lucide-react";
import { useMenus } from "@/hooks/react-query/useMenu";
import { MenuCard } from "@/components/resto";

export default function Step2Menu({ onNext, onSkip, onBack }: any) {
  const { data: menuResponse, isLoading } = useMenus();

  const [cart, setCart] = useState<any[]>([]);

  const handleAddToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 pb-32">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <div className="text-right">
          <h2 className="text-2xl font-bold">PILIH MENU</h2>
          <p className="text-sm text-zinc-500">
            Opsional: Pesan sekarang agar cepat disajikan.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-red-500" />
          <p className="mt-4 text-zinc-500 font-normal">Memuat menu lezat...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {menuResponse?.data?.map((item: any) => (
            <MenuCard
              key={item.id}
              item={item}
              onOpenDetail={() => handleAddToCart(item)}
            />
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-t z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Button variant="outline" onClick={onSkip}>
            <FastForward className="mr-2 w-4 h-4" /> Lewati
          </Button>

          <div className="flex-1 flex justify-end items-center gap-4">
            {cart.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-red-600 font-medium bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-lg">
                <ShoppingBasket className="w-4 h-4" />
                <span>{totalItems} Items</span>
              </div>
            )}

            <Button
              onClick={() => onNext(cart)}
              disabled={cart.length === 0}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Konfirmasi {cart.length > 0 && `(${totalItems})`}{" "}
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
