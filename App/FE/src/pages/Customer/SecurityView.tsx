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
import { useTranslation, Trans } from "react-i18next"; // + Import Trans untuk styling teks dalam I18n

export function SecurityView() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const logic = useSecurityLogic(user, refreshUser);

  return (
    <div className="space-y-6 pb-10">
      <div className="p-4 border rounded-xl bg-neutral-50/30 dark:bg-neutral-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 text-red-600 dark:bg-neutral-800 rounded-full">
            <Mail size={16} />
          </div>
          <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-300">
            {t("sec_email_title")}
          </h4>
        </div>
        <div className="flex gap-2">
          <Input value={user?.email} disabled className="bg-neutral-100 dark:bg-neutral-900" />
          <Button
            onClick={() => logic.setShowEmailForm(!logic.showEmailForm)}
            variant="outline"
            disabled={user?.google_id != null || user?.google_id == ""}
            className="border-neutral-200 text-xs disabled:cursor-not-allowed"
          >
            {logic.showEmailForm ? t("sec_email_btn_cancel") : t("sec_email_btn_change")}
          </Button>
        </div>

        {logic.showEmailForm && (
          <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Input
              placeholder={t("sec_email_placeholder")}
              type="email"
              value={logic.securityData.email}
              onChange={(e) => logic.updateField("email", e.target.value)}
            />
            <Button
              onClick={() => logic.handleUpdateSecurity("email")}
              disabled={logic.loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {logic.loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                t("sec_email_btn_save")
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 border rounded-xl bg-neutral-50/30 dark:bg-neutral-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 dark:bg-neutral-800 text-red-600 rounded-full">
            <Lock size={16} />
          </div>
          <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-300">
            {t("sec_pass_title")}
          </h4>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => logic.setShowPasswordForm(!logic.showPasswordForm)}
            variant="outline"
            // disabled={user?.google_id != null || user?.google_id == ""}
            className="w-full justify-start h-11 border-neutral-200 font-normal text-neutral-400 text-sm disabled:cursor-not-allowed"
          >
            {logic.showPasswordForm
              ? t("sec_pass_btn_close")
              : t("sec_pass_btn_open")}
          </Button>

          {logic.showPasswordForm && (
            <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {[
                {
                  id: "current_password",
                  label: t("sec_pass_current"),
                  state: logic.showCurrentPassword,
                  toggle: logic.setShowCurrentPassword,
                },
                {
                  id: "new_password",
                  label: t("sec_pass_new"),
                  state: logic.showNewPassword,
                  toggle: logic.setShowNewPassword,
                },
                {
                  id: "confirm_password",
                  label: t("sec_pass_confirm"),
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
                className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
              >
                {logic.loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  t("sec_pass_btn_update")
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 overflow-hidden border border-red-200 dark:border-neutral-200/20 dark:bg-neutral-800 rounded-xl bg-red-50/10">
        <div className="p-5 border-b border-red-100 bg-red-50/30 dark:border-none dark:bg-neutral-900">
          <div className="flex items-center gap-4">
            <div className="p-2.5 text-white rounded-lg bg-red-500">
              <Trash2 size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-medium text-red-500 dark:text-neutral-300">
                {t("sec_danger_title")}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground font-normal">
                {t("sec_danger_subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
            <Trans i18nKey="sec_danger_desc">
              Setelah Anda menghapus akun, tidak ada jalan kembali. Semua 
              <span className="font-bold text-neutral-800"> riwayat pesanan, lencana, </span> 
              dan 
              <span className="font-bold text-neutral-800"> data pribadi </span> 
              akan dihapus dari 
              <span className="text-red-600 font-semibold"> GAGAL-LAPAR</span>.
            </Trans>
          </p>

          {!logic.showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => logic.setShowDeleteConfirm(true)}
              className="w-full border-red-200 text-red-600 hover:bg-red-600 hover:text-white h-11 text-sm font-bold transition-all duration-300"
            >
              {t("sec_danger_btn_delete")}
            </Button>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="p-2 bg-white border border-red-200 rounded-lg flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="text-amber-600" size={16} />
                </div>
                <p className="text-xs text-neutral-600 font-medium">
                  <Trans i18nKey="sec_danger_confirm_msg">
                    Untuk mencegah penghapusan yang tidak disengaja, silakan ketik 
                    <span className="mx-1 px-2 py-0.5 bg-red-100 text-red-700 rounded font-bold">
                      DELETE
                    </span> 
                    di bawah ini.
                  </Trans>
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
                  {t("sec_danger_btn_cancel")}
                </Button>
                <Button
                  disabled={logic.confirmText !== "DELETE" || logic.isDeleting}
                  onClick={logic.handleDeleteAccount}
                  className="flex-[1.5] bg-red-600 hover:bg-red-700 text-white text-sm shadow-red-200 h-11 disabled:opacity-50 transition-all"
                >
                  {logic.isDeleting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    t("sec_danger_btn_confirm")
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