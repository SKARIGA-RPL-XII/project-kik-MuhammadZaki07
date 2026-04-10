import { apiClient } from '@/lib/apiClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageCircle, Flame, TicketCheck, Pin, LeafyGreen, Bot, ShoppingCart } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  menuData?: any[] // Untuk menyimpan daftar menu dari AI
}

const quickActions = [
  { emoji: <Flame size={18} color='red'/>, text: 'Menu Pedas', id: 'spicy' },
  { emoji: <LeafyGreen size={18} color='green' fill='green'/>, text: 'Menu Sehat', id: 'healthy' },
  { emoji: <TicketCheck size={18} color='gray'/>, text: 'Cek Promo', id: 'promo' },
  { emoji: <Pin size={18} color='red' fill='red'/>, text: 'Signature', id: 'signature' },
]

export function AIAssistant({ isCartOpen }: { isCartOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo! 👋 Gue GagalBot. Laper? Mau gue cariin menu yang gokil?',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasAppeared, setHasAppeared] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto Scroll ke bawah tiap ada pesan baru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    const timer = setTimeout(() => setHasAppeared(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  const addMessage = (content: string, role: 'user' | 'assistant', menuData?: any[]) => {
    setMessages((prev) => [
      ...prev, 
      { id: Date.now().toString(), role, content, timestamp: new Date(), menuData }
    ])
  }

  const fetchAiResponse = async (userText: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/ai/chat', { message: userText })
      const aiData = response.data
      
      // Simpan pesan beserta data menu jika action-nya show_menu
      addMessage(
        aiData.message, 
        'assistant', 
        aiData.action === 'show_menu' ? aiData.data : undefined
      )
    } catch (error) {
      addMessage("Duh, server gue lagi pusing. Coba lagi ya!", 'assistant')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = (text?: string) => {
    const messageToSend = text || inputValue
    if (!messageToSend.trim()) return
    
    addMessage(messageToSend, 'user')
    setInputValue('')
    window.navigator?.vibrate?.(50)
    fetchAiResponse(messageToSend)
  }

  if (["/transaction", "/admin", "/login"].some(path => location.pathname.includes(path))) return null

  return (
    <>
      <AnimatePresence>
        {hasAppeared && !isOpen && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className={`fixed z-50 ${isCartOpen ? "bottom-10 right-110 hidden lg:block" : "bottom-10 right-6"}`}
          >
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-red-600 text-white shadow-2xl flex items-center justify-center relative"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 rounded-full border-2 border-red-400 opacity-50" />
              <MessageCircle size={28} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className={`fixed z-50 w-[380px] max-w-[95vw] h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col ${isCartOpen ? "bottom-10 right-110" : "bottom-10 right-6"}`}
            >
              {/* Header */}
              <div className="p-4 bg-red-600 text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full"><Bot size={20}/></div>
                  <div><h4 className="font-bold text-sm">GagalBot AI</h4><p className="text-[10px] opacity-80 font-medium">Asisten GAGAL-LAPAR</p></div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
              </div>

              {/* Chat Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
                {messages.map((m) => (
                  <div key={m.id} className="flex flex-col gap-2">
                    <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${m.role === 'user' ? 'bg-red-600 text-white font-medium' : 'bg-white border border-slate-100 text-slate-800'}`}>
                        {m.content}
                      </div>
                    </div>

                    {/* Rendering Daftar Menu (Jika AI kirim data) */}
                    {m.menuData && (
                      <div className="flex flex-col gap-2 ml-2 mt-1">
                        {m.menuData.map((item, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 max-w-[90%]"
                          >
                            <div className="flex-1">
                              <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1">{item.name}</h5>
                              <p className="text-[10px] text-red-600 font-bold">Rp {item.price.toLocaleString()}</p>
                            </div>
                            <button 
                              disabled={!item.is_available}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${item.is_available ? 'bg-red-600 text-white active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            >
                              <ShoppingCart size={12}/>
                              {item.is_available ? 'Pesan' : 'Habis'}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium italic">
                    <Bot size={14} className="animate-bounce" /> GagalBot lagi ngetik...
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                {messages.length === 1 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {quickActions.map(a => (
                      <button key={a.id} onClick={() => handleSendMessage(a.text)} className="flex items-center gap-2 p-2.5 border border-slate-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-[11px] font-bold text-slate-700">
                        {a.emoji} {a.text}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-full px-4 border border-slate-200 shadow-inner focus-within:border-red-300 transition-colors">
                  <input
                    value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Tanya menu atau budget..." className="flex-1 bg-transparent py-1.5 text-sm outline-none font-medium"
                  />
                  <button onClick={() => handleSendMessage()} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
                    <Send size={16}/>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}