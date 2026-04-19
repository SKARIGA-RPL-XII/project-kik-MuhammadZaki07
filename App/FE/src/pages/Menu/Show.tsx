import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { MenuService } from "../../services/menu.service";
import {
  ArrowLeft,
  Package,
  Calendar,
  Clock,
  Layers,
  Info,
  ChevronRight,
  Flame,
} from "lucide-react";
import Badge from "../../components/ui/badge/Badge";
import MenuShowSkeleton from "@/components/skeleton/menu/MenuShowSkeleton";
import PageMeta from "@/components/common/PageMeta";
import { formatCurrency } from "@/lib/currency";

function Show() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    MenuService.getMenuById(Number(id))
      .then((response) => {
        if (isMounted) {
          if (response.data) {
            setMenu(response.data);
          } else {
            setErrorMessage(response.error || "Failed to load data");
          }
        }
      })
      .catch(() => {
        if (isMounted) setErrorMessage("A system error occurred");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <MenuShowSkeleton />
      </div>
    );
  }

  if (errorMessage || !menu) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-neutral-500 gap-4">
        <div className="p-4 bg-red-50 text-red-500 rounded-lg border border-red-100">
          {errorMessage || "Data not found."}
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    );
  }

  const discountAmount = menu.discount
    ? (menu.price * menu.discount.value_discount) / 100
    : 0;
  const finalPrice = menu.price - discountAmount;

  return (
    <>
      <PageMeta title={menu.name} description={menu.description} />
      <div className="max-w-6xl mx-auto">
        <PageBreadcrumb pageTitle="Menu Detail" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 ">
              <img
                src={
                  menu.menu_image
                    ? `${import.meta.env.VITE_STORAGE_URL}/${menu.menu_image}`
                    : "/image-dumy.png"
                }
                alt={menu.name}
                className="w-full h-auto object-cover aspect-square"
              />
              {menu.discount && (
                <div className="absolute top-5 left-5 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1">
                  <Flame size={14} />
                  Save {menu.discount.value_discount}%
                </div>
              )}
            </div>

            <ComponentCard title="Status & Category">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.02]">
                  <span className="text-neutral-500 text-xs font-medium">
                    Availability
                  </span>
                  <Badge color={menu.is_active ? "success" : "error"}>
                    {menu.is_active ? "Live on Store" : "Hidden"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.02]">
                  <span className="text-neutral-500 text-xs font-medium">
                    Category
                  </span>
                  <span className="text-sm font-bold flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
                    {menu.category?.name}{" "}
                    <ChevronRight size={14} className="text-neutral-400" />
                  </span>
                </div>
              </div>
            </ComponentCard>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border border-neutral-200 dark:border-neutral-800  relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                  {menu.name}
                </h1>

                <div className="flex items-center gap-4 mb-8">
                  <div className="flex flex-col">
                    <span className="text-xs text-neutral-400 font-medium mb-1">
                      Final Price
                    </span>
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(finalPrice)}
                    </span>
                  </div>
                  {menu.discount && (
                    <div className="flex flex-col border-l border-neutral-200 dark:border-neutral-800 pl-4">
                      <span className="text-xs text-neutral-400 font-medium mb-1">
                        Normal
                      </span>
                      <span className="text-lg line-through text-neutral-400 font-medium">
                        {formatCurrency(menu.price)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-800 dark:text-white mb-2 flex items-center gap-2">
                      <Info size={16} className="text-red-500" />
                      About this menu
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm">
                      {menu.description ||
                        "No specific details provided for this selection."}
                    </p>
                  </div>

                  {menu.stocks && menu.stocks.length > 0 && (
                    <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                      <h3 className="text-sm font-medium text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
                        <Package size={16} className="text-red-500" />
                        Ingredient Usage
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {menu.stocks.map((stock: any) => (
                          <div
                            key={stock.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700"
                          >
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                              {stock.name}
                            </span>
                            <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-neutral-500">
                              {stock.pivot.amount} {stock.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {menu.attributes && menu.attributes.length > 0 && (
                    <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                      <h3 className="text-sm font-medium text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
                        <Layers size={16} className="text-red-500" />
                        Available Variations
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Array.from(
                          new Set(menu.attributes.map((a: any) => a.name)),
                        ).map((attrName: any) => {
                          const levels = menu.attributes
                            .filter((a: any) => a.name === attrName)
                            .map((a: any) => {
                              const level = a.levels.find(
                                (l: any) => l.id === a.pivot.attribute_level_id,
                              );
                              return level?.name;
                            })
                            .filter(Boolean);

                          return (
                            <div
                              key={attrName}
                              className="p-3 rounded-xl bg-red-50/50 dark:bg-red-500/5 border border-red-100/50 dark:border-red-500/10"
                            >
                              <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                                {attrName}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {levels.map((lvl: string, i: number) => (
                                  <span
                                    key={i}
                                    className="text-xs font-semibold text-neutral-800 dark:text-neutral-200"
                                  >
                                    {lvl}
                                    {i < levels.length - 1 ? "," : ""}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-800 text-neutral-400 border border-neutral-100 dark:border-neutral-700">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">
                        Launched on
                      </p>
                      <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        {new Date(menu.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-800 text-neutral-400 border border-neutral-100 dark:border-neutral-700">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">
                        Last Activity
                      </p>
                      <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        {new Date(menu.updated_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex h-10 items-center gap-2 text-sm hover:bg-neutral-100 transition-colors"
              >
                <ArrowLeft size={16} /> Back
              </Button>
              <Button
                className="text-base h-10 transition-transform bg-yellow-400 hover:bg-yellow-300"
                onClick={() => navigate(`/menu/edit-menu/${menu.id}`)}
              >
                Edit Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Show;
