"use client";

import { useState } from "react";
import {
    CalendarDays,
    ShieldCheck,
    Trash2,
    Edit,
    X,
    Save,
    FileText,
    FileSpreadsheet,
} from "lucide-react";
import Swal from "sweetalert2";
import { ref, remove, update } from "firebase/database";
import { db } from "../../../lib/firebase";
import { HistoryRecord } from "../../../types";
import { generateExcel, generatePDF } from "../utils/exportGenerator";

interface HistoryTableProps {
    isConnected: boolean;
    history: HistoryRecord[];
}

export default function HistoryTable({
    isConnected,
    history,
}: HistoryTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNotes, setEditNotes] = useState<string>("");
    const [editDaysAchieved, setEditDaysAchieved] = useState<number | string>(
        "",
    );
    const [editDate, setEditDate] = useState<string>("");
    const [editTime, setEditTime] = useState<string>("");

    const onExportExcel = () => {
        if (history.length === 0)
            return Swal.fire(
                "Log Kosong",
                "Belum ada data history untuk diekspor.",
                "info",
            );
        generateExcel(history);
    };

    const onExportPDF = async () => {
        if (history.length === 0)
            return Swal.fire(
                "Log Kosong",
                "Belum ada data history untuk dicetak.",
                "info",
            );
        Swal.fire({
            title: "Menyusun Laporan...",
            text: "Merapikan tabel dan logo...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        try {
            await generatePDF(history);
            Swal.close();
        } catch {
            Swal.fire("Error", "Gagal mencetak dokumen PDF.", "error");
        }
    };

    const startEditing = (record: HistoryRecord) => {
        setEditingId(record.id || "");
        setEditNotes(record.notes);
        setEditDaysAchieved(record.daysAchieved);
        const dateObj = new Date(record.resetDate);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const hh = String(dateObj.getHours()).padStart(2, "0");
        const min = String(dateObj.getMinutes()).padStart(2, "0");
        setEditDate(`${yyyy}-${mm}-${dd}`);
        setEditTime(`${hh}:${min}`);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditNotes("");
        setEditDaysAchieved("");
        setEditDate("");
        setEditTime("");
    };

    const saveEditHistory = (id: string | undefined) => {
        if (!isConnected)
            return Swal.fire(
                "Koneksi Terputus!",
                "Tidak dapat menyimpan data.",
                "error",
            );
        if (!id)
            return Swal.fire("Error!", "ID Rekaman tidak ditemukan.", "error");
        const days = Number(editDaysAchieved);
        if (editDaysAchieved === "" || days < 0)
            return Swal.fire(
                "Peringatan!",
                "Angka hari tidak valid!",
                "warning",
            );
        if (!editNotes.trim())
            return Swal.fire(
                "Peringatan!",
                "Catatan tidak boleh kosong!",
                "warning",
            );
        if (!editDate || !editTime)
            return Swal.fire(
                "Peringatan!",
                "Tanggal dan Jam harus diisi!",
                "warning",
            );
        const newResetDate = new Date(`${editDate}T${editTime}:00`).getTime();
        const specificRecordRef = ref(
            db,
            `safety_board/imaschine_lab/history/${id}`,
        );
        update(specificRecordRef, {
            resetDate: newResetDate,
            daysAchieved: days,
            notes: editNotes,
        })
            .then(() => {
                Swal.fire({
                    title: "Diperbarui!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
                cancelEditing();
            })
            .catch((err) => Swal.fire("Gagal!", err.message, "error"));
    };

    const handleDeleteHistory = (id: string | undefined) => {
        if (!isConnected)
            return Swal.fire(
                "Koneksi Terputus!",
                "Tidak dapat menghapus data.",
                "error",
            );
        if (!id)
            return Swal.fire("Error!", "ID Rekaman tidak ditemukan.", "error");
        Swal.fire({
            title: "Hapus Rekaman?",
            text: "Data riwayat ini akan dihapus secara permanen!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus!",
        }).then((result) => {
            if (result.isConfirmed) {
                const specificRecordRef = ref(
                    db,
                    `safety_board/imaschine_lab/history/${id}`,
                );
                remove(specificRecordRef)
                    .then(() =>
                        Swal.fire({
                            title: "Terhapus!",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                        }),
                    )
                    .catch((err) => Swal.fire("Gagal!", err.message, "error"));
            }
        });
    };

    const formatDate = (ts: number) =>
        new Date(ts).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const formatTime = (ts: number) =>
        new Date(ts).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* ===== HEADER ===== */}
            <div className="p-5 sm:p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                    <h3 className="text-base sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarDays
                            size={20}
                            className="text-emerald-500 flex-shrink-0 sm:w-6 sm:h-6"
                        />
                        Log Riwayat Insiden
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Daftar rekaman kecelakaan kerja yang telah terjadi.
                    </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                        onClick={onExportExcel}
                        className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold cursor-pointer hover:bg-emerald-100 active:scale-95 transition-all flex justify-center items-center gap-1.5 sm:gap-2 text-xs sm:text-sm border border-emerald-200"
                    >
                        <FileSpreadsheet size={16} className="flex-shrink-0" />{" "}
                        Excel
                    </button>
                    <button
                        onClick={onExportPDF}
                        className="flex-1 sm:flex-none bg-rose-50 text-rose-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold cursor-pointer hover:bg-rose-100 active:scale-95 transition-all flex justify-center items-center gap-1.5 sm:gap-2 text-xs sm:text-sm border border-rose-200"
                    >
                        <FileText size={16} className="flex-shrink-0" /> PDF
                    </button>
                </div>
            </div>

            {/* ===== EMPTY STATE ===== */}
            {history.length === 0 ? (
                <div className="text-center p-8 sm:p-12 text-slate-400">
                    <ShieldCheck
                        size={40}
                        className="mx-auto mb-3 text-emerald-200"
                    />
                    <p className="text-sm sm:text-base">
                        Belum ada rekaman insiden. Pertahankan performa
                        keselamatan ini!
                    </p>
                </div>
            ) : (
                <>
                    {/* ===== TABEL — tampil hanya di md+ ===== */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4 md:px-8 font-semibold">
                                        Waktu Kejadian
                                    </th>
                                    <th className="p-4 md:px-8 font-semibold">
                                        Capaian Terakhir
                                    </th>
                                    <th className="p-4 md:px-8 font-semibold">
                                        Rincian / Penyebab
                                    </th>
                                    <th className="p-4 md:px-8 font-semibold text-center w-24">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.map((record) => (
                                    <tr
                                        key={record.id}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        {/* Waktu */}
                                        <td className="p-4 md:px-8 text-slate-700 whitespace-nowrap align-top">
                                            {editingId === record.id ? (
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="date"
                                                        value={editDate}
                                                        onChange={(e) =>
                                                            setEditDate(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="border border-slate-300 p-2 rounded-lg w-full text-sm text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                                                    />
                                                    <input
                                                        type="time"
                                                        value={editTime}
                                                        onChange={(e) =>
                                                            setEditTime(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="border border-slate-300 p-2 rounded-lg w-full text-sm text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="font-semibold">
                                                        {formatDate(
                                                            record.resetDate,
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1">
                                                        Pukul{" "}
                                                        {formatTime(
                                                            record.resetDate,
                                                        )}{" "}
                                                        WIB
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                        {/* Capaian */}
                                        <td className="p-4 md:px-8 align-top">
                                            {editingId === record.id ? (
                                                <input
                                                    type="number"
                                                    value={editDaysAchieved}
                                                    onChange={(e) =>
                                                        setEditDaysAchieved(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border border-slate-300 p-2 rounded-lg w-24 text-sm text-slate-800 focus:outline-none focus:border-blue-500 cursor-text"
                                                />
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    {record.daysAchieved} Hari
                                                </span>
                                            )}
                                        </td>
                                        {/* Catatan */}
                                        <td className="p-4 md:px-8 text-sm text-slate-600 align-top">
                                            {editingId === record.id ? (
                                                <textarea
                                                    value={editNotes}
                                                    onChange={(e) =>
                                                        setEditNotes(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border border-slate-300 p-2 rounded-lg w-full text-sm text-slate-800 focus:outline-none focus:border-blue-500 resize-y min-h-[72px] cursor-text"
                                                />
                                            ) : (
                                                record.notes
                                            )}
                                        </td>
                                        {/* Aksi */}
                                        <td className="p-4 md:px-8 align-top">
                                            {editingId === record.id ? (
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() =>
                                                            saveEditHistory(
                                                                record.id,
                                                            )
                                                        }
                                                        className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                                                        title="Simpan"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="p-1.5 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                                                        title="Batal"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() =>
                                                            startEditing(record)
                                                        }
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit data"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteHistory(
                                                                record.id,
                                                            )
                                                        }
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Hapus data"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ===== CARD LIST — tampil hanya di bawah md ===== */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {history.map((record) => {
                            const isEditing = editingId === record.id;
                            return (
                                <div
                                    key={record.id}
                                    className="p-4 flex flex-col gap-3"
                                >
                                    {/* Baris atas: Tanggal + Badge + Aksi */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            {isEditing ? (
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="date"
                                                        value={editDate}
                                                        onChange={(e) =>
                                                            setEditDate(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="border border-slate-300 p-2 rounded-lg w-full text-sm text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                                                    />
                                                    <input
                                                        type="time"
                                                        value={editTime}
                                                        onChange={(e) =>
                                                            setEditTime(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="border border-slate-300 p-2 rounded-lg w-full text-sm text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="font-semibold text-slate-800 text-sm">
                                                        {formatDate(
                                                            record.resetDate,
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-0.5">
                                                        Pukul{" "}
                                                        {formatTime(
                                                            record.resetDate,
                                                        )}{" "}
                                                        WIB
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Aksi */}
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            saveEditHistory(
                                                                record.id,
                                                            )
                                                        }
                                                        className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                                                        title="Simpan"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="p-1.5 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                                                        title="Batal"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            startEditing(record)
                                                        }
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteHistory(
                                                                record.id,
                                                            )
                                                        }
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Badge capaian */}
                                    {isEditing ? (
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">
                                                Capaian Hari
                                            </label>
                                            <input
                                                type="number"
                                                value={editDaysAchieved}
                                                onChange={(e) =>
                                                    setEditDaysAchieved(
                                                        e.target.value,
                                                    )
                                                }
                                                className="border border-slate-300 p-2 rounded-lg w-full text-sm text-slate-800 focus:outline-none focus:border-blue-500 cursor-text"
                                            />
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                            {record.daysAchieved} Hari Aman
                                        </span>
                                    )}

                                    {/* Catatan */}
                                    {isEditing ? (
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">
                                                Rincian / Penyebab
                                            </label>
                                            <textarea
                                                value={editNotes}
                                                onChange={(e) =>
                                                    setEditNotes(e.target.value)
                                                }
                                                className="border border-slate-300 p-2 rounded-lg w-full text-sm text-slate-800 focus:outline-none focus:border-blue-500 resize-y min-h-[72px] cursor-text"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                            {record.notes}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
