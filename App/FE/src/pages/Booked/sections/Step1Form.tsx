import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Users, ChevronRight } from "lucide-react";

export default function Step1Form({ data, onNext }: any) {
  const [localData, setLocalData] = useState(data);

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Kapan kamu datang?</h2>
        <p className="text-zinc-500 font-normal">Isi detail reservasi dasar untuk memulai.</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Waktu Kedatangan</Label>
          <Input 
            type="datetime-local"
            value={localData.booking_time}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setLocalData({...localData, booking_time: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Users className="w-4 h-4"/> Jumlah Orang</Label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 4, 6, 8].map(num => (
              <Button 
                key={num}
                type="button"
                variant={localData.number_of_people === num ? "default" : "outline"}
                className={`shadow-none hover:bg-red-600 hover:text-white ${localData.number_of_people === num ? "bg-red-600" : ""}`}
                onClick={() => setLocalData({...localData, number_of_people: num})}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          disabled={!localData.booking_time}
          onClick={() => onNext(localData)}
           className="bg-red-500 hover:bg-red-600 text-white w-full"
        >
          Lanjut Pilih Menu <ChevronRight className="ml-2 w-5 h-5"/>
        </Button>
      </div>
    </div>
  );
}