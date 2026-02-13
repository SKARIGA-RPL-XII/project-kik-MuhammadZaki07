import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuth();  
  
  
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate("/auth/sign-in");
    } finally {
      setLoading(false);
    }
  };

  const profile_image = `${import.meta.env.VITE_STORAGE_URL}/${user.profile_image}`

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-neutral-700 dropdown-toggle dark:text-neutral-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src={user.profile_image == null ? "/profile.png" : profile_image} alt="User" />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {user?.username ?? "Your name"}
        </span>

        <svg
          className={`stroke-neutral-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-4 w-[260px] rounded-2xl border bg-white dark:bg-neutral-900 p-3 shadow-lg"
      >
        <div>
          <span className="block font-medium text-theme-sm">
            {user?.username}
          </span>
          <span className="block text-theme-xs text-neutral-500">
            {user?.email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b">
          <li>
            <DropdownItem onItemClick={closeDropdown} tag="a" to="/profile">
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem onItemClick={closeDropdown} tag="a" to="/settings">
              Account settings
            </DropdownItem>
          </li>
        </ul>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-3 px-3 py-2 mt-3 w-full rounded-lg text-theme-sm
          hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-500 disabled:opacity-60"
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </Dropdown>
    </div>
  );
}
