import React from "react";

interface StatCardProps {
  label: string;
  value: React.ReactNode; 
  icon: any;
  description: React.ReactNode;
  trend?: string;
}

export function StatCard({ label, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-950 p-5 rounded-xl border">
      <div className="flex justify-between items-start">
        <div className="space-y-3 w-full">
          <p className="text-sm text-neutral-400 dark:text-neutral-300 leading-tight">
            {label}
          </p>
          
          <div className="min-h-[28px] flex items-center">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-300 tracking-tight leading-none">
              {value}
            </h3>
          </div>

          <div className="min-h-[14px]">
             <p className="text-[10px] text-neutral-500 font-medium leading-none">
                {description}
             </p>
          </div>
        </div>

        <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white rounded transition-all duration-300">
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}