"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { AlertTriangle } from "lucide-react";
import { SafetyData } from "../types";

export default function DisplayBoard() {
    const [days, setDays] = useState<number>(0);
    const [startDateMs, setStartDateMs] = useState<number | null>(null);
    const [now, setNow] = useState<Date | null>(null);

    const dbRef = ref(db, "safety_board/imaschine_lab/current");

    // # Mengambil Data Realtime dan Set Jam
    useEffect(() => {
        setNow(new Date());

        const unsubData = onValue(dbRef, (snapshot) => {
            const data = snapshot.val() as SafetyData | null;
            if (data) {
                setStartDateMs(data.startDate);
                const current = new Date().getTime();
                const diff = Math.max(0, current - data.startDate);
                setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
            }
        });

        const interval = setInterval(() => {
            setNow(new Date());
            setStartDateMs((prevStart) => {
                if (prevStart) {
                    const diff = Math.max(0, new Date().getTime() - prevStart);
                    setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
                }
                return prevStart;
            });
        }, 1000);

        return () => {
            unsubData();
            clearInterval(interval);
        };
    }, []);

    const formatTime = now
        ? now.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
          })
        : "00:00:00";

    const formatDay = now
        ? now.toLocaleDateString("id-ID", { weekday: "long" })
        : "Hari";

    const formatDate = now
        ? now.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "Tanggal";

    const formattedStartDate = startDateMs
        ? new Date(startDateMs).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "...";

    return (
        <div className="font-chakra min-h-screen flex flex-col justify-between p-3 sm:p-4 md:p-6 lg:p-8 bg-[#0a0e17] text-white border-2 sm:border-4 border-[#00ff88] shadow-[inset_0_0_50px_rgba(0,255,136,0.15)] overflow-hidden">
            {/* ===== HEADER ===== */}
            <header className="flex flex-col xl:flex-row justify-between items-center border-b-2 border-slate-800 pb-3 sm:pb-4 gap-4 xl:gap-4">
                {/* Logo + Judul */}
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full xl:w-auto justify-center xl:justify-start">
                    {/* Logo I Maschine */}
                    <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 relative flex-shrink-0">
                        <img
                            src="/logo-imaschine.png"
                            alt="Logo I Maschine Lab"
                            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        />
                    </div>

                    {/* Teks Judul */}
                    <div className="text-center px-1 sm:px-2 md:px-4">
                        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-widest text-white leading-tight">
                            I Maschine Lab
                        </h1>
                        <h2 className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl tracking-wider mt-1">
                            Politeknik Manufaktur Bandung
                        </h2>
                    </div>

                    {/* Logo K3 */}
                    <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 relative flex-shrink-0">
                        <img
                            src="/logo-k3.webp"
                            alt="Logo K3"
                            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        />
                    </div>
                </div>

                {/* Jam & Tanggal */}
                <div className="text-center xl:text-right bg-slate-900/50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-slate-800 shadow-inner w-full xl:w-auto">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#00ff88] tracking-widest mb-1 drop-shadow-md">
                        {formatTime} WIB
                    </div>
                    <div className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 font-semibold uppercase tracking-wider">
                        {formatDay}, {formatDate}
                    </div>
                </div>
            </header>

            {/* ===== MAIN ===== */}
            <main className="flex-grow flex flex-col justify-center items-center text-center my-2 sm:my-4">
                <h3 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-300 font-semibold mb-2">
                    Bekerja Tanpa Kecelakaan
                </h3>

                <div className="text-[18vh] sm:text-[22vh] md:text-[28vh] lg:text-[35vh] font-bold leading-none text-[#00ff88] drop-shadow-[0_0_50px_rgba(0,255,136,0.6)] my-1 sm:my-2">
                    {days}
                </div>

                <div className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl uppercase tracking-[0.2em] text-slate-400 font-semibold mb-4 sm:mb-8">
                    Hari
                </div>

                <div className="bg-slate-900/80 px-4 sm:px-6 py-2 rounded-full border border-slate-700 text-slate-300 text-base sm:text-lg md:text-xl tracking-wider inline-flex items-center gap-2 mt-2 sm:mt-4 flex-wrap justify-center">
                    <span className="text-slate-400">Mulai sejak:</span>
                    <strong className="text-[#00ff88]">
                        {formattedStartDate}
                    </strong>
                </div>
            </main>

            {/* ===== FOOTER ===== */}
            <footer className="flex justify-center items-center border-t border-slate-800 pt-4 sm:pt-6 mt-2">
                <div className="flex items-center justify-center gap-2 sm:gap-3 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] font-bold text-base sm:text-xl md:text-2xl lg:text-4xl uppercase tracking-wider sm:tracking-widest text-center w-full">
                    <AlertTriangle
                        size={20}
                        className="animate-pulse flex-shrink-0 sm:w-7 sm:h-7 md:w-9 md:h-9"
                    />
                    <span className="text-center leading-tight">
                        UTAMAKAN KESELAMATAN DAN KESEHATAN KERJA
                    </span>
                    <AlertTriangle
                        size={20}
                        className="animate-pulse flex-shrink-0 sm:w-7 sm:h-7 md:w-9 md:h-9"
                    />
                </div>
            </footer>
        </div>
    );
}
