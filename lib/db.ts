import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface SafetyMainData {
  startDate: string;
  pin: string;
  lastAccident: string | null;
  safeDays: number;
}

export interface IncidentLog {
  id: string;
  date: string;
  type: string;
  note: string;
  createdAt: string;
}

/**
 * Inisialisasi Tabel Otomatis jika belum ada di Neon
 */
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS safety_main (
      id INT PRIMARY KEY DEFAULT 1,
      start_date VARCHAR(10) NOT NULL,
      pin VARCHAR(20) NOT NULL DEFAULT '1234',
      last_accident VARCHAR(10)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS safety_logs (
      id SERIAL PRIMARY KEY,
      date VARCHAR(10) NOT NULL,
      type VARCHAR(20) NOT NULL,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const rows = await sql`SELECT * FROM safety_main WHERE id = 1`;
  if (rows.length === 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    await sql`INSERT INTO safety_main (id, start_date, pin) VALUES (1, ${todayStr}, '1234')`;
  }
}

/**
 * Mengambil Status K3 & Menghitung Hari Aman secara Dinamis
 */
export async function getSafetyStatus(): Promise<SafetyMainData> {
  await initDb();
  const rows = await sql`SELECT * FROM safety_main WHERE id = 1`;
  const main = rows[0];

  const startDate = new Date(main.start_date);
  const today = new Date();

  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - startDate.getTime();
  const safeDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  return {
    startDate: main.start_date,
    pin: main.pin,
    lastAccident: main.last_accident || null,
    safeDays,
  };
}

/**
 * Kalibrasi Tanggal Mulai
 */
export async function calibrateSafetyData(newStartDate: string, inputPin: string) {
  const current = await getSafetyStatus();
  if (inputPin !== current.pin) {
    throw new Error('PIN Keamanan Salah');
  }

  await sql`UPDATE safety_main SET start_date = ${newStartDate} WHERE id = 1`;
  return getSafetyStatus();
}

/**
 * Deklarasi Kecelakaan Kerja
 */
export async function declareAccident(note: string, inputPin: string) {
  const current = await getSafetyStatus();
  if (inputPin !== current.pin) {
    throw new Error('PIN Keamanan Salah');
  }

  const todayStr = new Date().toISOString().split('T')[0];
  await sql`UPDATE safety_main SET start_date = ${todayStr}, last_accident = ${todayStr} WHERE id = 1`;

  await sql`
    INSERT INTO safety_logs (date, type, note)
    VALUES (${todayStr}, 'ACCIDENT', ${note || 'Kecelakaan Kerja Dicatat'})
  `;

  return getSafetyStatus();
}

/**
 * Ambil Riwayat Insiden K3
 */
export async function getIncidentLogs(): Promise<IncidentLog[]> {
  await initDb();
  const rows = await sql`SELECT id, date, type, note, created_at FROM safety_logs ORDER BY id DESC`;
  return rows.map((r: any) => ({
    id: String(r.id),
    date: r.date,
    type: r.type,
    note: r.note,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}