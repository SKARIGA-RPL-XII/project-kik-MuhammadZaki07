import {
  Lock,
  Mail,
  Trash2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeClosed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSecurityLogic } from "@/hooks/useSecurityLogic";
import { useAuth } from "@/context/AuthContext";

export function SecurityView() {
  const { user, refreshUser } = useAuth();
  const logic = useSecurityLogic(user, refreshUser);

  return (
    <div className="space-y-6 pb-10">
      <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 text-red-600 rounded-full">
            <Mail size={16} />
          </div>
          <h4 className="text-sm font-medium text-neutral-800">
            Primary Email
          </h4>
        </div>
        <div className="flex gap-2">
          <Input value={user?.email} disabled className="bg-neutral-100" />
          <Button
            onClick={() => logic.setShowEmailForm(!logic.showEmailForm)}
            variant="outline"
            disabled={user?.google_id != null || user?.google_id == ""}
            className="border-neutral-200 text-xs disabled:cursor-not-allowed"
          >
            {logic.showEmailForm ? "Cancel" : "Change"}
          </Button>
        </div>

        {logic.showEmailForm && (
          <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Input
              placeholder="Enter New Email"
              type="email"
              value={logic.securityData.email}
              onChange={(e) => logic.updateField("email", e.target.value)}
            />
            <Button
              onClick={() => logic.handleUpdateSecurity("email")}
              disabled={logic.loading}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100"
            >
              {logic.loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 text-red-600 rounded-full">
            <Lock size={16} />
          </div>
          <h4 className="text-sm font-medium text-neutral-800">
            Password Management
          </h4>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => logic.setShowPasswordForm(!logic.showPasswordForm)}
            variant="outline"
            disabled={user?.google_id != null || user?.google_id == ""}
            className="w-full justify-start h-11 border-neutral-200 font-normal text-neutral-400 text-sm disabled:cursor-not-allowed"
          >
            {logic.showPasswordForm
              ? "Close password settings..."
              : "Click to change your password..."}
          </Button>

          {logic.showPasswordForm && (
            <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {[
                {
                  id: "current_password",
                  label: "Current Password",
                  state: logic.showCurrentPassword,
                  toggle: logic.setShowCurrentPassword,
                },
                {
                  id: "new_password",
                  label: "New Password",
                  state: logic.showNewPassword,
                  toggle: logic.setShowNewPassword,
                },
                {
                  id: "confirm_password",
                  label: "Confirm Password",
                  state: logic.showConfirmPassword,
                  toggle: logic.setShowConfirmPassword,
                },
              ].map((field) => (
                <div key={field.id} className="relative">
                  <Input
                    type={field.state ? "text" : "password"}
                    placeholder={field.label}
                    className="pr-10"
                    value={(logic.securityData as any)[field.id]}
                    onChange={(e) =>
                      logic.updateField(field.id, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => field.toggle(!field.state)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {field.state ? <Eye size={18} /> : <EyeClosed size={18} />}
                  </button>
                </div>
              ))}

              <Button
                onClick={() => logic.handleUpdateSecurity("password")}
                disabled={logic.loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 h-11"
              >
                {logic.loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 overflow-hidden border border-red-200 rounded-xl bg-red-50/10">
        <div className="p-5 border-b border-red-100 bg-red-50/30">
          <div className="flex items-center gap-4">
            <div className="p-2.5 text-white rounded-lg bg-red-500">
              <Trash2 size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-medium text-red-500">
                Danger Zone
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground font-normal">
                Irreversible Actions
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            Once you delete your account, there is no going back. All your
            <span className="font-bold text-neutral-800">
              {" "}
              order history, badges,
            </span>{" "}
            and
            <span className="font-bold text-neutral-800">
              {" "}
              personal data
            </span>{" "}
            will be wiped from
            <span className="text-red-600 font-semibold"> GAGAL-LAPAR</span>.
          </p>

          {!logic.showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => logic.setShowDeleteConfirm(true)}
              className="w-full border-red-200 text-red-600 hover:bg-red-600 hover:text-white h-11 text-sm font-bold transition-all duration-300"
            >
              Delete My Account
            </Button>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="p-2 bg-white border border-red-200 rounded-lg flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="text-amber-600" size={16} />
                </div>
                <p className="text-xs text-neutral-600 font-medium">
                  To prevent accidental deletion, please type
                  <span className="mx-1 px-2 py-0.5 bg-red-100 text-red-700 rounded font-bold">
                    DELETE
                  </span>
                  below.
                </p>
              </div>

              <Input
                className="border-neutral-200 bg-white h-11 text-center text-lg font-bold focus-visible:ring-red-500"
                placeholder="••••••"
                value={logic.confirmText}
                onChange={(e) =>
                  logic.setConfirmText(e.target.value.toUpperCase())
                }
              />

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => logic.setShowDeleteConfirm(false)}
                  className="flex-1 h-11 text-neutral-500"
                >
                  I changed my mind
                </Button>
                <Button
                  disabled={logic.confirmText !== "DELETE" || logic.isDeleting}
                  onClick={logic.handleDeleteAccount}
                  className="flex-[1.5] bg-red-600 hover:bg-red-700 text-white text-sm shadow-red-200 h-11 disabled:opacity-50 transition-all"
                >
                  {logic.isDeleting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Delete Permanently"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
