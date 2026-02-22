import React from 'react';
import { Layout } from '../components';
import styles from './LaporanMingguanPage.module.css';

const LaporanMingguanPage = () => {
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Laporan Mingguan</h1>
        <p>// Ringkasan konsumsi 7 hari terakhir</p>
      </div>
      <div className={styles.contentPad}>
        <div className={styles.placeholder}>
          📊 Grafik mingguan akan ditampilkan di sini
        </div>
      </div>
    </Layout>
  );
};

export default LaporanMingguanPage;