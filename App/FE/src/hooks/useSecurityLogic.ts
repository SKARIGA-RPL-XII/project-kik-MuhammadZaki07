import { useState } from "react";
import { UserService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export function useSecurityLogic(user: any) {
  const { toast } = useToast();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [securityData, setSecurityData] = useState({
    email: user?.email || "",
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const updateField = (field: string, value: string) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateSecurity = async (type: "email" | "password") => {
    setLoading(true);

    try {
      const payload =
        type === "email"
          ? { email: securityData.email }
          : {
              current_password: securityData.current_password,
              new_password: securityData.new_password,
              new_password_confirmation: securityData.confirm_password
            };

      const { error } = await UserService.updateSecurity(user.id, payload);

      if (error) throw error;

      toast("success", "Success", `${type} updated successfully`);

      if (type === "password") {
        setSecurityData(prev => ({
          ...prev,
          current_password: "",
          new_password: "",
          confirm_password: ""
        }));
        setShowPasswordForm(false);
      }

      if (type === "email") {
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
      toast("success", "Account Deleted", "Goodbye!");
      logout();
      window.location.href = "/";
    } catch {
      toast("error", "Failed", "Could not delete account.");
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

    showEmailForm,
    setShowEmailForm,

    showPasswordForm,
    setShowPasswordForm,

    updateField,
    handleUpdateSecurity,
    handleDeleteAccount
  };
}