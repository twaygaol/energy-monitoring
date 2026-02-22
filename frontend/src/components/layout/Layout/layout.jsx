import React from 'react';
import Topbar from '../Topbar';
import Sidebar from '../Sidebar';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  return (
    <>
      <div className={styles.gridBg}></div>
      <Topbar />
      <div className={styles.bodyWrap}>
        <Sidebar />
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
};

export default Layout;