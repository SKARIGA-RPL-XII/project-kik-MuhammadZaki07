import { useState } from "react";
import { UserService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export function useSecurityLogic(user: any , refreshUser: () => Promise<void>) {
  const { toast } = useToast();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [securityData, setSecurityData] = useState({
    email: user?.email || "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const updateField = (field: string, value: string) => {
    setSecurityData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateSecurity = async (type: "email" | "password") => {
    setLoading(true);

    try {
      const payload: any = {};

      if (type === "email") {
        if (securityData.email !== user?.email) {
          payload.email = securityData.email;
        }
      } else if (type === "password") {
        if (securityData.new_password) {
          payload.password = securityData.new_password;
        }
      }

      if (Object.keys(payload).length === 0) {
        toast("info", "No Changes", "No new data to update.");
        setLoading(false);
        return;
      }

      const { error } = await UserService.updateProfile(user.id, payload);

      if (error) throw error;

      toast(
        "success",
        "Success",
        `${type.charAt(0).toUpperCase() + type.slice(1)} updated!`,
      );

      await refreshUser();
      
      if (type === "password") {
        setSecurityData((prev) => ({
          ...prev,
          current_password: "",
          new_password: "",
          confirm_password: "",
        }));
        setShowPasswordForm(false);
      } else {
        setShowEmailForm(false);
      }
    } catch (err: any) {
      toast("error", "Failed", err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      await UserService.deleteAccount(user.id);
      toast(
        "success",
        "Account Deleted",
        "Your account has been permanently removed.",
      );
      logout();
      window.location.href = "/";
    } catch {
      toast("error", "Failed", "Could not delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    securityData,
    loading,
    isDeleting,
    confirmText,
    setConfirmText,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    showEmailForm,
    setShowEmailForm,
    showPasswordForm,
    setShowPasswordForm,
    updateField,
    handleUpdateSecurity,
    handleDeleteAccount,
  };
}
