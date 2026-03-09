import { useState } from "react";
import { UserService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export function useSecurityLogic(user: any) {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    
    setIsDeleting(true);
    try {
      const { error } = await UserService.deleteAccount(user.id);
      if (error) throw error;
      
      toast("success", "Account Deleted", "We're sorry to see you go. Goodbye!");
      logout();
    } catch (err) {
      toast("error", "Failed", "Could not delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    confirmText,
    setConfirmText,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeleteAccount
  };
}