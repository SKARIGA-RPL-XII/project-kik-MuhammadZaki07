import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Shield, History, LogOut, Camera, Award } from "lucide-react";

export function CustomerProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-neutral-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[110] shadow-2xl flex flex-col"
          >
            <div className="p-8 pb-12 bg-neutral-900 relative overflow-hidden">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-red-500/20 rounded-full blur-3xl" />

              <div className="relative flex flex-col items-center">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-[32px] bg-red-500 border-4 border-white/10 flex items-center justify-center shadow-2xl overflow-hidden mb-4">
                    <img
                      src="https://ui-avatars.com/api/?name=Alex+Graham&background=0D0D0D&color=fff"
                      alt="Avatar"
                    />
                  </div>
                  <div className="absolute bottom-4 right-0 bg-white p-2 rounded-xl shadow-lg">
                    <Camera size={12} className="text-neutral-900" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white">Alex Graham</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-red-500 text-[10px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Gold Member
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="flex justify-evenly -mt-8 px-6 z-10">
              <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center border border-neutral-100 min-w-[100px]">
                <span className="text-xl font-black text-neutral-900">24</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">
                  Orders
                </span>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center border border-neutral-100 min-w-[100px]">
                <span className="text-xl font-black text-red-600">850</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">
                  Points
                </span>
              </div>
            </div>

            {/* Profile Menu */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <section>
                <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-4">
                  Personal Info
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-neutral-400" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-bold">
                          Email Address
                        </span>
                        <span className="text-xs font-bold text-neutral-900">
                          alex.graham@example.com
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <div className="flex items-center gap-3">
                      <Shield size={16} className="text-neutral-400" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-bold">
                          Account Security
                        </span>
                        <span className="text-xs font-bold text-neutral-900">
                          Password Updated
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-4">
                  Activity
                </h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <History
                        size={18}
                        className="text-neutral-400 group-hover:text-red-600"
                      />
                      <span className="text-sm font-bold text-neutral-900">
                        Order History
                      </span>
                    </div>
                    <Award size={14} className="text-red-500" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <LogOut
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                      <span className="text-sm font-bold">Sign Out</span>
                    </div>
                  </button>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
