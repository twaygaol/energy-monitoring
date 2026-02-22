package controllers

import (
	"backend-energy-monitoring/config"
	"backend-energy-monitoring/models"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetAllData mengambil semua data konsumsi energi
func GetAllData(c *gin.Context) {
	var data []models.ConsumptionData
	
	// Optional query parameters
	houseCode := c.Query("house")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	limit := c.DefaultQuery("limit", "100")

	query := config.DB

	// Filter by house code
	if houseCode != "" {
		query = query.Where("house_code = ?", houseCode)
	}

	// Filter by date range
	if startDate != "" && endDate != "" {
		query = query.Where("timestamp BETWEEN ? AND ?", startDate, endDate)
	}

	// Get data with limit
	query.Order("timestamp desc").Limit(parseLimit(limit)).Find(&data)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"data":    data,
		"count":   len(data),
	})
}

// GetDataByID mengambil data berdasarkan ID
func GetDataByID(c *gin.Context) {
	id := c.Param("id")
	var data models.ConsumptionData

	if err := config.DB.First(&data, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Data not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   data,
	})
}

// CreateData menambahkan data baru
func CreateData(c *gin.Context) {
	var newData models.ConsumptionData

	if err := c.ShouldBindJSON(&newData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	// Set timestamp if not provided
	if newData.Timestamp.IsZero() {
		newData.Timestamp = time.Now()
	}

	if err := config.DB.Create(&newData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"data":    newData,
	})
}

// UpdateData mengupdate data berdasarkan ID
func UpdateData(c *gin.Context) {
	id := c.Param("id")
	var data models.ConsumptionData

	// Cek apakah data ada
	if err := config.DB.First(&data, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "Data not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	// Bind JSON ke data
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	// Simpan perubahan
	if err := config.DB.Save(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   data,
	})
}

// DeleteData menghapus data berdasarkan ID
func DeleteData(c *gin.Context) {
	id := c.Param("id")
	
	if err := config.DB.Delete(&models.ConsumptionData{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Data deleted successfully",
	})
}

// GetHouseSummary mendapatkan ringkasan per rumah
func GetHouseSummary(c *gin.Context) {
	var results []struct {
		HouseCode   string    `json:"house_code"`
		TotalUsage  float64   `json:"total_usage"`
		AvgUsage    float64   `json:"avg_usage"`
		RecordCount int64     `json:"record_count"`
		LastUpdate  time.Time `json:"last_update"`
	}

	// Get today's date range
	today := time.Now().Format("2006-01-02")
	startOfDay := today + " 00:00:00"
	endOfDay := today + " 23:59:59"

	err := config.DB.Model(&models.ConsumptionData{}).
		Select("house_code, SUM(power_usage) as total_usage, AVG(power_usage) as avg_usage, COUNT(*) as record_count, MAX(timestamp) as last_update").
		Where("timestamp BETWEEN ? AND ?", startOfDay, endOfDay).
		Group("house_code").
		Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	// IMPORTANT: Jika tidak ada data, return array kosong, BUKAN null
	if results == nil {
		results = make([]struct {
			HouseCode   string    `json:"house_code"`
			TotalUsage  float64   `json:"total_usage"`
			AvgUsage    float64   `json:"avg_usage"`
			RecordCount int64     `json:"record_count"`
			LastUpdate  time.Time `json:"last_update"`
		}, 0)
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   results, // Sekarang pasti array, tidak akan pernah null
	})
}

// GetDailySummary mendapatkan ringkasan harian
func GetDailySummary(c *gin.Context) {
	var results []models.DailySummary

	err := config.DB.Model(&models.ConsumptionData{}).
		Select("DATE(timestamp) as date, SUM(power_usage) as total_usage, MAX(power_usage) as peak_usage, COUNT(*) as record_count").
		Group("DATE(timestamp)").
		Order("date DESC").
		Limit(30).
		Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   results,
	})
}

// GetStats mendapatkan statistik umum
func GetStats(c *gin.Context) {
	var totalRecords int64
	var totalUsage float64
	var uniqueHouses int64

	// Hitung total records
	config.DB.Model(&models.ConsumptionData{}).Count(&totalRecords)

	// Hitung total usage
	config.DB.Model(&models.ConsumptionData{}).Select("SUM(power_usage)").Scan(&totalUsage)

	// Hitung unique houses
	config.DB.Model(&models.ConsumptionData{}).Distinct("house_code").Count(&uniqueHouses)

	// Get latest timestamp
	var latest models.ConsumptionData
	config.DB.Order("timestamp desc").First(&latest)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"total_records":   totalRecords,
			"total_usage":     totalUsage,
			"unique_houses":   uniqueHouses,
			"latest_timestamp": latest.Timestamp,
		},
	})
}

// Helper function
func parseLimit(limit string) int {
	var l int
	_, err := fmt.Sscanf(limit, "%d", &l)
	if err != nil || l <= 0 {
		return 100
	}
	if l > 1000 {
		return 1000
	}
	return l
}