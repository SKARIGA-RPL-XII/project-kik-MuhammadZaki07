import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { MenuService } from "../../services/menu.service";
import { ArrowLeft, Package } from "lucide-react";

function Show() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<any>(null);

  useEffect(() => {
    MenuService.getMenuById(Number(id)).then(({ data }) => {
      setMenu(data?.data);
    });
  }, [id]);

  if (!menu) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-neutral-500">
        Loading...
      </div>
    );
  }

  const finalPrice = menu.discount
    ? menu.price - (menu.price * menu.discount.value_discount) / 100
    : menu.price;

  return (
    <>
      <PageBreadcrumb pageTitle="Detail Product" />

      <ComponentCard title="Product Detail" desc="Informasi lengkap produk">
        {/* Back */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* IMAGE */}
          <div className="rounded-xl overflow-hidden border dark:border-neutral-800">
            <img
              src={`${import.meta.env.VITE_STORAGE_URL}/${menu.menu_image}`}
              alt={menu.name}
              className="w-full h-[420px] object-cover"
            />
          </div>

          {/* INFO */}
          <div className="space-y-6">
            {/* TITLE */}
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
                {menu.name}
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Category: {menu.category?.name}
              </p>
            </div>

            {/* PRICE */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold text-brand-500">
                Rp. {finalPrice.toLocaleString()}
              </span>

              {menu.discount && (
                <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-500/10">
                  -{menu.discount.value_discount}%
                </span>
              )}
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  menu.is_active
                    ? "bg-green-100 text-green-600 dark:bg-green-500/10"
                    : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700"
                }`}
              >
                {menu.is_active ? "Active" : "Inactive"}
              </span>

              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Package size={16} />
                Stock: {menu.stock}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <h3 className="font-semibold mb-2 text-neutral-700 dark:text-neutral-200">
                Description
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {menu.description || "-"}
              </p>
            </div>

            {/* META */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-neutral-800">
              <div className="text-sm">
                <p className="text-neutral-500">Created At</p>
                <p className="font-medium">
                  {new Date(menu.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="text-sm">
                <p className="text-neutral-500">Updated At</p>
                <p className="font-medium">
                  {new Date(menu.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>
      <div className="mt-4 flex justify-end items-center gap-3">
        <div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        </div>
        <div>
          <Button onClick={() => navigate(`/menu/edit-menu/${menu.id}`)}>
            Edit Product
          </Button>
        </div>
      </div>
    </>
  );
}

export default Show;
