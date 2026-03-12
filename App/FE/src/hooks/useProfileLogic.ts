import { useState } from "react";
import { UserService } from "@/services/user.service";
import { useToast } from "@/context/ToastContext";

export function useProfileLogic(user: any , refreshUser: () => void) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    no_tlp: user?.no_tlp || "",
    addres: user?.addres || "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    setErrors({});

    const payload = {
      ...formData,
      profile_image: imageFile,
    };

    const { error } = await UserService.updateProfile(user.id, payload);

    if (error) {
      const mapped: Record<string, string> = {};

      if (typeof error === "object") {
        Object.entries(error).forEach(([key, messages]: any) => {
          mapped[key] = messages[0];
        });
        setErrors(mapped);
      }

      toast("error", "Validation Failed", "Please check your input.");
    } else {
      toast("success", "Success", "Profile updated successfully!");
      setImageFile(null);
      setPreview(null);
      await refreshUser();
    }

    setLoading(false);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  return {
    formData,
    loading,
    preview,
    handleFileChange,
    updateProfile,
    updateField,
    errors,
  };
}