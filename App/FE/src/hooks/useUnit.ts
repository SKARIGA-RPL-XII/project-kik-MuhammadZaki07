import { Unit, UnitQuery, UnitService } from "@/services/unit.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const useUnit = (initialQuery?: UnitQuery) => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<UnitQuery>(initialQuery || { page: 1, size: 10 });

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['units', query],
    queryFn: () => UnitService.getUnits(query),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Unit>) => UnitService.createUnit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Unit> }) =>
      UnitService.updateUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => UnitService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });

  const handleSearch = (search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleCategoryFilter = (category: 'weight' | 'volume' | 'unit' | undefined) => {
    setQuery((prev) => ({ ...prev, category, page: 1 }));
  };

  return {
    units: data?.data || [],
    metadata: {
      page: data?.page || 1,
      size: data?.size || 10,
      total: data?.total || 0,
    },
    isLoading,
    isError,
    error: data?.error || (error as any)?.message,
    
    query,
    setQuery,
    handleSearch,
    handlePageChange,
    handleCategoryFilter,
    refresh: refetch,

    createUnit: createMutation.mutateAsync,
    updateUnit: updateMutation.mutateAsync,
    deleteUnit: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};