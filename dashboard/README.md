# 🚗 Aviral Path — Live Telemetry & Navigation Dashboard

> **Interactive Real-Time Vehicle Positioning & GNSS Outage Simulation Engine**

[![Live Dashboard](https://img.shields.io/badge/Live%20Demo-aviral--path.vercel.app-emerald?style=for-the-badge&logo=vercel)](https://aviral-path.vercel.app)

---

## 🌐 Live Hosted Link for Judges

👉 **[https://aviral-path.vercel.app](https://aviral-path.vercel.app)**

---

## 📌 Dashboard Overview

The **Aviral Path Web Dashboard** provides real-time visualization of vehicle dead reckoning trajectory estimations, comparing AI-estimated positioning against actual GNSS ground truth data.

### Features
- 🗺️ **Interactive OpenStreetMap**: Real-time trajectory plotting using Leaflet maps.
- ⚡ **GNSS Blackout Simulator**: Toggle `KILL GPS` to simulate tunnel signal loss & test AI fallback.
- 📊 **Telemetry Metrics & Waveforms**: High-frequency sensor sparklines (Accelerometer, Gyroscope, Velocity, Drift).
- 📁 **Benchmark & Custom Datasets**: Switch between pre-loaded Indian benchmark corridors or upload custom IO-VNBD CSV files.

---

## 📁 Dashboard Structure

```
dashboard/
├── frontend/    # React + Vite + TailwindCSS + Leaflet web UI
└── backend/     # Python FastAPI + EKF Dead Reckoning simulation engine
```

---

## 🚀 Quick Run (Local Development)

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to launch locally.
