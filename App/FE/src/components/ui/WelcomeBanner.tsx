import { useState, useEffect, useMemo } from "react";
import Grainient from "./Grainient";
import { useAuth } from "@/context/AuthContext";

export default function WelcomeBanner() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  const quotes = useMemo(
    () => [
      "Fast service, great taste. Let's give our best today!",
      "A hot kitchen is normal, keep a cool heart for our customers.",
      "Inventory's safe, mind's at ease. Double-check stock before the rush!",
      "Customer satisfaction is Gagal-Lapar's top priority.",
      "One order, one smile. Make them want to come back!",
      "Teamwork is the secret ingredient behind our success.",
      "Keep today's reports as clean as a freshly washed plate. Let's go, Admin!",
      "Let's make today's shift smoother than yesterday. Step on it!",
    ],
    []
  );

  const dailyQuote = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return quotes[dayOfYear % quotes.length];
  }, [quotes]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  let greeting = "Good Evening";

  if (hours >= 5 && hours < 11) greeting = "Good Morning";
  else if (hours >= 11 && hours < 15) greeting = "Good Afternoon";
  else if (hours >= 15 && hours < 18) greeting = "Good Evening";

  const timeString = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dateString = time.toLocaleDateString("en-US", {
    weekday: "short", // Changed to short for better mobile fit
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative min-h-[220px] md:h-[200px] w-full overflow-hidden rounded-3xl shadow-lg border border-white/10">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#ff9e9e"
          color2="#ff2929"
          color3="#f0a3a3"
          timeSpeed={0.30}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={20}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col justify-center bg-black/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user?.profile_image && (
              <img 
                src={user.profile_image} 
                alt="Profile"
                draggable={false}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-white/30 hidden sm:block shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/image-dumy.png";
                }}
              />
            )}
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 border border-white/30 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span className="text-[10px] font-normal text-white uppercase tracking-wider">{user?.role_name || "Guest"}</span>
                </div>
                
                {user?.badge && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-yellow-400/20 px-3 py-1 border border-yellow-400/30 backdrop-blur-sm">
                    <span className="text-[10px] font-normal text-yellow-200">
                      {user.badge.name} Member
                    </span>
                  </div>
                )}
              </div>

              <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                {greeting},{" "}
                <span className="underline decoration-white/30 underline-offset-4">
                  {user?.username || "Zaki"}
                </span>{" "}
                👋
              </h2>
              <p className="max-w-sm md:max-w-md text-xs md:text-sm font-medium text-white/80 italic leading-relaxed">
                "{dailyQuote}"
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t border-white/10 pt-4 md:pt-0 md:border-none">
            <div className="text-3xl md:text-6xl font-bold text-white drop-shadow-md">
              {timeString}
            </div>
            <div className="text-[10px] md:text-sm text-white/90 font-medium">
              {dateString}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute hidden dark:block inset-0 z-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
    </div>
  );
}