import React, { useState, useEffect } from 'react';
import styles from './Topbar.module.css';

const Topbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID');
  };

  return (
    <div className={styles.topbar}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className={styles.logoBlock}>
          <div className={styles.logoIcon}>⚡</div>
          <div className={styles.logoText}>
            EnergiCloud
            <small>CV ATTA NETWORK</small>
          </div>
        </div>
        <div className={styles.topbarMid}>
          Dashboard / <span>Monitoring Konsumsi</span>
        </div>
      </div>
      <div className={styles.topbarRight}>
        <div className={styles.livePill}>
          <div className={styles.liveDot}></div>
          LIVE DATA
        </div>
        <div className={styles.clock}>
          Update: <b>{formatTime(currentTime)}</b>
        </div>
      </div>
    </div>
  );
};

export default Topbar;