import React, { useState, useEffect } from 'react';
import { fetchEnergyData } from '../../../services/api';
import styles from './DataTable.module.css';

const HOUSE_COLORS = [
  '#00e5ff', '#ff6b35', '#39ff14', '#ffd60a', '#a78bfa', '#f472b6',
  '#34d399', '#fb923c', '#60a5fa', '#e879f9', '#4ade80', '#f87171'
];

const DataTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadData = async () => {
    try {
      console.log('Fetching data...'); // Debug
      const response = await fetchEnergyData({ limit: 20 });
      console.log('Full response:', response); // Debug: lihat struktur
      
      // CEK: Data ada di response.data (dari API response)
      if (response && response.data && Array.isArray(response.data)) {
        console.log('Data is array with length:', response.data.length);
        // Urutkan berdasarkan timestamp terbaru
        const sortedData = [...response.data].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setRows(sortedData);
        setLastUpdate(new Date());
      } 
      // CEK: Data ada di response.data.data (struktur bersarang)
      else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('Data is nested with length:', response.data.data.length);
        const sortedData = [...response.data.data].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setRows(sortedData);
        setLastUpdate(new Date());
      }
      // CEK: Data langsung di response (array)
      else if (response && Array.isArray(response)) {
        console.log('Response is array with length:', response.length);
        const sortedData = [...response].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setRows(sortedData);
        setLastUpdate(new Date());
      }
      else {
        console.warn('Unexpected response structure:', response);
        setRows([]);
      }
    } catch (error) {
      console.error('Failed to load table data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Refresh setiap 10 detik
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getHouseIndex = (houseCode) => {
    if (!houseCode) return 0;
    const match = houseCode.match(/\d+/);
    if (match) {
      const num = parseInt(match[0]) - 1;
      return num >= 0 && num < 12 ? num : 0;
    }
    return 0;
  };

  const getPercentage = (kwh) => {
    // Cari max power usage dari data untuk skala dinamis
    const maxPower = Math.max(...rows.map(r => r.power_usage || 0), 5);
    return Math.min(Math.round((kwh / maxPower) * 100), 100);
  };

  const getFillClass = (percentage) => {
    if (percentage > 80) return styles.hi;
    if (percentage > 55) return styles.med;
    return '';
  };

  const formatPowerUsage = (value) => {
    return value?.toFixed(2) || '0.00';
  };

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.title}>🗃 LOG DATA REKAMAN (TERBARU)</div>
          <div className={styles.structure}>
            <span className={styles.structureLabel}>STRUKTUR:&nbsp;</span>
            <span className={styles.structureTimestamp}>timestamp</span>
            <span className={styles.separator}>|</span>
            <span className={styles.structureHouse}>id_rumah</span>
            <span className={styles.separator}>|</span>
            <span className={styles.structureKwh}>kwh</span>
          </div>
        </div>
        <div className={styles.body}>
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
            <span className={styles.loadingSpinner}></span>
            Memuat data...
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering with rows:', rows.length); // Debug

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>🗃 LOG DATA REKAMAN (TERBARU)</div>
        <div className={styles.structure}>
          <span className={styles.structureLabel}>STRUKTUR:&nbsp;</span>
          <span className={styles.structureTimestamp}>timestamp</span>
          <span className={styles.separator}>|</span>
          <span className={styles.structureHouse}>id_rumah</span>
          <span className={styles.separator}>|</span>
          <span className={styles.structureKwh}>kwh</span>
        </div>
      </div>
      <div className={styles.body}>
        {rows.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>KODE RUMAH</th>
                  <th>KONSUMSI (KWH)</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, index) => {
                  const houseIdx = getHouseIndex(row.house_code);
                  const percentage = getPercentage(row.power_usage);
                  const fillClass = getFillClass(percentage);
                  
                  return (
                    <tr key={row.id || index} className={styles.tableRow}>
                      <td className={`${styles.mono} ${styles.timestamp}`}>
                        {formatDate(row.timestamp)}
                      </td>
                      <td>
                        <span 
                          className={styles.houseChip} 
                          style={{ 
                            borderColor: HOUSE_COLORS[houseIdx], 
                            color: HOUSE_COLORS[houseIdx] 
                          }}
                        >
                          {row.house_code}
                        </span>
                      </td>
                      <td>
                        <div className={styles.kwhBar}>
                          <div className={styles.kwhTrack}>
                            <div 
                              className={`${styles.kwhFill} ${fillClass}`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className={styles.kwhNum}>
                            {formatPowerUsage(row.power_usage)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyText}>Belum ada data rekaman</div>
            <div className={styles.emptyHint}>
              Upload file Excel/CSV untuk mulai menampilkan data
            </div>
          </div>
        )}
        {lastUpdate && (
          <div className={styles.updateInfo}>
            Terakhir diperbarui: {formatDate(lastUpdate)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;