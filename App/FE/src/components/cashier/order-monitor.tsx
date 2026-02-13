import { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import { OrderCard, Order } from './order-card'
import Input from '../form/input/InputField'

interface OrderMonitorProps {
  orders: Order[]
  selectedOrder: Order | null
  onSelectOrder: (order: Order) => void
}

type FilterType = 'all' | 'pending' | 'paid' | 'takeaway' | 'dine-in'

export function OrderMonitor({ orders, selectedOrder, onSelectOrder }: OrderMonitorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filteredOrders = useMemo(() => {
    let result = orders

    // Apply filter
    if (activeFilter === 'takeaway') {
      result = result.filter(o => o.type === 'takeaway')
    } else if (activeFilter === 'dine-in') {
      result = result.filter(o => o.type === 'dine-in')
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(o =>
        o.id.toLowerCase().includes(query) ||
        o.tableNumber?.toLowerCase().includes(query)
      )
    }

    return result
  }, [orders, searchQuery, activeFilter])

  const filterChips: { label: string; value: FilterType }[] = [
    { label: 'All Orders', value: 'all' },
    { label: 'Takeaway', value: 'takeaway' },
    { label: 'Dine-in', value: 'dine-in' },
  ]

  return (
    <div className="flex-1 flex flex-col">
      {/* Search & Filter Bar */}
      <div className="p-6 border-b border-border/30 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by Order ID or Table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 flex-wrap">
          {filterChips.map(chip => (
            <button
              key={chip.value}
              onClick={() => setActiveFilter(chip.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === chip.value
                  ? 'bg-brand-50 text-brand-500'
                  : 'bg-secondary/50 text-brand-500/80 border border-border/40 hover:border-brand-500/40'
              }`}
            >
              <Filter className="w-3 h-3" />
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground mb-2">No orders found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try a different search' : 'All orders have been processed'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={onSelectOrder}
                isSelected={selectedOrder?.id === order.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
