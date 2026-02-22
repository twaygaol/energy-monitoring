package main

import (
	"backend-energy-monitoring/config"
	"backend-energy-monitoring/routes"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}

	// Connect to database
	config.ConnectDatabase()

	// Set Gin mode
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	router := gin.Default()

	// Enable CORS
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// Setup routes
	routes.SetupRoutes(router)

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	fmt.Printf("🚀 Server running on http://localhost:%s\n", port)
	fmt.Printf("📝 API Documentation:\n")
	fmt.Printf("   - GET    /api/v1/health\n")
	fmt.Printf("   - GET    /api/v1/energy\n")
	fmt.Printf("   - GET    /api/v1/energy/:id\n")
	fmt.Printf("   - POST   /api/v1/energy\n")
	fmt.Printf("   - PUT    /api/v1/energy/:id\n")
	fmt.Printf("   - DELETE /api/v1/energy/:id\n")
	fmt.Printf("   - GET    /api/v1/energy/summary/houses\n")
	fmt.Printf("   - GET    /api/v1/energy/summary/daily\n")
	fmt.Printf("   - GET    /api/v1/energy/stats\n")
	
	log.Fatal(router.Run(":" + port))
}