import { useCallback } from "react";
import { useLocation, useSearchParams } from "react-router";
import { useTransaction } from "@/hooks/react-query/useTransaction";
import { useCart } from "@/hooks/useCart";
import { useCashierCart } from "@/hooks/useCashierCart";
import { openSnapPopup } from "@/utils/midtransHandler";

export type TransactionSource = "cashier" | "customer";

interface TransactionOptions {
  source: TransactionSource;
  orderType: "dine_in" | "take_away";
  paymentMethod: string;
  settings: any;
  onSuccess?: (data: any) => void;
}

export const useTransactionManager = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const cashierCart = useCashierCart();
  const customerCart = useCart();
  const { useCreateTransaction } = useTransaction();
  const { mutateAsync: createTransaction, isPending } = useCreateTransaction();

  const getSourceData = useCallback((source: TransactionSource) => {
    return source === "cashier" ? cashierCart : customerCart;
  }, [cashierCart, customerCart]);

  const calculateTotals = useCallback((items: any[], settings: any) => {
    const subtotal = items.reduce((acc, item) => {
      const price = item.discount_price ?? item.price;
      return acc + (price * item.quantity);
    }, 0);

    const tax = settings?.is_tax_active ? (subtotal * settings.tax_percent / 100) : 0;
    const service = settings?.is_service_active ? (subtotal * settings.service_percent / 100) : 0;
    const total = subtotal + tax + service;

    return {
      subtotal: Math.round(subtotal),
      tax: Math.round(tax),
      service: Math.round(service),
      total: Math.round(total)
    };
  }, []);

  const executeCheckout = async (options: TransactionOptions) => {
    const { source, orderType, paymentMethod, settings, onSuccess } = options;
    const { cartItems, clearCart } = getSourceData(source);

    if (cartItems.length === 0) throw new Error("Cart is empty");

    const tableIdFromUrl = searchParams.get("table");
    const tableIdFromState = location.state?.tableId;
    const finalTableId = tableIdFromUrl || tableIdFromState || null;

    if (orderType === "dine_in" && !finalTableId) {
      throw new Error("Table selection is required for dine-in");
    }

    const { total } = calculateTotals(cartItems, settings);

    const payload = {
      order_source: source === "cashier" ? "cashier_direct" : "qr_code",
      order_type: orderType,
      table_id: orderType === "dine_in" ? finalTableId : null,
      payment_method: paymentMethod,
      total_amount: total,
      amount_paid: paymentMethod === "cash" ? total : 0,
      items: cartItems.map((item) => ({
        menu_id: item.id,
        quantity: item.quantity,
        price_at_transaction: item.discount_price ?? item.price,
        attributes: item.selectedAttributes
      })),
      settings: settings
    };

    const result = await createTransaction(payload);
    
    if (result.snap_token && paymentMethod !== "cash") {
      await openSnapPopup(result.snap_token, {
        onSuccess: () => {
          clearCart();
          if (onSuccess) onSuccess(result);
        },
        onPending: () => {
          clearCart();
          if (onSuccess) onSuccess(result);
        },
      });
    } else {
      clearCart();
      if (onSuccess) onSuccess(result);
    }

    return result;
  };

  return {
    executeCheckout,
    isPending,
    calculateTotals
  };
};