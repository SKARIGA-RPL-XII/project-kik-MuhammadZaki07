import { useState, useEffect, useMemo } from "react";
import Grainient from "./Grainient";
import { useAuth } from "@/context/AuthContext"; // Pastikan path import sesuai

export default function WelcomeBanner() {
  const { user } = useAuth(); // Ambil data user dari context
  const [time, setTime] = useState(new Date());

  const quotes = useMemo(
    () => [
      "Pelayanan cepat, rasa tetap mantap. Mari berikan yang terbaik hari ini!",
      "Dapur panas itu biasa, yang penting hati tetap dingin melayani pelanggan.",
      "Stok aman, hati tenang. Jangan lupa cek bahan baku sebelum jam sibuk!",
      "Kepuasan pelanggan Gagal-Lapar adalah prioritas utama kita semua.",
      "Satu pesanan, satu senyuman. Mari buat mereka ingin kembali lagi!",
      "Kerja tim adalah bumbu rahasia di balik kesuksesan restoran kita.",
      "Pastikan laporan hari ini sebersih piring yang baru dicuci. Semangat, Admin!",
      "Shift hari ini harus lebih lancar dari kemarin. Mari kita gas!",
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
  let greeting = "Selamat Malam";

  if (hours >= 5 && hours < 11) greeting = "Selamat Pagi";
  else if (hours >= 11 && hours < 15) greeting = "Selamat Siang";
  else if (hours >= 15 && hours < 18) greeting = "Selamat Sore";

  const timeString = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateString = time.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative h-[180px] w-full overflow-hidden rounded-3xl">
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#ff9e9e"
          color2="#ff2929"
          color3="#f0a3a3"
          timeSpeed={0.30}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
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

      <div className="relative z-10 flex h-full w-full flex-col justify-between bg-black/10 p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            {user?.profile_image && (
              <img 
                src={user.profile_image} 
                alt="Profile"
                draggable={false}
                className="w-20 h-20 rounded-lg object-cover border-2 border-white/30  hidden md:block"
              />
            )}
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 border border-white/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-white capitalize">{user?.role_name || "Guest"}</span>
                </div>
                
                {user?.badge && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-yellow-400/20 px-3 py-1 border border-yellow-400/30">
                    <span className="text-[10px] font-bold text-yellow-200">
                      {user.badge.name} Member
                    </span>
                  </div>
                )}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {greeting},{" "}
                <span className="underline decoration-white/30 underline-offset-4">
                  {user?.username || "Zaki"}!
                </span>{" "}
                👋
              </h2>
              <p className="max-w-md text-sm font-normal text-white/80 italic">
                "{dailyQuote}"
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <div className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              {timeString}
            </div>
            <div className="mt-1 text-xs tracking-[0.2em] text-white">
              {dateString}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute hidden dark:block inset-0 z-0 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
}