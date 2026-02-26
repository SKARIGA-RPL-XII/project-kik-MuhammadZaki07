import { useState, useMemo } from 'react'
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  ClipboardList, 
  ShoppingBag,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useNavigate } from 'react-router'

const CATEGORIES = ['All Items', 'Mains', 'Sides', 'Drinks', 'Dessert', 'Snacks']

const DUMMY_MENU = [
  { 
    id: '1', name: 'Signature Beef Burger', price: 45000, category: 'Mains', popular: true,
    attributes: { title: 'Tingkat Kematangan', options: ['Medium', 'Well Done'] }
  },
  { id: '2', name: 'Truffle Parmesan Fries', price: 32000, category: 'Sides', popular: false },
  { 
    id: '3', name: 'Iced Pistachio Latte', price: 38000, category: 'Drinks', popular: true,
    attributes: { title: 'Level Gula', options: ['Less Sugar', 'Normal', 'Extra Sweet'] }
  },
  { id: '4', name: 'Classic Margherita Pizza', price: 65000, category: 'Mains', popular: false },
  { id: '5', name: 'Caesar Chicken Salad', price: 42000, category: 'Mains', popular: false },
  { id: '6', name: 'Deep Dark Chocolate Cake', price: 35000, category: 'Dessert', popular: true },
]

export default function CashierPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All Items')
  const [cart, setCart] = useState<any[]>([])
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  
  // New States for Attr & Selection
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [tempAttr, setTempAttr] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart])
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const change = parseFloat(amountPaid) ? parseFloat(amountPaid) - total : 0

  const handleProductClick = (product: any) => {
    if (product.attributes) {
      setSelectedProduct(product)
      setTempAttr(product.attributes.options[0])
    } else {
      addToCart(product, '')
    }
  }

  const addToCart = (product: any, attr: string) => {
    const cartId = attr ? `${product.id}-${attr}` : product.id
    setCart(prev => {
      const existing = prev.find(item => item.cartId === cartId)
      if (existing) {
        return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, cartId, attribute: attr, quantity: 1 }]
    })
    setSelectedProduct(null)
  }

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : null
      }
      return item
    }).filter((item): item is any => item !== null))
  }

  const toggleExpand = (cartId: string) => {
    setExpandedItems(prev => prev.includes(cartId) ? prev.filter(id => id !== cartId) : [...prev, cartId])
  }

  const resetOrder = () => {
    setCart([])
    setAmountPaid('')
    setPaymentSuccess(false)
    setIsPaymentOpen(false)
    setSelectedIds([])
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F4F5] dark:bg-zinc-950 font-sans">
      <div className="flex flex-1 flex-col min-w-0">
        <header className="h-20 px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Premium POS</h1>
            <div className="h-6 w-px bg-zinc-200 mx-2" />
            <Button 
              variant="ghost" 
              onClick={() => navigate('/orders')}
              className="h-10 px-4 text-zinc-500 hover:text-red-600 hover:bg-red-50 gap-2 rounded-lg transition-all"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="text-sm font-semibold">Orders Queue</span>
              <Badge className="bg-red-600 h-5 w-5 p-0 flex items-center justify-center text-[10px]">3</Badge>
            </Button>
          </div>
          
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search product..." 
              className="pl-10 h-10 bg-zinc-100 border-none rounded-lg text-sm focus-visible:ring-1 focus-visible:ring-zinc-300" 
            />
          </div>
        </header>

        <div className="bg-white border-b border-zinc-200 px-6 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant="ghost"
                onClick={() => setActiveCategory(cat)}
                className={`h-9 px-5 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat 
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800' 
                  : 'text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {DUMMY_MENU.map((item) => (
              <Card 
                key={item.id} 
                className="group border border-zinc-200 shadow-none hover:border-red-600 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-200 cursor-pointer rounded-xl bg-white overflow-hidden"
                onClick={() => handleProductClick(item)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square bg-zinc-50 flex items-center justify-center relative">
                    {item.popular && (
                      <Badge className="absolute top-2 left-2 bg-red-600 text-[10px] h-5 px-2 uppercase font-black tracking-tighter">Popular</Badge>
                    )}
                    <ShoppingBag className="h-8 w-8 text-zinc-200 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-zinc-900 text-sm leading-snug mb-1 truncate">{item.name}</h3>
                    <p className="text-red-600 font-bold text-sm">Rp {item.price.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <aside className="w-[380px] bg-white border-l border-zinc-200 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Checkbox 
              checked={selectedIds.length === cart.length && cart.length > 0}
              onCheckedChange={(checked) => setSelectedIds(checked ? cart.map(i => i.cartId) : [])}
              className="rounded-md border-zinc-300 data-[state=checked]:bg-red-600"
            />
            <h2 className="font-bold text-sm text-zinc-900 uppercase tracking-tight">Cart ({cart.length})</h2>
          </div>
          <div className="flex gap-1">
             {selectedIds.length > 0 && (
               <Button variant="ghost" size="icon" onClick={() => {
                 setCart(prev => prev.filter(i => !selectedIds.includes(i.cartId)));
                 setSelectedIds([]);
               }} className="h-8 w-8 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
             )}
             <Button variant="ghost" size="icon" onClick={() => setCart([])} className="h-8 w-8 text-zinc-300 hover:text-red-600 rounded-lg">
               <Trash2 className="h-4 w-4" />
             </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-zinc-50">
            {cart.map((item) => (
              <div key={item.cartId} className={`p-4 transition-all group ${selectedIds.includes(item.cartId) ? 'bg-red-50/40' : 'hover:bg-zinc-50/50'}`}>
                <div className="flex gap-3">
                   <Checkbox 
                      checked={selectedIds.includes(item.cartId)}
                      onCheckedChange={() => setSelectedIds(prev => prev.includes(item.cartId) ? prev.filter(id => id !== item.cartId) : [...prev, item.cartId])}
                      className="mt-1 rounded-md border-zinc-300 data-[state=checked]:bg-red-600 shadow-none"
                    />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-zinc-800 text-sm truncate leading-tight">{item.name}</h4>
                      <p className="text-sm font-bold text-zinc-900 whitespace-nowrap ml-2">Rp {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{item.category}</p>
                       {item.attribute && <Badge variant="outline" className="text-[9px] py-0 h-4 bg-white font-medium border-zinc-200 text-zinc-500 uppercase">{item.attribute}</Badge>}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pl-7">
                  <button 
                    onClick={() => toggleExpand(item.cartId)}
                    className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest"
                  >
                    {expandedItems.includes(item.cartId) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {expandedItems.includes(item.cartId) ? 'Hide Info' : 'Show Info'}
                  </button>
                  <div className="flex items-center gap-1 bg-white border border-zinc-100 rounded-lg p-0.5 shadow-sm">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.cartId, -1)}>
                      <Minus className="h-3 w-3 text-zinc-400" />
                    </Button>
                    <span className="w-8 text-center font-bold text-xs text-zinc-900">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md font-bold" onClick={() => updateQuantity(item.cartId, 1)}>
                      <Plus className="h-3 w-3 text-zinc-600" />
                    </Button>
                  </div>
                </div>

                {expandedItems.includes(item.cartId) && (
                  <div className="mt-3 ml-7 p-3 bg-white rounded-xl border border-zinc-100 animate-in slide-in-from-top-1 duration-200">
                     <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Selected Attribute:</p>
                     <p className="text-xs font-semibold text-zinc-600">{item.attribute || 'No attribute selected'}</p>
                  </div>
                )}
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                <ShoppingBag className="h-10 w-10 mb-2 stroke-1" />
                <p className="text-xs font-medium uppercase tracking-widest">Cart Empty</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-zinc-50/50 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-zinc-900">Rp {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <span>Tax (10%)</span>
              <span className="text-zinc-900">Rp {tax.toLocaleString()}</span>
            </div>
            <Separator className="bg-zinc-200 my-2" />
            <div className="flex justify-between text-xl font-black text-zinc-900">
              <span>Total Bill</span>
              <span className="text-red-600">Rp {total.toLocaleString()}</span>
            </div>
          </div>
          
          <Button 
            className="w-full h-14 text-sm font-bold bg-zinc-900 hover:bg-black text-white shadow-xl rounded-xl transition-all active:scale-[0.98]"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
          >
            Process Checkout
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Attribute Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-[380px] p-6 border-none rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-zinc-900">{selectedProduct?.name}</DialogTitle>
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider pt-1">{selectedProduct?.attributes?.title}</p>
          </DialogHeader>
          <RadioGroup value={tempAttr} onValueChange={setTempAttr} className="py-4 space-y-3">
            {selectedProduct?.attributes?.options.map((opt: string) => (
              <div 
                key={opt} 
                onClick={() => setTempAttr(opt)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  tempAttr === opt ? 'border-red-600 bg-red-50/50' : 'border-zinc-100'
                }`}
              >
                <Label htmlFor={opt} className="font-bold text-zinc-800 cursor-pointer">{opt}</Label>
                <RadioGroupItem value={opt} id={opt} className="text-red-600 border-zinc-300" />
              </div>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button 
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl" 
              onClick={() => addToCart(selectedProduct, tempAttr)}
            >
              Add to Cart - Rp {selectedProduct?.price.toLocaleString()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog - Same as before but with consistent rounding */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
          {!paymentSuccess ? (
            <div className="p-8 space-y-6">
              <DialogHeader><DialogTitle className="text-center text-lg font-bold uppercase tracking-widest">Payment</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="text-center py-2">
                  <h2 className="text-4xl font-black text-zinc-900 leading-none">Rp {total.toLocaleString()}</h2>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cash Amount</label>
                  <Input 
                    autoFocus
                    type="number" 
                    className="h-12 text-xl font-bold text-center bg-zinc-50 border-zinc-200 rounded-xl focus:ring-red-600"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>
                <div className="p-4 bg-red-50 rounded-xl text-center border border-red-100">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Change</p>
                  <p className="text-2xl font-black text-red-600">Rp {Math.max(0, change).toLocaleString()}</p>
                </div>
              </div>
              <Button 
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200"
                disabled={!amountPaid || parseFloat(amountPaid) < total}
                onClick={() => setPaymentSuccess(true)}
              >
                Confirm Payment
              </Button>
            </div>
          ) : (
            <div className="p-10 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mb-1 leading-tight">Payment Successful</h2>
              <Button className="w-full h-12 bg-zinc-900 text-white font-bold rounded-xl mt-6" onClick={resetOrder}>
                New Order
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}