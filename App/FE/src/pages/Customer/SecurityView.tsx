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
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <Mail size={16} />
          </div>
          <h4 className="text-sm font-bold text-neutral-800">Primary Email</h4>
        </div>
       <div className="flex gap-2">
  <Input value={user?.email} disabled className="bg-neutral-100" />

  <Button
    onClick={() => logic.setShowEmailForm(!logic.showEmailForm)}
    variant="outline"
    className="rounded-xl border-neutral-200 text-xs"
  >
    Change
  </Button>
</div>

{logic.showEmailForm && (
  <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
    <Input
      placeholder="New Email"
      value={logic.securityData.email}
      onChange={(e) => logic.updateField("email", e.target.value)}
    />

    <Button
      onClick={() => logic.handleUpdateSecurity("email")}
      disabled={logic.loading}
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      {logic.loading ? <Loader2 className="animate-spin" size={16}/> : "Save"}
    </Button>
  </div>
)}
      </div>

      <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <Lock size={16} />
          </div>
          <h4 className="text-sm font-bold text-neutral-800">Password Management</h4>
        </div>
        <div className="space-y-3">
        <Button
  onClick={() => logic.setShowPasswordForm(!logic.showPasswordForm)}
  variant="outline"
  className="w-full justify-start h-11 rounded-xl border-neutral-200 font-normal text-neutral-400 text-sm italic"
>
  Click to change your password...
</Button>

{logic.showPasswordForm && (
  <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-2">

    <Input
      type="password"
      placeholder="Current Password"
      value={logic.securityData.current_password}
      onChange={(e) =>
        logic.updateField("current_password", e.target.value)
      }
    />

    <Input
      type="password"
      placeholder="New Password"
      value={logic.securityData.new_password}
      onChange={(e) =>
        logic.updateField("new_password", e.target.value)
      }
    />

    <Input
      type="password"
      placeholder="Confirm Password"
      value={logic.securityData.confirm_password}
      onChange={(e) =>
        logic.updateField("confirm_password", e.target.value)
      }
    />

    <Button
      onClick={() => logic.handleUpdateSecurity("password")}
      disabled={logic.loading}
      className="w-full bg-red-600 hover:bg-red-700 text-white"
    >
      {logic.loading ? <Loader2 className="animate-spin" size={16}/> : "Update Password"}
    </Button>

  </div>
)}
        </div>
      </div>

      <div className="mt-12 p-5 border border-red-100 rounded-2xl bg-red-50/20">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
            <Trash2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-600">Danger Zone</h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Once deleted, all data including order history will be lost.
            </p>
          </div>
        </div>

        {!logic.showDeleteConfirm ? (
          <Button
            variant="ghost"
            onClick={() => logic.setShowDeleteConfirm(true)}
            className="w-full text-red-600 hover:bg-red-100/50 rounded-xl h-11 text-sm font-semibold hover:text-red-500"
          >
            Delete My Account
          </Button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 bg-white border border-red-100 rounded-xl flex gap-3 items-center">
              <AlertTriangle className="text-amber-500" size={16} />
              <p className="text-xs text-neutral-600 font-medium">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm.
              </p>
            </div>
            <Input
              className="border-red-200 h-11 text-center font-bold focus-visible:ring-red-500"
              placeholder="DELETE"
              value={logic.confirmText}
              onChange={(e) => logic.setConfirmText(e.target.value.toUpperCase())}
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => logic.setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                disabled={logic.confirmText !== "DELETE" || logic.isDeleting}
                onClick={logic.handleDeleteAccount}
                className="flex-[2] bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {logic.isDeleting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Yes, Delete Permanently"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}