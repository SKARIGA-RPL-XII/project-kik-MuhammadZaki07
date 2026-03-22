import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Step1Form({ data, onNext }: any) {
  const { t } = useTranslation();
  const [localData, setLocalData] = useState({
    ...data,
    number_of_people: data.number_of_people || 2,
    notes: data.notes || "",
  });
  const [isCustom, setIsCustom] = useState(false);

  const presets = [2, 4, 6, 8];

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
          {t("booking.step1.title")}
        </h2>
        <p className="text-zinc-500 font-normal">
          {t("booking.step1.description")}
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {t("booking.step1.arrival_time")}
          </Label>
          <Input
            type="datetime-local"
            value={localData.booking_time}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) =>
              setLocalData({ ...localData, booking_time: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" /> {t("booking.step1.person_count")}
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((num) => (
              <Button
                key={num}
                type="button"
                variant={!isCustom && localData.number_of_people === num ? "default" : "outline"}
                className={`shadow-none ${!isCustom && localData.number_of_people === num ? "bg-red-600 hover:bg-red-600 text-white" : ""}`}
                onClick={() => {
                  setIsCustom(false);
                  setLocalData({ ...localData, number_of_people: num });
                }}
              >
                {num}
              </Button>
            ))}
            <Button
              type="button"
              variant={isCustom ? "default" : "outline"}
              className={`shadow-none ${isCustom ? "bg-red-600 hover:bg-red-600 text-white" : ""}`}
              onClick={() => setIsCustom(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {isCustom && (
            <div className="mt-2 animate-in zoom-in-95 duration-200">
              <Input
                type="number"
                placeholder="Masukkan jumlah orang..."
                min="1"
                value={localData.number_of_people}
                onChange={(e) => setLocalData({ ...localData, number_of_people: parseInt(e.target.value) || "" })}
                className="focus-visible:ring-red-500"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> {t("booking.step1.notes_label", "Catatan Khusus")}
          </Label>
          <Textarea
            placeholder="Contoh: Kursi bayi, alergi, atau request meja pojok..."
            value={localData.notes}
            onChange={(e) => setLocalData({ ...localData, notes: e.target.value })}
            className="resize-none"
          />
        </div>

        <Button
          disabled={!localData.booking_time || localData.number_of_people <= 0}
          onClick={() => onNext(localData)}
          className="bg-red-500 hover:bg-red-600 text-white w-full transition-all"
        >
          {t("booking.step1.btn_next")} <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}