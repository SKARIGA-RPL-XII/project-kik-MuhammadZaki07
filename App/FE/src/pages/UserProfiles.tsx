import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import { UserService } from "../services/user.service";

export interface UserInterface {
  id: number;
  username: string;
  email: string;
  no_tlp: string;
  addres: string;
  gender: "LK" | "PR";
  profile_image: string | null;
}

export default function UserProfiles() {
  const [user, setUser] = useState<UserInterface | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await UserService.getProfile();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }
    fetchUser();
  }, []);

  return (
    <>
      <PageMeta
        title="Profile Dashboard - MyApp"
        description="View and edit your personal profile including email, phone, address, and profile picture."
      />

      <PageBreadcrumb pageTitle="Profile" />

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-neutral-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>

        <div className="space-y-6">
          {user && <UserMetaCard user={user} />}
          {/* <UserInfoCard />
          <UserAddressCard /> */}
        </div>
      </div>
    </>
  );
}

