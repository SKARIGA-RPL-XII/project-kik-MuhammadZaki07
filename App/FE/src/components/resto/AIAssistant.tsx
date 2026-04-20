import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  MessageCircle,
  Flame,
  TicketCheck,
  Pin,
  LeafyGreen,
  Bot,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Card } from "../ui/card";
import { useAI } from "@/hooks/useAI";
import { useCart } from "@/hooks/useCart";
import { AttributeModal } from "../ui/AttributeModal";
import { MenuCardAI } from "../ui/MenuCardAI";
import { useAuth } from "@/context/AuthContext";

const quickActions = [
  { emoji: <Flame size={18} color="red" />, text: "Menu Pedas", id: "spicy" },
  {
    emoji: <LeafyGreen size={18} color="green" fill="green" />,
    text: "Menu Sehat",
    id: "healthy",
  },
  {
    emoji: <TicketCheck size={18} color="gray" />,
    text: "Cek Promo",
    id: "promo",
  },
  {
    emoji: <Pin size={18} color="red" fill="red" />,
    text: "Signature",
    id: "signature",
  },
];

export function AIAssistant({ isCartOpen }: { isCartOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasAppeared, setHasAppeared] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [attrOpen, setAttrOpen] = useState(false);
  const { token } = useAuth();

  const { addToCart, cartItems } = useCart();
  const { messages, loading, sendMessage, handleAction } = useAI([], addToCart);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => setHasAppeared(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (text?: string) => {
    const messageToSend = text || inputValue;
    if (!messageToSend.trim()) return;

    sendMessage(messageToSend);
    setInputValue("");
  };

  const noAuth = !token;

  if (
    ["/transaction", "/admin", "/login", "booking", noAuth].some((path) =>
      location.pathname.includes(path),
    )
  )
    return null;

  const isEmptyChat = messages.length === 0;

  const normalizeMenu = (item: any) => {
    {
      return {
        id: item.id,
        name: item.name,
        price: item.price ?? 0,
        image: item.image,
        stock: item.stock ?? 0,
        category: item.category ?? "menu",
        attributes: item.attributes || [],
        hasAttributes: item.attributes?.length > 0,
      };
    }
  };

  const extractMenuItems = (messages: any[]) => {
    const last = messages[messages.length - 1];

    if (!last || last.type !== "menu") return [];

    if (!Array.isArray(last.data)) return [];

    return last.data;
  };

  const latestMenu = Array.isArray(extractMenuItems(messages))
    ? extractMenuItems(messages).map(normalizeMenu)
    : [];

  const handleAdd = (menu: any) => {
    if (menu.attributes?.length > 0) {
      setSelectedMenu(menu);
      setAttrOpen(true);
      return;
    }

    addToCart(
      {
        id: menu.id,
        name: menu.name,
        price: menu.original_price ?? 0,
        discount_price: menu.final_price ?? 0,
        original_price: menu.original_price,
        final_price: menu.final_price,
        menu_image: menu.image,
        attributes: menu.attributes || [],
        selectedAttributes: {},
        discount: menu.discount
          ? {
              id: menu.discount.id,
              value_discount: menu.discount.value,
              is_active: 1,
            }
          : null,
      },
      1,
    );
  };

  const handleConfirmAttr = (item: any, selected: any) => {
    addToCart(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        menu_image: item.image,
        attributes: item.attributes,
        selectedAttributes: selected,
        discount: item.discount,
      },
      1,
    );

    setAttrOpen(false);
  };


  return (
    <>
      <AnimatePresence>
        {hasAppeared && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`fixed z-50 ${
              isCartOpen
                ? "bottom-30 lg:bottom-10 right-110 hidden lg:block"
                : "bottom-30 lg:bottom-10 right-6"
            }`}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-red-600 text-white shadow-2xl flex items-center justify-center relative"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full border-2 border-red-400 opacity-50"
              />
              <MessageCircle size={28} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50"
            />

            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className={`fixed z-90 w-[380px] max-w-[95vw] h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
                isCartOpen ? "bottom-10 right-110" : "bottom-10 right-6"
              }`}
            >
              <div className="p-4 bg-red-600 text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">GagalBot AI</h4>
                    <p className="text-[10px] opacity-80">
                      Asisten GAGAL-LAPAR
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 dark:bg-neutral-900 bg-slate-50"
              >
                {isEmptyChat ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="p-4 bg-red-100 rounded-full mb-4">
                      <Bot size={28} className="text-red-600" />
                    </div>

                    <h2 className="text-lg font-bold dark:text-neutral-200">
                      Halo 👋, gue GagalBot
                    </h2>

                    <p className="text-sm dark:text-neutral-200 mt-1">
                      Mau makan apa hari ini? Gue bantu pilihin yang enak +
                      hemat 😋
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-5 w-full">
                      {quickActions.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => handleSendMessage(a.text)}
                          className="flex items-center justify-center gap-2 p-2 rounded-xl border bg-white dark:bg-neutral-800 hover:bg-slate-50 text-xs font-semibold"
                        >
                          {a.emoji}
                          {a.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="flex flex-col gap-2">
                      <div
                        className={`flex ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                            m.role === "user"
                              ? "bg-red-600 text-white"
                              : "bg-white dark:bg-neutral-800 border"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>

                      {m.type === "menu" && Array.isArray(m.data) && (
                        <div className="grid grid-cols-1 gap-3">
                          {m.data.map((item: any) => (
                            <MenuCardAI
                              key={item.id}
                              item={item}
                              onAdd={handleAdd}
                              onCustomize={(m) => {
                                setSelectedMenu(m);
                                setAttrOpen(true);
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {m.type === "profile" && m.data && (
                        <div className="bg-white p-3 rounded-xl border text-sm">
                          <p>
                            <b>Nama:</b> {m.data.name}
                          </p>
                          <p>
                            <b>Email:</b> {m.data.email}
                          </p>
                          <p>
                            <b>Badge:</b> {m.data.badge}
                          </p>
                          <p>
                            <b>Total Spend:</b> Rp{" "}
                            {Number(m.data.total_spend).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {m.actions?.length > 0 && (
                        <div className="flex flex-col gap-2 ml-2 mt-1">
                          {m.actions.map((item: any, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-white p-3 rounded-xl border flex justify-between"
                            >
                              <div>
                                <p className="text-xs font-bold">{item.name}</p>
                                <p className="text-xs text-red-600 font-bold">
                                  Rp {item.price.toLocaleString()}
                                </p>
                              </div>

                              <button
                                onClick={() => handleAction(item)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-[10px]"
                              >
                                <ShoppingCart size={12} />
                                Tambah
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {loading && (
                  <div className="text-xs text-gray-400">Typing...</div>
                )}
              </div>

              <div className="p-4 border-t bg-white dark:bg-neutral-800">
                <Card className="flex gap-2 p-2 rounded-full">
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 outline-none text-sm"
                    placeholder="Tanya menu..."
                  />
                  <button onClick={() => handleSendMessage()}>
                    <Send size={16} />
                  </button>
                </Card>
              </div>
            </motion.div>

            <AttributeModal
              open={attrOpen}
              onClose={() => setAttrOpen(false)}
              item={selectedMenu}
              onConfirm={handleConfirmAttr}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
