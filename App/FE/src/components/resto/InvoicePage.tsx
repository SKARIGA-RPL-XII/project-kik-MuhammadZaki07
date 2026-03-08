import { useEffect, useState } from "react";
import Barcode from "react-barcode";
import { useLocation, useNavigate } from "react-router";
import { Home, Printer, Clock, Info, Phone } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const InvoiceCashPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};
  const { settings } = useSettings();
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!order?.id) return;

    const channel = `transactions.${order.id}`;
    
    window.Echo.channel(channel)
      .listen(".payment.confirmed", (e: any) => {
        setIsPaid(true);
        setTimeout(() => {
          navigate(`/invoice/${order.id}`);
        }, 2000);
      });

    return () => {
      window.Echo.leaveChannel(channel);
    };
  }, [order?.id, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-400 text-sm">Order data not found</p>
      </div>
    );
  }

  const currency = settings.currency_symbol || "Rp";
  const subtotal = order.total_amount;
  const tax = settings.is_tax_active === 1 ? (subtotal * settings.tax_percent) / 100 : 0;
  const service = settings.is_service_active === 1 ? (subtotal * settings.service_percent) / 100 : 0;
  const total = subtotal + tax + service;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-neutral-900 flex justify-center">
      {isPaid && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
           </div>
           <h2 className="text-xl font-bold">Payment Confirmed!</h2>
           <p className="text-zinc-500 text-sm">Redirecting to receipt...</p>
        </div>
      )}

      <div className="w-full max-w-lg bg-white dark:bg-neutral-800 min-h-screen flex flex-col">
        <div className="border-b border-zinc-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.logo_light && (
                <img
                  src={`${import.meta.env.VITE_STORAGE_URL}/${settings.logo_light}`}
                  className="w-10 h-10 object-contain"
                />
              )}
              <div>
                <h1 className="text-base font-semibold">
                  {settings.store_name}
                </h1>
                <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-neutral-200">
                  <Phone size={12} />
                  {settings.phone}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-zinc-400">Status</p>
              <p className="text-sm font-semibold text-red-600">
                {isPaid ? "Paid" : "Waiting Payment"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          <div className="flex items-center gap-2 text-zinc-500 text-sm dark:text-neutral-200">
            <Clock size={14} />
            {new Date(order.created_at).toLocaleString("en-US", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          <div className="space-y-4">
            {order.details?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{item.menu?.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-neutral-200">
                    {item.menu_qty} × {currency} {item.price.toLocaleString()}
                  </p>
                  {item.attributes?.length > 0 && (
                    <p className="text-xs text-zinc-400 italic dark:text-neutral-200">
                      {item.attributes.join(", ")}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold">
                  {currency} {item.subtotal.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-zinc-600 lowercase">
              <span>subtotal</span>
              <span>
                {currency} {subtotal.toLocaleString()}
              </span>
            </div>

            {settings.is_tax_active === 1 && (
              <div className="flex justify-between text-sm text-zinc-600 lowercase">
                <span>tax ({settings.tax_percent}%)</span>
                <span>
                  {currency} {tax.toLocaleString()}
                </span>
              </div>
            )}

            {settings.is_service_active === 1 && (
              <div className="flex justify-between text-sm text-zinc-600 lowercase">
                <span>service ({settings.service_percent}%)</span>
                <span>
                  {currency} {service.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-dashed">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-red-600">
                {currency} {total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="py-8 flex flex-col items-center">
            <div className="w-full flex flex-col items-center border-y py-10">
              <div className="w-full [&>svg]:w-full [&>svg]:h-auto px-10">
                <Barcode
                  value={order.transaction_code}
                  width={1.2}
                  height={50}
                  displayValue={false}
                  margin={0}
                />
              </div>

              <p className="mt-4 font-mono text-sm font-normal text-zinc-400 dark:text-neutral-200 tracking-[1.2em]">
                {order.transaction_code}
              </p>
            </div>

            <p className="text-xs text-zinc-500 mt-3 dark:text-neutral-200 lowercase">Order ID #{order.id}</p>
          </div>

          <div className="flex gap-3 text-zinc-500 text-xs dark:text-neutral-200">
            <Info size={16} className="text-red-500 flex-shrink-0" />
            <p>
              Please present this barcode to the cashier to complete your payment.
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-100 p-5 bg-white text-center space-y-3">
          <p className="text-xs text-zinc-500">{settings.address}</p>
          <p className="text-[11px] text-zinc-400">{settings.company_name}</p>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={() => window.print()}
              className="h-11 rounded-lg bg-red-600 text-white dark:text-neutral-200 text-sm flex items-center justify-center gap-2 hover:bg-red-700 transition"
            >
              <Printer size={16} />
              Print
            </button>

            <button
              onClick={() => navigate("/")}
              className="h-11 rounded-lg bg-zinc-900 text-white text-sm flex items-center justify-center gap-2 hover:bg-black transition"
            >
              <Home size={16} />
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCashPage;