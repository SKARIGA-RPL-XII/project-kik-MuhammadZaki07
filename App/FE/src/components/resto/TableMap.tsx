'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Users, CheckCircle2, Lock } from 'lucide-react'

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

export function TableMap({ onSelectTable, selectedTable }: any) {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Floor Plan</h3>
          <p className="text-slate-500 font-medium">Tap on an available table to book it.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100">
          {[
            { label: 'Free', class: 'bg-white border-slate-200' },
            { label: 'Active', class: 'bg-indigo-600' },
            { label: 'Booked', class: 'bg-slate-300' }
          ].map((dot) => (
            <div key={dot.label} className="flex items-center gap-2 px-2">
              <div className={`w-3 h-3 rounded-full ${dot.class}`} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{dot.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full aspect-square md:aspect-[16/10] bg-white rounded-[3rem] border-4 border-slate-50 shadow-2xl shadow-slate-200/50 overflow-hidden p-4 md:p-12">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px)`, 
            backgroundSize: '32px 32px' 
          }} 
        />

        <div className="relative h-full w-full border-2 border-dashed border-slate-100 rounded-[2rem]">
          {tables.map((table) => {
            const isSelected = selectedTable === table.number
            const isOccupied = table.status !== 'available'
            const isHovered = hoveredTable === table.id

            return (
              <motion.button
                key={table.id}
                whileHover={!isOccupied ? { scale: 1.1 } : {}}
                whileTap={!isOccupied ? { scale: 0.95 } : {}}
                onClick={() => !isOccupied && onSelectTable?.(table.number)}
                onHoverStart={() => setHoveredTable(table.id)}
                onHoverEnd={() => setHoveredTable(null)}
                className="absolute"
                style={{
                  left: `${table.x}%`,
                  top: `${table.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{
                      width: isSelected ? 80 : 64,
                      height: isSelected ? 80 : 64,
                      backgroundColor: isSelected ? '#4f46e5' : isOccupied ? '#f1f5f9' : '#ffffff',
                      boxShadow: isSelected 
                        ? '0 20px 40px rgba(79, 70, 229, 0.3)' 
                        : isHovered && !isOccupied
                        ? '0 10px 20px rgba(0,0,0,0.05)'
                        : '0 0px 0px rgba(0,0,0,0)',
                    }}
                    className={`rounded-[1.5rem] border-2 transition-colors flex flex-col items-center justify-center ${
                      isSelected ? 'border-indigo-400' : isOccupied ? 'border-slate-200' : 'border-slate-100'
                    }`}
                  >
                    {isOccupied ? (
                      <Lock size={16} className="text-slate-400" />
                    ) : (
                      <>
                        <span className={`text-lg font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {table.number}
                        </span>
                        <div className={`flex items-center gap-1 mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          <Users size={10} />
                          <span className="text-[10px] font-bold">{table.capacity}</span>
                        </div>
                      </>
                    )}
                  </motion.div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full border-4 border-white"
                      >
                        <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-between p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Selected Table</p>
                <p className="text-xl font-black text-white">Table {selectedTable}</p>
              </div>
            </div>
            <p className="text-xs font-medium text-indigo-100 max-w-[120px] text-right">
              You can still change the table before checkout.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}