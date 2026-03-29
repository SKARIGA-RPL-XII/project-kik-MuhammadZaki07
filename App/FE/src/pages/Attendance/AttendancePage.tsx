import { useAttendance } from '@/hooks/useAttendance';

const AttendancePage = () => {
    const { 
        attendanceStatus, 
        distance, 
        isOutOfRange, 
        loading, 
        handleClockIn, 
        handleClockOut 
    } = useAttendance();

    const onConfirmAttendance = async () => {
        try {
            if (!attendanceStatus?.has_clock_in) {
                await handleClockIn();
            } else {
                await handleClockOut();
            }
            alert("Berhasil memperbarui presensi!");
        } catch (error) {
            alert(error);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Presensi Pegawai</h1>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">Jarak Anda dari kantor:</p>
                <p className={`text-xl font-mono ${isOutOfRange ? 'text-red-500' : 'text-green-600'}`}>
                    {distance !== null ? `${Math.round(distance)} meter` : 'Mencari lokasi...'}
                </p>
                {isOutOfRange && (
                    <p className="text-xs text-red-500 mt-1 italic">
                        * Anda berada di luar jangkauan (Maks 50m)
                    </p>
                )}
            </div>

            {!attendanceStatus?.has_clock_out ? (
                <button 
                    onClick={onConfirmAttendance}
                    disabled={loading || distance === null || isOutOfRange}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                        isOutOfRange 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg active:scale-95'
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                        </span>
                    ) : (
                        !attendanceStatus?.has_clock_in ? 'Clock In Sekarang' : 'Clock Out Sekarang'
                    )}
                </button>
            ) : (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center font-medium">
                    ✅ Anda sudah menyelesaikan absensi hari ini.
                </div>
            )}

            <div className="mt-8 text-sm text-gray-500 border-t pt-4">
                <div className="flex justify-between">
                    <span>Masuk:</span>
                    <span>{attendanceStatus?.attendance?.clock_in || '--:--'}</span>
                </div>
                <div className="flex justify-between mt-2">
                    <span>Pulang:</span>
                    <span>{attendanceStatus?.attendance?.clock_out || '--:--'}</span>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;