'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface Order {
  id: string
  tableNumber?: string
  type: 'dine-in' | 'takeaway'
  total: number
  items: Array<{ name: string; qty: number; price: number }>
  specialRequests?: string[]
  createdAt: Date
  isHighPriority?: boolean
}

interface OrderCardProps {
  order: Order
  onSelect: (order: Order) => void
  isSelected: boolean
}

export function OrderCard({ order, onSelect, isSelected }: OrderCardProps) {
  const [elapsedTime, setElapsedTime] = useState('0m')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - order.createdAt.getTime()) / 1000)
      const mins = Math.floor(diff / 60)
      const hours = Math.floor(mins / 60)

      if (hours > 0) {
        setElapsedTime(`${hours}h ${mins % 60}m`)
      } else {
        setElapsedTime(`${mins}m`)
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 10000)
    return () => clearInterval(interval)
  }, [order.createdAt])

  return (
    <button
      onClick={() => onSelect(order)}
      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? 'bg-brand-50/50 border-primary/60 shadow-lg shadow-primary/20'
          : 'bg-card border-border/40 hover:border-brand-500/40'
      } ${order.isHighPriority ? 'ring-2 ring-destructive/50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Order ID</p>
          <p className="text-2xl font-bold">{order.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {order.isHighPriority && (
            <AlertCircle className="w-5 h-5 text-destructive animate-pulse" />
          )}
          <div className={`px-2 py-1 rounded text-xs font-semibold ${
            order.type === 'takeaway'
              ? 'bg-accent/20 text-accent'
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {order.type === 'takeaway' ? 'TO-GO' : `TABLE ${order.tableNumber || '?'}`}
          </div>
        </div>
      </div>

      {/* Timer and Amount */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{elapsedTime}</span>
        </div>
        <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
      </div>

      {/* Items Preview */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground font-medium mb-1">Items ({order.items.length})</p>
        <div className="space-y-1">
          {order.items.slice(0, 2).map((item, i) => (
            <p key={i} className="text-sm text-foreground/80">
              {item.qty}x {item.name}
            </p>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-muted-foreground">+{order.items.length - 2} more</p>
          )}
        </div>
      </div>

      {/* Special Requests */}
      {order.specialRequests && order.specialRequests.length > 0 && (
        <div className="bg-accent/10 border border-accent/30 rounded p-2 mb-3">
          <p className="text-xs font-semibold text-accent mb-1">Special Requests</p>
          {order.specialRequests.map((req, i) => (
            <p key={i} className="text-xs text-foreground/70">• {req}</p>
          ))}
        </div>
      )}

      {/* Action Button */}
      <Button
        size="sm"
        variant={isSelected ? 'default' : 'outline'}
        className="w-full text-xs font-semibold"
        onClick={(e) => {
          e.stopPropagation()
          onSelect(order)
        }}
      >
        {isSelected ? 'Process Payment' : 'View Order'}
      </Button>
    </button>
  )
}
