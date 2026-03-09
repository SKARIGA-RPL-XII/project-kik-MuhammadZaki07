import { Lock, Mail, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSecurityLogic } from "@/hooks/useSecurityLogic";

export function SecurityView({ user }: { user: any }) {
  const logic = useSecurityLogic(user);

  return (
    <div className="space-y-6 pb-10">
      <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Mail size={16}/></div>
          <h4 className="text-sm font-bold text-neutral-800">Primary Email</h4>
        </div>
        <div className="flex gap-2">
          <input 
            className="flex-1 px-4 py-2.5 bg-white border border-neutral-100 rounded-xl text-sm text-neutral-400 outline-none" 
            value={user?.email} 
            disabled 
          />
          <Button variant="outline" className="rounded-xl border-neutral-200 text-xs">Change</Button>
        </div>
      </div>

      <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Lock size={16}/></div>
          <h4 className="text-sm font-bold text-neutral-800">Password Management</h4>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start h-11 rounded-xl border-neutral-200 font-normal text-neutral-400 text-sm italic">
            Click to change your password...
          </Button>
        </div>
      </div>

      <div className="mt-12 p-5 border border-red-100 rounded-2xl bg-red-50/20">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={20}/></div>
          <div>
            <h4 className="text-sm font-bold text-red-600">Danger Zone</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">Once deleted, all your order history and earned badges will be permanently lost.</p>
          </div>
        </div>

        {!logic.showDeleteConfirm ? (
          <Button 
            variant="ghost" 
            onClick={() => logic.setShowDeleteConfirm(true)}
            className="w-full text-red-600 hover:bg-red-100/50 rounded-xl h-11 text-xs font-bold"
          >
            Delete My Account
          </Button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 bg-white border border-red-100 rounded-xl flex gap-3 items-center">
              <AlertTriangle className="text-amber-500" size={16} />
              <p className="text-[10px] text-neutral-600 font-medium leading-tight">
                Type <span className="font-bold text-red-600">DELETE</span> below to confirm.
              </p>
            </div>
            <Input 
              className="rounded-xl border-red-200 h-11 text-center font-bold tracking-widest focus-visible:ring-red-500 uppercase" 
              placeholder="DELETE"
              value={logic.confirmText}
              onChange={(e) => logic.setConfirmText(e.target.value.toUpperCase())}
            />
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => logic.setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button 
                disabled={logic.confirmText !== "DELETE" || logic.isDeleting}
                onClick={logic.handleDeleteAccount}
                className="flex-[2] bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-200"
              >
                {logic.isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Yes, Delete Permanently"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}