# ⚡ Energy Monitoring System

Sistem **Cloud-Based Monitoring** untuk analisis konsumsi energi rumah tangga menggunakan dataset dari perusahaan tertentu. Dibangun dengan **Golang** pada sisi backend dan **React.js + TypeScript** pada sisi frontend.

## 🚀 Fitur Utama

- 📊 **Dashboard Interaktif** - Visualisasi konsumsi energi real-time dengan chart dan tabel
- 📁 **Upload Dataset** - Import data Excel/CSV langsung ke database
- 🏠 **Filter per Rumah** - Analisis konsumsi per kode rumah (RMH-01 s/d RMH-12)
- 📈 **Grafik Real-time** - Line chart, bar chart, dan heatmap untuk analisis pola
- 📤 **Ekspor Data** - Download data ke format CSV/Excel
- 🔄 **Auto Refresh** - Data update setiap 10-30 detik

## 🛠️ Tech Stack

### Backend
- **Go** (Golang) - Bahasa pemrograman utama
- **Gin Framework** - HTTP web framework
- **GORM** - ORM untuk database
- **PostgreSQL** - Database utama
- **JWT** - Autentikasi (opsional)

### Frontend
- **React 18** - Library UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Chart.js** - Visualisasi data
- **Axios** - HTTP client
- **React Router DOM** - Routing
- **CSS Modules** - Styling

## 📋 Prasyarat

Sebelum menjalankan project ini, pastikan Anda telah menginstall:

- **Go** (versi 1.19 atau lebih baru) - [Download](https://go.dev/dl/)
- **Node.js** (versi 18 atau lebih baru) - [Download](https://nodejs.org/)
- **PostgreSQL** (versi 14 atau lebih baru) - [Download](https://www.postgresql.org/download/)
- **Git** (opsional) - [Download](https://git-scm.com/download/win)

## 🔧 Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/username/energy-monitoring-system.git
cd energy-monitoring-system