import { OrderType, Step } from "@/components/dialog/CheckoutProcess";
import { useSearchParams } from "react-router";

export const useCheckoutFlow = () => {
  const [searchParams] = useSearchParams();
  const tableFromUrl = searchParams.get("table");

  const getInitialStep = (): {
    step: Step;
    type: OrderType;
    table: string | null;
  } => {
    if (tableFromUrl) {
      return { step: "PAYMENT", type: "dine-in", table: tableFromUrl };
    }
    return { step: "ORDER_TYPE", type: null, table: null };
  };

  return { getInitialStep };
};
