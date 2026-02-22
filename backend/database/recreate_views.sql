-- Recreate views
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

CREATE OR REPLACE VIEW vw_general_stats AS
SELECT
    (SELECT COUNT(*) FROM consumption_data) as total_records,
    (SELECT COALESCE(SUM(power_usage), 0) FROM consumption_data) as total_usage,
    (SELECT COUNT(DISTINCT house_code) FROM houses) as total_houses,
    (SELECT MAX(timestamp) FROM consumption_data) as latest_timestamp,
    (SELECT COUNT(*) FROM devices) as total_devices;

-- Recreate triggers
CREATE TRIGGER update_consumption_updated_at
    BEFORE UPDATE ON consumption_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_houses_updated_at
    BEFORE UPDATE ON houses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_summary_updated_at
    BEFORE UPDATE ON daily_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();