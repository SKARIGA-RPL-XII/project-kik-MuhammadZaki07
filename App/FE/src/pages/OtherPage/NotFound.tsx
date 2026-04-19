import GridShape from "../../components/common/GridShape";
import { Link, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <PageMeta
        title="404 - Page Not Found"
        description="The page you are looking for doesn't exist or has been moved. Return to the dashboard or go back to continue browsing."
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="mb-8 font-bold text-neutral-800 text-title-md dark:text-white/90 xl:text-title-2xl">
            ERROR
          </h1>

          <img src="/images/error/404.svg" alt="404" className="dark:hidden" />
          <img
            src="/images/error/404-dark.svg"
            alt="404"
            className="hidden dark:block"
          />

          <p className="mt-10 mb-6 text-base text-neutral-700 dark:text-neutral-400 sm:text-lg">
            We can’t seem to find the page you are looking for!
          </p>

          <Link
            to={navigate(-1)}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 py-3.5 text-sm font-medium text-neutral-700 shadow-theme-xs hover:bg-neutral-50 hover:text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-white/[0.03] dark:hover:text-neutral-200"
          >
            Back to Home Page
          </Link>
        </div>
      </div>
    </>
  );
}
