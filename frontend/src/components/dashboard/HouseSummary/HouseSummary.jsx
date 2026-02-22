import React, { useState, useEffect } from 'react';
import { fetchHouseSummary } from '../../../services/api';
import styles from './HouseSummary.module.css';

const HOUSE_COLORS = [
  '#00e5ff', '#ff6b35', '#39ff14', '#ffd60a', '#a78bfa', '#f472b6',
  '#34d399', '#fb923c', '#60a5fa', '#e879f9', '#4ade80', '#f87171'
];

const HouseSummary = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxUsage, setMaxUsage] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHouseData = async () => {
      try {
        setError(null);
        const response = await fetchHouseSummary();
        
        // CEK: Pastikan response.data ada dan merupakan array
        if (response && response.data && Array.isArray(response.data)) {
          setHouses(response.data);
          
          // Hitung max usage untuk progress bar
          if (response.data.length > 0) {
            const max = Math.max(...response.data.map(h => h.total_usage || 0));
            setMaxUsage(max);
          }
        } else {
          // Jika data tidak sesuai format, set array kosong
          console.warn('Unexpected response format:', response);
          setHouses([]);
          setError('Format data tidak sesuai');
        }
      } catch (error) {
        console.error('Failed to load house data:', error);
        setError('Gagal memuat data rumah');
        setHouses([]);
      } finally {
        setLoading(false);
      }
    };

    loadHouseData();
    
    // Refresh setiap 30 detik
    const interval = setInterval(loadHouseData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const getBarColor = (percentage) => {
    if (percentage > 80) return '#ff2d55';
    if (percentage > 55) return '#ffd60a';
    return '#00e5ff';
  };

  const getTrend = () => {
    return Math.random() > 0.5 ? '↑' : '↓';
  };

  // Tampilkan loading
  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.title}>🏠 Konsumsi per Kode Rumah</div>
        </div>
        <div className={styles.grid}>
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
            Memuat data...
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan error
  if (error) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.title}>🏠 Konsumsi per Kode Rumah</div>
        </div>
        <div className={styles.grid}>
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--danger)' }}>
            ⚠️ {error}
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan jika tidak ada data
  if (!houses || houses.length === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.title}>🏠 Konsumsi per Kode Rumah</div>
        </div>
        <div className={styles.grid}>
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
            📭 Belum ada data konsumsi
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan data
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>🏠 Konsumsi per Kode Rumah</div>
      </div>
      <div className={styles.grid}>
        {houses.map((house, i) => {
          const percentage = maxUsage > 0 ? ((house.total_usage || 0) / maxUsage) * 100 : 0;
          const barColor = getBarColor(percentage);
          const trend = getTrend();
          const trendColor = trend === '↑' ? '#39ff14' : '#ff2d55';

          return (
            <div key={house.house_code || i} className={styles.row}>
              <div 
                className={styles.badge} 
                style={{ borderColor: HOUSE_COLORS[i % HOUSE_COLORS.length], color: HOUSE_COLORS[i % HOUSE_COLORS.length] }}
              >
                {house.house_code || `RMH-${String(i+1).padStart(2, '0')}`}
              </div>
              <div className={styles.kwh}>
                <div className={styles.value}>
                  {(house.total_usage || 0).toFixed(2)}<small> kWh</small>
                </div>
                <div className={styles.barTrack}>
                  <div 
                    className={styles.barFill} 
                    style={{ width: `${percentage}%`, background: barColor }}
                  ></div>
                </div>
              </div>
              <div className={styles.time}>{formatTime(house.last_update)}</div>
              <div className={styles.trend} style={{ color: trendColor }}>
                {trend}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HouseSummary;