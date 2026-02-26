import { useState } from 'react'
import { 
  Clock, 
  ArrowLeft, 
  Smartphone, 
  Store,  
  QrCode, 
  CheckCircle2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNavigate } from 'react-router'

const DUMMY_ORDERS = [
  { 
    id: 'ORD-2026-001', 
    type: 'ONLINE', 
    table: 'Meja 05', 
    total: 35000, 
    timestamp: '14:20', 
    status: 'Pending',
    items: [
      { name: 'Nasi Goreng Spesial', qty: 1, price: 25000 },
      { name: 'Es Teh Manis', qty: 2, price: 10000 }
    ]
  },
  { 
    id: 'ORD-2026-002', 
    type: 'OFFLINE', 
    table: 'Takeaway', 
    total: 18000, 
    timestamp: '14:25', 
    status: 'Cooking',
    items: [{ name: 'Kopi Susu Aren', qty: 1, price: 18000 }] 
  }
]

export default function OrderQueuePage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [statusToUpdate, setStatusToUpdate] = useState('')

  const filteredOrders = DUMMY_ORDERS.filter(order => 
    filter === 'ALL' ? true : order.type === filter
  )

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setStatusToUpdate(newStatus)
    setIsUpdateOpen(true)
  }

  return (
    <div className="flex flex-col h-screen bg-[#fafafa] dark:bg-zinc-950">
      <header className="px-6 py-4 bg-white dark:bg-zinc-900 border-b flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Order Management</h1>
          <p className="text-sm text-zinc-500">Monitor dan perbarui status pesanan pelanggan secara real-time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs value={filter} onValueChange={setFilter} className="w-[280px]">
            <TabsList className="grid w-full grid-cols-3 h-10 bg-zinc-100 p-1">
              <TabsTrigger value="ALL" className="text-xs">Semua</TabsTrigger>
              <TabsTrigger value="OFFLINE" className="text-xs">Offline</TabsTrigger>
              <TabsTrigger value="ONLINE" className="text-xs">Online</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => navigate('/cashier')} size="sm" className="bg-red-600 hover:bg-red-700 h-10 px-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Buka Kasir
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="border border-zinc-200 shadow-sm hover:border-red-200 transition-colors bg-white">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <Badge variant={order.type === 'ONLINE' ? 'default' : 'secondary'} className={order.type === 'ONLINE' ? 'bg-red-50 text-red-600 hover:bg-red-50 border-red-100 shadow-none' : 'shadow-none'}>
                    {order.type === 'ONLINE' ? <Smartphone className="h-3 w-3 mr-1" /> : <Store className="h-3 w-3 mr-1" />}
                    {order.type}
                  </Badge>
                  <CardTitle className="text-lg font-bold">{order.table}</CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{order.id}</p>
                  <p className="text-sm font-bold text-red-600">Rp {order.total.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 border-b border-zinc-50">
                <div className="flex items-center text-xs text-zinc-500 mb-4">
                  <Clock className="h-3 w-3 mr-1" /> Masuk: {order.timestamp}
                </div>
                <div className="flex items-center justify-between bg-zinc-50 p-2 rounded-md">
                  <span className="text-xs font-medium text-zinc-600">Status Saat Ini:</span>
                  <Badge variant="outline" className="bg-white border-zinc-200 text-zinc-700">{order.status}</Badge>
                </div>
              </CardContent>
              <CardFooter className="p-2 gap-2 bg-zinc-50/50">
                <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs" onClick={() => setSelectedOrder(order)}>
                  Detail Pesanan
                </Button>
                <Button variant="default" size="sm" className="flex-1 h-9 text-xs bg-zinc-900 hover:bg-zinc-800" onClick={() => handleUpdateStatus(order.id, 'Selesai')}>
                  Update Status
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Detail Sidebar */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-[400px] sm:w-[450px] p-0 border-l border-zinc-200">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <SheetTitle className="text-xl font-bold">{selectedOrder?.table}</SheetTitle>
                  <SheetDescription>Detail rincian pesanan #{selectedOrder?.id}</SheetDescription>
                </div>
                {selectedOrder?.type === 'ONLINE' && (
                  <div className="p-2 border border-zinc-100 rounded-lg bg-zinc-50">
                    <QrCode className="h-10 w-10 text-zinc-900" />
                  </div>
                )}
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Item Pesanan</h4>
                  <div className="space-y-3">
                    {selectedOrder?.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-zinc-800">{item.name}</p>
                          <p className="text-xs text-zinc-500">{item.qty} x Rp {item.price.toLocaleString()}</p>
                        </div>
                        <p className="text-sm font-bold">Rp {(item.qty * item.price).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-medium text-zinc-900">Rp {selectedOrder?.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-black pt-2">
                    <span>Total Pembayaran</span>
                    <span className="text-red-600">Rp {selectedOrder?.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 bg-zinc-50 border-t border-zinc-200">
              <Button 
                className="w-full h-12 bg-red-600 hover:bg-red-700 font-bold"
                onClick={() => {
                  setSelectedOrder(null);
                  handleUpdateStatus(selectedOrder?.id, 'Selesai');
                }}
              >
                Tandai Sebagai Selesai
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Update Status Alert */}
      <AlertDialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <AlertDialogContent className="max-w-[400px] border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="text-green-600 h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Perbarui Status?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Apakah Anda yakin ingin mengubah status pesanan ini menjadi <span className="font-bold text-zinc-900">"{statusToUpdate}"</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
            <AlertDialogCancel className="flex-1 border-zinc-200 h-11">Batal</AlertDialogCancel>
            <AlertDialogAction className="flex-1 bg-red-600 hover:bg-red-700 h-11">Konfirmasi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}