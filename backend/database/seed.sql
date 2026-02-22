-- ============================================
-- DATA DUMMY SEDERHANA (PASTI BERHASIL)
-- ============================================

-- Hapus data lama
TRUNCATE devices CASCADE;
TRUNCATE consumption_data CASCADE;
TRUNCATE daily_summary CASCADE;

-- Insert devices
INSERT INTO devices (device_id, device_name, device_type, power_rating, house_code) VALUES
('DEV-001', 'AC Ruang Tamu', 'AC', 1200, 'RMH-01'),
('DEV-002', 'Kulkas 2 Pintu', 'Refrigerator', 150, 'RMH-01'),
('DEV-003', 'AC Kamar Utama', 'AC', 1000, 'RMH-02'),
('DEV-004', 'Mesin Cuci', 'Washer', 500, 'RMH-03'),
('DEV-005', 'TV LED 50"', 'TV', 150, 'RMH-02'),
('DEV-006', 'Water Heater', 'Water Heater', 1500, 'RMH-04'),
('DEV-007', 'AC Kamar Anak', 'AC', 800, 'RMH-05'),
('DEV-008', 'Kulkas 1 Pintu', 'Refrigerator', 100, 'RMH-06'),
('DEV-009', 'Microwave', 'Microwave', 1200, 'RMH-07'),
('DEV-010', 'Rice Cooker', 'Rice Cooker', 400, 'RMH-08');

-- Insert sample data for today (sederhana)
INSERT INTO consumption_data (device_id, device_name, house_code, power_usage, timestamp)
SELECT 
    d.device_id,
    d.device_name,
    d.house_code,
    (random() * 2.5 + 0.1)::decimal(10,2),
    CURRENT_TIMESTAMP - (random() * 24 || ' hours')::interval
FROM devices d
CROSS JOIN generate_series(1, 5) -- 5 records per device
WHERE random() > 0.3;

-- Insert data for previous days
INSERT INTO consumption_data (device_id, device_name, house_code, power_usage, timestamp)
SELECT 
    d.device_id,
    d.device_name,
    d.house_code,
    (random() * 2.5 + 0.1)::decimal(10,2),
    CURRENT_TIMESTAMP - (random() * 7 || ' days')::interval - (random() * 24 || ' hours')::interval
FROM devices d
CROSS JOIN generate_series(1, 10) -- 10 records per device for past days
WHERE random() > 0.4;

-- Update daily summary
INSERT INTO daily_summary (summary_date, house_code, total_usage, peak_usage, average_usage, record_count)
SELECT 
    DATE(timestamp) as summary_date,
    house_code,
    SUM(power_usage) as total_usage,
    MAX(power_usage) as peak_usage,
    AVG(power_usage) as average_usage,
    COUNT(*) as record_count
FROM consumption_data
GROUP BY DATE(timestamp), house_code
ON CONFLICT (summary_date, house_code) DO UPDATE
SET 
    total_usage = EXCLUDED.total_usage,
    peak_usage = EXCLUDED.peak_usage,
    average_usage = EXCLUDED.average_usage,
    record_count = EXCLUDED.record_count;

-- Update dataset info
UPDATE datasets 
SET record_count = (SELECT COUNT(*) FROM consumption_data),
    date_range_start = (SELECT MIN(timestamp)::date FROM consumption_data),
    date_range_end = (SELECT MAX(timestamp)::date FROM consumption_data)
WHERE dataset_id = 1;

-- Tampilkan hasil
SELECT 'Devices: ' || COUNT(*) || ' devices' FROM devices
UNION ALL
SELECT 'Consumption data: ' || COUNT(*) || ' records' FROM consumption_data
UNION ALL
SELECT 'Daily summary: ' || COUNT(*) || ' days' FROM daily_summary;