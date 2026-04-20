import { useState } from "react";
import { sendAIMessage, AIAction } from "@/services/ai.service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: AIAction[];
  type?: "menu" | "profile" | "general";
  data?: any[];
}

export function useAI(cart: any[], onAddToCart: (item: any) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendAIMessage(text, cart);

      const aiMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: res.reply,
        type: res.type,
        actions: res.actions ?? [],
        data: res.data ?? [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Server error, coba lagi ya",
          actions: [],
          data: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: AIAction) => {
    if (action.type === "add_to_cart") {
      const exist = cart.find((i) => i.menu_id === action.menu_id);

      if (exist) {
        onAddToCart({ ...exist, qty: exist.qty + 1 });
      } else {
        onAddToCart({
          menu_id: action.menu_id,
          name: action.name,
          price: action.price,
          qty: 1,
        });
      }
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    handleAction,
  };
}
