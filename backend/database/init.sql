-- ============================================
-- Database: energy_monitoring
-- Untuk Sistem Monitoring Konsumsi Energi Rumah Tangga
-- CV ATTA NETWORK Dataset
-- ============================================

-- Hapus views terlebih dahulu (karena dependensi)
DROP VIEW IF EXISTS vw_daily_chart CASCADE;
DROP VIEW IF EXISTS vw_house_summary CASCADE;

-- Hapus tabel dengan urutan yang benar (dari yang memiliki foreign key ke yang tidak)
DROP TABLE IF EXISTS daily_summary CASCADE;
DROP TABLE IF EXISTS consumption_data CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS datasets CASCADE;
DROP TABLE IF EXISTS houses CASCADE;

-- ============================================
-- CREATE TABLES (urutan yang benar)
-- ============================================

-- 1. TABLE: houses (tabel utama, tidak punya foreign key)
CREATE TABLE houses (
    house_code VARCHAR(20) PRIMARY KEY,
    house_name VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    building_type VARCHAR(50),
    total_area DECIMAL(10,2),
    occupant_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLE: devices (tergantung houses)
CREATE TABLE devices (
    device_id VARCHAR(50) PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50),
    power_rating DECIMAL(10,2),
    house_code VARCHAR(20) REFERENCES houses(house_code) ON DELETE CASCADE,
    installation_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLE: consumption_data (MAIN TABLE, tergantung houses dan devices)
CREATE TABLE consumption_data (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_id VARCHAR(50) REFERENCES devices(device_id) ON DELETE SET NULL,
    device_name VARCHAR(100),
    house_code VARCHAR(20) NOT NULL REFERENCES houses(house_code) ON DELETE CASCADE,
    power_usage DECIMAL(10,2) NOT NULL CHECK (power_usage >= 0),
    timestamp TIMESTAMP NOT NULL
);

-- 4. TABLE: daily_summary (tergantung houses)
CREATE TABLE daily_summary (
    id SERIAL PRIMARY KEY,
    summary_date DATE NOT NULL,
    house_code VARCHAR(20) REFERENCES houses(house_code) ON DELETE CASCADE,
    total_usage DECIMAL(12,2) NOT NULL DEFAULT 0,
    peak_usage DECIMAL(10,2),
    average_usage DECIMAL(10,2),
    record_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(summary_date, house_code)
);

-- 5. TABLE: datasets (independen)
CREATE TABLE datasets (
    dataset_id SERIAL PRIMARY KEY,
    dataset_name VARCHAR(100) NOT NULL,
    source_format VARCHAR(20),
    file_name VARCHAR(255),
    record_count INTEGER DEFAULT 0,
    import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_range_start DATE,
    date_range_end DATE,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- ============================================
-- CREATE INDEXES (untuk performa)
-- ============================================

-- Index untuk consumption_data
CREATE INDEX IF NOT EXISTS idx_consumption_house ON consumption_data(house_code);
CREATE INDEX IF NOT EXISTS idx_consumption_timestamp ON consumption_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_consumption_house_timestamp ON consumption_data(house_code, timestamp);
CREATE INDEX IF NOT EXISTS idx_consumption_device ON consumption_data(device_id);

-- Index untuk daily_summary
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_summary(summary_date);
CREATE INDEX IF NOT EXISTS idx_daily_summary_house ON daily_summary(house_code);

-- Index untuk devices
CREATE INDEX IF NOT EXISTS idx_devices_house ON devices(house_code);

-- ============================================
-- INSERT MASTER DATA (rumah dari template frontend)
-- ============================================

-- Hapus data yang ada (jika ada)
TRUNCATE houses CASCADE;

INSERT INTO houses (house_code, house_name, building_type) VALUES
('RMH-01', 'Rumah 01', 'Residential'),
('RMH-02', 'Rumah 02', 'Residential'),
('RMH-03', 'Rumah 03', 'Residential'),
('RMH-04', 'Rumah 04', 'Residential'),
('RMH-05', 'Rumah 05', 'Residential'),
('RMH-06', 'Rumah 06', 'Residential'),
('RMH-07', 'Rumah 07', 'Residential'),
('RMH-08', 'Rumah 08', 'Residential'),
('RMH-09', 'Rumah 09', 'Residential'),
('RMH-10', 'Rumah 10', 'Residential'),
('RMH-11', 'Rumah 11', 'Residential'),
('RMH-12', 'Rumah 12', 'Residential');

-- Insert contoh dataset CV ATTA NETWORK
TRUNCATE datasets CASCADE;
INSERT INTO datasets (dataset_name, source_format, description) VALUES
('CV ATTA NETWORK - Konsumsi Rumah Tangga 2024', 'CSV', 'Dataset utama untuk skripsi: monitoring konsumsi energi rumah tangga');

-- ============================================
-- CREATE VIEWS (setelah semua tabel siap)
-- ============================================

-- View untuk ringkasan per rumah (seperti di dashboard)
CREATE OR REPLACE VIEW vw_house_summary AS
SELECT 
    h.house_code,
    h.house_name,
    COALESCE(SUM(c.power_usage), 0) as total_usage,
    COALESCE(AVG(c.power_usage), 0) as avg_usage,
    COUNT(c.id) as record_count,
    MAX(c.timestamp) as last_update
FROM houses h
LEFT JOIN consumption_data c ON h.house_code = c.house_code
    AND DATE(c.timestamp) = CURRENT_DATE
GROUP BY h.house_code, h.house_name
ORDER BY h.house_code;

-- View untuk daily summary (chart)
CREATE OR REPLACE VIEW vw_daily_chart AS
SELECT 
    DATE(timestamp) as date,
    house_code,
    SUM(power_usage) as daily_total,
    AVG(power_usage) as daily_avg,
    MAX(power_usage) as daily_peak,
    COUNT(*) as readings
FROM consumption_data
GROUP BY DATE(timestamp), house_code
ORDER BY date DESC, house_code;

-- View untuk statistik umum
CREATE OR REPLACE VIEW vw_general_stats AS
SELECT
    (SELECT COUNT(*) FROM consumption_data) as total_records,
    (SELECT COALESCE(SUM(power_usage), 0) FROM consumption_data) as total_usage,
    (SELECT COUNT(DISTINCT house_code) FROM houses) as total_houses,
    (SELECT MAX(timestamp) FROM consumption_data) as latest_timestamp,
    (SELECT COUNT(*) FROM devices) as total_devices;

-- ============================================
-- CREATE FUNCTION untuk update timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk consumption_data (hapus dulu jika ada)
DROP TRIGGER IF EXISTS update_consumption_updated_at ON consumption_data;
CREATE TRIGGER update_consumption_updated_at
    BEFORE UPDATE ON consumption_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk houses
DROP TRIGGER IF EXISTS update_houses_updated_at ON houses;
CREATE TRIGGER update_houses_updated_at
    BEFORE UPDATE ON houses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk daily_summary
DROP TRIGGER IF EXISTS update_daily_summary_updated_at ON daily_summary;
CREATE TRIGGER update_daily_summary_updated_at
    BEFORE UPDATE ON daily_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk devices
DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TAMPILKAN HASIL
-- ============================================

-- Tampilkan jumlah data yang berhasil diinsert
SELECT 'Houses inserted: ' || COUNT(*) || ' rows' as result FROM houses;
SELECT 'Datasets inserted: ' || COUNT(*) || ' rows' as result FROM datasets;

-- Tampilkan struktur tabel
SELECT 'Database setup completed successfully!' as message;