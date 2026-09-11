'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface SafetyData {
  startDate: string;
  lastAccident: string | null;
  safeDays: number;
}

interface IncidentLog {
  id: string;
  date: string;
  type: string;
  note: string;
  createdAt: string;
}

function calculateSafeDays(startDate: string, currentDate: Date) {
  const [year, month, day] = startDate.split('-').map(Number);
  const startDay = Date.UTC(year, month - 1, day);
  const currentDay = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  return Math.max(0, Math.floor((currentDay - startDay) / (1000 * 60 * 60 * 24)));
}

export default function DisplayBoard() {
  const [safety, setSafety] = useState<SafetyData | null>(null);
  const [logs, setLogs] = useState<IncidentLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Realtime Clock State
  const [now, setNow] = useState<Date | null>(null);

  // Modal States
  const [showCalibrateModal, setShowCalibrateModal] = useState<boolean>(false);
  const [showAccidentModal, setShowAccidentModal] = useState<boolean>(false);

  // Form Inputs
  const [pin, setPin] = useState<string>('');
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [accidentNote, setAccidentNote] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch Data dari API Neon Postgres
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/safety', { cache: 'no-store' });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal mengambil data keselamatan.');
      }

      setSafety(result.data);

      // Fetch Incident Logs
      const logsRes = await fetch('/api/safety/logs');
      const logsResult = await logsRes.json();
      if (logsRes.ok && logsResult.success) {
        setLogs(logsResult.data);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNow(new Date());
    fetchData();

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format Waktu & Tanggal (Indonesian Locale)
  const formatTime = now
    ? now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '00:00:00';

  const formatDay = now
    ? now.toLocaleDateString('id-ID', { weekday: 'long' })
    : 'Hari';

  const formatDate = now
    ? now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Tanggal';

  const formattedStartDate = safety?.startDate
    ? new Date(safety.startDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '...';

  const displayedSafeDays = safety && now
    ? calculateSafeDays(safety.startDate, now)
    : safety?.safeDays ?? 0;

  // Handle Kalibrasi
  const handleCalibrate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError(null);

    try {
      const res = await fetch('/api/safety/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: newStartDate, pin }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Kalibrasi gagal. Periksa PIN Anda.');
      }

      setSafety(result.data);
      setShowCalibrateModal(false);
      setPin('');
      setNewStartDate('');
      fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Deklarasi Kecelakaan
  const handleDeclareAccident = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError(null);

    try {
      const res = await fetch('/api/safety/accident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: accidentNote, pin }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal mencatat insiden. Periksa PIN Anda.');
      }

      setSafety(result.data);
      setShowAccidentModal(false);
      setPin('');
      setAccidentNote('');
      fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-3 sm:p-4 md:p-6 lg:p-8 bg-[#0a0e17] text-white border-2 sm:border-4 border-[#00ff88] shadow-[inset_0_0_50px_rgba(0,255,136,0.15)] overflow-x-hidden overflow-y-auto font-sans">
      {/* ===== HEADER ===== */}
      <header className="flex flex-col xl:flex-row justify-between items-center border-b-2 border-slate-800 pb-3 sm:pb-4 gap-4 xl:gap-4">
        {/* Logo + Judul */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full xl:w-auto justify-center xl:justify-start">
          <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 relative flex-shrink-0">
            <img
              src="/logo-imaschine.png"
              alt="Logo I Maschine Lab"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            />
          </div>

          <div className="text-center px-1 sm:px-2 md:px-4">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-widest text-white leading-tight">
              I MASCHINE LAB
            </h1>
            <h2 className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl tracking-wider mt-1">
              Politeknik Manufaktur Bandung
            </h2>
          </div>

          <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 relative flex-shrink-0">
            <img
              src="/logo-k3.webp"
              alt="Logo K3"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            />
          </div>
        </div>

        {/* Jam & Tanggal */}
        <div className="text-center xl:text-right bg-slate-900/50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-slate-800 shadow-inner w-full xl:w-auto">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#00ff88] tracking-widest mb-1 drop-shadow-md font-mono">
            {formatTime} WIB
          </div>
          <div className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 font-semibold uppercase tracking-wider">
            {formatDay}, {formatDate}
          </div>
        </div>
      </header>

      {/* ===== MAIN DISPLAY ===== */}
      <main className="flex-grow flex flex-col justify-center items-center text-center my-4 sm:my-6 min-h-0">
        {error && (
          <div className="mb-4 bg-rose-950/80 border border-rose-600 text-rose-200 px-6 py-3 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        <h3 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-300 font-semibold mb-2">
          BEKERJA TANPA KECELAKAAN
        </h3>

        {/* Big Counter Display */}
        <div className="text-[clamp(6rem,20vw,18rem)] max-w-full font-black leading-[0.85] text-[#00ff88] drop-shadow-[0_0_50px_rgba(0,255,136,0.6)] my-2 font-mono">
          {loading ? '---' : displayedSafeDays}
        </div>

        <div className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400 font-semibold mb-4 sm:mb-6">
          HARI
        </div>

        <div className="bg-slate-900/80 px-4 sm:px-6 py-2 rounded-full border border-slate-700 text-slate-300 text-base sm:text-lg md:text-xl tracking-wider inline-flex items-center gap-2 mt-2 flex-wrap justify-center">
          <span className="text-slate-400">Mulai sejak:</span>
          <strong className="text-[#00ff88] font-mono">
            {formattedStartDate}
          </strong>
        </div>

        {/* Tombol Kontrol Manajer */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 relative z-10">
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setShowCalibrateModal(true);
            }}
            className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-medium px-5 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer text-sm shadow-md active:scale-95"
          >
            ⚙️ Kalibrasi Tanggal
          </button>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setShowAccidentModal(true);
            }}
            className="bg-rose-900/80 hover:bg-rose-800 text-rose-100 font-semibold px-5 py-2.5 rounded-xl border border-rose-700 transition cursor-pointer text-sm shadow-md active:scale-95"
          >
            🚨 Deklarasi Kecelakaan
          </button>
        </div>
      </main>

      {/* ===== LOGS SECTION ===== */}
      {logs.length > 0 && (
        <section className="my-4 max-w-5xl mx-auto w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h4 className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider text-left">
            📋 Riwayat Insiden Terakhir
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase">
                <tr>
                  <th className="p-2">Tanggal</th>
                  <th className="p-2">Tipe</th>
                  <th className="p-2">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.slice(0, 3).map((log) => (
                  <tr key={log.id}>
                    <td className="p-2 font-mono text-rose-400 font-semibold">{log.date}</td>
                    <td className="p-2">
                      <span className="bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {log.type}
                      </span>
                    </td>
                    <td className="p-2">{log.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="flex justify-center items-center border-t border-slate-800 pt-4 mt-2">
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] font-bold text-base sm:text-xl md:text-2xl lg:text-3xl uppercase tracking-wider sm:tracking-widest text-center w-full">
          <AlertTriangle
            size={24}
            className="animate-pulse flex-shrink-0 sm:w-7 sm:h-7 md:w-8 md:h-8"
          />
          <span className="text-center leading-tight">
            UTAMAKAN KESELAMATAN DAN KESEHATAN KERJA
          </span>
          <AlertTriangle
            size={24}
            className="animate-pulse flex-shrink-0 sm:w-7 sm:h-7 md:w-8 md:h-8"
          />
        </div>
      </footer>

      {/* ===== MODAL KALIBRASI ===== */}
      {showCalibrateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-[#00ff88]/50 rounded-2xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(0,255,136,0.2)] space-y-4 text-left">
            <h3 className="text-lg font-bold text-[#00ff88]">⚙️ Kalibrasi Tanggal Mulai</h3>
            {formError && (
              <div className="bg-rose-950/80 border border-rose-700 text-rose-200 text-xs p-3 rounded-lg">
                {formError}
              </div>
            )}
            <form onSubmit={handleCalibrate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Tanggal Mulai Baru
                </label>
                <input
                  type="date"
                  required
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-[#00ff88] text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  PIN Keamanan Manajer
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-[#00ff88] text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCalibrateModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[#00ff88] hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm transition disabled:opacity-50"
                >
                  {actionLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL DEKLARASI KECELAKAAN ===== */}
      {showAccidentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(244,63,94,0.2)] space-y-4 text-left">
            <h3 className="text-lg font-bold text-rose-400">🚨 Deklarasi Kecelakaan Kerja</h3>
            <p className="text-xs text-slate-400">
              Aksi ini akan meriset angka hari aman kembali ke angka 0 dan mencatat tanggal kecelakaan.
            </p>
            {formError && (
              <div className="bg-rose-950/80 border border-rose-700 text-rose-200 text-xs p-3 rounded-lg">
                {formError}
              </div>
            )}
            <form onSubmit={handleDeclareAccident} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Catatan Insiden / Keterangan
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tuliskan lokasi / deskripsi singkat insiden..."
                  value={accidentNote}
                  onChange={(e) => setAccidentNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-rose-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  PIN Keamanan Manajer
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-rose-500 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAccidentModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2 rounded-xl text-sm transition disabled:opacity-50"
                >
                  {actionLoading ? 'Proses Reset...' : 'Riset Counter Hari'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}