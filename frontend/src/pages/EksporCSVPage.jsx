import React from 'react';
import { Layout, Button } from '../components';
import styles from './EksporCSVPage.module.css';

const EksporCSVPage = () => {
  const handleExport = (type) => {
    alert(`Fitur ekspor ${type} akan segera tersedia`);
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Ekspor Data</h1>
        <p>// Download data dalam format CSV</p>
      </div>
      <div className={styles.contentPad}>
        <div className={styles.exportGrid}>
          <div className={styles.exportCard}>
            <h3>📅 Data Harian</h3>
            <p>Ekspor data konsumsi per hari</p>
            <Button onClick={() => handleExport('harian')}>
              Download CSV
            </Button>
          </div>
          
          <div className={styles.exportCard}>
            <h3>📊 Data Mingguan</h3>
            <p>Ekspor data konsumsi per minggu</p>
            <Button onClick={() => handleExport('mingguan')}>
              Download CSV
            </Button>
          </div>
          
          <div className={styles.exportCard}>
            <h3>🏠 Data per Rumah</h3>
            <p>Ekspor data berdasarkan rumah</p>
            <Button onClick={() => handleExport('per rumah')}>
              Download CSV
            </Button>
          </div>
          
          <div className={styles.exportCard}>
            <h3>📈 Data Lengkap</h3>
            <p>Ekspor semua data konsumsi</p>
            <Button onClick={() => handleExport('lengkap')}>
              Download CSV
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EksporCSVPage;