import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { ShieldBan } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function BannedPage() {
  const { settings } = useSettings();
  const supportEmail = settings?.support_email || "admin@gagallapar.my.id";

  return (
    <>
      <PageMeta
        title="Account Banned | Access Restricted"
        description="Your account has been suspended or blocked by the administrator. Contact support if you think this is a mistake."
      />

      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />

        <div className="mx-auto w-full max-w-[420px] text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-red-500/10 text-red-500">
              <ShieldBan size={42} />
            </div>
          </div>

          <h1 className="mb-4 font-bold text-red-500 text-title-md xl:text-title-2xl">
            ACCESS BLOCKED
          </h1>

          <p className="mt-6 mb-8 text-base text-neutral-700 dark:text-neutral-400 sm:text-lg">
            Your account has been {" "}
            <span className="text-red-500 font-semibold">
              suspended or blocked {" "}
            </span>
            by the administrator.
            <br />
            If you think this is a mistake, please contact support.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to={`mailto:${supportEmail}`}
              className="inline-flex items-center justify-center rounded-lg bg-red-500 px-5 py-3.5 text-sm font-medium text-white hover:bg-red-600 transition"
            >
              Contact Support
            </Link>

            <Link
              to="/auth/sign-in"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 py-3.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
