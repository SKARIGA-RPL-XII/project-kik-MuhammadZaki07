import { attendanceService } from "@/services/attendance.service";
import { useState, useEffect, useCallback } from "react";

const OFFICE_LOCATION = { 
  lat: -7.929135494953358, 
  lng: 112.58941654232895 
};
const MAX_DISTANCE = 500;

export const useAttendance = (toast: (variant: any, title: string, message: string) => void) => {
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast("error", "Geolocation Error", "Browser Anda tidak mendukung fitur lokasi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        const d = calculateDistance(
          latitude,
          longitude,
          OFFICE_LOCATION.lat,
          OFFICE_LOCATION.lng,
        );
        setDistance(d);
      },
      () => {
        toast("error", "Lokasi Gagal", "Gagal mendapatkan lokasi. Pastikan GPS aktif.");
      },
      { enableHighAccuracy: true }
    );
  }, [toast]);

  useEffect(() => {
    fetchStatus();
    updateLocation();
  }, [fetchStatus, updateLocation]);

  const handleClockIn = async () => {
    if (!location) {
      toast("warning", "Peringatan", "Lokasi belum terdeteksi. Silakan segarkan halaman.");
      return;
    }
    
    if (distance && distance > MAX_DISTANCE) {
      toast("error", "Gagal Absen", `Anda berada di luar jangkauan (${Math.round(distance)}m dari kantor)`);
      return;
    }

    setLoading(true);
    try {
      const res = await attendanceService.clockIn(location.lat, location.lng);
      toast("success", "Berhasil", res.message);
      await fetchStatus();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Terjadi kesalahan saat absen masuk.";
      toast("error", "Gagal", errMsg);
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.clockOut();
      toast("success", "Berhasil", res.message);
      await fetchStatus();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Gagal melakukan absen pulang.";
      toast("error", "Gagal", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    attendanceStatus,
    distance,
    location,
    isOutOfRange: distance !== null && distance > MAX_DISTANCE,
    loading,
    handleClockIn,
    handleClockOut,
    refresh: fetchStatus,
    updateLocation
  };
};