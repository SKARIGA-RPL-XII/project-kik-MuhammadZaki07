import { attendanceService } from "@/services/attendance.service";
import { useState, useEffect, useCallback } from "react";

const OFFICE_LOCATION = { 
  lat: -7.929242549769063, 
  lng: 112.59065530363672 
};
const MAX_DISTANCE = 50;

export const useAttendance = () => {
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await attendanceService.getTodayStatus();
      setAttendanceStatus(res);
    } catch (err) {
      console.error("Gagal ambil status harian");
    }
  }, []);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation({ lat: latitude, lng: longitude });
      setDistance(
        calculateDistance(
          latitude,
          longitude,
          OFFICE_LOCATION.lat,
          OFFICE_LOCATION.lng,
        ),
      );
    });
  };

  useEffect(() => {
    fetchStatus();
    updateLocation();
  }, [fetchStatus]);

  const handleClockIn = async () => {
    if (!location || (distance && distance > MAX_DISTANCE)) return;
    setLoading(true);
    try {
      await attendanceService.clockIn(location.lat, location.lng);
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await attendanceService.clockOut();
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  return {
    attendanceStatus,
    distance,
    isOutOfRange: distance !== null && distance > MAX_DISTANCE,
    loading,
    handleClockIn,
    handleClockOut,
    refresh: fetchStatus,
  };
};
