import { AIAssistant, CartSummary, Header } from "@/components/resto";
import { Outlet } from "react-router";
import { m, AnimatePresence, LazyMotion, domAnimation, Transition } from "framer-motion";
import { LoginInvitationModal } from "@/components/dialog/LoginInvitationModal";
import { useCustomerLayoutLogic } from "@/hooks/useCustomerLayoutLogic";

const springTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
};

function CustomerLayout() {
  const { states, actions } = useCustomerLayoutLogic();

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-white dark:bg-neutral-900/30 flex w-full overflow-hidden font-sans">
        <m.div
          layout
          className="flex-1 flex flex-col min-w-0 h-screen relative will-change-[width,transform]"
          transition={springTransition}
        >
          <Header tableId={states.tableDisplay} />

          <main className="flex-1 overflow-y-auto custom-scrollbar bg-neutral-50/30 dark:bg-neutral-900/30">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
              <Outlet />
            </div>
          </main>

          <CartSummary
            items={states.cartItems}
            onCheckout={actions.openCheckout}
            isOpen={states.isCartOpen}
            onToggle={actions.toggleCart}
          />
        </m.div>

        <AnimatePresence mode="popLayout">
          {states.isCartOpen && (
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
                  items={states.cartItems}
                  onToggle={actions.closeCart}
                  onRemoveItem={actions.removeFromCart}
                  onUpdateQuantity={actions.updateQuantity}
                  onCheckout={actions.openCheckout}
                />
              </div>
            </m.aside>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {states.isCartOpen && (
            <m.div
              key="sidebar-mobile"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed inset-0 z-[100] lg:hidden bg-white flex flex-col"
            >
              <CartSummary.SidebarContent
                items={states.cartItems}
                onToggle={actions.closeCart}
                onRemoveItem={actions.removeFromCart}
                onUpdateQuantity={actions.updateQuantity}
                onCheckout={actions.openCheckout}
              />
            </m.div>
          )}
        </AnimatePresence>

        <AIAssistant isCartOpen={states.isCartOpen} />
        <LoginInvitationModal />
      </div>
    </LazyMotion>
  );
}

export default CustomerLayout;