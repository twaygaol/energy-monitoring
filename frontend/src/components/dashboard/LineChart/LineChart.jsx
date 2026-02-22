import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { fetchDailySummary } from '../../../services/api';
import Button from '../../common/Button';
import styles from './LineChart.module.css';

const HOUSES = ['RMH-01', 'RMH-02', 'RMH-03', 'RMH-04', 'RMH-05', 'RMH-06',
                'RMH-07', 'RMH-08', 'RMH-09', 'RMH-10', 'RMH-11', 'RMH-12'];

const HOUSE_COLORS = [
  '#00e5ff', '#ff6b35', '#39ff14', '#ffd60a', '#a78bfa', '#f472b6',
  '#34d399', '#fb923c', '#60a5fa', '#e879f9', '#4ade80', '#f87171'
];

const LineChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState('ALL');
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchDailySummary();
        if (response && response.data) {
          // Group by date and house
          const grouped = response.data.reduce((acc, item) => {
            if (!acc[item.date]) {
              acc[item.date] = {};
            }
            acc[item.date][item.house_code] = item.daily_total;
            return acc;
          }, {});

          // Get last 7 days
          const dates = Object.keys(grouped).sort().slice(-7);
          setLabels(dates);

          // Prepare data per house
          const houseData = HOUSES.map(house => ({
            house,
            data: dates.map(date => grouped[date]?.[house] || 0)
          }));
          
          setDailyData(houseData);
        }
      } catch (error) {
        console.error('Failed to load daily data:', error);
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
    if (chartRef.current && labels.length > 0 && !loading) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      let datasets = [];
      if (selectedHouse === 'ALL') {
        // Show all houses with opacity
        datasets = dailyData.map((houseData, i) => ({
          label: houseData.house,
          data: houseData.data,
          borderColor: HOUSE_COLORS[i],
          backgroundColor: 'transparent',
          borderWidth: 1,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 4,
          hidden: false,
        }));
      } else {
        // Show selected house only
        const idx = HOUSES.indexOf(selectedHouse);
        if (idx !== -1) {
          datasets = [{
            label: selectedHouse,
            data: dailyData[idx]?.data || [],
            borderColor: HOUSE_COLORS[idx],
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
          }];
        }
      }

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
          }),
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { 
              display: selectedHouse === 'ALL',
              position: 'top',
              labels: { color: 'var(--text)', font: { size: 8 } }
            },
            tooltip: {
              backgroundColor: 'rgba(7,18,32,0.96)',
              borderColor: 'rgba(0,229,255,0.25)',
              borderWidth: 1,
              titleColor: '#00e5ff',
              bodyColor: '#dceef5',
              padding: 8,
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(0,229,255,0.05)' },
              ticks: { color: 'var(--muted)', font: { size: 8 } }
            },
            y: {
              grid: { color: 'rgba(0,229,255,0.05)' },
              ticks: { color: 'var(--muted)', font: { size: 8 } },
              beginAtZero: true,
              title: {
                display: true,
                text: 'kWh',
                color: 'var(--muted)',
                font: { size: 8, family: "'DM Mono', monospace" }
              }
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
  }, [dailyData, labels, loading, selectedHouse]);

  const handleHouseChange = (houseId) => {
    setSelectedHouse(houseId);
  };

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.title}>📈 Konsumsi kWh per Hari</div>
        </div>
        <div className={styles.body}>
          <div style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>📈 Konsumsi kWh per Hari (7 Hari Terakhir)</div>
        <div className={styles.controls}>
          <Button 
            active={selectedHouse === 'ALL'} 
            onClick={() => handleHouseChange('ALL')}
          >
            Semua
          </Button>
          <Button 
            active={selectedHouse === 'RMH-01'} 
            onClick={() => handleHouseChange('RMH-01')}
          >
            RMH-01
          </Button>
          <Button 
            active={selectedHouse === 'RMH-02'} 
            onClick={() => handleHouseChange('RMH-02')}
          >
            RMH-02
          </Button>
          <Button 
            active={selectedHouse === 'RMH-03'} 
            onClick={() => handleHouseChange('RMH-03')}
          >
            RMH-03
          </Button>
        </div>
      </div>
      <div className={styles.body}>
        {labels.length > 0 ? (
          <canvas ref={chartRef} className={styles.canvas}></canvas>
        ) : (
          <div style={{ 
            height: '170px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--muted)'
          }}>
            📭 Belum ada data harian
          </div>
        )}
      </div>
    </div>
  );
};

export default LineChart;