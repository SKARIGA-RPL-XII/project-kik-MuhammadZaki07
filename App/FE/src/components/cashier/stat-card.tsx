import React from "react"
import { TrendingUp } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: number
  highlight?: boolean
}

export function StatCard({ label, value, icon, trend, highlight }: StatCardProps) {
  return (
    <div className={`rounded-lg p-4 backdrop-blur-md border ${
      highlight
        ? 'bg-red-500/10 border-red-500/50'
        : 'bg-secondary/50 border-border/50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-red-500">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-500 font-semibold">+{trend}% today</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg text-red-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
