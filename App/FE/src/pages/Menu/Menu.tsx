import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import MenuTable from "../../components/tables/MenuTable";
import { MenuService } from "../../services/menu.service";
import { CategoryService } from "../../services/category.service";
import Button from "../../components/ui/button/Button";
import { Plus } from "lucide-react";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import { Link } from "react-router";

export interface Menu {
  id: number;
  menu_image: string;
  name: string;
  description: string | null;
  price: number | null;
  stock: number;
  is_active: number;
  created_at?: string;
  category?: { id: number; name: string };
  discount?: { id: number; title: string; value_discount: number };
}

function Menu() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockMin, setStockMin] = useState<number | undefined>();
  const [stockMax, setStockMax] = useState<number | undefined>();

  // debounced filters
  const [debounced, setDebounced] = useState({
    search: "",
    category: "",
    stockMin: undefined as number | undefined,
    stockMax: undefined as number | undefined,
  });

  const [loading, setLoading] = useState(false);

  /* =========================
      DEBOUNCE FILTER
     ========================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced({
        search,
        category,
        stockMin,
        stockMax,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, category, stockMin, stockMax]);

  /* =========================
      FETCH CATEGORIES
     ========================= */
  const fetchCategories = async () => {
    const res = await CategoryService.getCategories();

    const cats =
      res.data?.map((c: any) => ({
        label: c.name,
        value: c.name,
      })) || [];

    setCategories(cats);
  };

  /* =========================
      FETCH MENUS
     ========================= */
  const fetchMenus = async () => {
    setLoading(true);

    const query: any = {};

    if (debounced.search) query.search = debounced.search;
    if (debounced.category) query.category = debounced.category;
    if (debounced.stockMin !== undefined)
      query.stock_min = debounced.stockMin;
    if (debounced.stockMax !== undefined)
      query.stock_max = debounced.stockMax;

    const res = await MenuService.getMenusAdmin(query);

    setMenus(res.data || []);
    setLoading(false);
  };

  /* =========================
      EFFECTS
     ========================= */
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [debounced]);

  return (
    <>
      <PageMeta
        title="Menu Management"
        description="Manage all menus in the admin panel"
      />

      <PageBreadcrumb pageTitle="Menu" />

      <ComponentCard title="Management Menu" desc="manage menu">
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="grid grid-cols-6 gap-2 flex-1">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select
              options={categories}
              placeholder="Filter by Category"
              value={category}
              onChange={(val) => setCategory(val as string)}
            />

            <Input
              type="number"
              placeholder="Stock min"
              value={stockMin ?? ""}
              onChange={(e) =>
                setStockMin(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />

            <Input
              type="number"
              placeholder="Stock max"
              value={stockMax ?? ""}
              onChange={(e) =>
                setStockMax(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>

          <Link to="create-menu">
            <Button className="h-10">
              Create <Plus />
            </Button>
          </Link>
        </div>

        <MenuTable
          menus={menus}
          loading={loading}
          onRefresh={fetchMenus}
        />
      </ComponentCard>
    </>
  );
}

export default Menu;
