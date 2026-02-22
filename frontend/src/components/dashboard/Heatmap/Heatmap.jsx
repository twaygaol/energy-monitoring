import React from 'react';
import Tooltip from '../../common/Tooltip';
import styles from './Heatmap.module.css';

const HOUSES = ['RMH-01', 'RMH-02', 'RMH-03', 'RMH-04', 'RMH-05', 'RMH-06',
                'RMH-07', 'RMH-08', 'RMH-09', 'RMH-10', 'RMH-11', 'RMH-12'];

const generateHeatmapData = () => {
  const houseProfile = (seed) => {
    return Array.from({ length: 24 }, (_, h) => {
      const peak = (h >= 7 && h <= 9) || (h >= 12 && h <= 13) || (h >= 18 && h <= 22) ? 1 : 0.25;
      return +(peak * (0.8 + Math.sin(h * 0.5 + seed) * 0.4) + (Math.random() * 0.15)).toFixed(2);
    });
  };
  
  return HOUSES.map((_, i) => houseProfile(i * 1.3));
};

const PROFILES = generateHeatmapData();

const Heatmap = () => {
  const getIntensity = (value) => {
    const norm = Math.min(1, value / 3);
    return `rgba(0,229,255,${(norm * 0.92 + 0.05).toFixed(2)})`;
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>🗓 Heatmap Konsumsi — Waktu × Rumah</div>
      </div>
      <div className={styles.body}>
        <div className={styles.wrap}>
          <div className={styles.days}>
            {HOUSES.map(house => (
              <div key={house} className={styles.day}>
                {house.replace('RMH-', 'R')}
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div className={styles.grid}>
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className={styles.col}>
                  {PROFILES.map((profile, houseIdx) => {
                    const value = profile[hour];
                    return (
                      <Tooltip
                        key={`${houseIdx}-${hour}`}
                        content={`${HOUSES[houseIdx]} · ${String(hour).padStart(2, '0')}:00 → ${value} kWh`}
                        position="top"
                        delay={300}
                      >
                        <div
                          className={styles.cell}
                          style={{ background: getIntensity(value) }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className={styles.hourLabels}>
              {[0, 6, 12, 18, 23].map(hour => (
                <div key={hour} className={styles.hourLabel}>
                  {String(hour).padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.legend}>
          <div className={styles.legendLabel}>Rendah</div>
          <div className={styles.swatch}>
            <div className={styles.swatchItem} style={{ background: 'rgba(0,229,255,0.08)' }}></div>
            <div className={styles.swatchItem} style={{ background: 'rgba(0,229,255,0.22)' }}></div>
            <div className={styles.swatchItem} style={{ background: 'rgba(0,229,255,0.42)' }}></div>
            <div className={styles.swatchItem} style={{ background: 'rgba(0,229,255,0.62)' }}></div>
            <div className={styles.swatchItem} style={{ background: 'rgba(0,229,255,0.82)' }}></div>
            <div className={styles.swatchItem} style={{ background: '#00e5ff' }}></div>
          </div>
          <div className={styles.legendLabel}>Tinggi</div>
        </div>
        <div className={styles.footer}>
          * Baris = Kode Rumah (RMH-01 s/d RMH-12) · Kolom = Jam (00:00–23:00)
        </div>
      </div>
    </div>
  );
};

export default Heatmap;