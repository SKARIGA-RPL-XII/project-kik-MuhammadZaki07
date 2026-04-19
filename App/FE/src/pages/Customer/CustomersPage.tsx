import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCustomers,
  useCustomerStats,
} from "@/hooks/react-query/useCustomers";
import CustomerStatsCards from "@/components/ui/CustomerStatsCards";
import CustomerChart from "@/components/charts/CustomerChart";
import CustomerTable from "@/components/tables/CustomerTable";
import { Button } from "@/components/ui/button";
import CustomerDetailDialog from "@/components/dialog/CustomerDetailDialog";
import CustomerEditDialog from "@/components/dialog/CustomerEditDialog";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  const {
    data: customersData,
    isLoading,
    refetch,
  } = useCustomers({
    search: debouncedSearch,
    status: statusFilter,
    page,
  });

  const { data: statsData, isLoading: statsLoading } = useCustomerStats();
  const totalItems = customersData?.total || 0;
  const totalPage = customersData?.last_page || 1;
  const currentItems = customersData?.data || [];

  return (
    <div className="space-y-6">
      <PageMeta
        title="Customers Management"
        description="Manage all customers data including profile, transaction history, and account status in the Gagal Lapar admin dashboard."
      />

      <PageBreadcrumb pageTitle="Customers Management" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
        <div className="flex gap-3 w-full md:w-auto">
          <Input
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CustomerStatsCards data={statsData} loading={statsLoading} />

      <CustomerChart />

      <CustomerTable
        customers={customersData?.data || []}
        loading={isLoading}
        onRefresh={refetch}
        onEdit={(user) => {
          setSelectedCustomer(user);
          setOpenEdit(true);
        }}
        onView={(user) => {
          setSelectedCustomer(user);
          setOpenView(true);
        }}
      />

      <CustomerDetailDialog
        open={openView}
        onOpenChange={setOpenView}
        customerId={selectedCustomer?.id}
      />

      <CustomerEditDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        customer={selectedCustomer}
      />

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-neutral-500 font-medium">
          Showing {currentItems.length} of {totalItems} items (Page {page + 1}{" "}
          of {totalPage})
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0 || isLoading}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={page + 1 >= totalPage || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
