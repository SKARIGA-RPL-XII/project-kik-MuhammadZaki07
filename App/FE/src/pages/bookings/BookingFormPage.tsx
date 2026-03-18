import React, { useState} from "react";
import { ChevronLeft, Save, Calendar, Users, MessageSquare, Utensils } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useBookingMutations } from "@/hooks/react-query/useBooking";

const BookingFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { createBooking } = useBookingMutations();

  const [formData, setFormData] = useState({
    table_id: "",
    booking_time: "",
    number_of_people: 1,
    notes: "",
    items: []
  });

  console.log(`[Log] ${isEdit ? 'Edit' : 'Create'} Booking Mode`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Log] Submitting Data:", formData);
    
    createBooking.mutate(formData, {
      onSuccess: () => navigate("/admin/bookings")
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-white dark:bg-neutral-950 transition-colors">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-neutral-500 hover:text-red-600 transition-colors mb-6 text-sm"
      >
        <ChevronLeft size={18} />
        Back to List
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          {isEdit ? "Update Reservation" : "New Reservation"}
        </h1>
        <p className="text-neutral-500">Fill in the details to {isEdit ? "update existing" : "create a new"} booking.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Table Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Utensils size={16} className="text-red-500"/> Select Table
            </label>
            <select 
              required
              className="w-full p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all text-sm"
              value={formData.table_id}
              onChange={(e) => setFormData({...formData, table_id: e.target.value})}
            >
              <option value="">Choose a table...</option>
              {/* Map tables here */}
              <option value="1">Table 01 (4 Person)</option>
              <option value="2">Table 02 (2 Person)</option>
            </select>
          </div>

          {/* Guest Count */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users size={16} className="text-red-500"/> Number of People
            </label>
            <input 
              type="number"
              min="1"
              required
              className="w-full p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all text-sm"
              value={formData.number_of_people}
              onChange={(e) => setFormData({...formData, number_of_people: parseInt(e.target.value)})}
            />
          </div>

          {/* Booking Time */}
          <div className="space-y-3 md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar size={16} className="text-red-500"/> Reservation Time
            </label>
            <input 
              type="datetime-local"
              required
              className="w-full p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all text-sm"
              value={formData.booking_time}
              onChange={(e) => setFormData({...formData, booking_time: e.target.value})}
            />
          </div>

          {/* Notes */}
          <div className="space-y-3 md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare size={16} className="text-red-500"/> Special Request (Optional)
            </label>
            <textarea 
              rows={4}
              className="w-full p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all text-sm resize-none"
              placeholder="e.g. Birthday celebration, window seat..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 font-medium text-sm transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-xl font-medium text-sm transition-all"
          >
            <Save size={18} />
            {isEdit ? "Update Booking" : "Confirm Reservation"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingFormPage;