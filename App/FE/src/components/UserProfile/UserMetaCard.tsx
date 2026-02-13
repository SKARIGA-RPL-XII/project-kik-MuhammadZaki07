import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { Pencil } from "lucide-react";
import { UpdateProfilePayload, UserService } from "../../services/user.service";

export default function UserMetaCard({ user }: { user: any }) {
  const { isOpen, openModal, closeModal } = useModal();

  const [form, setForm] = useState<UpdateProfilePayload & { confirm_password: string }>({
    email: user.email || "",
    password: "",
    confirm_password: "",
    no_tlp: user.no_tlp || "",
    addres: user.addres || "",
    gender: user.gender || "LK",
    username: user.username || "",
    profile_image: null,
  });

  const [imagePreview, setImagePreview] = useState<string>(user.profile_image || "/profile.png");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "profile_image" && value) {
      setImagePreview(URL.createObjectURL(value));
    }
  };

  const handleSave = async () => {
    if (form.password && form.password !== form.confirm_password) {
      alert("Password and confirm password do not match");
      return;
    }

    setSubmitting(true);
    try {
      await UserService.updateProfile(user.id, form);
      alert("Profile updated successfully!");
      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to update profile");
    }
    setSubmitting(false);
  };

  useEffect(() => {
    return () => {
      if (form.profile_image) URL.revokeObjectURL(imagePreview);
    };
  }, [form.profile_image, imagePreview]);
  
  return (
    <>
      <div className="p-5 border border-neutral-200 rounded-2xl dark:border-neutral-800 lg:p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 overflow-hidden border border-neutral-200 rounded-full dark:border-neutral-800">
            <img
              src={imagePreview}
              alt="user"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-neutral-800 dark:text-white/90">
              {user.username}
            </h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {user.email || "No address"}
            </p>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-white/5"
        >
          <Pencil size={15} />
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-neutral-900">
          <h4 className="mb-4 text-2xl font-semibold text-neutral-800 dark:text-white/90">
            Edit Profile
          </h4>

          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label>Username</Label>
                <Input
                  type="text"
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </div>

              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={form.confirm_password}
                  onChange={(e) => handleChange("confirm_password", e.target.value)}
                />
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  type="text"
                  value={form.no_tlp}
                  onChange={(e) => handleChange("no_tlp", e.target.value)}
                />
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  type="text"
                  value={form.addres}
                  onChange={(e) => handleChange("addres", e.target.value)}
                />
              </div>

              <div>
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onChange={(v) => handleChange("gender", v)}
                  options={[
                    { label: "Male", value: "LK" },
                    { label: "Female", value: "PR" },
                  ]}
                />
              </div>

              <div>
                <Label>Profile Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChange("profile_image", e.target.files?.[0] || null)}
                />
                {form.profile_image && (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="mt-2 w-24 h-24 rounded-full object-cover border border-neutral-200"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
