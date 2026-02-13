'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Table {
  id: string
  number: number
  status: 'available' | 'occupied' | 'reserved'
  capacity: number
  x: number
  y: number
}

const tables: Table[] = [
  { id: '1', number: 1, status: 'available', capacity: 2, x: 20, y: 20 },
  { id: '2', number: 2, status: 'occupied', capacity: 2, x: 50, y: 20 },
  { id: '3', number: 3, status: 'available', capacity: 4, x: 80, y: 20 },
  { id: '4', number: 4, status: 'available', capacity: 4, x: 20, y: 50 },
  { id: '5', number: 5, status: 'occupied', capacity: 6, x: 50, y: 50 },
  { id: '6', number: 6, status: 'available', capacity: 6, x: 80, y: 50 },
  { id: '7', number: 7, status: 'reserved', capacity: 2, x: 20, y: 80 },
  { id: '8', number: 8, status: 'available', capacity: 4, x: 50, y: 80 },
  { id: '9', number: 9, status: 'available', capacity: 4, x: 80, y: 80 },
]

interface TableMapProps {
  onSelectTable?: (tableNumber: number) => void
  selectedTable?: number
}

export function TableMap({ onSelectTable, selectedTable }: TableMapProps) {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)

  const getTableColor = (table: Table) => {
    if (table.status === 'occupied') return 'from-red-500 to-red-600'
    if (table.status === 'reserved') return 'from-amber-500 to-amber-600'
    if (selectedTable === table.number) return 'from-indigo-600 to-indigo-700'
    return 'from-white to-slate-100'
  }

  const getTextColor = (table: Table) => {
    if (table.status === 'occupied' || table.status === 'reserved') return 'text-white'
    return 'text-slate-900'
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Select a Table</h3>
        <p className="text-sm text-slate-600 mb-6">
          Choose your preferred seating arrangement
        </p>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white to-slate-100 border border-slate-200" />
          <span className="text-xs text-slate-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700" />
          <span className="text-xs text-slate-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-600" />
          <span className="text-xs text-slate-600">Occupied</span>
        </div>
      </div>

      {/* Table Grid */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200">
        {/* Decorative grid background */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-b border-slate-300"
              style={{ top: `${(i + 1) * 10}%` }}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-full border-r border-slate-300"
              style={{ left: `${(i + 1) * 10}%` }}
            />
          ))}
        </div>

        {/* Tables */}
        {tables.map((table) => (
          <motion.button
            key={table.id}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (table.status === 'available') {
                onSelectTable?.(table.number)
                window.navigator?.vibrate?.(50)
              }
            }}
            onHoverStart={() => setHoveredTable(table.id)}
            onHoverEnd={() => setHoveredTable(null)}
            disabled={table.status !== 'available' && selectedTable !== table.number}
            className={`absolute w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              table.status !== 'available' && selectedTable !== table.number
                ? 'cursor-not-allowed opacity-70'
                : 'cursor-pointer'
            }`}
            style={{
              left: `${table.x}%`,
              top: `${table.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              boxShadow:
                hoveredTable === table.id || selectedTable === table.number
                  ? '0 10px 30px rgba(79, 70, 229, 0.4)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <motion.div
              className={`w-full h-full rounded-full bg-gradient-to-br ${getTableColor(
                table,
              )} flex items-center justify-center font-bold ${getTextColor(table)}`}
              animate={{
                borderColor:
                  selectedTable === table.number ? 'rgb(79, 70, 229)' : 'transparent',
              }}
              style={{
                border: selectedTable === table.number ? '3px solid rgba(79, 70, 229, 0.5)' : 'none',
              }}
            >
              {table.number}
            </motion.div>

            {/* Hover Info */}
            {hoveredTable === table.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: -80 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap"
              >
                <div className="font-semibold">Table {table.number}</div>
                <div className="text-slate-400">Capacity: {table.capacity}</div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {selectedTable && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200"
        >
          <p className="text-sm text-indigo-700 font-semibold">
            ✓ Table {selectedTable} selected
          </p>
        </motion.div>
      )}
    </div>
  )
}
