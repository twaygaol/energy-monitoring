import React, { useState, useEffect } from 'react';
import { Layout } from '../components';
import { fetchHealth, fetchEnergyStats } from '../services/api';
import styles from './CloudStatusPage.module.css';

const CloudStatusPage = () => {
  const [status, setStatus] = useState('checking');
  const [stats, setStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const health = await fetchHealth();
        const statsData = await fetchEnergyStats();
        
        setStatus(health.status === 'healthy' ? 'online' : 'degraded');
        setStats(statsData.data);
        setLastUpdate(new Date());
      } catch (error) {
        setStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <h1>Cloud Status</h1>
        <p>// Status koneksi dan sinkronisasi data</p>
      </div>
      
      <div className={styles.contentPad}>
        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <div className={`${styles.statusDot} ${styles[status]}`}></div>
            <div>
              <h3>Server Status</h3>
              <p className={styles.statusText}>
                {status === 'online' && 'Server Online - Semua sistem berfungsi'}
                {status === 'degraded' && 'Server Degraded - Beberapa fitur mungkin lambat'}
                {status === 'offline' && 'Server Offline - Tidak dapat terhubung'}
                {status === 'checking' && 'Memeriksa status...'}
              </p>
            </div>
          </div>
          
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Records</span>
              <span className={styles.statValue}>{stats?.total_records || 0}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Usage</span>
              <span className={styles.statValue}>{stats?.total_usage?.toFixed(2) || 0} kWh</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Houses</span>
              <span className={styles.statValue}>{stats?.unique_houses || 0}</span>
            </div>
          </div>
          
          <div className={styles.infoRow}>
            <span>Last Updated:</span>
            <span>{lastUpdate.toLocaleString('id-ID')}</span>
          </div>
          <div className={styles.infoRow}>
            <span>Database:</span>
            <span>PostgreSQL</span>
          </div>
          <div className={styles.infoRow}>
            <span>API Status:</span>
            <span className={styles.ok}>✓ Operational</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CloudStatusPage;