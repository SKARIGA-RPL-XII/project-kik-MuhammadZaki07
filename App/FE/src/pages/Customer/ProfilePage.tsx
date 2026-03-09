import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronLeft, ChevronRight, User, ShieldCheck, History } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { ProfileView } from "./ProfileView";
import { OrdersView } from "./OrdersView";
import { SecurityView } from "./SecurityView";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";
import { ProfileSkeleton } from "@/components/skeleton/ProfileSkeleton";

export default function CustomerProfilePage() {
  const { user, logout, loading } = useAuth();
  const logic = useCustomerProfile(user);

  if (loading) return <ProfileSkeleton />;

  return (
    <>
      <Helmet>
        <title>My Profile | Gagal-Lapar Restaurant</title>
        <meta name="description" content="Manage your account, view your loyalty badges, and track order history." />
      </Helmet>

      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Badge Section */}
        <section className="flex flex-col items-center mb-10">
          <div className="relative flex items-center justify-center w-full h-48">
            <button onClick={logic.prevBadge} className="absolute left-0 p-2 text-neutral-300 hover:text-red-500 transition-colors">
              <ChevronLeft size={24} />
            </button>
            
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={logic.badgeIdx}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center border-[4px] shadow-xl transition-all duration-500 ${
                    logic.isUnlocked 
                    ? "bg-gradient-to-br from-neutral-100 via-neutral-300 to-neutral-400 border-white" 
                    : "bg-neutral-100 border-neutral-200 grayscale opacity-40"
                  }`}
                >
                  {logic.isUnlocked && (
                    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                      <motion.div 
                        animate={{ x: [-120, 120] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                        className="absolute inset-0 w-1/3 h-full bg-white/40 skew-x-12 blur-md"
                      />
                    </div>
                  )}
                  
                  <span className="text-3xl filter drop-shadow-sm mb-1">🏆</span>
                  <span className={`text-[10px] font-bold ${logic.isUnlocked ? "text-neutral-700" : "text-neutral-400"}`}>
                    {logic.viewedBadge?.name}
                  </span>

                  {logic.isCurrentBadge && (
                    <div className="absolute -top-1 -right-1 bg-red-600 text-[8px] text-white px-2 py-0.5 rounded-full font-bold shadow-md ring-2 ring-white">
                      ACTIVE
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <button onClick={logic.nextBadge} className="absolute right-0 p-2 text-neutral-300 hover:text-red-500 transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>

          <p className={`text-[11px] font-medium mt-2 ${logic.isUnlocked ? "text-red-600" : "text-neutral-400"}`}>
            {logic.isCurrentBadge ? "Primary Rank" : logic.isUnlocked ? "Unlocked" : `Requires Rp${logic.viewedBadge?.min_spend.toLocaleString()}`}
          </p>
        </section>

        {/* Navigation Tabs */}
        <Tabs 
          defaultValue={logic.activeTab} 
          onValueChange={(value) => logic.setActiveTab(value)} 
          className="w-full"
        >
          <TabsList className="flex bg-neutral-100/80 p-1 rounded-xl mb-8 h-auto">
            <TabsTrigger 
              value="profile" 
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-neutral-500"
            >
              <User size={14} /> Profile
            </TabsTrigger>
            
            <TabsTrigger 
              value="security" 
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-neutral-500"
            >
              <ShieldCheck size={14} /> Security
            </TabsTrigger>
            
            <TabsTrigger 
              value="orders" 
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-neutral-500"
            >
              <History size={14} /> Orders
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={logic.activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="min-h-[300px]"
            >
              <TabsContent value="profile" className="m-0 focus-visible:outline-none outline-none border-none">
                <ProfileView user={user} />
              </TabsContent>
              
              <TabsContent value="security" className="m-0 focus-visible:outline-none outline-none border-none">
                <SecurityView user={user} />
              </TabsContent>
              
              <TabsContent value="orders" className="m-0 focus-visible:outline-none outline-none border-none">
                <OrdersView />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Logout Footer */}
        <div className="mt-12 pt-6 border-t border-neutral-100 flex flex-col gap-2">
          <Button 
            variant="ghost" 
            onClick={logout} 
            className="w-full justify-start text-neutral-400 hover:text-red-600 hover:bg-red-50 h-11 rounded-xl transition-all"
          >
            <LogOut size={16} className="mr-3" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </>
  );
}