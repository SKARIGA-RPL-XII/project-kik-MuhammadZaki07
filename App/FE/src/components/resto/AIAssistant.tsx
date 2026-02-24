import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageCircle, Sparkles, Flame, TicketCheck, Pin, LeafyGreen, Bot } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const quickActions = [
  { emoji: <Flame color='red'/>, text: 'Rekomendasi Menu Pedas', id: 'spicy' },
  { emoji: <LeafyGreen color='green' fill='green'/>, text: 'Menu Sehat', id: 'healthy' },
  { emoji: <TicketCheck color='gray' fill='white'/>, text: 'Cek Promo', id: 'promo' },
  { emoji: <Pin color='red' fill='red'/>, text: 'Menu Signature', id: 'signature' },
]

const assistantResponses: Record<string, string> = {
  spicy: 'Kami merekomendasikan Sambal Goreng Telur, Ayam Penyet, dan Lumpia Goreng Pedas! 🌶️ Semuanya punya level kepedasan yang bisa disesuaikan.',
  healthy: 'Menu sehat kami termasuk: Salad Sayuran Segar, Ikan Bakar dengan Rempah, dan Sup Ayam Rendah Garam. Semua lezat dan bergizi!',
  promo: 'Sedang ada promo SPESIAL JUMAT: Diskon 30% untuk menu pilihan. Plus, setiap pembelian minuman gratis dessert! 🎉',
  signature: 'Signature kami yang paling dicinta: Rendang Daging Premium, Nasi Kuning Istimewa, dan Martabak Manis Kejutan. Wajib dicoba!',
}

interface AIAssistantProps {
  onDisappear?: () => void
  isCartOpen?: boolean
}

export function AIAssistant({ onDisappear , isCartOpen }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo! 👋 Saya siap membantu Anda memilih menu terbaik. Ada yang bisa saya bantu?',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasAppeared, setHasAppeared] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAppeared(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleQuickAction = (actionId: string) => {
    const userMessage = quickActions.find((a) => a.id === actionId)?.text || ''
    addMessage(userMessage, 'user')
    window.navigator?.vibrate?.(50)

    setTimeout(() => {
      const response = assistantResponses[actionId] || 'Maaf, saya tidak memahami pertanyaan Anda.'
      addMessage(response, 'assistant')
    }, 1000)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    addMessage(inputValue, 'user')
    setInputValue('')
    window.navigator?.vibrate?.(50)

    setIsLoading(true)
    setTimeout(() => {
      const response = 'Terima kasih atas pertanyaan Anda! Silakan pesan menu favorit Anda atau hubungi staff kami untuk bantuan lebih lanjut.'
      addMessage(response, 'assistant')
      setIsLoading(false)
    }, 1500)
  }

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  return (
    <>
      <AnimatePresence>
        {hasAppeared && !isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className={isCartOpen ? "fixed bottom-10 lg:block hidden right-110 z-20" : "fixed lg:bottom-10 bottom-30 right-9 z-20"}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-15 right-0 px-3 py-2 bg-brand-600 text-white text-xs rounded-full flex items-center gap-2 shadow-lg"
            >
              <h1 className='font-bold text-white text-xl'>AI</h1>
              <span className="font-semibold">Thinking...</span>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsOpen(true)
                window.navigator?.vibrate?.(50)
              }}
              className="relative w-16 h-16 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-xl flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full border-2 border-brand-400 opacity-50"
              />
              <MessageCircle className="w-7 h-7" />
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
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`fixed ${isCartOpen ? "fixed bottom-10 right-110 z-20" : "fixed bottom-10 right-9 z-20"} z-50 w-96 max-w-full h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden`}
            >
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Restaurant Assistant</h3>
                    <p className="text-xs text-white/80">Always here to help</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-slate-400"
                    />
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-slate-400"
                    />
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-slate-400"
                    />
                  </motion.div>
                )}
              </div>

              {messages.length === 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 bg-slate-50 border-t border-slate-200"
                >
                  <p className="text-xs text-slate-600 font-semibold mb-2">Coba pertanyaan ini:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action) => (
                      <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickAction(action.id)}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-brand-50 hover:border-brand-300 transition-all text-left"
                      >
                        <span className="text-lg block mb-1">{action.emoji}</span>
                        <span className="text-xs font-semibold text-slate-900 line-clamp-2">
                          {action.text}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tanya sesuatu..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage()
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-full border border-slate-200 focus:border-brand-600 focus:outline-none text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="p-2 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
