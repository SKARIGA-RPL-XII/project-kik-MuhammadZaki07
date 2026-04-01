import { apiClient } from '@/lib/apiClient';

export interface SchedulePayload {
  user_id: number;
  date: string;
  shift_id?: number | null;
  is_picket?: boolean;
  is_holiday?: boolean;
  note?: string;
  day_name?: string;
  start_time?: string; 
  end_time?: string;
}

export interface BulkSchedulePayload {
  schedules: SchedulePayload[];
  dates: string[];
}

export const scheduleService = {
  getSchedules: async (month?: number) => {
    const response = await apiClient.get('/schedules', { params: { month } });
    return response.data;
  },

  saveSchedule: async (payload: SchedulePayload) => {
    const response = await apiClient.post('/schedules', payload);
    return response.data;
  },

  deleteSchedule: async (id: number) => {
    const response = await apiClient.delete(`/schedules/${id}`);
    return response.data;
  },

  bulkSaveSchedules: async (payload: BulkSchedulePayload) => {
    const response = await apiClient.post('/schedules/bulk', payload);
    return response.data;
  },
};