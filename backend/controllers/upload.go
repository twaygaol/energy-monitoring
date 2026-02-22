package controllers

import (
	"backend-energy-monitoring/config"
	"backend-energy-monitoring/models"
	"encoding/csv"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

// UploadExcelFile menangani upload file Excel
func UploadExcelFile(c *gin.Context) {
	// Ambil file dari form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "No file uploaded",
		})
		return
	}

	// Validasi ekstensi file
	if !isValidExcelFile(file.Filename) {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid file format. Please upload .xlsx or .xls file",
		})
		return
	}

	// Buat folder uploads jika belum ada
	if err := os.MkdirAll("./uploads", os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to create upload directory",
		})
		return
	}

	// Simpan file sementara
	tempPath := "./uploads/" + file.Filename
	if err := c.SaveUploadedFile(file, tempPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(tempPath) // Hapus setelah selesai

	// Proses file Excel
	records, err := processExcelFile(tempPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to process Excel: " + err.Error(),
		})
		return
	}

	// DEBUG: Tampilkan informasi file
	log.Println("=== FILE UPLOAD DEBUG ===")
	log.Printf("Filename: %s", file.Filename)
	log.Printf("Total rows: %d", len(records))
	
	if len(records) > 0 {
		log.Println("Sample data (row 1):")
		for idx, val := range records[0] {
			log.Printf("  Column %d: '%s' (length: %d)", idx, val, len(val))
		}
	}
	log.Println("=========================")

	// Insert ke database dalam batch
	var successCount, errorCount int
	var errors []string

	for i, record := range records {
		// Validasi jumlah kolom
		if len(record) < 5 {
			errorCount++
			errors = append(errors, fmt.Sprintf("Row %d: insufficient columns (got %d, expected 5)", i+2, len(record)))
			continue
		}

		// DEBUG per row untuk yang error
		if i < 5 { // Tampilkan 5 row pertama untuk debugging
			log.Printf("Processing Row %d:", i+2)
			log.Printf("  device_id: '%s'", record[0])
			log.Printf("  device_name: '%s'", record[1])
			log.Printf("  house_code: '%s'", record[2])
			log.Printf("  power_usage RAW: '%s'", record[3])
			log.Printf("  timestamp RAW: '%s'", record[4])
		}

		// Parse power_usage
		powerUsage, err := parsePowerUsage(record[3])
		if err != nil {
			errorCount++
			errMsg := fmt.Sprintf("Row %d: invalid power_usage value '%s'", i+2, record[3])
			errors = append(errors, errMsg)
			log.Printf("ERROR: %s", errMsg)
			continue
		}
		log.Printf("  power_usage PARSED: %f", powerUsage)

		// Parse timestamp
		timestamp, err := parseTimestamp(record[4])
		if err != nil {
			errorCount++
			errMsg := fmt.Sprintf("Row %d: invalid timestamp format '%s'", i+2, record[4])
			errors = append(errors, errMsg)
			log.Printf("ERROR: %s", errMsg)
			continue
		}
		log.Printf("  timestamp PARSED: %s", timestamp.Format("2006-01-02 15:04:05"))

		data := models.ConsumptionData{
			DeviceID:   record[0],
			DeviceName: record[1],
			HouseCode:  record[2],
			PowerUsage: powerUsage,
			Timestamp:  timestamp,
		}

		if err := config.DB.Create(&data).Error; err != nil {
			errorCount++
			errors = append(errors, fmt.Sprintf("Row %d: %v", i+2, err.Error()))
			log.Printf("ERROR DB: %v", err)
		} else {
			successCount++
			log.Printf("SUCCESS: Row %d inserted", i+2)
		}
	}

	log.Printf("UPLOAD COMPLETE: %d success, %d failed", successCount, errorCount)

	c.JSON(http.StatusOK, gin.H{
		"status":       "success",
		"message":      fmt.Sprintf("Upload complete: %d success, %d failed", successCount, errorCount),
		"total":        len(records),
		"success":      successCount,
		"failed":       errorCount,
		"errors":       errors,
	})
}

// UploadCSVFile untuk file CSV
func UploadCSVFile(c *gin.Context) {
	// Ambil file dari form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "No file uploaded",
		})
		return
	}

	// Validasi ekstensi file
	if !isValidCSVFile(file.Filename) {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid file format. Please upload .csv file",
		})
		return
	}

	// Buka file
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to open file: " + err.Error(),
		})
		return
	}
	defer src.Close()

	// Baca CSV
	reader := csv.NewReader(src)
	reader.TrimLeadingSpace = true
	reader.LazyQuotes = true
	reader.FieldsPerRecord = -1 // Allow variable number of fields
	
	records, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to read CSV: " + err.Error(),
		})
		return
	}

	// DEBUG CSV
	log.Println("=== CSV FILE DEBUG ===")
	log.Printf("Filename: %s", file.Filename)
	log.Printf("Total rows: %d", len(records))
	if len(records) > 0 {
		log.Printf("Header row: %v", records[0])
	}
	if len(records) > 1 {
		log.Printf("First data row: %v", records[1])
	}
	log.Println("======================")

	// Skip header jika ada (asumsi baris pertama adalah header)
	if len(records) > 0 {
		records = records[1:]
	}

	// Insert ke database
	var successCount, errorCount int
	var errors []string

	for i, record := range records {
		if len(record) < 5 {
			errorCount++
			errors = append(errors, fmt.Sprintf("Row %d: insufficient columns (got %d)", i+2, len(record)))
			continue
		}

		// Parse power_usage
		powerUsage, err := parsePowerUsage(record[3])
		if err != nil {
			errorCount++
			errors = append(errors, fmt.Sprintf("Row %d: invalid power_usage value '%s'", i+2, record[3]))
			continue
		}

		// Parse timestamp
		timestamp, err := parseTimestamp(record[4])
		if err != nil {
			errorCount++
			errors = append(errors, fmt.Sprintf("Row %d: invalid timestamp format '%s'", i+2, record[4]))
			continue
		}

		data := models.ConsumptionData{
			DeviceID:   record[0],
			DeviceName: record[1],
			HouseCode:  record[2],
			PowerUsage: powerUsage,
			Timestamp:  timestamp,
		}

		if err := config.DB.Create(&data).Error; err != nil {
			errorCount++
			errors = append(errors, fmt.Sprintf("Row %d: %v", i+2, err.Error()))
		} else {
			successCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":       "success",
		"message":      fmt.Sprintf("Upload complete: %d success, %d failed", successCount, errorCount),
		"total":        len(records),
		"success":      successCount,
		"failed":       errorCount,
		"errors":       errors,
	})
}

// Helper function untuk memproses file Excel
func processExcelFile(path string) ([][]string, error) {
	f, err := excelize.OpenFile(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	// Ambil sheet pertama
	sheetName := f.GetSheetName(0)
	if sheetName == "" {
		return nil, fmt.Errorf("no sheets found in Excel file")
	}

	// Baca semua rows
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, err
	}

	// DEBUG: Tampilkan nilai mentah dari Excel
	log.Println("=== RAW EXCEL DATA ===")
	if len(rows) > 0 {
		log.Printf("Header row: %v", rows[0])
	}
	if len(rows) > 1 {
		log.Printf("First data row (raw): %v", rows[1])
		// Tampilkan representasi byte untuk mendeteksi karakter tersembunyi
		for idx, cell := range rows[1] {
			log.Printf("  Cell %d bytes: %v", idx, []byte(cell))
		}
	}
	log.Println("======================")

	// Skip header row jika ada (asumsi baris pertama adalah header)
	if len(rows) > 0 {
		rows = rows[1:]
	}

	return rows, nil
}

// Helper function untuk parse power usage dengan berbagai format
// Helper function untuk parse power usage dengan berbagai format
func parsePowerUsage(value string) (float64, error) {
	// Bersihkan string: hapus spasi
	cleanValue := strings.TrimSpace(value)
	
	// Log untuk debugging
	log.Printf("parsePowerUsage input: '%s'", value)
	
	// Jika kosong, return error
	if cleanValue == "" {
		return 0, fmt.Errorf("empty value")
	}
	
	// STEP 1: Handle berbagai separator
	// Ganti titik dua dengan titik (01:02 -> 01.02)
	cleanValue = strings.ReplaceAll(cleanValue, ":", ".")
	
	// Ganti koma dengan titik (1,02 -> 1.02)
	cleanValue = strings.ReplaceAll(cleanValue, ",", ".")
	
	// Ganti spasi dengan nothing (1 02 -> 1.02) - kadang Excel kasih spasi
	cleanValue = strings.ReplaceAll(cleanValue, " ", "")
	
	// STEP 2: Handle karakter aneh (non-breaking space)
	cleanValue = strings.Map(func(r rune) rune {
		if r == 0xA0 { // non-breaking space
			return ' '
		}
		return r
	}, cleanValue)
	cleanValue = strings.TrimSpace(cleanValue)
	
	// STEP 3: Handle multiple titik (01..02 -> 01.02)
	for strings.Contains(cleanValue, "..") {
		cleanValue = strings.ReplaceAll(cleanValue, "..", ".")
	}
	
	// STEP 4: Handle leading zero
	// Contoh: 01.02 -> 1.02
	if strings.HasPrefix(cleanValue, "0") && len(cleanValue) > 1 && !strings.HasPrefix(cleanValue, "0.") {
		// Tapi jangan trim jika setelah 0 adalah titik (0.5)
		if !strings.HasPrefix(cleanValue, "0.") {
			cleanValue = strings.TrimLeft(cleanValue, "0")
		}
	}
	
	// STEP 5: Handle kasus khusus
	// Jika setelah trim jadi ".02", tambahkan "0" di depan
	if strings.HasPrefix(cleanValue, ".") {
		cleanValue = "0" + cleanValue
	}
	
	// Jika hanya angka tanpa titik dan ada leading zero (01 -> 1)
	if !strings.Contains(cleanValue, ".") && strings.HasPrefix(cleanValue, "0") && len(cleanValue) > 1 {
		cleanValue = strings.TrimLeft(cleanValue, "0")
		if cleanValue == "" {
			cleanValue = "0"
		}
	}
	
	// STEP 6: Handle format dengan pemisah ribuan (1.500,50 -> 1500.50)
	if strings.Count(cleanValue, ".") > 1 {
		// Kemungkinan format dengan pemisah ribuan
		// Hapus semua titik kecuali yang terakhir
		lastDotIndex := strings.LastIndex(cleanValue, ".")
		if lastDotIndex != -1 {
			thousandsPart := cleanValue[:lastDotIndex]
			decimalPart := cleanValue[lastDotIndex:]
			
			// Hapus semua titik dari bagian ribuan
			thousandsPart = strings.ReplaceAll(thousandsPart, ".", "")
			cleanValue = thousandsPart + decimalPart
		}
	}
	
	// Parse ke float64
	result, err := strconv.ParseFloat(cleanValue, 64)
	if err != nil {
		log.Printf("parsePowerUsage error: failed to parse '%s' (cleaned to '%s')", value, cleanValue)
		return 0, fmt.Errorf("failed to parse '%s'", value)
	}
	
	log.Printf("parsePowerUsage success: '%s' -> %f", value, result)
	return result, nil
}
// Helper function untuk parse timestamp dengan berbagai format
// Helper function untuk parse timestamp dengan berbagai format
func parseTimestamp(value string) (time.Time, error) {
	cleanValue := strings.TrimSpace(value)
	
	// Log untuk debugging
	log.Printf("parseTimestamp input: '%s'", value)
	
	// STEP 1: Handle berbagai separator waktu
	// Ganti titik dengan titik dua di bagian waktu (08.30 -> 08:30)
	if strings.Contains(cleanValue, " ") {
		parts := strings.Split(cleanValue, " ")
		if len(parts) == 2 {
			datePart := parts[0]
			timePart := parts[1]
			// Ganti titik dengan titik dua di timePart
			timePart = strings.ReplaceAll(timePart, ".", ":")
			cleanValue = datePart + " " + timePart
		}
	}
	
	// STEP 2: Handle format US yang mungkin muncul (m/d/yy)
	// Contoh: "2/19/26 08:30" -> harusnya 19 Feb 2026
	
	// Deteksi format US: jika bagian pertama (bulan) ≤ 12 dan bagian kedua (hari) > 12
	if strings.Contains(cleanValue, "/") {
		parts := strings.Split(cleanValue, " ")[0] // Ambil bagian tanggal
		dateParts := strings.Split(parts, "/")
		
		if len(dateParts) == 3 {
			// Coba tebak format
			first, _ := strconv.Atoi(dateParts[0])
			second, _ := strconv.Atoi(dateParts[1])
			
			// Jika first ≤ 12 dan second > 12, kemungkinan format US (month/day/year)
			if first <= 12 && second > 12 {
				// Tukar posisi: dari m/d/y jadi d/m/y
				newDate := fmt.Sprintf("%s/%s/%s", dateParts[1], dateParts[0], dateParts[2])
				cleanValue = strings.Replace(cleanValue, parts, newDate, 1)
				log.Printf("parseTimestamp: swapped US format to: '%s'", cleanValue)
			}
		}
	}
	
	// STEP 3: Handle 2-digit year (26 -> 2026)
	if strings.Contains(cleanValue, "/") {
		parts := strings.Split(cleanValue, " ")[0]
		dateParts := strings.Split(parts, "/")
		
		if len(dateParts) == 3 && len(dateParts[2]) == 2 {
			// Ubah 2 digit tahun menjadi 4 digit
			year, _ := strconv.Atoi(dateParts[2])
			if year < 50 {
				dateParts[2] = fmt.Sprintf("20%02d", year)
			} else {
				dateParts[2] = fmt.Sprintf("19%02d", year)
			}
			newDate := strings.Join(dateParts, "/")
			cleanValue = strings.Replace(cleanValue, parts, newDate, 1)
			log.Printf("parseTimestamp: expanded year to: '%s'", cleanValue)
		}
	}
	
	// Daftar format timestamp yang didukung (diperbarui)
	formats := []string{
		// Format dengan strip (yyyy-mm-dd)
		"2006-01-02 15:04:05",
		"2006-01-02 15:04",
		"2006-01-02 15.04.05",
		"2006-01-02 15.04",
		
		// Format dengan slash (dd/mm/yyyy)
		"02/01/2006 15:04:05",
		"02/01/2006 15:04",
		"02/01/2006 15.04.05",
		"02/01/2006 15.04",
		"2/1/2006 15:04",
		"2/1/2006 15.04",
		
		// Format dengan slash (mm/dd/yyyy) - US format
		"01/02/2006 15:04:05",
		"01/02/2006 15:04",
		"1/2/2006 15:04",
		
		// Format dengan slash dan 2-digit year
		"02/01/06 15:04:05",
		"02/01/06 15:04",
		"2/1/06 15:04",
		"01/02/06 15:04:05", // US with 2-digit year
		"1/2/06 15:04",
		
		// Format dengan titik sebagai separator tanggal (dd.mm.yyyy)
		"02.01.2006 15:04:05",
		"02.01.2006 15:04",
		"02.01.2006 15.04.05",
		"02.01.2006 15.04",
		
		// Format ISO dengan T
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
	}
	
	// Coba semua format
	for _, format := range formats {
		timestamp, err := time.Parse(format, cleanValue)
		if err == nil {
			log.Printf("parseTimestamp success with format '%s': '%s' -> %s", format, value, timestamp)
			return timestamp, nil
		}
	}
	
	// Jika semua format gagal, coba parsing manual
	// Kasus: "2/19/26 08:30"
	if strings.Contains(cleanValue, "/") && strings.Contains(cleanValue, ":") {
		parts := strings.Split(cleanValue, " ")
		if len(parts) == 2 {
			datePart := parts[0]
			timePart := parts[1]
			
			// Parse tanggal (mm/dd/yy)
			dateParts := strings.Split(datePart, "/")
			if len(dateParts) == 3 {
				month, _ := strconv.Atoi(dateParts[0])
				day, _ := strconv.Atoi(dateParts[1])
				year, _ := strconv.Atoi(dateParts[2])
				
				// Handle 2-digit year
				if year < 100 {
					if year < 50 {
						year = 2000 + year
					} else {
						year = 1900 + year
					}
				}
				
				// Parse waktu (HH:MM)
				timeParts := strings.Split(timePart, ":")
				if len(timeParts) >= 2 {
					hour, _ := strconv.Atoi(timeParts[0])
					minute, _ := strconv.Atoi(timeParts[1])
					second := 0
					if len(timeParts) >= 3 {
						second, _ = strconv.Atoi(timeParts[2])
					}
					
					// PERHATIAN: Karena Excel mengubah format, kita perlu menukar day dan month
					// Data asli: 19/02/2026 -> Excel ubah jadi 2/19/26
					// Jadi month = 2, day = 19, year = 2026
					timestamp := time.Date(year, time.Month(month), day, hour, minute, second, 0, time.Local)
					log.Printf("parseTimestamp manual success: '%s' -> %s", value, timestamp)
					return timestamp, nil
				}
			}
		}
	}
	
	log.Printf("parseTimestamp failed for: '%s'", value)
	return time.Time{}, fmt.Errorf("unable to parse timestamp: %s", value)
}

// Helper function untuk validasi file Excel
func isValidExcelFile(filename string) bool {
	extensions := []string{".xlsx", ".xls", ".xlsm"}
	for _, ext := range extensions {
		if strings.HasSuffix(strings.ToLower(filename), ext) {
			return true
		}
	}
	return false
}

// Helper function untuk validasi file CSV
func isValidCSVFile(filename string) bool {
	return strings.HasSuffix(strings.ToLower(filename), ".csv")
}