import { useState, useEffect } from "react";
import Step1Form from "./sections/Step1Form";
import Step2Menu from "./sections/Step2Menu";
import Step3Table from "./sections/Step3Table";
import Step4Review from "./sections/Step4Review";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { BookingService } from "@/services/booking.service";
import { useToast } from "@/context/ToastContext";

export default function BookingLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("booking_step");
    return savedStep ? parseInt(savedStep) : 1;
  });
  const {toast} = useToast();

  const [bookingData, setBookingData] = useState(() => {
    const savedData = localStorage.getItem("booking_data");
    return savedData
      ? JSON.parse(savedData)
      : {
          booking_time: "",
          number_of_people: 1,
          notes: "",
          items: [],
          table_id: null,
          table_number: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("booking_step", step.toString());
    localStorage.setItem("booking_data", JSON.stringify(bookingData));
  }, [step, bookingData]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateData = (newData: any) => {
    setBookingData((prev: any) => ({ ...prev, ...newData }));
  };

const handleFinalFinish = async (finalData: any) => {
  try {
    // 1. Cek apakah ada pesanan menu atau cuma booking meja
    const hasItems = finalData.items && finalData.items.length > 0;

    const bookingPayload = {
      table_id: finalData.table_id,
      booking_time: finalData.booking_time,
      number_of_people: finalData.number_of_people,
      notes: finalData.notes,
      // Jika ada item pakai midtrans, jika tidak bisa 'manual' atau 'none'
      payment_method: hasItems ? "midtrans" : "cash", 
      total_amount: hasItems 
        ? finalData.items.reduce((acc: number, item: any) => 
            acc + (item.discount_price || item.price) * item.quantity, 0)
        : 0,
      items: hasItems 
        ? finalData.items.map((item: any) => ({
            menu_id: item.id,
            quantity: item.quantity,
            attributes: Object.values(item.selectedAttributes || {}), 
          }))
        : [], // Kosongkan jika skip menu
    };

    console.log("[Log] Processing Booking...", hasItems ? "With Menu" : "Only Table");

    const res = await BookingService.createBooking(bookingPayload);
    if (res.error) throw new Error(res.error);

    console.log("res" , res);
    

    const bookingInfo = res.data?.data?.booking;
    const snapToken = res.data?.data?.snap_token;
    console.log(snapToken);
    

    // --- LOGIC PERCABANGAN SETELAH API ---

    // KONDISI A: Ada Menu & Wajib Bayar Midtrans
    if (hasItems && snapToken) {
      window.snap.pay(snapToken, {
        onSuccess: () => {
          localStorage.removeItem("booking_step");
          localStorage.removeItem("booking_data");
          toast("success", "Pembayaran Berhasil", "Pesanan & Meja telah dikonfirmasi.");
          navigate(`/invoice/${bookingInfo.transaction_id}`);
        },
        onPending: () => {
          toast("warning", "Pending", "Segera bayar agar pesanan diproses.");
          navigate("/customer/orders");
        },
        onError: () => toast("error", "Gagal", "Pembayaran dibatalkan."),
        onClose: () => toast("info", "Batal", "Selesaikan pembayaran nanti di menu Order."),
      });
      return; // Stop di sini kalau masuk Midtrans
    }

    // KONDISI B: Ga Pesen Menu (Skip) / Total 0
    localStorage.removeItem("booking_step");
    localStorage.removeItem("booking_data");
    toast("success", "Booking Berhasil", "Meja Anda sudah dipesan, silakan datang tepat waktu.");
    navigate("/"); // Langsung ke Home sesuai request kamu

  } catch (err: any) {
    console.error(err);
    toast("error", "Gagal Booking", err.message || "Sistem sedang sibuk.");
  }
};

  return (
    <div className="min-h-screen dark:bg-neutral-900 pb-20">
      <div className="py-4 top-0 z-50 dark:bg-neutral-900 border-b">
        <div className="max-w-md mx-auto">
          <div className="relative flex items-center justify-between w-full">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 dark:bg-neutral-800 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-red-600 transition-all duration-500 -translate-y-1/2 z-0"
              style={{ width: `${((step - 1) / (4 - 1)) * 100}%` }}
            />

            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2 ${
                    s <= step
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white dark:bg-neutral-900 text-neutral-400"
                  }`}
                >
                  {s < step ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <span className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
              {t("booking.step_info", { current: step, total: 4 })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 px-4">
        {step === 1 && (
          <Step1Form
            data={bookingData}
            onNext={(val: any) => {
              updateData(val);
              nextStep();
            }}
          />
        )}

        {step === 2 && (
          <Step2Menu
            data={bookingData}
            onNext={(items: any) => {
              updateData({ items });
              nextStep();
            }}
            onSkip={() => nextStep()}
            onBack={prevStep}
          />
        )}

        {step === 3 && (
          <Step3Table
            data={bookingData}
            onBack={prevStep}
            onUpdateData={updateData}
            onNext={nextStep}
          />
        )}

        {step === 4 && (
          <Step4Review
            data={bookingData}
            onBack={prevStep}
            onConfirm={handleFinalFinish}
          />
        )}
      </div>
    </div>
  );
}
