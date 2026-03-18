import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Printer, Download } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import PageMeta from "@/components/common/PageMeta";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import InvoiceSkeleton from "@/components/skeleton/InvoiceSkeleton";
import { formatDate } from "@/utils/dateHelper";
import { useAuth } from "@/context/AuthContext";

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { user } = useAuth();

  const isCashier = user?.role_name === "cashier" || user?.role_id === 5;

  const [transactionData, setTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isCustomerSource =
    transactionData?.order_source === "qr_code" ||
    transactionData?.order_source === "customer_app" ||
    window.location.pathname.includes("customer");

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await apiClient.get(`/transactions/${id}`);
        setTransactionData(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil data invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, []);

  if (loading) return <InvoiceSkeleton />;

  const subtotal =
    transactionData.details?.reduce(
      (acc: number, item: any) => acc + (item.subtotal || 0),
      0,
    ) || 0;
  const taxAmount = settings.is_tax_active
    ? subtotal * (settings.tax_percent / 100)
    : 0;
  const serviceAmount = settings.is_service_active
    ? subtotal * (settings.service_percent / 100)
    : 0;

  const handleDone = () => {
    if (isCashier) {
      navigate("/cashier");
    } else if (isCustomerSource) {
      navigate("/");
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <PageMeta
        title="Invoice"
        description="Official invoice containing order details, payment summary, and transaction information."
      />
      <div className="h-[130vh] bg-slate-100 flex flex-col items-center py-5 font-sans print:bg-white print:py-0">
        {!isCustomerSource && (
          <Button
            variant="ghost"
            onClick={() => navigate("/cashier")}
            className="mb-6 rounded-full gap-2 font-semibold text-lg text-muted-foreground hover:text-slate-900 print:hidden"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Terminal
          </Button>
        )}

        <div className="w-full max-w-xl relative">
          <div className="h-14 bg-neutral-200 rounded-xl p-2 overflow-hidden mx-auto max-w-xl">
            <div className="h-10 bg-neutral-300 p-1.5 rounded-lg border-4 border-white">
              <div className="h-5 bg-neutral-700 rounded-full border-3 border-white"></div>
            </div>
          </div>

          <div
            id="invoice-content"
            className="bg-white max-w-lg w-[90%] sm:w-full mx-auto -mt-7 relative overflow-hidden print:shadow-none print:mt-0"
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 print:opacity-[0.05]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='60' y='60' font-size='20' font-weight='700' font-family='sans-serif' fill='%23000' text-anchor='middle' dominant-baseline='middle' transform='rotate(-35, 60, 60)'%3E${settings.store_name}%3C/text%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            ></div>

            <div className="relative z-10 px-6 sm:px-8 pt-10 pb-16">
              <div className="flex flex-col items-start text-center mb-10">
                <div className="inline-flex w-[80px] mb-5">
                  <img
                    className="w-full h-auto object-contain"
                    loading="lazy"
                    src={`${import.meta.env.VITE_STORAGE_URL}/${settings.logo_light}`}
                    alt="Logo"
                  />
                </div>

                <h1 className="font-black text-slate-900 text-xl leading-none">
                  {settings.store_name}
                </h1>

                <div className="mt-3 text-start">
                  <div className="text-[10px] gap-1 flex flex-col text-slate-500 max-w-[250px]">
                    <span>{settings.address}</span>
                    <span>Phone : {settings.phone}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8 border-t border-slate-100 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-muted-foreground uppercase text-[11px]">
                    Invoice No
                  </span>
                  <span className="font-black text-slate-800 tracking-tight">
                    #{transactionData.transaction_code || transactionData.id}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="font-bold text-muted-foreground uppercase text-[11px]">
                    Date
                  </span>
                  <span className="font-black text-slate-800 tracking-tight">
                    {formatDate(transactionData.transaction_date)} |{" "}
                    {
                      formatDate(transactionData.transaction_date, true).split(
                        " ",
                      )[1]
                    }{" "}
                    WIB
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="font-bold text-muted-foreground uppercase text-[11px]">
                    Table
                  </span>
                  <span className="font-black text-slate-800 tracking-tight">
                    T-{transactionData.table?.table_number || "0"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-muted-foreground uppercase text-[11px]">
                    Payment
                  </span>
                  <span className="font-black text-slate-800 uppercase text-[10px] px-2 py-0.5 border-2 border-slate-900 rounded-md">
                    {transactionData.payment_method}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 py-6 space-y-4">
                {transactionData.details?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-start text-[13px] font-bold text-slate-700"
                  >
                    <span className="flex-1 leading-tight uppercase tracking-tight">
                      {item.menu.name}
                    </span>
                    <span className="w-10 text-center text-muted-foreground">
                      {item.menu_qty}x
                    </span>
                    <span className="w-24 text-right font-black text-slate-900">
                      {settings.currency_symbol}{" "}
                      {item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-slate-100 pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-muted-foreground uppercase text-[11px]">
                    Customer
                  </span>
                  <span className="font-black text-slate-800 tracking-tight">
                    {transactionData.user?.username || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-muted-foreground uppercase text-[11px]">
                    Cashier
                  </span>
                  <span className="font-black text-slate-800 tracking-tight">
                    {transactionData.cashier?.username || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] font-bold text-muted-foreground">
                  <span>Subtotal</span>
                  <span>
                    {settings.currency_symbol} {subtotal.toLocaleString()}
                  </span>
                </div>
                {settings.is_service_active === 1 && (
                  <div className="flex justify-between text-[13px] font-bold text-muted-foreground">
                    <span>Service Fee</span>
                    <span>
                      {settings.currency_symbol}{" "}
                      {serviceAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                {settings.is_tax_active === 1 && (
                  <div className="flex justify-between text-[13px] font-bold text-muted-foreground">
                    <span>Total sales tax</span>
                    <span>
                      {settings.currency_symbol} {taxAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-300 mt-4">
                  <span className="text-lg font-black text-slate-900 uppercase tracking-widest">
                    Total
                  </span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">
                    {settings.currency_symbol}{" "}
                    {transactionData.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full flex overflow-hidden h-4 z-20">
              {[...Array(22)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[34px] bg-slate-100 h-6 rotate-45 translate-y-2 border-l border-t"
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-xl flex gap-3 px-4 print:hidden z-30 absolute lg:bottom-5 bottom-3">
          <Button
            variant="outline"
            className="flex-1 h-10 font-semibold text-sm border-slate-200 bg-white hover:bg-slate-50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share to email
          </Button>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1 h-10 font-bold text-xs border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-95"
          >
            <Download className="h-4 w-4 mr-2" />
            Save PDF
          </Button>

          {!isCustomerSource && (
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex-1 h-10 font-semibold text-sm border-slate-200 bg-white hover:bg-slate-50 active:scale-95"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          )}

          <Button
            onClick={handleDone}
            className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all active:scale-95"
          >
            Done
          </Button>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .max-w-lg { 
            position: relative !important; 
            top: 0 !important; 
            left: 0 !important; 
            box-shadow: none !important; 
            width: 100% !important;
            max-width: 100% !important;
          }
          .h-14 { display: none !important; }
        }
      `,
          }}
        />
      </div>
    </>
  );
}
