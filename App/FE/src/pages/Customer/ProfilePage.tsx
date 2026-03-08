import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, History, LogOut, ShieldCheck, 
  ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { BadgeService } from "@/services/badge.service";
import { ProfileView } from "./ProfileView";
import { OrdersView } from "./OrdersView";
import { SecurityView } from "./SecurityView";

export default function CustomerProfilePage() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [badgeIdx, setBadgeIdx] = useState(0);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data } = await BadgeService.getBadges();
        if (data?.data) {
          const sorted = [...data.data].sort((a, b) => a.min_spend - b.min_spend);
          setAllBadges(sorted);
          const currentIdx = sorted.findIndex((b: any) => Number(b.id) === Number(user?.badge_id));
          setBadgeIdx(currentIdx === -1 ? 0 : currentIdx);
        }
      } catch (err) { console.error(err); }
    };
    if (user) fetchBadges();
  }, [user]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="animate-spin text-red-500" size={28} />
      <p className="text-sm text-neutral-400">Memuat profil...</p>
    </div>
  );

  const currentBadge = allBadges.find((b: any) => Number(b.id) === Number(user?.badge_id)) || allBadges[0];
  const viewedBadge = allBadges[badgeIdx];
  const isUnlocked = viewedBadge && currentBadge ? viewedBadge.min_spend <= currentBadge.min_spend : false;
  const isCurrentBadge = user?.badge_id ? Number(viewedBadge?.id) === Number(user?.badge_id) : badgeIdx === 0;

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      {/* 3D Metal Badge Section */}
      <section className="flex flex-col items-center mb-10">
        <div className="relative flex items-center justify-center w-full h-48">
          <button 
            onClick={() => setBadgeIdx((p) => (p - 1 + allBadges.length) % allBadges.length)} 
            className="absolute left-0 p-2 text-neutral-300 hover:text-red-500 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={badgeIdx}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center border-[4px] shadow-xl transition-all duration-500 ${
                  isUnlocked 
                  ? "bg-gradient-to-br from-neutral-100 via-neutral-300 to-neutral-400 border-white" 
                  : "bg-neutral-100 border-neutral-200 grayscale opacity-40"
                }`}
                style={{
                  boxShadow: isUnlocked ? "inset 0 2px 8px rgba(255,255,255,0.7), 0 10px 25px rgba(0,0,0,0.1)" : "none"
                }}
              >
                {/* Metallic Gloss Reflection */}
                {isUnlocked && (
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <motion.div 
                      animate={{ x: [-120, 120] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                      className="absolute inset-0 w-1/3 h-full bg-white/40 skew-x-12 blur-md"
                    />
                  </div>
                )}
                
                <span className="text-3xl filter drop-shadow-sm mb-1">🏆</span>
                <span className={`text-[10px] font-bold ${isUnlocked ? "text-neutral-700" : "text-neutral-400"}`}>
                  {viewedBadge?.name}
                </span>

                {isCurrentBadge && (
                  <div className="absolute -top-1 -right-1 bg-red-600 text-[8px] text-white px-2 py-0.5 rounded-full font-bold shadow-md ring-2 ring-white">
                    AKTIF
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Subtle Orbital Rings */}
            {isUnlocked && isCurrentBadge && (
              <div className="absolute inset-0 -z-10 pointer-events-none">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-12px] border border-dashed border-red-500/10 rounded-full"
                />
              </div>
            )}
          </div>

          <button 
            onClick={() => setBadgeIdx((p) => (p + 1) % allBadges.length)} 
            className="absolute right-0 p-2 text-neutral-300 hover:text-red-500 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <p className={`text-[11px] font-medium mt-2 ${isUnlocked ? "text-red-600" : "text-neutral-400"}`}>
          {isCurrentBadge ? "Rank Utama" : isUnlocked ? "Sudah Terbuka" : `Butuh Rp${viewedBadge?.min_spend.toLocaleString()}`}
        </p>
      </section>

      {/* Modern Tabs */}
      <div className="flex bg-neutral-100/80 p-1 rounded-xl mb-8">
        {[
          { id: "profile", label: "Profil", icon: User },
          { id: "security", label: "Keamanan", icon: ShieldCheck },
          { id: "orders", label: "Pesanan", icon: History },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.id ? "bg-white text-red-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="min-h-[300px]"
        >
          {activeTab === "profile" && <ProfileView user={user} />}
          {activeTab === "security" && <SecurityView user={user} />}
          {activeTab === "orders" && <OrdersView />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 pt-6 border-t border-neutral-100 flex flex-col gap-2">
        <Button 
          variant="ghost" 
          onClick={logout}
          className="w-full justify-start text-neutral-400 hover:text-red-600 hover:bg-red-50 h-11 rounded-xl transition-all"
        >
          <LogOut size={16} className="mr-3" />
          <span className="text-sm font-medium">Keluar Akun</span>
        </Button>
      </div>
    </div>
  );
}