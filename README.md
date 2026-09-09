# Safety Board I-Maschine

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Tech](https://img.shields.io/badge/stack-nextjs%20%7C%20firebase-blue)

## Overview

Safety Board Imaschine is a web-based dashboard for monitoring workplace safety performance.

Main feature:

* Bekerja Tanpa Kecelakaan (Safe Days Counter)
* PIN-based security system
* Built using Next.js and Firebase

---

## Features

### Safe Day Counter

Displays number of days without accidents.

Example:

Bekerja Tanpa Kecelakaan
0 Hari
Mulai sejak: 2026-05-01

---

### PIN Security

* Required for:
  * Calibration
  * Accident declaration
* Stored securely in Firestore

---

Aplikasi web dashboard digital display untuk memantau keselamatan kerja (Safe Days Counter) dan mencatat riwayat insiden K3 secara real-time. 

Dirancang khusus untuk I Maschine Lab — Politeknik Manufaktur Bandung dan dapat dijalankan dengan mudah di Vercel dengan Neon PostgreSQL.

## 🌟 Fitur Utama
* Kalkulasi Hari Aman Dinamis: Angka hari kerja aman dihitung secara otomatis berdasarkan selisih tanggal saat ini dengan tanggal mulai (startDate).
* Tampilan Industrial Display Board: UI futuristik khas papan skor digital laboratorium dengan jam real-time (WIB), indikator tanggal, counter neon raksasa, dan banner slogan K3.
* Kontrol Manajer Terproteksi PIN: Kalibrasi tanggal mulai dan deklarasi kecelakaan dapat dilakukan langsung di halaman utama melalui pop-up modal berproteksi PIN keamanan.
* Auto-Inisialisasi Database: Tabel database Neon (safety_main dan safety_logs) otomatis dibuat saat aplikasi pertama kali dijalankan.
* Log Riwayat Insiden K3: Mencatat tanggal, tipe, dan deskripsi insiden kecelakaan kerja secara otomatis ke database.

## 🛠️ Tech Stack
Framework: Next.js 16 (App Router, Turbopack, React 19)
Styling: Tailwind CSS
Database: Neon PostgreSQL (@neondatabase/serverless)
Icons: Lucide React
Deployment: Vercel

## 📊 Struktur Database (Neon Postgres)
Aplikasi ini menggunakan dua tabel sederhana dalam database Neon:

1. safety_main
Menyimpan konfigurasi utama status keselamatan kerja.

Kolom	Tipe Data	Keterangan
'''
id	INT (PK)	Fixed ID (1)
start_date	VARCHAR(10)	Tanggal mulai perhitungan (YYYY-MM-DD)
pin	VARCHAR(20)	PIN keamanan manajer (default: '1234')
last_accident	VARCHAR(10)	Tanggal kecelakaan terakhir (YYYY-MM-DD / null)
'''

2. safety_logs
Menyimpan riwayat dan catatan kecelakaan kerja.

Kolom	Tipe Data	Keterangan
'''
id	SERIAL (PK)	Auto increment ID
date	VARCHAR(10)	Tanggal kejadian (YYYY-MM-DD)
type	VARCHAR(20)	Tipe insiden (ACCIDENT, NEAR_MISS, dll.)
note	TEXT	Catatan / deskripsi lokasi insiden
created_at	TIMESTAMP	Waktu pembuatan log
'''

## ⚙️ Variabel Lingkungan (Environment Variables)
Buat file .env.local di root direktori proyek Anda dan tambahkan kredensial Neon Postgres:

'''
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-raspy-art-azcqx23t-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
'''

## 🚀 Panduan Memulai di Lokal (Local Development)
1. Clone Repositori
git clone https://github.com/nj-ramadhan/safety-counter.git
cd safety-counter

2. Install Dependencies
npm install

3. Konfigurasi Environment Variable
Salin string koneksi database Neon Anda ke file .env.local.

4. Jalankan Development Server
npm run dev
Buka http://localhost:3000 di browser Anda.

## ☁️ Panduan Deploy ke Vercel
Push kode terbaru ke GitHub:
'''
git add .
git commit -m "Refactor database ke Neon Postgres & update README"
git push origin main
'''

* Buka Vercel Dashboard dan buat New Project.
* Hubungkan repositori GitHub safety-counter.
* Pada bagian Environment Variables, tambahkan DATABASE_URL berisi string koneksi Neon Postgres Anda.
* Klik Deploy.

## 🔐 Keamanan PIN
PIN bawaan untuk kalibrasi dan deklarasi kecelakaan adalah 1234. PIN dapat diubah langsung melalui SQL Editor di konsol Neon:
'''
UPDATE safety_main SET pin = 'PIN_BARU_ANDA' WHERE id = 1;
'''

## 📜 Lisensi & Kredit
Dikembangkan untuk I Maschine Lab — Politeknik Manufaktur Bandung.