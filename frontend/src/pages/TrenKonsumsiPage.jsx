import React, { useState } from 'react';
import { Layout, LineChart } from '../components';
import styles from './TrenKonsumsiPage.module.css';

const TrenKonsumsiPage = () => {
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Tren Konsumsi</h1>
        <p>// Analisis pola konsumsi energi</p>
      </div>
      <div className={styles.contentPad}>
        <LineChart />
      </div>
    </Layout>
  );
};

export default TrenKonsumsiPage;