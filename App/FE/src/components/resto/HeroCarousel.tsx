'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { useState, useEffect } from 'react'

const promos = [
  {
    id: 1,
    title: 'Special Friday Feast',
    description: 'Get 30% off on selected premium dishes',
    color: 'from-indigo-600 to-indigo-700',
    badge: '30% OFF',
  },
  {
    id: 2,
    title: 'Happy Hour',
    description: 'Buy one, get one 50% off on beverages',
    color: 'from-blue-600 to-indigo-600',
    badge: '50% OFF',
  },
  {
    id: 3,
    title: 'Chef\'s Recommendation',
    description: 'Try our new signature dessert collection',
    color: 'from-purple-600 to-indigo-600',
    badge: 'NEW',
  },
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [autoplay])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setAutoplay(false)
    setTimeout(() => setAutoplay(true), 5000)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg">
      <AnimatePresence mode="wait">
        {promos.map((promo, index) => (
          index === currentIndex && (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className={`relative h-48 md:h-64 bg-gradient-to-br ${promo.color} p-6 md:p-10 flex flex-col justify-between overflow-hidden`}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-white" />
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
                    {promo.badge}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-balance">{promo.title}</h2>
                <p className="text-white/90 text-sm md:text-base">{promo.description}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.navigator?.vibrate?.(50)}
                className="relative z-10 w-fit px-6 py-2 bg-white text-indigo-600 font-semibold rounded-full hover:shadow-lg transition-shadow"
              >
                Order Now
              </motion.button>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          goToSlide((currentIndex - 1 + promos.length) % promos.length)
          window.navigator?.vibrate?.(50)
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          goToSlide((currentIndex + 1) % promos.length)
          window.navigator?.vibrate?.(50)
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {promos.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            animate={{
              width: index === currentIndex ? 32 : 8,
              backgroundColor: index === currentIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
            }}
            className="h-2 rounded-full backdrop-blur-sm transition-all"
          />
        ))}
      </div>
    </div>
  )
}
