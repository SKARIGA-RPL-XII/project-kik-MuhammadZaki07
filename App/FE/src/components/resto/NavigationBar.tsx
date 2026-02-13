'use client'

import { motion } from 'framer-motion'
import { Dessert, Grid, Pizza, Search, Star } from 'lucide-react'
import { useState } from 'react'
import { MdLocalDrink } from 'react-icons/md'

const categories = [
  { id: 'all', label: 'All', icon: <Grid/> },
  { id: 'food', label: 'Food', icon: <Pizza/> },
  { id: 'drinks', label: 'Drinks', icon: <MdLocalDrink/> },
  { id: 'desserts', label: 'Desserts', icon: <Dessert/> },
  { id: 'specials', label: 'Specials', icon: <Star/> },
]

interface NavigationBarProps {
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
  onSearch?: (query: string) => void
}

export function NavigationBar({
  selectedCategory = 'all',
  onCategoryChange,
  onSearch,
}: NavigationBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <div className="space-y-4 pb-4 mt-10">
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 20px rgba(79, 70, 229, 0.2)'
            : '0 0 0px rgba(79, 70, 229, 0)',
        }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search dishes, ingredients..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-brand-600 focus:outline-none transition-colors bg-white placeholder-slate-400 text-slate-900"
        />
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onCategoryChange?.(category.id)
              window.navigator?.vibrate?.(30)
            }}
            animate={{
              backgroundColor: selectedCategory === category.id ? 'rgb(79, 70, 229)' : 'rgb(248, 250, 252)',
              color: selectedCategory === category.id ? 'white' : 'rgb(71, 85, 105)',
            }}
            className="flex items-center gap-2 px-5 py-1.5 rounded-full font-semibold text-sm border border-slate-200 whitespace-nowrap transition-all"
          >
            <span className="text-lg">{category.icon}</span>
            {category.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
