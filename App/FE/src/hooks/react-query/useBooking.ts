import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingService } from "@/services/booking.service";

export const useBookings = (params?: { search?: string; status?: string }) => {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => BookingService.getBookings(params),
  });
};

export const useBookingMutations = () => {
  const queryClient = useQueryClient();

  const createBooking = useMutation({
    mutationFn: (payload: any) => BookingService.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  const deleteBooking = useMutation({
    mutationFn: (id: number) => BookingService.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  return { createBooking, deleteBooking };
};