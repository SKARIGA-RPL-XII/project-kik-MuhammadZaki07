import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DiscountService } from "@/services/discount.service";

export const useDiscounts = (params?: {
    search?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
}) => {
    return useQuery({
        queryKey: ["discounts", params],
        queryFn: () => DiscountService.getDiscounts(params),
        staleTime: 1000 * 60 * 5,
    });
};

export const useDiscountMutations = () => {
    const queryClient = useQueryClient();

    const createDiscount = useMutation({
        mutationFn: (formData: FormData) => DiscountService.createDiscount(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
        },
    });

    const updateDiscount = useMutation({
        mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
            DiscountService.updateDiscount(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
        },
    });

    const deleteDiscount = useMutation({
        mutationFn: (id: number) => DiscountService.deleteDiscount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
        },
    });

    const applyDiscount = useMutation({
        mutationFn: (formData: FormData) => DiscountService.applyDiscount(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
            queryClient.invalidateQueries({ queryKey: ["menus"] });
            queryClient.invalidateQueries({ queryKey: ["menus-admin"] });
        },
    });

    return { createDiscount, updateDiscount, deleteDiscount, applyDiscount };
};