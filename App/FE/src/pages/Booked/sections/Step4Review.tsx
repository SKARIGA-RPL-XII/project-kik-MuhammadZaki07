import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";
import {
  ArrowLeft,
  CreditCard,
  Utensils,
  MapPin,
  Users,
  ReceiptText,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/utils/dateHelper";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function Step4Review({ data, onBack, onConfirm }: any) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const navigation = useNavigate();

  const BOOKING_FEE = 50000;

  const currency = settings?.currency_symbol || "Rp";
  const isTaxActive = settings?.is_tax_active === 1;
  const isServiceActive = settings?.is_service_active === 1;
  const taxPercent = Number(settings?.tax_percent) || 0;
  const servicePercent = Number(settings?.service_percent) || 0;

  const formatCurrency = (value: number) =>
    `${currency} ${Math.round(value).toLocaleString("id-ID")}`;

  const subtotal = useMemo(() => {
    const itemsTotal =
      data.items?.reduce((acc: number, item: any) => {
        const hasDiscount =
          item.discount?.is_active && item.discount.value_discount > 0;
        const priceAfterDiscount = hasDiscount
          ? item.price * (1 - item.discount.value_discount / 100)
          : item.price;

        return acc + priceAfterDiscount * item.quantity;
      }, 0) || 0;

    return Math.round(itemsTotal);
  }, [data.items]);

  const isOnlyBooking = !data.items || data.items.length === 0;
  const showExtras = !isOnlyBooking;

  const baseAmount = isOnlyBooking ? BOOKING_FEE : subtotal;

  const service = isServiceActive
    ? Math.round(baseAmount * (servicePercent / 100))
    : 0;

  const tax = isTaxActive
    ? Math.round((baseAmount + service) * (taxPercent / 100))
    : 0;

  const total = isOnlyBooking ? BOOKING_FEE : baseAmount + service + tax;

  const handleConfirmClick = () => {
    const cleanedTime = data.booking_time.replace("T", " ") + ":00";

    const finalItems =
      data.items?.map((item: any) => {
        return {
          menu_id: item.id,
          quantity: item.quantity,
          attributes: item.attributes || [],
        };
      }) || [];

    const finalPayload = {
      table_id: data.table_id,
      booking_time: cleanedTime,
      number_of_people: data.number_of_people,
      notes: data.notes,
      payment_method: "midtrans",
      items: finalItems,
      settings: {
        tax_percent: taxPercent,
        service_percent: servicePercent,
      },
    };

    onConfirm(finalPayload);
  };

  const handleCancleTransaction = (e: any) => {
    e.preventDefault();
    localStorage.removeItem("booking_data");
    localStorage.removeItem("booking_step");
    navigation("/");
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center lg:gap-4 gap-1 mb-2">
          <Button
            variant="ghost"
            onClick={onBack}
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="lg:text-xl text-xs font-bold uppercase">
              {t("booking.step4.title")}
            </h2>
            <p className="lg:text-xs md:text-xs text-[10px] text-zinc-500">
              {t("booking.step4.description")}
            </p>
          </div>
        </div>
        <Button
          onClick={handleCancleTransaction}
          className="bg-red-500 hover:bg-red-600"
        >
          Batalkan Pesanan
        </Button>
      </div>

      <div className="bg-white dark:bg-neutral-950 border rounded-lg overflow-hidden shadow-none">
        <div className="p-4 border-b bg-zinc-50/50 dark:bg-neutral-900/50 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-red-600" />
          <span className="text-sm font-semibold text-zinc-600">
            {t("booking.step4.visit_info")}
          </span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">
              {t("booking.step4.selected_table")}
            </p>
            <p className="text-lg font-bold text-red-600">
              {t("booking.step4.table_prefix")} {data.table_number}
            </p>
          </div>
          <div className="space-y-1 border-l pl-6">
            <p className="text-xs text-zinc-400 font-medium">
              {t("booking.step4.time_person")}
            </p>
            <p className="text-sm font-bold">
              {formatDate(data.booking_time)} |{" "}
              {formatDate(data.booking_time, true).split(" ")[1]} WIB
            </p>
            <div className="flex items-center gap-1 text-zinc-500">
              <Users className="h-3 w-3" />
              <span className="text-xs">
                {data.number_of_people} {t("booking.step4.person_unit")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-950 border rounded-lg overflow-hidden shadow-none">
        <div className="p-4 border-b bg-zinc-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-red-600" />
            <span className="text-sm font-semibold text-zinc-600">
              {t("booking.step4.menu_list")}
            </span>
          </div>
          <span className="text-xs bg-zinc-200 dark:bg-neutral-800 px-2 py-1 rounded font-semibold text-zinc-600">
            {data.items?.length || 0} {t("booking.step4.item_unit")}
          </span>
        </div>

        {isOnlyBooking ? (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-500 italic">
              Tidak ada menu yang dipilih.
            </p>
            <p className="text-xs text-red-500 font-bold mt-1">
              Dikenakan Biaya Komitmen Reservasi
            </p>
          </div>
        ) : (
          <div className="divide-y border-b">
            {data.items?.map((item: any) => {
              const hasDiscount =
                item.discount?.is_active && item.discount.value_discount > 0;
              const priceAfterDiscount = hasDiscount
                ? item.price * (1 - item.discount.value_discount / 100)
                : item.price;

              return (
                <div
                  key={item.id}
                  className="p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded bg-zinc-100 dark:bg-neutral-800 flex items-center justify-center font-black text-red-600">
                      <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${
                          item.menu_image
                        }`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{item.name}</p>
                        {hasDiscount && (
                          <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded font-bold">
                            -{item.discount.value_discount}%
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {hasDiscount && (
                          <span className="line-through mr-1">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                        {formatCurrency(priceAfterDiscount)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(priceAfterDiscount * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {data.notes && (
          <div className="p-4 bg-yellow-50/50 dark:bg-yellow-950/10">
            <p className="text-[10px] text-yellow-600 uppercase font-black mb-1">
              {t("booking.step4.notes_label")}:
            </p>
            <p className="text-xs italic text-zinc-600">"{data.notes}"</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-950 border rounded-lg overflow-hidden shadow-none">
        <div className="p-4 border-b bg-zinc-50/50 dark:bg-neutral-900/50 flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-red-600" />
          <span className="text-sm font-semibold text-zinc-600">
            {t("booking.step4.payment_detail")}
          </span>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">
              {isOnlyBooking
                ? "Biaya Reservasi (DP)"
                : t("booking.step4.subtotal")}
            </span>
            <span className="font-medium">{formatCurrency(baseAmount)}</span>
          </div>

          {showExtras && isTaxActive && tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">
                {t("booking.step4.tax")} ({taxPercent}%)
              </span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
          )}

          {showExtras && isServiceActive && service > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">
                {t("booking.step4.service")} ({servicePercent}%)
              </span>
              <span className="font-medium">{formatCurrency(service)}</span>
            </div>
          )}

          <div className="pt-3 border-t flex justify-between items-center">
            <span className="text-base font-bold">
              {t("booking.step4.grand_total")}
            </span>
            <span className="text-xl font-black text-red-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white dark:bg-neutral-950 border-t z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex items-center lg:justify-between md:justify-between justify-end gap-4">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-zinc-600">
              {t("booking.step4.payment_method")}
            </p>
            <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-bold">
                {t("booking.step4.payment_type")}
              </span>
            </div>
          </div>
          <Button
            onClick={handleConfirmClick}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {t("booking.step4.btn_confirm")}{" "}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
