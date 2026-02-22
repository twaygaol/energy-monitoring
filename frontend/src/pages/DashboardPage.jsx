import React, { useState } from 'react';
import {
  Layout,
  DatasetBanner,
  KpiCards,
  LineChart,
  HouseSummary,
  DataTable,
  LogFeed,
  BarChart,
  Heatmap,
  Button
} from '../components';
import styles from './DashboardPage.module.css';
import '../styles/global.css';

const DashboardPage = () => {
  const [activeRange, setActiveRange] = useState('1H');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRangeChange = (range) => {
    setActiveRange(range);
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Monitoring Konsumsi Listrik</h1>
          <p>// Dataset: timestamp · kode rumah · kWh — CV ATTA NETWORK</p>
        </div>
        <div className={styles.headerControls}>
          <Button 
            active={activeRange === '1H'} 
            onClick={() => handleRangeChange('1H')}
          >
            1 Jam
          </Button>
          <Button 
            active={activeRange === '6H'} 
            onClick={() => handleRangeChange('6H')}
          >
            6 Jam
          </Button>
          <Button 
            active={activeRange === '24H'} 
            onClick={() => handleRangeChange('24H')}
          >
            24 Jam
          </Button>
          <Button 
            active={activeRange === '7D'} 
            onClick={() => handleRangeChange('7D')}
          >
            7 Hari
          </Button>
          <Button variant="primary">⬇ Ekspor CSV</Button>
        </div>
      </div>

      <div className={styles.contentPad}>
        <DatasetBanner />
        
        <KpiCards key={`kpi-${refreshKey}`} />
        
        <div className={styles.mainGrid}>
          <LineChart key={`line-${refreshKey}`} />
          <HouseSummary key={`house-${refreshKey}`} />
        </div>

        <div className={styles.mainGrid} style={{ marginBottom: '12px' }}>
          <DataTable key={`table-${refreshKey}`} />
          <LogFeed />
        </div>

        <div className={styles.bottomGrid}>
          <BarChart key={`bar-${refreshKey}`} />
          <Heatmap />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;