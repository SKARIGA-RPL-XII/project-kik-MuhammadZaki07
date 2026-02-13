'use client'

import { useState } from 'react'
import { BarChart3, Clock, Users, Zap, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from './stat-card'
import { OrderMonitor } from './order-monitor'
import { PaymentDrawer } from './payment-drawer'
import { Order } from './order-card'

interface CashierLayoutProps {
  orders?: Order[]
}

const DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-2401',
    tableNumber: '5',
    type: 'dine-in',
    total: 45.99,
    items: [
      { name: 'Grilled Salmon', qty: 2, price: 18.99 },
      { name: 'Caesar Salad', qty: 1, price: 8.99 },
    ],
    specialRequests: ['Extra Lemon', 'No Croutons'],
    createdAt: new Date(Date.now() - 18 * 60000),
    isHighPriority: true,
  },
  {
    id: 'ORD-2402',
    type: 'takeaway',
    total: 32.50,
    items: [
      { name: 'Margherita Pizza', qty: 1, price: 14.99 },
      { name: 'Garlic Bread', qty: 2, price: 5.99 },
      { name: 'Soft Drink', qty: 2, price: 2.99 },
    ],
    createdAt: new Date(Date.now() - 8 * 60000),
  },
  {
    id: 'ORD-2403',
    tableNumber: '12',
    type: 'dine-in',
    total: 67.25,
    items: [
      { name: 'Ribeye Steak', qty: 1, price: 38.99 },
      { name: 'Loaded Fries', qty: 1, price: 7.99 },
      { name: 'House Wine', qty: 1, price: 12.99 },
      { name: 'Dessert Trio', qty: 1, price: 9.99 },
    ],
    specialRequests: ['Medium Rare', 'Extra Butter'],
    createdAt: new Date(Date.now() - 5 * 60000),
  },
  {
    id: 'ORD-2404',
    tableNumber: '3',
    type: 'dine-in',
    total: 28.75,
    items: [
      { name: 'Burger Deluxe', qty: 1, price: 15.99 },
      { name: 'Sweet Potato Fries', qty: 1, price: 5.99 },
      { name: 'Iced Tea', qty: 1, price: 3.99 },
    ],
    createdAt: new Date(Date.now() - 3 * 60000),
  },
  {
    id: 'ORD-2405',
    type: 'takeaway',
    total: 19.99,
    items: [
      { name: 'Chicken Sandwich', qty: 1, price: 11.99 },
      { name: 'Coleslaw', qty: 1, price: 3.99 },
      { name: 'Beverage', qty: 1, price: 2.99 },
    ],
    createdAt: new Date(Date.now() - 1 * 60000),
  },
  {
    id: 'ORD-2406',
    tableNumber: '8',
    type: 'dine-in',
    total: 55.50,
    items: [
      { name: 'Pasta Carbonara', qty: 2, price: 16.99 },
      { name: 'Tiramisu', qty: 2, price: 6.99 },
      { name: 'Espresso', qty: 2, price: 2.99 },
    ],
    createdAt: new Date(Date.now() - 12 * 60000),
  },
]

export function CashierLayout({ orders = DEMO_ORDERS }: CashierLayoutProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const todayRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const activeOrders = orders.length
  const tableOccupancy = Math.round((orders.filter(o => o.type === 'dine-in').length / 12) * 100)

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedOrder(null)
  }

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Navigation Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-primary">Command Center</h1>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: BarChart3, label: 'Live Orders', active: true },
            { icon: Clock, label: 'History' },
            { icon: Users, label: 'Menu Management' },
            { icon: Zap, label: 'Analytics' },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                item.active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Performance Metrics Bar */}
        <div className="bg-secondary/20 border-b border-border/30 backdrop-blur-md p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden mb-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Real-time Revenue"
              value={`$${todayRevenue.toFixed(2)}`}
              trend={12}
              highlight
              icon={<BarChart3 className="w-6 h-6" />}
            />
            <StatCard
              label="Order Queue"
              value={activeOrders}
              icon={<Clock className="w-6 h-6" />}
            />
            <StatCard
              label="Table Occupancy"
              value={`${tableOccupancy}%`}
              icon={<Users className="w-6 h-6" />}
            />
            <StatCard
              label="AI Insights"
              value="Peak hour"
              icon={<Zap className="w-6 h-6" />}
            />
          </div>
        </div>

        {/* Order Workspace */}
        <div className="flex-1 flex overflow-hidden">
          <OrderMonitor
            orders={orders}
            selectedOrder={selectedOrder}
            onSelectOrder={handleSelectOrder}
          />

          {/* Payment Drawer Overlay Indicator */}
          {isDrawerOpen && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-none" />
          )}
        </div>
      </div>

      {/* Payment Drawer */}
      <PaymentDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  )
}
