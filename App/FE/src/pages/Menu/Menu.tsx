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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ActionGuard } from "@/components/guard/ActionGuard";

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

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockMin, setStockMin] = useState<number | undefined>();
  const [stockMax, setStockMax] = useState<number | undefined>();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [debounced, setDebounced] = useState({
    search: "",
    category: "",
    stockMin: undefined as number | undefined,
    stockMax: undefined as number | undefined,
  });

  const [loading, setLoading] = useState(false);

  const totalPage = Math.ceil(totalItems / pageSize) || 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced({
        search,
        category,
        stockMin,
        stockMax,
      });
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, category, stockMin, stockMax]);

  const fetchCategories = async () => {
    const res = await CategoryService.getCategories();
    const cats =
      res.data?.map((c: any) => ({
        label: c.name,
        value: c.id,
      })) || [];
    setCategories(cats);
  };

  const fetchMenus = async () => {
    setLoading(true);

    const query: any = {
      page: currentPage - 1,
      size: 10,
    };

    if (debounced.search) query.search = debounced.search;
    if (debounced.category) query.category = debounced.category;
    if (debounced.stockMin !== undefined) query.stock_min = debounced.stockMin;
    if (debounced.stockMax !== undefined) query.stock_max = debounced.stockMax;

    const res = await MenuService.getMenusAdmin(query);

    if (res.data) {
      setMenus(res.data);
      setTotalItems(res.total || 0);
      setPageSize(res.size || 10);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [debounced, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPage) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <PageMeta
        title="Menu Management"
        description="Comprehensive management of menu items, including creation, updates, pricing, categories, and availability."
      />

      <PageBreadcrumb pageTitle="Menu Management" />

      <ComponentCard
        title="Menu Management"
        desc="View, create, update, and manage all menu items, including pricing, categories, stock levels, and availability status."
      >
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
                setStockMin(e.target.value ? Number(e.target.value) : undefined)
              }
            />

            <Input
              type="number"
              placeholder="Stock max"
              value={stockMax ?? ""}
              onChange={(e) =>
                setStockMax(e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>

          <ActionGuard module="menu" action="write">
            <Link to="create-menu">
              <Button className="h-10">
                Create <Plus />
              </Button>
            </Link>
          </ActionGuard>
        </div>

        <MenuTable menus={menus} loading={loading} onRefresh={fetchMenus} />

        <div className="mt-6">
          <Pagination>
            <PaginationContent className="flex w-full justify-between items-center">
              <p className="text-xs text-gray-500 font-medium">
                Showing {menus.length} of {totalItems} items (Page {currentPage}{" "}
                of {totalPage})
              </p>

              <div className="flex gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {[...Array(totalPage)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPage ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === pageNum}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </div>
            </PaginationContent>
          </Pagination>
        </div>
      </ComponentCard>
    </>
  );
}

export default Menu;
