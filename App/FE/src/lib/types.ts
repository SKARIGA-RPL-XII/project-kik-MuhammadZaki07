/**
 * Type definitions for ModernDine Restaurant Ordering App
 */

/**
 * Menu item representing a dish or drink
 */
export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: 'food' | 'drinks' | 'desserts' | 'specials'
  isBestSeller?: boolean
  rating?: number
  prepTime?: number // in minutes
  allergens?: string[]
  isVegetarian?: boolean
  isSpicy?: boolean
}

/**
 * Cart item combining menu item with quantity
 */
export interface CartItem {
  item: MenuItem
  quantity: number
  notes?: string // special instructions
  addedAt?: Date
}

/**
 * Restaurant table for dine-in ordering
 */
export interface Table {
  id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  x: number // Position on map (0-100)
  y: number // Position on map (0-100)
}

/**
 * Order information
 */
export interface Order {
  id: string
  items: CartItem[]
  orderType: 'dine-in' | 'take-away'
  tableId?: number // Only for dine-in
  subtotal: number
  serviceFee: number
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed'
  createdAt: Date
  estimatedReadyTime?: Date
}

/**
 * Chat message in AI Assistant
 */
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'quick-action'
}

/**
 * Quick action preset for AI Assistant
 */
export interface QuickAction {
  id: string
  emoji: string
  text: string
  category?: 'recommendations' | 'promotions' | 'menu' | 'help'
}

/**
 * Promotion/Promo item for carousel
 */
export interface Promotion {
  id: string | number
  title: string
  description: string
  badge: string
  color: string
  image?: string
  expiresAt?: Date
}

/**
 * User profile (prepared for future auth)
 */
export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  preferences?: {
    favoriteItems?: string[]
    dietary?: string[]
    allergies?: string[]
  }
}

/**
 * Restaurant information
 */
export interface RestaurantInfo {
  name: string
  description: string
  logo?: string
  address: string
  phone: string
  hours: {
    open: string
    close: string
  }
  cuisine: string[]
}

/**
 * Category for menu filtering
 */
export interface MenuCategory {
  id: string
  label: string
  icon: string
  color?: string
}

/**
 * Checkout method
 */
export type CheckoutMethod = 'dine-in' | 'take-away'

/**
 * Table status
 */
export type TableStatus = 'available' | 'occupied' | 'reserved'

/**
 * Order status
 */
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
