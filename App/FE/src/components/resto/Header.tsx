"use client";

import { motion } from "framer-motion";
import { Bell, User } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  tableId?: string;
  restaurantName?: string;
}

export function Header({
  tableId = "Table 12",
  restaurantName = "ModernDine",
}: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-2 relative"
        >
          <div className="bg-brand-500 rounded-md w-10 h-10 flex justify-center items-center">
            <img src="/white-logo.png" alt="Logo" className="w-full" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-semibold text-black">Restaurant name</h1>
            <span className=" text-muted-foreground text-sm">Jl.hahaha , No 09 , Malang</span>
          </div>
        </div>

        <div
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-200"
        >
          <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
          <span className="text-sm font-semibold text-brand-700">
            {tableId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.navigator?.vibrate?.(50)}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              window.navigator?.vibrate?.(50);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-500"
          >
            <User className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:hidden px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border-t border-indigo-200 flex items-center justify-center gap-2"
      >
        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
        <span className="text-sm font-semibold text-indigo-700">{tableId}</span>
      </motion.div>
    </motion.header>
  );
}
