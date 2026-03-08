import { useState, useEffect } from "react";
import {
  AIAssistant,
  CartSummary,
  Header,
} from "@/components/resto";
import { Outlet, useSearchParams } from "react-router";
import { useCart } from "@/hooks/useCart";
import { m, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import CheckoutProcess from "@/components/dialog/CheckoutProcess";
import { TableService } from "@/services/table.service";
import { LoginInvitationModal } from "@/components/dialog/LoginInvitationModal";

function CustomerLayout() {
  const [searchParams] = useSearchParams();
  const tableIdFromUrl = searchParams.get("table");

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableData, setTableData] = useState<{ id: string | number; name: string; room?: { name: string } } | null>(null);
  
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchTableInfo = async () => {
      if (tableIdFromUrl) {
        const { data, error } = await TableService.showTable(tableIdFromUrl);
        if (!error && data) {
          setTableData(data.data);
        }
      }
    };
    fetchTableInfo();
  }, [tableIdFromUrl]);

  const springTransition = {
    type: "spring",
    stiffness: 260,
    damping: 28,
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-white flex w-full overflow-hidden font-sans">
        <m.div
          layout
          className="flex-1 flex flex-col min-w-0 h-screen relative will-change-[width,transform]"
          transition={springTransition}
        >
          <Header 
            tableId={
              tableData 
                ? `Table ${tableData.name || tableData.id} ${tableData.room ? `| ${tableData.room.name}` : ""}` 
                : "No Table"
            } 
          />

          <main className="flex-1 overflow-y-auto custom-scrollbar bg-neutral-50/30">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
              <Outlet />
            </div>
          </main>

          <CartSummary
            items={cartItems}
            onCheckout={() => setIsCheckoutOpen(true)}
            isOpen={isCartOpen}
            onToggle={() => setIsCartOpen((prev) => !prev)}
          />
        </m.div>

        <AnimatePresence mode="popLayout">
          {isCartOpen && (
            <m.aside
              key="sidebar-desktop"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={springTransition}
              className="hidden lg:flex flex-col border-l border-neutral-100 bg-white h-screen sticky top-0 overflow-hidden z-30"
            >
              <div className="w-[400px] h-full shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
                <CartSummary.SidebarContent
                  items={cartItems}
                  onToggle={() => setIsCartOpen(false)}
                  onRemoveItem={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                  onCheckout={() => setIsCheckoutOpen(true)}
                />
              </div>
            </m.aside>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCartOpen && (
            <m.div
              key="sidebar-mobile"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed inset-0 z-[100] lg:hidden bg-white flex flex-col"
            >
              <CartSummary.SidebarContent
                items={cartItems}
                onToggle={() => setIsCartOpen(false)}
                onRemoveItem={removeFromCart}
                onUpdateQuantity={updateQuantity}
                onCheckout={() => setIsCheckoutOpen(true)}
              />
            </m.div>
          )}
        </AnimatePresence>

        {/* <CheckoutProcess
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onConfirm={() => {
            clearCart();
            setIsCheckoutOpen(false);
          }}
        /> */}

        <AIAssistant isCartOpen={isCartOpen} />
        <LoginInvitationModal />
      </div>
    </LazyMotion>
  );
}

export default CustomerLayout;