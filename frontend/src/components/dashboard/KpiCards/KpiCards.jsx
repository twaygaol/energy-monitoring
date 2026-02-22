import React, { useState, useEffect } from 'react';
import { fetchEnergyStats } from '../../../services/api';
import styles from './KpiCards.module.css';

const KpiCards = () => {
  const [stats, setStats] = useState({
    total_records: 0,
    total_usage: 0,
    unique_houses: 0,
    latest_timestamp: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchEnergyStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Refresh setiap 30 detik
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID');
  };

  const formatNumber = (num) => {
    return num?.toLocaleString('id-ID') || '0';
  };

  const cards = [
    {
      id: 0,
      label: 'Total kWh Hari Ini',
      icon: '⚡',
      value: stats.total_usage?.toFixed(1) || '0',
      unit: 'kWh',
      subValue: `Dari ${stats.total_records || 0} records`,
      subClass: styles.up,
    },
    {
      id: 1,
      label: 'Rekaman Tercatat',
      icon: '📋',
      value: formatNumber(stats.total_records),
      unit: 'baris',
      subValue: 'Data dalam database',
    },
    {
      id: 2,
      label: 'Jumlah Rumah',
      icon: '🏠',
      value: formatNumber(stats.unique_houses),
      unit: 'unit',
      subValue: 'Kode rumah terdaftar',
    },
    {
      id: 3,
      label: 'Pencatatan Terakhir',
      icon: '🕐',
      value: formatTime(stats.latest_timestamp),
      unit: '',
      subValue: 'Timestamp terbaru',
    },
  ];

  if (loading) {
    return <div className={styles.kpiRow}>Loading stats...</div>;
  }

  return (
    <div className={styles.kpiRow}>
      {cards.map((card) => (
        <div key={card.id} className={`${styles.kpi} ${styles[`c${card.id}`]}`}>
          <div className={styles.label}>
            {card.label} <span>{card.icon}</span>
          </div>
          <div className={styles.value}>
            {card.value}
            {card.unit && <span className={styles.unit}>{card.unit}</span>}
          </div>
          <div className={`${styles.sub} ${card.subClass || ''}`}>{card.subValue}</div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;