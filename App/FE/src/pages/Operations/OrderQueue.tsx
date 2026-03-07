import { useState } from "react";
import {
  Clock,
  ArrowLeft,
  Smartphone,
  Store,
  QrCode,
  CheckCircle2,
  Loader2,
  ClipboardX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import { useTransaction } from "@/hooks/react-query/useTransaction";

export default function OrderQueuePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [targetOrderId, setTargetOrderId] = useState<number | null>(null);

  const { useGetOrders, useUpdateStatus } = useTransaction();

  const apiFilter =
    filter === "ONLINE"
      ? "qr_code"
      : filter === "OFFLINE"
        ? "cashier_direct"
        : undefined;
  const { data: orders, isLoading } = useGetOrders(apiFilter);
  const updateMutation = useUpdateStatus();

  const handleUpdateStatus = (id: number, currentStatus: string) => {
    setTargetOrderId(id);
    const nextStatus = currentStatus === "to_cook" ? "cooking" : "completed";
    setStatusToUpdate(nextStatus);
    setIsUpdateOpen(true);
  };

  const confirmUpdateStatus = async () => {
    if (targetOrderId && statusToUpdate) {
      await updateMutation.mutateAsync({
        id: targetOrderId,
        status: statusToUpdate,
      });
      setIsUpdateOpen(false);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="flex flex-col">
      <PageMeta
        title="Order Management"
        description="Monitor real-time customer orders"
      />

      <header className="px-6 py-4 bg-white dark:bg-zinc-900 border-b flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Order Management
          </h1>
          <p className="text-sm text-zinc-500">
            Monitor and update customer order status in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={filter} onValueChange={setFilter} className="w-[280px]">
            <TabsList className="grid w-full grid-cols-3 h-10 bg-zinc-100 p-1">
              <TabsTrigger value="ALL" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="OFFLINE" className="text-xs">
                Offline
              </TabsTrigger>
              <TabsTrigger value="ONLINE" className="text-xs">
                Online
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            onClick={() => navigate("/cashier")}
            size="sm"
            className="bg-red-600 hover:bg-red-700 h-10 px-4 font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cashier
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center w-full">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders?.map((order: any) => (
              <Card
                key={order.id}
                className="border border-zinc-200 shadow-sm hover:border-red-200 transition-colors bg-white"
              >
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <Badge
                      variant={
                        order.order_source === "qr_code"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        order.order_source === "qr_code"
                          ? "bg-red-50 text-red-600 hover:bg-red-50 border-red-100 shadow-none"
                          : "shadow-none"
                      }
                    >
                      {order.order_source === "qr_code" ? (
                        <Smartphone className="h-3 w-3 mr-1" />
                      ) : (
                        <Store className="h-3 w-3 mr-1" />
                      )}
                      {order.order_source === "qr_code" ? "ONLINE" : "OFFLINE"}
                    </Badge>
                    <CardTitle className="text-lg font-bold">
                      Table Number : {order.table?.table_number || "No Table"}
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                      #TRX-{order.id}
                    </p>
                    <p className="text-sm font-bold text-red-600">
                      Rp {order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 border-b border-zinc-50">
                  <div className="flex items-center text-xs text-zinc-500 mb-4">
                    <Clock className="h-3 w-3 mr-1" /> Ordered at:{" "}
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex items-center justify-between bg-zinc-50 p-2 rounded-md">
                    <span className="text-xs font-medium text-zinc-600">
                      Status:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-white border-zinc-200 text-zinc-700 font-bold uppercase text-[10px]"
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-2 gap-2 bg-zinc-50/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-9 text-xs font-bold"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 h-9 text-xs bg-zinc-900 hover:bg-zinc-800 font-bold"
                    onClick={() => handleUpdateStatus(order.id, order.status)}
                  >
                    {order.status === "to_cook"
                      ? "Start Cooking"
                      : "Complete Order"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
            <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-full mb-4">
              <ClipboardX className="h-12 w-12 text-zinc-400" strokeWidth={1} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              No orders found
            </h3>
            <p className="text-zinc-500 max-w-xs mt-2">
              {filter === "ALL"
                ? "There are currently no active orders in the queue."
                : `There are no active ${filter.toLowerCase()} orders at the moment.`}
            </p>
            {filter !== "ALL" && (
              <Button
                variant="link"
                className="mt-2 text-red-600 font-bold"
                onClick={() => setFilter("ALL")}
              >
                View all orders
              </Button>
            )}
          </div>
        )}
      </ScrollArea>

      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-[400px] sm:w-[450px] p-0 border-l border-zinc-200 z-[9999]">
          <div className="flex flex-col h-full bg-white">
            {/* Header Sidebar - Minimalis */}
            <SheetHeader className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-red-100 shadow-none text-[10px] mb-1 uppercase">
                    {selectedOrder?.status?.replace("_", " ")}
                  </Badge>
                  <SheetTitle className="text-xl font-bold">
                    Order Details
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    Transaction ID: #TRX-{selectedOrder?.id}
                  </SheetDescription>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    Date
                  </p>
                  <p className="text-xs font-medium text-zinc-900">
                    {selectedOrder?.created_at &&
                      new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8">
                {/* CONTENT: Detail Meja & QR Code */}
                <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">
                        Table Information
                      </p>
                      <h3 className="text-3xl font-black text-zinc-900">
                        Number: {selectedOrder?.table?.table_number || "N/A"}
                      </h3>
                      <div className="flex gap-4 mt-3">
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase">
                            Capacity
                          </p>
                          <p className="text-sm font-bold text-zinc-700">
                            {selectedOrder?.table?.capacity || 0} Seats
                          </p>
                        </div>
                        <div className="w-px h-8 bg-zinc-200" />
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase">
                            Payment
                          </p>
                          <p className="text-sm font-bold text-zinc-700 uppercase">
                            {selectedOrder?.payment_method || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedOrder?.table?.qr_code && (
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-zinc-200">
                        <img
                          src={`${import.meta.env.VITE_STORAGE_URL}/${selectedOrder.table.qr_code}`}
                          alt="QR"
                          className="h-16 w-16 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  {/* Dekorasi Background */}
                  <QrCode className="absolute -bottom-4 -right-4 h-24 w-24 text-zinc-100 -z-0 opacity-50" />
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Items List</span>
                    <span className="text-zinc-400">
                      {selectedOrder?.details?.length} Items
                    </span>
                  </h4>
                  <div className="space-y-4">
                    {selectedOrder?.details?.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between items-center group"
                      >
                        <div className="flex gap-3 items-center">
                          <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center border border-zinc-200 text-xs font-bold text-zinc-400">
                            <img
                              src={`${import.meta.env.VITE_STORAGE_URL}/${item?.menu?.menu_image}`}
                              alt="QR"
                              className="h-16 w-16 object-contain"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-800">
                              {item.menu?.name}
                            </p>
                            <p className="text-[11px] text-zinc-500 font-medium">
                              @ Rp {Number(item.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-zinc-900">
                          Rp {Number(item.subtotal).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="pt-6 border-t-2 border-dashed border-zinc-100 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium">Subtotal</span>
                    <span className="text-zinc-900 font-bold">
                      Rp {Number(selectedOrder?.total_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-black text-zinc-900 uppercase">
                      Total Amount
                    </span>
                    <span className="text-2xl font-black text-red-600">
                      Rp {Number(selectedOrder?.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 bg-white border-t border-zinc-100 mt-auto">
              <Button
                disabled={updateMutation.isPending}
                className="w-full h-14 bg-zinc-900 hover:bg-red-600 text-white font-black text-sm transition-all shadow-lg rounded-xl flex items-center justify-center gap-2"
                onClick={() =>
                  handleUpdateStatus(selectedOrder?.id, selectedOrder?.status)
                }
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {selectedOrder?.status === "to_cook"
                      ? "PROCESS TO KITCHEN"
                      : "COMPLETE ORDER"}
                    <CheckCircle2 className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <AlertDialogContent
          size="sm"
          className="border-none shadow-2xl rounded-2xl"
        >
          <AlertDialogHeader>
            <div className="mx-auto bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2
                className="text-green-600"
                size={60}
                strokeWidth={1}
              />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">
              Update Status?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to change this order status to{" "}
              <span className="font-bold text-zinc-900 uppercase">
                "{statusToUpdate.replace("_", " ")}"
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
            <AlertDialogCancel className="flex-1 border-zinc-200 h-11 font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 bg-red-600 hover:bg-red-700 h-11 font-bold"
              onClick={confirmUpdateStatus}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
