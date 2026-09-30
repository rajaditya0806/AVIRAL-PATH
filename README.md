# 🚗 Aviral Path — AI-ML based Intelligent Dead Reckoning system for seamless navigation

> **Autonomous Navigation Telemetry & IMU Dead Reckoning System**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aviral--path.vercel.app-emerald?style=for-the-badge&logo=vercel)](https://aviral-path.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)]()
[![TensorFlow](https://img.shields.io/badge/TensorFlow-Keras-orange?style=for-the-badge&logo=tensorflow)]()
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)

---

## 🌟 Live Interactive Dashboard for Judges

🌐 **Live Hosted Link:**  
👉 **[https://aviral-path.vercel.app](https://aviral-path.vercel.app)**

*The live dashboard allows judges to visually inspect live dead reckoning trajectory estimations, trigger GNSS blackout / tunnel simulations, load custom IO-VNBD dataset CSV files, and view real-time sensor telemetry.*

---

## 📌 Table of Contents

- [Live Interactive Dashboard](#-live-interactive-dashboard-for-judges)
- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Why This Matters](#-why-this-matters)
- [Dataset — IO-VNBD](#-dataset--io-vnbd)
- [Approach & Methodology](#-approach--methodology)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Team](#-team)

---

## 🔍 Overview

**Aviral Path** is an AI system designed to solve one of the core challenges in autonomous and connected vehicle navigation: **estimating a vehicle's real-time position when GPS signal is unavailable or unreliable** — for example, in tunnels, dense urban canyons, underground parking structures, or during deliberate GPS jamming/spoofing.

Navigation apps freeze or jump when GPS drops — in tunnels, multi-level car parks, urban canyons — and most Indian vehicles have only the driver's smartphone, not a factory inertial system wired to the wheels. The ask is an AI dead-reckoning system that uses the phone's own accelerometer and gyroscope to keep tracking position through a GPS blackout, despite the noise of a phone on a dashboard.

We approach this as an **inertial navigation (dead reckoning)** problem, powered by a deep learning model trained on the **IO-VNBD (Inertial and Odometry Vehicle Navigation Benchmark Dataset)**. Instead of relying on classical physics-only dead reckoning, we use an **LSTM (Long Short-Term Memory) neural network** to learn vehicle dynamics directly from raw sensor data — accelerometer, gyroscope, and wheel-speed signals — and predict the vehicle's velocity, which is then integrated into a full 2D trajectory.

---

## 🎯 Problem Statement

> *"AI-ML based Intelligent Dead Reckoning system for seamless navigation"*

Conventional navigation applications (like GPS/GNSS) often freeze, jump, or lose connection entirely when a vehicle enters signal-blocked environments such as tunnels, deep valleys, dense forests, or urban canyons. Since most standard Indian commercial vehicles rely solely on the driver’s smartphone rather than high-end, factory-installed wheel-based inertial systems, they experience absolute navigation blackouts.

The goal of this challenge is to build an AI/ML-powered dead reckoning module. The software must use **only a standard smartphone's built-in MEMS accelerometer and gyroscope sensors** to accurately estimate and track the vehicle's position during a GPS outage.

### Key Features

* **Smartphone-Only Dead Reckoning** — Estimates vehicle position during GPS outages using only internal MEMS accelerometers and gyroscopes.
* **Bias & Drift Correction** — Machine-learning techniques correct sensor biases, rotational drift, and vibration noise.
* **Benchmark Validated** — Trained and evaluated on the **IO-VNBD** benchmark dataset to ensure realistic motion modeling.
* **Seamless GPS Transitions** — Automatically detects signal loss to trigger dead reckoning, then cleanly blends position estimates back to GPS-aided tracking.
* **Robust Outage Performance** — Bounds position drift to maintain usable accuracy across blackouts lasting from tens of seconds up to a few minutes.

---

## 💡 Why This Matters

GPS is the backbone of modern vehicle navigation — but it is not always available or trustworthy:

- **Signal blockage**: tunnels, underground structures, dense urban high-rises ("urban canyon" effect)
- **Jamming & spoofing**: security threats to GPS-dependent systems
- **Multipath errors**: reflected signals in cities that corrupt position accuracy
- **Rural/remote gaps**: inconsistent satellite coverage in certain terrains

---

## 📊 Dataset — IO-VNBD

**IO-VNBD (Inertial and Odometry Vehicle Navigation Benchmark Dataset)** is a real-world driving dataset combining:

- GPS-derived ground truth (latitude, longitude, height, heading, velocity)
- Inertial Measurement Unit (IMU) data (longitudinal/lateral acceleration, yaw rate)
- Vehicle CAN-bus data (wheel speeds, steering angle, gear, throttle, brake)

---

## 📁 Repository Structure

```
intelligent-dead-reckoning/
├── dashboard/               # Interactive React + Vite Web Dashboard
│   ├── frontend/            # React Leaflet & Telemetry Components
│   └── backend/             # Python FastAPI Dead Reckoning Engine
├── IO-VNBD/                 # Dataset benchmarks
├── IO_VNBD_ML_Master.ipynb  # Main ML model training & evaluation notebook
└── README.md
```

---

## 👥 Team — Aviral Path

| Name | Role | GitHub |
|---|---|---|
| Aditya Raj | Machine Learning Developer | [@rajaditya0806](https://github.com/rajaditya0806) |
| Anushka | Full-Stack Developer | [@Anushkaa64](https://github.com/Anushkaa64) |
| Jaanvi Batra | PPT Specialist | `[GitHub link]` |
| Raju Gupta | Front-End Lead | [@rajugupta40110-hue](https://github.com/rajugupta40110-hue) |
| Harsh Garg | Core Contributor | [@harshgarg5107](https://github.com/harshgarg5107) |
| Mann Goswami | Core Contributor | [@manngoswami16-sketch](https://github.com/manngoswami16-sketch) |

---

<p align="center">Built with ⚙️ and 🧠 by <b>Team Aviral Path</b></p>
