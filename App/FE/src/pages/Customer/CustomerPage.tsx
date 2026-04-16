import { useTranslation } from "react-i18next";
import BannerCarousel from "@/components/carousel/BannerCarousel";
import PageMeta from "@/components/common/PageMeta";
import { MenuCard, NavigationBar } from "@/components/resto";
import { EmptyState } from "@/components/resto/EmptyState";
import { MenuDetailView } from "@/components/resto/MenuDetailView";
import { MenuListSkeleton } from "@/components/skeleton/MenuCardSkeleton";
import { useCustomerPageLogic } from "@/hooks/useCustomerPage";

export default function CustomerPage() {
  const { t } = useTranslation();
  const { state, actions } = useCustomerPageLogic();

  return (
    <div className="flex flex-col gap-6 sm:gap-10 pb-20">
      <PageMeta 
        title={t("cp_meta_title")} 
        description={t("cp_meta_desc")} 
      />

      {(state.loadingBanner || state.banners.length > 0) && (
        <BannerCarousel
          isLoading={state.loadingBanner}
          banners={state.banners}
          autoLoop
          loopInterval={5000}
        />
      )}

      <NavigationBar
        selectedCategory={state.selectedCategory}
        selectedSorts={state.selectedSorts}
        onCategoryChange={(cat) => {
          actions.setSelectedCategory(cat);
          actions.setPage(1);
        }}
        onSearch={actions.setSearchQuery}
        onSortChange={(sorts) => {
          actions.setSelectedSorts(sorts);
          actions.setPage(1);
        }}
      />

      <div className="min-h-[45vh] px-4">
        {state.loadingMenu ? (
          <MenuListSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {state.menuData.map((item: any) => (
                <MenuCard
                  key={item?.id}
                  item={item}
                  onOpenDetail={actions.handleOpenDetail}
                />
              ))}
            </div>

            {state.menuData.length === 0 && <EmptyState />}

            {state.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 mb-10">
                <button
                  disabled={state.page === 1}
                  onClick={() => actions.changePage(state.page - 1)}
                  className="h-12 px-6 bg-white border border-neutral-200 rounded-xl disabled:opacity-30 font-bold text-xs uppercase transition-all"
                >
                  {t("cp_pagination_prev")}
                </button>
                <span className="text-xs font-black text-neutral-400 uppercase">
                  {t("cp_pagination_info", { current: state.page, total: state.totalPages })}
                </span>
                <button
                  disabled={state.page >= state.totalPages}
                  onClick={() => actions.changePage(state.page + 1)}
                  className="h-12 px-6 bg-white border border-neutral-200 rounded-xl disabled:opacity-30 font-bold text-xs uppercase transition-all"
                >
                  {t("cp_pagination_next")}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <MenuDetailView
        menu={state.selectedMenu}
        isOpen={state.isModalOpen}
        onClose={actions.handleCloseDetail}
        onAddToCart={(data: any) => {
          const { quantity, ...menuItem } = data;
          actions.addToCart(menuItem, quantity);
        }}
      />
    </div>
  );
}