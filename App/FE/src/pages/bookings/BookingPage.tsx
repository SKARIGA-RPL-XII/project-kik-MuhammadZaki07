import React, { useState } from "react";
import { 
  Plus, Search, Filter, MoreHorizontal, 
  CheckCircle, XCircle, Clock, Calendar as CalendarIcon 
} from "lucide-react";
import { useBookingMutations, useBookings } from "@/hooks/react-query/useBooking";
import { useNavigate } from "react-router";

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useBookings();
  const { deleteBooking } = useBookingMutations();
  

  const handleConfirm = async (id: number) => {
    console.log(`[Log] Confirming booking ID: ${id}`);
    // Logic confirm panggil mutation confirm mu nanti
    // toast.success("Booking confirmed successfully");
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure?")) {
      console.log(`[Log] Deleting booking ID: ${id}`);
      deleteBooking.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'pending': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'cancelled': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-neutral-800';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Booking Management</h1>
          <p className="text-neutral-500 text-sm">Monitor and manage table reservations.</p>
        </div>
        <button 
          onClick={() => navigate("/admin/bookings/create")}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition-all font-medium text-sm"
        >
          <Plus size={18} />
          Add New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Bookings", value: data?.data?.length || 0, icon: <CalendarIcon size={20}/> },
          { label: "Pending Review", value: data?.data?.filter((b: any) => b.status === 'pending').length || 0, icon: <Clock size={20} className="text-amber-500"/> },
          { label: "Today's Schedule", value: 0, icon: <CheckCircle size={20} className="text-green-500"/> },
        ].map((stat, i) => (
          <div key={i} className="p-5 border border-neutral-100 dark:border-neutral-800 rounded-2xl flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
            <div>
              <p className="text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
            <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-800">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-950">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text"
              placeholder="Search guest or table..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 text-xs font-medium uppercase tracking-wider">
                <th className="px-6 py-4">Guest Info</th>
                <th className="px-6 py-4">Table</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Guests</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-400">Loading data...</td></tr>
              ) : data?.data?.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm">{booking.user?.username || "Offline Guest"}</p>
                    <p className="text-xs text-neutral-500">{booking.user?.email || "-"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg border border-neutral-100 dark:border-neutral-800 text-xs font-medium">
                      Table {booking.table?.table_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col">
                      {/* <span>{format(new Date(booking.booking_time), "dd MMM yyyy")}</span> */}
                      {/* <span className="text-xs text-neutral-400">{format(new Date(booking.booking_time), "HH:mm")}</span> */}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{booking.number_of_people} Pers.</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => handleConfirm(booking.id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/admin/bookings/edit/${booking.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(booking.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;