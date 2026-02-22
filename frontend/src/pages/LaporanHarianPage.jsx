import React from 'react';
import { Layout, DataTable } from '../components';
import styles from './LaporanHarianPage.module.css';

const LaporanHarianPage = () => {
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Laporan Harian</h1>
        <p>// Data konsumsi hari ini</p>
      </div>
      <div className={styles.contentPad}>
        <DataTable />
      </div>
    </Layout>
  );
};

export default LaporanHarianPage;