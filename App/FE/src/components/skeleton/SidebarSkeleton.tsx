import React from "react";

const SidebarSkeleton: React.FC = () => {
  return (
    <aside className="fixed mt-16 lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-neutral-900 border-r dark:border-neutral-800 h-screen w-[290px] z-50 animate-pulse">
      <div className="py-8 flex justify-start">
        <div className="flex items-center gap-3">
          <div className="size-[50px] bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-32 bg-neutral-100 dark:bg-neutral-800/50 rounded" />
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-8 mt-4">
        {[1, 2].map((section) => (
          <div key={section}>
            <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-800 mb-6 rounded" />
            <div className="flex flex-col gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-5 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  </div>
                  {item === 2 && <div className="size-4 bg-neutral-100 dark:bg-neutral-800 rounded" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarSkeleton;