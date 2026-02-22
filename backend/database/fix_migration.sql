-- -- Hapus view yang bergantung pada consumption_data
-- DROP VIEW IF EXISTS vw_house_summary CASCADE;
-- DROP VIEW IF EXISTS vw_daily_chart CASCADE;
-- DROP VIEW IF EXISTS vw_general_stats CASCADE;

-- -- Matikan trigger sementara
-- DROP TRIGGER IF EXISTS update_consumption_updated_at ON consumption_data;
-- DROP TRIGGER IF EXISTS update_houses_updated_at ON houses;
-- DROP TRIGGER IF EXISTS update_daily_summary_updated_at ON daily_summary;
-- DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;

-- Insert data untuk hari ini (today)
INSERT INTO consumption_data (device_id, device_name, house_code, power_usage, timestamp)
SELECT 
    d.device_id,
    d.device_name,
    d.house_code,
    (random() * 2.5 + 0.5)::decimal(10,2),
    CURRENT_TIMESTAMP - (random() * 12 || ' hours')::interval
FROM devices d
CROSS JOIN generate_series(1, 3) -- 3 records per device untuk hari ini
WHERE random() > 0.2;

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
WHERE DATE(timestamp) = CURRENT_DATE
GROUP BY DATE(timestamp), house_code
ON CONFLICT (summary_date, house_code) DO UPDATE
SET 
    total_usage = EXCLUDED.total_usage,
    peak_usage = EXCLUDED.peak_usage,
    average_usage = EXCLUDED.average_usage,
    record_count = EXCLUDED.record_count;

-- Cek data hari ini
SELECT DATE(timestamp) as date, house_code, COUNT(*) as records, SUM(power_usage) as total
FROM consumption_data 
WHERE DATE(timestamp) = CURRENT_DATE
GROUP BY DATE(timestamp), house_code
ORDER BY house_code;