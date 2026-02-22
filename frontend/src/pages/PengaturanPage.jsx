import React from 'react';
import { Layout } from '../components';
import styles from './PengaturanPage.module.css';

const PengaturanPage = () => {
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Pengaturan</h1>
        <p>// Konfigurasi sistem monitoring</p>
      </div>
      
      <div className={styles.contentPad}>
        <div className={styles.settingsCard}>
          <h3>⚙️ Pengaturan Umum</h3>
          
          <div className={styles.settingItem}>
            <label>Refresh Interval</label>
            <select>
              <option>5 detik</option>
              <option>10 detik</option>
              <option>30 detik</option>
              <option>1 menit</option>
            </select>
          </div>
          
          <div className={styles.settingItem}>
            <label>Default Tampilan</label>
            <select>
              <option>Dashboard</option>
              <option>Data Rekaman</option>
              <option>Per Rumah</option>
            </select>
          </div>
          
          <div className={styles.settingItem}>
            <label>Notifikasi</label>
            <select>
              <option>Aktif</option>
              <option>Nonaktif</option>
            </select>
          </div>
        </div>
        
        <div className={styles.settingsCard}>
          <h3>🔐 Keamanan</h3>
          
          <div className={styles.settingItem}>
            <label>Session Timeout</label>
            <select>
              <option>15 menit</option>
              <option>30 menit</option>
              <option>1 jam</option>
            </select>
          </div>
          
          <div className={styles.settingItem}>
            <label>Autentikasi</label>
            <select>
              <option>Single User</option>
              <option>Multi User</option>
            </select>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PengaturanPage;