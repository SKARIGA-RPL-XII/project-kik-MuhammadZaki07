import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Smartphone,
  Store,
  QrCode,
  CheckCircle2,
  Loader2,
  ClipboardX,
  User,
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
import { playNotificationSound } from "@/utils/notificationHelper";
import { OrderTimer } from "@/components/resto/OrderTimer";

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

  const {
    data: orders,
    isLoading,
    refetch,
  } = useGetOrders({
    orderSource: apiFilter,
    search: "",
  });
  const updateMutation = useUpdateStatus();

  useEffect(() => {
    if (!window.Echo) return;

    const channel = window.Echo.channel("orders-channel");

    channel.listen("NewOrderReceived", (e: any) => {
      playNotificationSound();

      if (Notification.permission === "granted" && document.hidden) {
        const customerName = e.order?.customer_name;
        const tableNumber = e.order?.table?.table_number;

        const locationInfo = tableNumber
          ? `Table ${tableNumber}`
          : "Takeaway / Online";
        const displayName = customerName
          ? `${customerName} (${locationInfo})`
          : locationInfo;

        new Notification("New Order! 🍔", {
          body: `Order received from ${displayName}`,
          icon: "/notification.png",
        });
      }

      refetch();
    });

    return () => {
      window.Echo.leaveChannel("orders-channel");
    };
  }, [refetch]);

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

      <header className="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10">
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
            <TabsList className="grid w-full grid-cols-3 h-10 p-1">
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
            className="bg-red-600 hover:bg-red-700 h-10 px-4 font-semibold"
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
                className="border shadow-none hover:border-red-200 dark:hover:border-red-500 transition-colors bg-white dark:bg-neutral-900"
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
                      {order.order_source === "qr_code" ? "Online" : "Offline"}
                    </Badge>
                    <CardTitle className="text-lg font-bold flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className={!order.table ? "text-orange-600" : ""}>
                          {order.table
                            ? `Table: ${order.table.table_number}`
                            : "Take Away"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {order.user?.username || order.customer_name || "Guest"}
                      </span>
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 font-bold">
                      #TRX-{order.id}
                    </p>
                    <p className="text-sm font-bold text-red-600">
                      Rp {order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 border-b">
                  <div className="flex items-center text-xs text-zinc-500 mb-4">
                    <OrderTimer
                      createdAt={order.created_at}
                      limitMinutes={15}
                      criticalMinutes={20}
                    />
                  </div>
                  <div className="flex items-center justify-between bg-zinc-50 dark:bg-neutral-800 p-2 rounded-md">
                    <span className="text-xs font-medium text-zinc-600 dark:text-neutral-300">
                      Status:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-white border-zinc-200 text-zinc-700 font-bold text-[10px]"
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 h-9 text-xs font-medium"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 h-9 text-xs bg-red-500 hover:bg-red-700 font-medium dark:text-white"
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
              There are currently no active orders in the queue.
            </p>
          </div>
        )}
      </ScrollArea>

      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-[400px] sm:w-[450px] p-0 border-l z-[9999]">
          <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
            <SheetHeader className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-red-100 shadow-none text-[10px] mb-1">
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
                  <p className="text-[10px] text-zinc-400 font-bold">Date</p>
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-300">
                    {selectedOrder?.created_at &&
                      new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8">
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-5 border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-red-600 mb-1">
                        Service Information
                      </p>
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {selectedOrder?.table
                          ? `Table: ${selectedOrder.table.table_number}`
                          : "Take Away"}
                      </h3>
                      <div className="flex gap-4 mt-3">
                        {selectedOrder?.table && (
                          <>
                            <div>
                              <p className="text-[10px] text-zinc-400 font-medium">
                                Capacity
                              </p>
                              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                {selectedOrder.table.capacity} Seats
                              </p>
                            </div>
                            <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
                          </>
                        )}
                        <div>
                          <p className="text-[10px] text-zinc-400 font-medium">
                            Payment
                          </p>
                          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                            {selectedOrder?.payment_method?.toUpperCase()}
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
                  <QrCode className="absolute -bottom-4 -right-4 h-24 w-24 text-zinc-100 dark:text-zinc-800 -z-0 opacity-50" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-zinc-100 mb-4 flex items-center justify-between">
                    <span>Items List</span>
                    <span className="text-zinc-400 font-medium">
                      {selectedOrder?.details?.length} Items
                    </span>
                  </h4>
                  <div className="space-y-6">
                    {selectedOrder?.details?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-start">
                        <div className="flex gap-3 items-start">
                          <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                            <img
                              src={`${import.meta.env.VITE_STORAGE_URL}/${item?.menu?.menu_image}`}
                              alt={item?.menu?.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                              <span className="text-red-600">
                                {item.menu_qty}x
                              </span>{" "}
                              {item.menu?.name}
                            </p>

                            <p className="text-[11px] text-zinc-500 font-medium">
                              @ Rp {Number(item.price).toLocaleString()}
                            </p>

                            {item.attributes && item.attributes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.attributes.map(
                                  (attr: any, idx: number) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700"
                                    >
                                      {attr.name}:{" "}
                                      <span className="text-zinc-800 dark:text-zinc-300 font-bold">
                                        {attr.level}
                                      </span>
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          Rp {Number(item.subtotal).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-dashed border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium">Subtotal</span>
                    <span className="text-zinc-900 dark:text-zinc-300 font-bold">
                      Rp {Number(selectedOrder?.total_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      Rp {Number(selectedOrder?.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
              <Button
                disabled={updateMutation.isPending}
                className="w-full bg-red-500 text-white font-bold h-12 transition-all hover:bg-red-600 flex items-center justify-center gap-2"
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
          size=""
          className="border-none rounded-2xl max-w-xs"
        >
          <AlertDialogHeader>
            <div className="mx-auto dark:bg-green-50 bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2
                className="text-green-600"
                size={40}
                strokeWidth={1.5}
              />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">
              Update Status?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Change order status to{" "}
              <span className="font-bold text-zinc-900">
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
