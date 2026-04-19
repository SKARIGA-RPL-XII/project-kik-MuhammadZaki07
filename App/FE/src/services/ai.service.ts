import { apiClient } from "@/lib/apiClient";

export interface AIAction {
  type: "add_to_cart";
  menu_id: number;
  name: string;
  price: number;
}

export interface AIResponse {
  reply: string;
  actions: AIAction[];
}

export const sendAIMessage = async (
  message: string,
  cart: { menu_id: number; name: string; qty: number }[],
): Promise<AIResponse> => {
  const res = await apiClient.post("/ai/chat", {
    message,
    cart,
  });

  return res.data;
};
