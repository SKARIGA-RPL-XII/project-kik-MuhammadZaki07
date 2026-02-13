import { useState } from "react";
import {
  AIAssistant,
  CartSummary,
  CheckoutModal,
  Header,
} from "@/components/resto";
import { Outlet } from "react-router";
import { useCart } from "@/hooks/useCart";

function CustomerLayout() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { cartItems, removeFromCart, clearCart } = useCart();

  const handleConfirmCheckout = (
    method: "dine-in" | "take-away",
    tableId?: number
  ) => {
    console.log("Order confirmed:", { method, tableId, items: cartItems });

    clearCart();
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    window.navigator?.vibrate?.([50, 50, 50]);
  };

  console.log("2" , cartItems);
  

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header tableId="Table 12" restaurantName="ModernDine" />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </div>

      <CartSummary
        items={cartItems}
        onCheckout={() => setIsCheckoutOpen(true)}
        onRemoveItem={removeFromCart}
        isOpen={isCartOpen}
        onToggle={() => setIsCartOpen(prev => !prev)}
      />
      

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleConfirmCheckout}
      />

      <AIAssistant />
    </main>
  );
}

export default CustomerLayout;
