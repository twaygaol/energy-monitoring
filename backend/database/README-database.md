# Database Energy Monitoring System

## File Structure
- `init.sql` - Inisialisasi database (buat tabel, index, views, triggers)
- `seed.sql` - Data dummy untuk testing
- `backups/` - Folder untuk backup database

## Cara Menggunakan

### 1. Inisialisasi Database
```bash
# Connect ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE energy_monitoring;

# Connect ke database
\c energy_monitoring

# Jalankan init.sql
\i database/init.sql

# (Opsional) Jalankan seed data
\i database/seed.sql