import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
  }

  for (let d = 1; d <= daysInMonth(currentDate.getFullYear(), currentDate.getMonth()); d++) {
    const isToday = 
      d === new Date().getDate() && 
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear();

    days.push(
      <div 
        key={d} 
        className={`h-8 w-8 flex items-center justify-center text-xs font-medium rounded-lg cursor-pointer transition-all
          ${isToday ? 'bg-red-500 text-white' : 'hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'}
        `}
      >
        {d}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-sm font-bold text-neutral-800 dark:text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500">
            <ChevronLeftIcon size={16} />
          </button>
          <button onClick={nextMonth} className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500">
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
          <div key={day} className="h-8 w-8 flex items-center justify-center text-[10px] font-bold text-neutral-400 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Jadwal Stok Terdekat: <span className="font-bold text-neutral-700 dark:text-neutral-200">28 Mar</span>
          </span>
        </div>
      </div>
    </div>
  );
}