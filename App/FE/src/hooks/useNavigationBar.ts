import { useState, useMemo, useEffect } from "react";
import { useCategories } from "@/hooks/react-query/useCategory";

interface NavigationLogicProps {
  onSearch: (value: string) => void;
  onSortChange: (values: string[]) => void;
  selectedSorts: string[];
}

export function useNavigationBarLogic({
  onSearch,
  onSortChange,
  selectedSorts,
}: NavigationLogicProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categoryResponse, isLoading } = useCategories({ size: 100 });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  const handleToggleSort = (id: string) => {
    const newSorts = selectedSorts.includes(id)
      ? selectedSorts.filter((s) => s !== id)
      : [...selectedSorts, id];
    onSortChange(newSorts);
  };

  const categories = useMemo(() => {
    const base = [{ id: "all", name: "All", slug: "all" }];
    if (categoryResponse?.data) {
      return [...base, ...categoryResponse.data];
    }
    return base;
  }, [categoryResponse]);

  return {
    state: {
      isFocused,
      showSort,
      searchTerm,
      categories,
      isLoading,
    },
    actions: {
      setIsFocused,
      setShowSort,
      setSearchTerm,
      handleToggleSort,
    },
  };
}