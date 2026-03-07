import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, Check, QrCode, CreditCard, Utensils, ShoppingBag } from 'lucide-react';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';

export type Step = 'ORDER_TYPE' | 'TABLE_SELECTION' | 'PAYMENT' | 'RECEIPT';
export type OrderType = 'dine-in' | 'take-away' | null;

export default function CheckoutProcess({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { getInitialStep } = useCheckoutFlow();
    const [state, setState] = useState(getInitialStep());

    const nextStep = (next: Step) => setState(prev => ({ ...prev, step: next }));
    const goBack = () => {
        if (state.step === 'PAYMENT' && !new URLSearchParams(window.location.search).get('table')) {
            nextStep(state.type === 'dine-in' ? 'TABLE_SELECTION' : 'ORDER_TYPE');
        } else if (state.step === 'TABLE_SELECTION') {
            nextStep('ORDER_TYPE');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />

            <motion.div
                layout
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="relative w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header Stepper */}
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    {state.step !== 'ORDER_TYPE' && state.step !== 'RECEIPT' ? (
                        <button onClick={goBack} className="p-2 -ml-2 hover:bg-neutral-50 rounded-full transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                    ) : <div className="w-8" />}

                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Checkout Progress</span>
                        <div className="flex gap-1 mt-1">
                            {['ORDER_TYPE', 'TABLE_SELECTION', 'PAYMENT', 'RECEIPT'].map((s) => (
                                <div key={s} className={`h-1 w-6 rounded-full ${state.step === s ? 'bg-red-600' : 'bg-neutral-100'}`} />
                            ))}
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 -mr-2 hover:bg-neutral-50 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {state.step === 'ORDER_TYPE' && (
                            <StepOrderType onSelect={(type) => {
                                setState(prev => ({ ...prev, type }));
                                nextStep(type === 'dine-in' ? 'TABLE_SELECTION' : 'PAYMENT');
                            }} />
                        )}

                        {state.step === 'TABLE_SELECTION' && (
                            <StepTableSelection onSelect={(tableId) => {
                                setState(prev => ({ ...prev, table: tableId }));
                                nextStep('PAYMENT');
                            }} />
                        )}

                        {state.step === 'PAYMENT' && (
                            <StepPayment onSelect={(method) => nextStep('RECEIPT')} />
                        )}

                        {state.step === 'RECEIPT' && (
                            <StepReceipt orderData={state} onFinish={onClose} />
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

function StepOrderType({ onSelect }: { onSelect: (t: OrderType) => void }) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900">How do you want your food?</h3>
                <p className="text-sm text-neutral-500">Please select your service preference.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {[
                    { id: 'dine-in', label: 'Dine-In', icon: Utensils, desc: 'Eat at restaurant' },
                    { id: 'take-away', label: 'Take-Away', icon: ShoppingBag, desc: 'Pick up & go' }
                ].map(opt => (
                    <button key={opt.id} onClick={() => onSelect(opt.id as any)} className="flex flex-col gap-4 p-6 rounded-2xl border-2 border-neutral-100 hover:border-red-600 hover:bg-red-50/30 transition-all text-left group">
                        <opt.icon className="text-neutral-400 group-hover:text-red-600" size={32} />
                        <div>
                            <p className="font-bold text-neutral-900">{opt.label}</p>
                            <p className="text-xs text-neutral-500">{opt.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

function StepTableSelection({ onSelect }: { onSelect: (id: string) => void }) {
    const tables = Array.from({ length: 12 }, (_, i) => ({ id: `${i + 1}`, status: i === 4 ? 'occupied' : 'available' }));

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Select Table</h3>
                <p className="text-sm text-neutral-500">Pick an available table to sit at.</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
                {tables.map(t => (
                    <button
                        key={t.id}
                        disabled={t.status === 'occupied'}
                        onClick={() => onSelect(t.id)}
                        className={`h-14 flex items-center justify-center rounded-xl font-bold text-sm transition-all border-2
              ${t.status === 'occupied' ? 'bg-neutral-50 border-neutral-100 text-neutral-300 cursor-not-allowed' : 'border-neutral-100 hover:border-red-600 text-neutral-700'}
            `}
                    >
                        {t.id}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

function StepPayment({ onSelect }: { onSelect: (m: string) => void }) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Payment Method</h3>
                <p className="text-sm text-neutral-500">Choose how you would like to pay.</p>
            </div>
            {['E-Wallet (OVO/Gopay)', 'Credit Card', 'Pay at Cashier'].map(m => (
                <button key={m} onClick={() => onSelect(m)} className="w-full flex items-center justify-between p-4 border border-neutral-100 rounded-xl hover:border-red-600 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-neutral-50 rounded-lg group-hover:bg-red-50 text-neutral-400 group-hover:text-red-600">
                            <CreditCard size={20} />
                        </div>
                        <span className="font-semibold text-neutral-700">{m}</span>
                    </div>
                    <ChevronRightIcon />
                </button>
            ))}
        </motion.div>
    );
}

function StepReceipt({ orderData, onFinish }: { orderData: any; onFinish: () => void }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <div className="mb-6 inline-flex p-4 bg-green-50 text-green-600 rounded-full">
                <Check size={40} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black text-neutral-900 tracking-tight">ORDER PLACED!</h3>
            <p className="text-sm text-neutral-500 mt-1">Please show this barcode to the cashier.</p>

            <div className="my-8 p-6 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center">
                <div className="bg-white p-4 shadow-sm rounded-lg mb-4">
                    <QrCode size={120} className="text-neutral-900" />
                </div>
                <p className="text-[10px] font-mono text-neutral-400">TRX-ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>

            <div className="flex justify-between text-left text-sm font-medium text-neutral-600 mb-8 px-2">
                <span>Type: <b className="text-neutral-900 uppercase">{orderData.type}</b></span>
                <span>Table: <b className="text-neutral-900">{orderData.table || 'N/A'}</b></span>
            </div>

            <button onClick={onFinish} className="w-full py-4 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs">
                Close & Finish
            </button>
        </motion.div>
    );
}

function ChevronRightIcon() {
    return <ChevronLeft className="rotate-180 text-neutral-300" size={16} />;
}