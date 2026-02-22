import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import PerRumahPage from './pages/PerRumahPage';
import TrenKonsumsiPage from './pages/TrenKonsumsiPage';
import LaporanHarianPage from './pages/LaporanHarianPage';
import LaporanMingguanPage from './pages/LaporanMingguanPage';
import EksporCSVPage from './pages/EksporCSVPage';
import CloudStatusPage from './pages/CloudStatusPage';
import PengaturanPage from './pages/PengaturanPage';
import './styles/global.css';

// Import fonts
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=Sora:wght@300;400;500;600&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/data-rekaman" element={<UploadPage />} />
        <Route path="/per-rumah" element={<PerRumahPage />} />
        <Route path="/tren-konsumsi" element={<TrenKonsumsiPage />} />
        <Route path="/laporan/harian" element={<LaporanHarianPage />} />
        <Route path="/laporan/mingguan" element={<LaporanMingguanPage />} />
        <Route path="/laporan/ekspor" element={<EksporCSVPage />} />
        <Route path="/cloud-status" element={<CloudStatusPage />} />
        <Route path="/pengaturan" element={<PengaturanPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);