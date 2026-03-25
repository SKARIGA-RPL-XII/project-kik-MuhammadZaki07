import { useState } from "react";
import {
  Search,
  Clock,
  CheckCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  useBookingMutations,
  useBookings,
} from "@/hooks/react-query/useBooking";
import { useNavigate } from "react-router";
import BookingTable from "@/components/tables/BookingTable";
import { useToast } from "@/context/ToastContext";

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useBookings({
    search: searchTerm,
    page: page + 1,
  });

  const { deleteBooking, approveBooking } = useBookingMutations();

  const bookingList = Array.isArray(data?.data) ? data.data : [];
  const totalItems = data?.total || 0;
  const totalPage = data?.last_page || 1;

  const handleDelete = async (id: number) => {
    return new Promise<void>((resolve, reject) => {
      deleteBooking.mutate(id, {
        onSuccess: () => {
          refetch();
          toast("success", "Deleted", "Booking has been successfully removed.");
          resolve();
        },
        onError: (error: any) => {
          console.error(error);
          toast(
            "error",
            "Failed",
            "Could not delete booking. Please try again.",
          );
          reject();
        },
      });
    });
  };

  const handleConfirm = async (id: number) => {
    if (window.confirm("Konfirmasi pesanan ini?")) {
      approveBooking.mutate(id, {
        onSuccess: () => {
          refetch();
          toast(
            "success",
            "Confirmed",
            "Booking has been approved successfully.",
          );
        },
        onError: (error: any) => {
          console.error(error);
          toast(
            "error",
            "Update Failed",
            "Something went wrong while confirming.",
          );
        },
      });
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Booking Management
          </h1>
          <p className="text-neutral-500 text-sm">
            Monitor and manage table reservations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: "Total Bookings",
            value: totalItems,
            icon: <CalendarIcon size={20} />,
          },
          {
            label: "Pending Review",
            value: bookingList.filter(
              (b: any) => b.status === "pending_payment",
            ).length,
            icon: <Clock size={20} className="text-amber-500" />,
          },
          {
            label: "Confirmed",
            value: bookingList.filter((b: any) => b.status === "confirmed")
              .length,
            icon: <CheckCircle size={20} className="text-green-500" />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 border rounded-xl flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950 dark:border-white/[0.05]"
          >
            <div>
              <p className="text-sm text-neutral-500 font-medium mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
            <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-800">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search guest or table..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm transition-all"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
            />
          </div>
        </div>

        <BookingTable
          bookings={bookingList}
          loading={isLoading}
          totalItems={totalItems}
          totalPage={totalPage}
          page={page}
          setPage={setPage}
          onRefresh={refetch}
          onConfirm={handleConfirm}
          onDelete={handleDelete}
          onEdit={(id) => navigate(`/bookings/edit/${id}`)}
        />
      </div>
    </div>
  );
};

export default BookingPage;
