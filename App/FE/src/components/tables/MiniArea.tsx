import { Download, Utensils } from "lucide-react";
import { TableInterface } from "../../pages/Tables/Table";

const MiniTable = ({
  table,
  onClick,
}: {
  table: TableInterface;
  onClick: () => void;
}) => {
  const isAvailable = table.status === "available";

  const qrUrl = table.qr_code
    ? `${import.meta.env.VITE_STORAGE_URL}/${table.qr_code}`
    : null;

  const color = isAvailable ? "emerald" : "rose";

  return (
    <div className="relative group cursor-pointer select-none" onClick={onClick}>
      <div
        className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-${color}-400`}
      />

      <div
        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-${color}-400`}
      />

      <div
        className={`absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-${color}-400`}
      />

      <div
        className={`absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-${color}-400`}
      />

      <div
        className={`relative w-9 h-9 rounded-lg flex flex-col items-center justify-center gap-0.5
        border shadow-md transition-all duration-200
        ${
          isAvailable
            ? "bg-emerald-50 border-emerald-400 text-emerald-600 hover:bg-emerald-500 hover:text-white"
            : "bg-rose-50 border-rose-400 text-rose-600 hover:bg-rose-500 hover:text-white"
        }`}
      >
        <Utensils size={14} className="opacity-70" />

        <span className="text-[10px] font-bold leading-none">
          {table.table_number}
        </span>

        {qrUrl && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-28 bg-white p-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-50 border border-slate-100 flex flex-col items-center pointer-events-none">
            <img
              src={qrUrl}
              alt={`QR Table ${table.table_number}`}
              className="w-24 h-24 mb-1"
            />

            <span className="text-[9px] text-slate-400 font-bold uppercase mb-2">
              Table {table.table_number}
            </span>

            <a
              href={qrUrl}
              download={`table_${table.table_number}.svg`}
              className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 flex items-center gap-1 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Download size={14} />
              QR
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniTable;
