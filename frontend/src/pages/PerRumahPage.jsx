import React from 'react';
import { Layout, HouseSummary, BarChart } from '../components';
import styles from './PerRumahPage.module.css';

const PerRumahPage = () => {
  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Konsumsi per Rumah</h1>
        <p>// Detail konsumsi energi setiap rumah</p>
      </div>
      <div className={styles.contentPad}>
        <div className={styles.grid2}>
          <HouseSummary />
          <BarChart />
        </div>
      </div>
    </Layout>
  );
};

export default PerRumahPage;