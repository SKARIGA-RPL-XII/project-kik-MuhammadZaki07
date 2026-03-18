import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTimerProps {
  createdAt: string;
  limitMinutes?: number;
  criticalMinutes?: number;
}

export const OrderTimer = ({ 
  createdAt, 
  limitMinutes = 15, 
  criticalMinutes = 20 
}: OrderTimerProps) => {
  const [timeData, setTimeData] = useState({
    text: "00:00",
    isWarning: false,
    isCritical: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(createdAt).getTime();
      const now = new Date().getTime();
      const diffInSeconds = Math.floor((now - start) / 1000);

      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      const formattedText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      setTimeData({
        text: formattedText,
        isWarning: minutes >= limitMinutes,
        isCritical: minutes >= criticalMinutes
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [createdAt, limitMinutes, criticalMinutes]);

  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black transition-all duration-500 border",
        "bg-zinc-100 text-zinc-600 border-zinc-200",
        timeData.isWarning && "bg-orange-50 text-orange-600 border-orange-200",
        timeData.isCritical && "bg-red-50 text-red-600 border-red-200 animate-pulse ring-2 ring-red-100"
      )}
    >
      <Clock className={cn("h-3 w-3", timeData.isCritical && "animate-spin-slow")} />
      <span>{timeData.text}</span>
    </div>
  );
};