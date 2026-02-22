import React, { useState } from 'react';
import axios from 'axios';
import styles from './FileUpload.module.css';

const FileUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    // Validasi tipe file [citation:8]
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (selectedFile && validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid Excel or CSV file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    // Tentukan endpoint berdasarkan tipe file
    const endpoint = file.type === 'text/csv' 
      ? '/api/v1/upload/csv' 
      : '/api/v1/upload/excel';

    try {
      const response = await axios.post(`http://localhost:8080${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setFile(null);
      // Reset file input
      document.getElementById('file-upload').value = '';
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <h3>📤 Upload Data Excel/CSV</h3>
      <p className={styles.note}>
        Format: device_id, device_name, house_code, power_usage, timestamp
      </p>
      
      <div className={styles.uploadArea}>
        <input
          type="file"
          id="file-upload"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        
        {file && (
          <div className={styles.fileInfo}>
            <span>Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className={styles.uploadBtn}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
        
        {result && (
          <div className={styles.result}>
            <h4>Upload Result:</h4>
            <p>{result.message}</p>
            <p>Total: {result.total} records</p>
            <p className={styles.success}>✓ Success: {result.success}</p>
            {result.failed > 0 && (
              <p className={styles.failed}>✗ Failed: {result.failed}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;