import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useCart } from "@/hooks/useCart";
import { TableService } from "@/services/table.service";

export function useCustomerLayoutLogic() {
  const [searchParams] = useSearchParams();
  const tableIdFromUrl = searchParams.get("table");

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableData, setTableData] = useState<{
    id: string | number;
    name: string;
    room?: { name: string };
  } | null>(null);

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

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const closeCart = () => setIsCartOpen(false);
  const openCheckout = () => setIsCheckoutOpen(true);
  const closeCheckout = () => setIsCheckoutOpen(false);

  const tableDisplay = tableData
    ? `Table ${tableData.name || tableData.id} ${
        tableData.room ? `| ${tableData.room.name}` : ""
      }`
    : "Nomor";

  return {
    states: {
      isCheckoutOpen,
      isCartOpen,
      tableDisplay,
      cartItems,
    },
    actions: {
      toggleCart,
      closeCart,
      openCheckout,
      closeCheckout,
      removeFromCart,
      clearCart,
      updateQuantity,
    },
  };
}