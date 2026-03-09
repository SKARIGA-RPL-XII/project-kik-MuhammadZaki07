import { useState } from "react";
import { UserService } from "@/services/user.service";
import { useToast } from "@/context/ToastContext";

export function useProfileLogic(user: any) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: user?.username || "",
    no_tlp: user?.no_tlp || "",
    addres: user?.addres || ""
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
    const payload = {
      ...formData,
      profile_image: imageFile
    };

    const { error } = await UserService.updateProfile(user.id, payload);
    
    if (error) {
      toast("error", "Failed", "Changes could not be saved");
    } else {
      toast("success", "Success", "Your profile has been updated");
      setImageFile(null);
    }
    
    setLoading(false);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    loading,
    preview,
    handleFileChange,
    updateProfile,
    updateField
  };
}