package models

import (
	"time"

	"gorm.io/gorm"
)

type ConsumptionData struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	DeviceID   string    `json:"device_id" gorm:"not null;index;type:varchar(50)"`  // Tentukan tipe
	DeviceName string    `json:"device_name" gorm:"type:varchar(100)"`
	HouseCode  string    `json:"house_code" gorm:"not null;index;type:varchar(20)"` // Tentukan tipe
	PowerUsage float64   `json:"power_usage" gorm:"not null;type:decimal(10,2)"`
	Timestamp  time.Time `json:"timestamp" gorm:"not null;index"`
}

// TableName overrides the table name
func (ConsumptionData) TableName() string {
	return "consumption_data"
}

// Untuk response summary
type HouseSummary struct {
	HouseCode    string    `json:"house_code"`
	TotalUsage   float64   `json:"total_usage"`
	AverageUsage float64   `json:"average_usage"`
	DeviceCount  int64     `json:"device_count"`
	LastUpdated  time.Time `json:"last_updated"`
}

// Untuk response daily summary
type DailySummary struct {
	Date        string  `json:"date"`         // YYYY-MM-DD
	TotalUsage  float64 `json:"total_usage"`
	PeakUsage   float64 `json:"peak_usage"`
	RecordCount int64   `json:"record_count"`
}