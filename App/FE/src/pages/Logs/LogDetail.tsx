import React, { useEffect, useState } from "react";
import { useActivityLogs } from "@/hooks/react-query/useActivityLogs";
import {
  AlertCircle,
  RefreshCcw,
  Loader2,
  ArrowLeft,
  Clock,
  User,
  Hash,
  Info,
  Server,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DiffViewer from "@/components/ui/DiffViewer";
import { formatDate } from "@/utils/dateHelper";

const LogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLogById, isFetchingDetail } = useActivityLogs();
  const [log, setLog] = useState<any>(null);

  const safeStringify = (obj: any) => {
    const seen = new WeakSet();

    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return "[Circular]";
          seen.add(value);
        }
        return value;
      },
      2,
    );
  };

  useEffect(() => {
    if (id) {
      getLogById(Number(id)).then((response: any) => {
        setLog(response);
      });
    }
  }, [id, getLogById]);

  if (isFetchingDetail) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-900">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        <p className="mt-4 text-sm text-neutral-500 font-medium">
          Memuat rincian log...
        </p>
      </div>
    );
  }


  const TerminalWindow = ({ title, data, icon: Icon, variant }: any) => {
    return (
      <div className="flex flex-col h-full rounded-2xl overflow-hidden border bg-white dark:bg-[#121212]">
        <div className="flex items-center justify-between px-4 py-3 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md border-b border-neutral-200 dark:border-white/10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>

            <span className="ml-2 text-[12px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <Icon
                size={14}
                className={
                  variant === "red" ? "text-rose-500" : "text-emerald-500"
                }
              />
              {title}
            </span>
          </div>
        </div>

        <div className="p-6 overflow-auto custom-scrollbar h-[450px] font-mono text-[13px] bg-neutral-900 dark:bg-neutral-950">
          <div
            className={variant === "red" ? "text-rose-400" : "text-emerald-400"}
          >
            {React.isValidElement(data) ? (
              data 
            ) : typeof data === "object" ? (
              <pre>{safeStringify(data)}</pre>
            ) : (
              <pre>{String(data)}</pre>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="space-y-10">
        <header className="space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Kembali
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                Rincian Aktivitas
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-neutral-500 dark:text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {formatDate(log?.created_at , true)}
                </span>
                <span className="flex items-center gap-1.5">
                  <User size={14} /> {log?.user?.username || "Sistem"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Hash size={14} /> ID: {id}
                </span>
                <span className="flex items-center gap-1.5">
                  <Server size={14} /> IP ADDRESS : <span className="text-blue-800">
                    {log?.ip_address ?? "-"}
                  </span>
                </span>
              </div>
            </div>
            <Badge variant={"outline"} className="py-2.5 px-5 rounded-sm">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {log?.module || "Log"}
              </span>
            </Badge>
          </div>
        </header>

        <Card className="shadow-none border p-5">
          <p className="text-lg md:text-xl flex items-center gap-3 text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
            <Info className="text-muted-foreground" />{" "}
            {log?.message || "Tidak ada pesan aktivitas."}
          </p>
        </Card>

        <div className="mt-8">
          <TerminalWindow
            title="GitHub Style Diff"
            data={
              <DiffViewer
                before={log?.payload_before}
                after={log?.payload_after}
              />
            }
            icon={RefreshCcw}
            variant="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <TerminalWindow
            title="Data Sebelumnya"
            data={log?.payload_before}
            icon={AlertCircle}
            variant="red"
          />
          <TerminalWindow
            title="Data Terbaru"
             data={log?.payload_after}
            icon={RefreshCcw}
            variant="green"
          />
        </div>
      </div>
    </div>
  );
};

export default LogDetailPage;
