import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HistoryRecord } from "../../../types";

const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0);
            }
            const dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
        };
        img.onerror = (error) => reject(error);
        img.src = url;
    });
};

export const generateExcel = (history: HistoryRecord[]) => {
    const worksheetData = history.map((row, index) => {
        const dateObj = new Date(row.resetDate);
        return {
            No: index + 1,
            "Tanggal Insiden": dateObj.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            Waktu:
                dateObj.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                }) + " WIB",
            "Capaian Hari Aman": `${row.daysAchieved} Hari`,
            "Rincian / Penyebab Insiden": row.notes,
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    worksheet["!cols"] = [
        { wch: 5 },
        { wch: 30 },
        { wch: 15 },
        { wch: 20 },
        { wch: 60 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log Laporan K3");

    XLSX.writeFile(
        workbook,
        `Laporan_K3_IMaschine_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
};

export const generatePDF = async (history: HistoryRecord[]) => {
    const doc = new jsPDF("landscape");

    try {
        const logoImaschine = await getBase64ImageFromURL(
            "/logo-imaschine.png",
        );
        const logoK3 = await getBase64ImageFromURL("/logo-k3.webp");

        doc.addImage(logoImaschine, "PNG", 14, 10, 24, 24);
        doc.addImage(logoK3, "PNG", 259, 10, 24, 24);
    } catch (error) {
        console.warn(error);
    }

    const centerX = 297 / 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text("Laporan Riwayat Insiden K3", centerX, 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("I Maschine Lab - Politeknik Manufaktur Bandung", centerX, 25, {
        align: "center",
    });

    doc.setFontSize(9);
    doc.text(
        `Dicetak pada: ${new Date().toLocaleString("id-ID")}`,
        centerX,
        31,
        { align: "center" },
    );

    const tableData = history.map((row, index) => {
        const dateObj = new Date(row.resetDate);
        return [
            index + 1,
            dateObj.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            dateObj.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            }) + " WIB",
            `${row.daysAchieved} Hari`,
            row.notes,
        ];
    });

    autoTable(doc, {
        startY: 42,
        head: [
            [
                "No",
                "Tanggal Insiden",
                "Waktu",
                "Capaian Terakhir",
                "Rincian / Penyebab Insiden",
            ],
        ],
        body: tableData,
        theme: "striped",
        styles: {
            font: "helvetica",
            fontSize: 10,
            cellPadding: 6,
            textColor: [51, 65, 85],
        },
        headStyles: {
            fillColor: [15, 23, 42],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
        },
        columnStyles: {
            0: { halign: "center", cellWidth: 15 },
            1: { cellWidth: 45 },
            2: { halign: "center", cellWidth: 35 },
            3: { halign: "center", cellWidth: 35 },
            4: { cellWidth: "auto" },
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
    });

    doc.save(
        `Laporan_K3_IMaschine_${new Date().toISOString().split("T")[0]}.pdf`,
    );
};
