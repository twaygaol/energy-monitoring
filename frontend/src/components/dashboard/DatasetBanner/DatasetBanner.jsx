import React from 'react';
import styles from './DatasetBanner.module.css';

const DatasetBanner = () => {
  const tags = [
    'timestamp',
    'id_rumah',
    'konsumsi_kwh',
    'id_peralatan',
    'format: CSV / Excel / SQL',
    'time-series',
  ];

  return (
    <div className={styles.datasetBanner}>
      <div className={styles.icon}>🗄️</div>
      <div className={styles.text}>Dataset berbentuk data terstruktur dalam format
        <strong> Excel, CSV, atau database SQL</strong>, berisi data <em>time-series</em> dengan kolom-kolom seperti
        <strong> timestamp</strong> (waktu pencatatan), <strong>ID rumah</strong> (kode rumah tangga),
        <strong> nilai konsumsi daya</strong> (dalam watt atau kWh), dan identifikasi peralatan.
        <div className={styles.tags}>
          {tags.map((tag, index) => (
            <div key={index} className={styles.tag}>{tag}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatasetBanner;