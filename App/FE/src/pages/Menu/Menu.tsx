import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import MenuTable from "../../components/tables/MenuTable";
import { CategoryService } from "../../services/category.service";
import Button from "../../components/ui/button/Button";
import { Plus } from "lucide-react";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
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
import { useMenusAdmin } from "@/hooks/react-query/useMenu";

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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [debounced, setDebounced] = useState({
    search: "",
    category: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced({ search, category });
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, category]);

  const { data: catData } = useQuery({
    queryKey: ["categories-select"],
    queryFn: async () => {
      const res = await CategoryService.getCategories();
      return res.data?.map((c: any) => ({ label: c.name, value: c.id })) || [];
    },
  });

  const { 
    data: menuRes, 
    isLoading: loading, 
    refetch 
  } = useMenusAdmin({
    page: currentPage - 1,
    size: 10,
    search: debounced.search,
    category: debounced.category,
  });

  const menus = menuRes?.data || [];
  const totalItems = menuRes?.total || 0;
  const pageSize = menuRes?.size || 10;
  const totalPage = Math.ceil(totalItems / pageSize) || 1;

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
              options={catData || []}
              placeholder="Filter by Category"
              value={category}
              onChange={(val) => setCategory(val as string)}
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

        <MenuTable menus={menus} loading={loading} onRefresh={refetch} />

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