import React, { useState, useEffect } from 'react';
import styles from './LogFeed.module.css';

const HOUSES = ['RMH-01', 'RMH-02', 'RMH-03', 'RMH-04', 'RMH-05', 'RMH-06',
                'RMH-07', 'RMH-08', 'RMH-09', 'RMH-10', 'RMH-11', 'RMH-12'];

const LogFeed = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const initialLogs = [
      { type: 'info', msg: '<b>Dataset aktif</b> — 3.841 baris terdeteksi dari sumber SQL' },
      { type: 'ok', msg: '<b>Sinkronisasi</b> — Cloud database berhasil terhubung' },
      { type: 'info', msg: '<b>RMH-01</b> — Pencatatan kWh diterima (timestamp 14:32:00)' },
      { type: 'info', msg: '<b>RMH-07</b> — Pencatatan kWh diterima (timestamp 14:31:45)' },
      { type: 'warn', msg: '<b>RMH-04</b> — Data timestamp tidak urut, validasi dijalankan' },
      { type: 'ok', msg: '<b>Format</b> — Kolom terdeteksi: timestamp · id_rumah · kwh · id_peralatan' },
      { type: 'info', msg: '<b>Interval</b> — Rata-rata pencatatan setiap 4 menit per rumah' },
    ];
    
    setLogs(initialLogs.map(log => ({
      ...log,
      timestamp: new Date()
    })));

    let liveTick = 0;
    const interval = setInterval(() => {
      liveTick++;
      
      if (liveTick % 8 === 0) {
        const ri = Math.floor(Math.random() * 12);
        const kwh = (Math.random() * 2.4 + 0.1).toFixed(2);
        
        const messages = [
          { type: 'info', msg: `<b>${HOUSES[ri]}</b> — Rekaman baru masuk: ${kwh} kWh` },
          { type: 'ok', msg: '<b>Sinkronisasi</b> — Batch 50 baris ditulis ke database SQL' },
          { type: 'info', msg: `<b>Parser</b> — CSV diproses, ${Math.floor(Math.random() * 20 + 5)} baris ditambahkan` },
        ];
        
        const pick = messages[Math.floor(Math.random() * messages.length)];
        
        setLogs(prev => [
          { ...pick, timestamp: new Date() },
          ...prev.slice(0, 13)
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  // Fungsi untuk mendapatkan className berdasarkan tipe log
  const getEntryClass = (type) => {
    switch(type) {
      case 'info': return styles.entryInfo;
      case 'ok': return styles.entryOk;
      case 'warn': return styles.entryWarn;
      case 'err': return styles.entryErr;
      default: return styles.entryInfo;
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>📡 Log Sinkronisasi Dataset</div>
      </div>
      <div className={styles.body}>
        <div className={styles.feed}>
          {logs.map((log, index) => (
            <div 
              key={index} 
              className={`${styles.entry} ${getEntryClass(log.type)}`}
            >
              <span className={styles.timestamp}>{formatTime(log.timestamp)}</span>
              <span 
                className={styles.message} 
                dangerouslySetInnerHTML={{ __html: log.msg }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogFeed;