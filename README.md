# Safety Board Imaschine

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

### Dashboard

<img src="https://github.com/user-attachments/assets/a058ff62-bcc0-40b8-9ee6-a8612162f445" width="600" />

* Logo I Maschine
* Dasbor Manajemen K3
* Status:

  * Online
  * Berjalan
* Info:

  * I Maschine Lab • Politeknik Manufaktur Bandung
  * 0 Hari Aman

---

### Calibration System

<img src="https://github.com/user-attachments/assets/2813ef81-4018-4bfb-8deb-f188963fa3da" width="600" />

#### Manual Days Input

* Set safe days manually

#### Set Start Date

* System calculates automatically based on date

---

### Accident Declaration

* Reset safe days to 0
* Set start date to current date
* Save incident to log

---

### Incident Log

* Stores all accident records
* Persistent in Firestore

---

### Export Feature

* Export data to PDF
* Export data to Excel

---

## Tech Stack

* Next.js
* Firebase (Firestore, Authentication)
* Tailwind CSS

---

## Firebase Setup

### 1. Create Firebase Project

* Open [https://console.firebase.google.com](https://console.firebase.google.com)
* Click Add Project
* Name: safety-board-imaschine
* Disable Analytics (optional)

After creation:
Hello, Diaz
Welcome back to Firebase!

---

### 2. Register Web App

* Click Web Icon
* App name: safety-board-web

Firebase will generate config:

```js
const firebaseConfig = {
  apiKey: "xxx",
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "xxx",
  appId: "xxx"
}
```

---

### 3. Enable Firestore

* Go to Firestore Database
* Click Create Database
* Select Production Mode
* Choose region: asia-southeast1

---

### 4. Environment Variables

File: .env.local

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

---

### 5. Firebase Initialization

File: src/lib/firebase.ts

```ts
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
```

---

### 6. Firestore Structure

Collection: safety

Document: main

```json
{
  "startDate": "2026-05-01",
  "safeDays": 0,
  "lastAccident": null,
  "pin": "1234"
}
```

Collection: logs

```json
{
  "date": "2026-05-20",
  "type": "ACCIDENT",
  "note": "Worker injury"
}
```

---

### 7. Security Rules

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /safety/main {
      allow read: if true;
      allow write: if request.resource.data.pin == resource.data.pin;
    }

    match /logs/{id} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

---

## Deployment (Vercel)

* Open [https://vercel.com](https://vercel.com)
* Go to Project Settings
* Open Environment Variables
* Add all Firebase variables

Keys:

NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

---

## Environment Variables Lifetime

* Firebase config: no expiration
* Vercel environment variables:

  * active until deleted
  * require redeploy after change
* .env.local:

  * local only
  * no expiration

Important:

* NEXT_PUBLIC variables are exposed to frontend
* Do not store sensitive secrets

---

## Run Project

```bash
npm install
npm run dev
```

Open:
[http://localhost:3000](http://localhost:3000)

---

## Status

This project is active and can be extended.

---

## License

Free to use for educational and internal industrial monitoring purposes.
