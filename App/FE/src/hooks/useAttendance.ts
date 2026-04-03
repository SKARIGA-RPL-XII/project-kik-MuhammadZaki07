import { attendanceService } from "@/services/attendance.service";
import { useState, useEffect, useCallback } from "react";

const OFFICE_LOCATION = { 
  lat: -7.929135494953358, 
  lng: 112.58941654232895 
};
const MAX_DISTANCE = 500;

export const useAttendance = (toast: any) => {
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
      toast({
        variant: "destructive",
        title: "Geolocation Error",
        description: "Browser Anda tidak mendukung fitur lokasi.",
      });
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
          OFFICE_LOCATION.lng
        );
        setDistance(d);
      },
      () => {
        toast({
          variant: "destructive",
          title: "Lokasi Gagal",
          description: "Gagal mendapatkan lokasi. Pastikan GPS aktif.",
        });
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
      toast({
        variant: "default",
        title: "Peringatan",
        description: "Lokasi belum terdeteksi. Silakan segarkan halaman.",
      });
      return;
    }
    
    if (distance && distance > MAX_DISTANCE) {
      toast({
        variant: "destructive",
        title: "Gagal Absen",
        description: `Anda berada di luar jangkauan (${Math.round(distance)}m dari kantor)`,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await attendanceService.clockIn(location.lat, location.lng);
      toast({
        title: "Berhasil",
        description: res.message,
      });
      await fetchStatus();
      return res;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Terjadi kesalahan saat absen masuk.";
      toast({
        variant: "destructive",
        title: "Gagal",
        description: errMsg,
      });
      await fetchStatus();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.clockOut();
      toast({
        title: "Berhasil",
        description: res.message,
      });
      await fetchStatus();
      return res;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Gagal melakukan absen pulang.";
      toast({
        variant: "destructive",
        title: "Gagal",
        description: errMsg,
      });
      throw err;
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