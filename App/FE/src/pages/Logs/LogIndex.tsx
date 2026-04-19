import { useState } from "react";
import { useActivityLogs } from "@/hooks/react-query/useActivityLogs";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity,
  LayoutGrid,
} from "lucide-react";
import { useNavigate } from "react-router";
import Button from "../../components/ui/button/Button";
import LogTable from "@/components/tables/LogTable";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Card } from "@/components/ui/card";
import { useToast } from "@/context/ToastContext";

const LogIndex = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    module: "",
    action: "",
    date: "",
    page: 1,
    trashed: "false",
  });

  const { logs, isLoading, isFetching, pagination, deleteLog, restoreLog } =
    useActivityLogs(filters);

  const { toast } = useToast();

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      page: 1,
    }));
  };

  const handleDeleteLog = async (id: number) => {
    try {
      await deleteLog(id);

      toast(
        "success",
        "Success",
        `Activity log with ID #${id} has been cleared from the system.`,
      );
    } catch (error) {
      toast(
        "error",
        "Failed to delete log",
        "A server error occurred, please try again later.",
      );
    }
  };

  const handleRestoreLog = async (id: number) => {
    try {
      await restoreLog(id);

      toast(
        "success",
        "Success",
        `Activity log with ID #${id} has been Restore from the system.`,
      );
    } catch (error) {
      toast(
        "error",
        "Failed to delete log",
        "A server error occurred, please try again later.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta
        description="System activity and change logs"
        title="Activity Logs"
      />
      <PageBreadcrumb pageTitle="History" />
      <Card className="p-5 border shadow-none">
        <div className="flex flex-col gap-2 mb-5">
          <h1 className="text-2xl font-semibold text-neutral-800 dark:text-white">
            Activity History
          </h1>
          <p className="text-sm text-neutral-500">
            Automatically tracking all system changes and operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
              <Search size={16} />
            </div>
            <input
              name="search"
              value={filters.search}
              placeholder="Search activities..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg dark:bg-white/[0.03] dark:border-neutral-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              onChange={handleFilterChange}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
              <LayoutGrid size={16} />
            </div>
            <select
              name="module"
              value={filters.module}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg dark:bg-white/[0.03] dark:border-white/[0.08] dark:border-neutral-800 outline-none text-neutral-600 cursor-pointer hover:border-neutral-300 transition-colors appearance-none"
            >
              <option value="">All Modules</option>
              <option value="Menu">Food Menu</option>
              <option value="Stock">Ingredients Stock</option>
              <option value="Transaction">Cashier Transactions</option>
              <option value="Auth">Authentication</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
              <Activity size={16} />
            </div>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg dark:bg-white/[0.03] dark:border-white/[0.08] dark:border-neutral-800 outline-none text-neutral-600 cursor-pointer hover:border-neutral-300 transition-colors appearance-none"
            >
              <option value="">All Actions</option>
              <option value="Create">Creation</option>
              <option value="Update">Modification</option>
              <option value="Delete">Deletion</option>
              <option value="Login">Login Session</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
              <Calendar size={16} />
            </div>
            <input
              name="date"
              type="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg dark:bg-white/[0.03] dark:border-white/[0.08] dark:border-neutral-800 outline-none text-neutral-600 hover:border-neutral-300 transition-colors cursor-pointer"
            />
          </div>

          <div className="mb-4">
            <select
              name="trashed"
              value={filters.trashed}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  trashed: e.target.value,
                  page: 1,
                }))
              }
              className="w-full sm:w-48 px-3 py-2 text-sm border rounded-lg 
               dark:bg-white/[0.03] dark:border-neutral-800 
               outline-none text-neutral-600 
               cursor-pointer hover:border-neutral-300 transition-colors"
            >
              <option value="false">Active</option>
              <option value="only">Deleted</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        <LogTable
          logs={logs}
          isLoading={isLoading}
          onView={(id) => navigate(`/system/logs/${id}`)}
          onDelete={(id) => handleDeleteLog(id)}
          onRestore={(id) => handleRestoreLog(id)}
        />

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-neutral-100 dark:border-white/[0.05]">
          <p className="text-sm text-neutral-500 font-medium">
            Showing {logs.length} of {pagination?.total || 0} entries
            <span className="mx-2 text-neutral-300">|</span>
            Page {pagination?.current_page || 1} of {pagination?.last_page || 1}
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={Number(pagination?.current_page) <= 1 || isFetching}
              onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
            >
              <ChevronLeft size={16} />
              Prev
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={
                Number(pagination?.current_page) >=
                  Number(pagination?.last_page) || isFetching
              }
              onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LogIndex;
