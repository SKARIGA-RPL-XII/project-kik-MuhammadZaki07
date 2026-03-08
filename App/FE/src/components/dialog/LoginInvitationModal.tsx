import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Star, Clock, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";

export function LoginInvitationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenInvitation = Cookies.get("hide_login_invitation");
    const token = localStorage.getItem("token");

    if (!hasSeenInvitation && !token) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    Cookies.set("hide_login_invitation", "true", { expires: 1 });
  };

  const handleLogin = () => {
    handleClose();
    navigate("/auth/sign-in");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[120] bg-neutral-900/50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto w-[90%] max-w-[400px] h-fit z-[130] bg-white rounded-2xl shadow-2xl shadow-neutral-200/50 overflow-hidden"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Dapatkan pengalaman lebih baik
                </h2>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Login untuk menikmati fitur lengkap dan kumpulkan poin di setiap pesanan Anda.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-red-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Riwayat Pesanan</p>
                    <p className="text-xs text-neutral-500">Pantau status dan cek riwayat pesanan lama Anda.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 text-red-500">
                    <Gift size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Loyalty Points</p>
                    <p className="text-xs text-neutral-500">Tukarkan poin dengan diskon menarik setiap harinya.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogin}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 group"
                >
                  Masuk Sekarang
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-3.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl text-sm font-medium transition-colors"
                >
                  Lanjut sebagai tamu
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}