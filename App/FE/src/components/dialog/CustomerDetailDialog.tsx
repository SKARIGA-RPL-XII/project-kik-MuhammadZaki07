import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useCustomerDetail,
  useDeleteCustomer,
} from "@/hooks/react-query/useCustomers";
import { Trash2 } from "lucide-react";
import DeleteAlertDialog from "./DeleteAlertDialog";

export default function CustomerDetailDialog({
  open,
  onOpenChange,
  customerId,
}: any) {
  const { data, isLoading } = useCustomerDetail(customerId);
  const { mutateAsync: deleteCustomer, isPending } = useDeleteCustomer();

  const handleDelete = async () => {
    if (!confirm("Yakin mau hapus customer ini?")) return;

    await deleteCustomer(customerId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Customer Detail</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-60 w-full rounded-lg" />
        ) : data ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={data.profile_image} />
                <AvatarFallback>{data.username?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div>
                <h3 className="text-lg font-semibold">{data.username}</h3>
                <p className="text-sm text-neutral-500">{data.email}</p>

                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{data.role?.name}</Badge>

                  <Badge variant={data.is_active ? "default" : "destructive"}>
                    {data.is_active ? "Active" : "Blocked"}
                  </Badge>
                </div>
              </div>
            </div>

            {data.badge && (
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: data.badge.color }}
                >
                  ⭐
                </div>

                <div>
                  <p className="font-medium">{data.badge.name}</p>
                  <p className="text-xs text-neutral-500">
                    Min spend: Rp{" "}
                    {Number(data.badge.min_spend).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500">Phone</p>
                <p className="font-medium">{data.no_tlp || "-"}</p>
              </div>

              <div>
                <p className="text-neutral-500">Gender</p>
                <p className="font-medium">{data.gender || "-"}</p>
              </div>

              <div>
                <p className="text-neutral-500">Total Spend</p>
                <p className="font-medium">
                  Rp {Number(data.total_spend).toLocaleString("id-ID")}
                </p>
              </div>

              <div>
                <p className="text-neutral-500">Strike Count</p>
                <p className="font-medium">{data.strike_count}</p>
              </div>

              <div className="col-span-2">
                <p className="text-neutral-500">Address</p>
                <p className="font-medium">{data.address || "-"}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="flex justify-end">
                <DeleteAlertDialog
                  title="Delete customer?"
                  description={`This will permanently delete "${data.username}".`}
                  onConfirm={async () => {
                    await deleteCustomer(customerId);
                    onOpenChange(false);
                  }}
                >
                  <Button
                    variant="destructive"
                    disabled={isPending}
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    {isPending ? "Deleting..." : "Delete Customer"}
                  </Button>
                </DeleteAlertDialog>
              </div>
            </div>
          </div>
        ) : (
          <p>No data</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
