import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { MenuService } from "../../services/menu.service";
import { ArrowLeft, Package, Tag, Calendar, Clock, Layers } from "lucide-react";
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
      <PageMeta
        title={menu.name}
        description={menu.description}
      />
        <PageBreadcrumb pageTitle="Menu Detail" />
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ComponentCard title="Menu Preview">
            <div className="relative group rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={`${import.meta.env.VITE_STORAGE_URL}/${menu.menu_image}`}
                alt={menu.name}
                className="w-full h-auto object-cover aspect-square transition-transform duration-500 group-hover:scale-105"
              />
              {menu.discount && (
                <div className="absolute top-3 right-3 bg-error-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  -{menu.discount.value_discount}% OFF
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 text-sm italic">
                  Selling Status
                </span>
                <Badge color={menu.is_active ? "success" : "error"}>
                  {menu.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 text-sm italic">
                  Remaining Stock
                </span>
                <div className="flex items-center gap-2 font-bold text-neutral-800 dark:text-white">
                  <Package size={16} className="text-brand-500" />
                  {menu.stock} Portions
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 text-sm italic">
                  Category
                </span>
                <Badge variant="light">
                  {menu.category?.name || "No Category"}
                </Badge>
              </div>
            </div>
          </ComponentCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <ComponentCard title="Product Information">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-brand-500 mb-1">
                <Tag size={14} />
                <span className="text-[10px] uppercase tracking-[2px] font-bold">
                  Product Information
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-white leading-tight">
                {menu.name}
              </h1>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-100 dark:border-white/[0.05] mb-8">
              <p className="text-xs text-neutral-400 uppercase font-semibold mb-2">
                Selling Price
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-neutral-900 dark:text-white">
                  {formatCurrency(finalPrice)}
                </span>
                {menu.discount && (
                  <span className="text-lg line-through text-neutral-400 font-medium">
                    {formatCurrency(menu.price)}
                  </span>
                )}
              </div>
            </div>

            {menu.attributes && menu.attributes.length > 0 && (
              <div className="mb-8">
                <h3 className="flex items-center gap-2 font-bold text-neutral-800 dark:text-white mb-4">
                  <Layers size={18} className="text-brand-500" />
                  Attribute Options
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {menu.attributes.map((attr: any, idx: number) => {
                    const selectedLevel = attr.levels?.find(
                      (l: any) => l.id === attr.pivot?.attribute_level_id,
                    );
                    return (
                      <div
                        key={idx}
                        className="flex flex-col p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-transparent"
                      >
                        <span className="text-[10px] uppercase text-neutral-400 font-bold mb-1">
                          {attr.name}
                        </span>
                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">
                          {selectedLevel?.name || "Standard"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-bold text-neutral-800 dark:text-white mb-2">
                Product Description
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                {menu.description || "No description available for this menu."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="hidden sm:block p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  <Calendar size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase font-bold">
                    Created At
                  </p>
                  <p className="text-xs font-semibold">
                    {new Date(menu.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  <Clock size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase font-bold">
                    Last Updated
                  </p>
                  <p className="text-xs font-semibold">
                    {new Date(menu.updated_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </ComponentCard>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              className="shadow-lg shadow-brand-500/20 px-8"
              onClick={() => navigate(`/menu/edit-menu/${menu.id}`)}
            >
              Edit This Menu
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Show;
