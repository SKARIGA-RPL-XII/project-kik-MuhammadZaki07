"use client";

import { useState } from "react";
import { X, CreditCard, Wallet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "./order-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaymentDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentDrawer({ order, isOpen, onClose }: PaymentDrawerProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "wallet" | null>(
    null,
  );
  const [changeAmount, setChangeAmount] = useState(0);

  if (!isOpen || !order) return null;

  const handleCashPayment = () => {
    const cash = prompt("Enter cash amount:", order.total.toString());
    if (cash) {
      const amount = parseFloat(cash);
      setChangeAmount(Math.max(0, amount - order.total));
      setPaymentMethod("cash");
    }
  };

  const handleWalletPayment = () => {
    setPaymentMethod("wallet");
  };

  const handleConfirmPayment = () => {
    console.log(`Payment confirmed: ${paymentMethod} for order ${order.id}`);
    setPaymentMethod(null);
    onClose();
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-card border-l border-border/50 backdrop-blur-md transform transition-transform duration-300 z-[999] flex flex-col shadow-2xl ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      onClick={(e) => {
        if (e.currentTarget === e.target) {
          onClose();
        }
      }}
    >
      <div className="flex items-center justify-between p-6 border-b border-border/30">
        <h2 className="text-xl font-bold text-foreground">Payment</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-3">
            Order #{order.id}
          </p>
          <div className="bg-secondary/30 border border-border/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-foreground">
                Order Type:
              </span>
              <span className="text-sm font-bold text-accent">
                {order.type === "takeaway"
                  ? "To-Go"
                  : `Table ${order.tableNumber}`}
              </span>
            </div>
            <div className="border-t border-border/30 pt-3">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                Items
              </h4>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        qty: {item.qty}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      ${(item.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {order.specialRequests && order.specialRequests.length > 0 && (
              <div className="border-t border-border/30 pt-3">
                <p className="text-xs font-semibold text-accent mb-2">
                  Special Requests:
                </p>
                {order.specialRequests.map((req, i) => (
                  <p key={i} className="text-xs text-foreground/70">
                    • {req}
                  </p>
                ))}
              </div>
            )}
            <div className="border-t border-border/30 pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-foreground">Total:</span>
              <span className="text-2xl font-bold text-primary">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Payment Method
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCashPayment}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                paymentMethod === "cash"
                  ? "bg-primary/20 border-primary/60 text-primary"
                  : "bg-secondary/30 border-border/40 text-foreground hover:border-primary/40"
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs font-semibold">Cash</span>
            </button>
            <button
              onClick={handleWalletPayment}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                paymentMethod === "wallet"
                  ? "bg-primary/20 border-primary/60 text-primary"
                  : "bg-secondary/30 border-border/40 text-foreground hover:border-primary/40"
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-xs font-semibold">E-Wallet</span>
            </button>
          </div>
        </div>

        {/* Cash Change Display */}
        {paymentMethod === "cash" && changeAmount > 0 && (
          <div className="bg-accent/10 border border-accent/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-medium mb-2">
              Change
            </p>
            <p className="text-3xl font-bold text-accent">
              ${changeAmount.toFixed(2)}
            </p>
          </div>
        )}

        {/* E-Wallet Status */}
        {paymentMethod === "wallet" && (
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-medium mb-2">
              Wallet Status
            </p>
            <p className="text-sm text-blue-400 mb-3">Processing payment...</p>
            <div className="w-full bg-secondary/50 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-1/2 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border/30 p-6 space-y-3 bg-secondary/20 backdrop-blur-md">
        <Button
          onClick={handleConfirmPayment}
          disabled={!paymentMethod}
          className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          Confirm Payment
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full font-semibold border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
              size="lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Void Order
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Void Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to void order #{order.id}? This action
              cannot be undone.
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                Void Order
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
