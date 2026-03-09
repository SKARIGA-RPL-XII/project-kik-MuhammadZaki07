import { useEffect, useState } from "react";
import { UserService } from "@/services/user.service";

export function useOrdersLogic() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await UserService.getTransactions();
        setOrders(data || []);
      } catch (err) { 
        console.error("Order Fetch Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchOrders();
  }, []);

  return { orders, loading };
}