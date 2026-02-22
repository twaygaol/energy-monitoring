import React from 'react';
import { Layout } from '../components';
import FileUpload from '../components/dashboard/FileUpload/FileUpload';
import styles from './UploadPage.module.css';

const UploadPage = () => {
  const handleUploadComplete = (result) => {
    console.log('Upload completed:', result);
  };

  return (
    <Layout>
      <div className={styles.pageHeader}>
        <div>
          <h1>Upload Dataset</h1>
          <p>// Import data Excel/CSV dari CV ATTA NETWORK</p>
        </div>
      </div>

      <div className={styles.contentPad}>
        <FileUpload onUploadComplete={handleUploadComplete} />
        
        <div className={styles.infoPanel}>
          <h3>📋 Panduan Upload</h3>
          <ul>
            <li>File harus berformat .xlsx, .xls, atau .csv</li>
            <li>Struktur kolom: device_id, device_name, house_code, power_usage, timestamp</li>
            <li>Timestamp format: YYYY-MM-DD HH:MM:SS</li>
            <li>Pastikan kode rumah sesuai (RMH-01 s/d RMH-12)</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;