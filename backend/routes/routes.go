package routes

import (
	"backend-energy-monitoring/controllers"
	"time"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// API v1 group
	api := router.Group("/api/v1")
	{
		// Energy consumption endpoints
		energy := api.Group("/energy")
		{
			energy.GET("/", controllers.GetAllData)
			energy.GET("/:id", controllers.GetDataByID)
			energy.POST("/", controllers.CreateData)
			energy.PUT("/:id", controllers.UpdateData)
			energy.DELETE("/:id", controllers.DeleteData)
			
			// Summary endpoints
			energy.GET("/summary/houses", controllers.GetHouseSummary)
			energy.GET("/summary/daily", controllers.GetDailySummary)
			energy.GET("/stats", controllers.GetStats)
		}

		api.POST("/upload/excel", controllers.UploadExcelFile)
		api.POST("/upload/csv", controllers.UploadCSVFile)

		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status": "healthy",
				"time":   time.Now(), // Ini yang membutuhkan package time
			})
		})
	}
}