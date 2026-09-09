"use client";
import { Wifi, WifiOff, Activity } from "lucide-react";

interface DashboardHeaderProps {
    isConnected: boolean;
    currentDays: number;
}

export default function DashboardHeader({
    isConnected,
    currentDays,
}: DashboardHeaderProps) {
    return (
        <header className="mb-6 sm:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto min-w-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 flex-shrink-0">
                    <img
                        src="/logo-imaschine.png"
                        alt="Logo I Maschine"
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-slate-800 leading-tight break-words">
                            Dasbor Manajemen K3
                        </h1>

                        <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border w-fit ${isConnected ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200 animate-pulse"}`}
                        >
                            {isConnected ? (
                                <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            ) : (
                                <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            )}
                            {isConnected ? "Online" : "Offline"}
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium truncate sm:whitespace-normal">
                        I Maschine Lab • Politeknik Manufaktur Bandung
                    </p>
                </div>
            </div>

            <div className="w-full lg:w-auto bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-slate-100 flex items-center gap-3 sm:gap-4">
                <div className="bg-emerald-100 p-2.5 sm:p-3 rounded-lg text-emerald-600 flex-shrink-0">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                </div>

                <div className="min-w-0">
                    <div className="text-[10px] sm:text-xs md:text-sm text-slate-500 font-semibold uppercase tracking-wider">
                        Status Berjalan
                    </div>

                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                        {currentDays}
                        <span className="block sm:inline text-xs sm:text-sm md:text-base font-semibold text-slate-500 sm:ml-1">
                            Hari Aman
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
