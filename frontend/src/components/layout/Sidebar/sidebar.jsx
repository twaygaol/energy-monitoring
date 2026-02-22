import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('Dashboard');

  // Definisikan menu items di dalam komponen
  const menuItems = [
    { icon: '⚡', label: 'Dashboard' },
    { icon: '📋', label: 'Data Rekaman' },
    { icon: '🏠', label: 'Per Rumah' },
    { icon: '📈', label: 'Tren Konsumsi' },
  ];

  const reportItems = [
    { icon: '📅', label: 'Harian' },
    { icon: '📁', label: 'Mingguan' },
    { icon: '📤', label: 'Ekspor CSV' },
  ];

  const systemItems = [
    { icon: '☁️', label: 'Cloud Status' },
    { icon: '⚙️', label: 'Pengaturan' },
  ];

  // Update active item based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveItem('Dashboard');
    else if (path === '/data-rekaman') setActiveItem('Data Rekaman');
    else if (path === '/per-rumah') setActiveItem('Per Rumah');
    else if (path === '/tren-konsumsi') setActiveItem('Tren Konsumsi');
    else if (path === '/laporan/harian') setActiveItem('Harian');
    else if (path === '/laporan/mingguan') setActiveItem('Mingguan');
    else if (path === '/laporan/ekspor') setActiveItem('Ekspor CSV');
    else if (path === '/cloud-status') setActiveItem('Cloud Status');
    else if (path === '/pengaturan') setActiveItem('Pengaturan');
  }, [location]);

  const handleNavigation = (label) => {
    setActiveItem(label);
    
    // Navigate based on label
    switch(label) {
      case 'Dashboard':
        navigate('/');
        break;
      case 'Data Rekaman':
        navigate('/data-rekaman');
        break;
      case 'Per Rumah':
        navigate('/per-rumah');
        break;
      case 'Tren Konsumsi':
        navigate('/tren-konsumsi');
        break;
      case 'Harian':
        navigate('/laporan/harian');
        break;
      case 'Mingguan':
        navigate('/laporan/mingguan');
        break;
      case 'Ekspor CSV':
        navigate('/laporan/ekspor');
        break;
      case 'Cloud Status':
        navigate('/cloud-status');
        break;
      case 'Pengaturan':
        navigate('/pengaturan');
        break;
      default:
        navigate('/');
    }
  };

  const NavItem = ({ icon, label }) => (
    <div
      className={`${styles.navItem} ${activeItem === label ? styles.active : ''}`}
      onClick={() => handleNavigation(label)}
    >
      <span className={styles.icon}>{icon}</span>
      {label}
    </div>
  );

  const NavSection = ({ title, children }) => (
    <>
      <div className={styles.navSectionLabel}>{title}</div>
      {children}
    </>
  );

  return (
    <div className={styles.sidebar}>
      <NavSection title="Menu">
        {menuItems.map((item) => (
          <NavItem key={item.label} icon={item.icon} label={item.label} />
        ))}
      </NavSection>

      <div className={styles.navDivider}></div>

      <NavSection title="Laporan">
        {reportItems.map((item) => (
          <NavItem key={item.label} icon={item.icon} label={item.label} />
        ))}
      </NavSection>

      <div className={styles.navDivider}></div>

      <NavSection title="Sistem">
        {systemItems.map((item) => (
          <NavItem key={item.label} icon={item.icon} label={item.label} />
        ))}
      </NavSection>

      <div className={styles.sidebarFooter}>
        <div className={styles.serverStatus}>
          <div className={styles.statusDot}></div>
          <div>
            <div className={styles.statusInfo}>SERVER ONLINE</div>
            <div className={styles.statusSub}>Sinkron · Latency 12ms</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;