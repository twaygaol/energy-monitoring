import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { fetchHouseSummary } from '../../../services/api';
import styles from './BarChart.module.css';

const HOUSE_COLORS = [
  '#00e5ff', '#ff6b35', '#39ff14', '#ffd60a', '#a78bfa', '#f472b6',
  '#34d399', '#fb923c', '#60a5fa', '#e879f9', '#4ade80', '#f87171'
];

const BarChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [houseData, setHouseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchHouseSummary();
        if (response && response.data && response.data.length > 0) {
          // Sort by house code
          const sortedData = [...response.data].sort((a, b) => 
            a.house_code.localeCompare(b.house_code)
          );
          setHouseData(sortedData);
          setLabels(sortedData.map(item => item.house_code));
        }
      } catch (error) {
        console.error('Failed to load bar chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Refresh setiap 30 detik
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chartRef.current && houseData.length > 0 && !loading) {
      // Destroy chart instance if exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'kWh Hari Ini',
            data: houseData.map(item => item.total_usage || 0),
            backgroundColor: HOUSE_COLORS.map(c => c + '99'),
            borderColor: HOUSE_COLORS,
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(7,18,32,0.96)',
              borderColor: 'rgba(0,229,255,0.25)',
              borderWidth: 1,
              titleColor: '#00e5ff',
              bodyColor: '#dceef5',
              padding: 8,
              callbacks: {
                label: (context) => {
                  const house = houseData[context.dataIndex];
                  return [
                    `  ⚡ ${context.parsed.y.toFixed(2)} kWh`,
                    `  📊 ${house.record_count || 0} records`,
                    `  ⏱️ Avg: ${(house.avg_usage || 0).toFixed(2)} kWh`
                  ];
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 7 } }
            },
            y: {
              grid: { color: 'rgba(0,229,255,0.05)' },
              ticks: { font: { size: 7.5 } },
              title: {
                display: true,
                text: 'kWh',
                color: '#4d7a8e',
                font: { size: 7.5, family: "'DM Mono', monospace" }
              },
              beginAtZero: true
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [houseData, labels, loading]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>📊 Perbandingan kWh per Rumah (Hari Ini)</div>
        {loading && <span style={{ color: 'var(--muted)' }}>Loading...</span>}
      </div>
      <div className={styles.body}>
        {houseData.length > 0 ? (
          <canvas ref={chartRef} className={styles.canvas}></canvas>
        ) : (
          <div style={{ 
            height: '170px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--muted)'
          }}>
            📭 Belum ada data konsumsi hari ini
          </div>
        )}
      </div>
    </div>
  );
};

export default BarChart;