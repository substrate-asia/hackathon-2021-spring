package main

import (
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type dailyReward struct {
	ID        uint64    `json:"-"`
	Address   string    `json:"address" form:"address"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

// 更改数据库表名
func (*dailyReward) TableName() string {
	return "daily_reward"
}

func fetchAllRewardAddress(c *gin.Context) {
	drs := []dailyReward{}
	res := db.Find(&drs)
	if res.Error == nil {
		c.JSON(200, drs)
		return
	}
	c.JSON(500, gin.H{"error": res.Error})
}

func checkReward(c *gin.Context) {
	address := c.Param("address")
	var dr dailyReward
	if err := db.Where("address = ?", address).First(&dr).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(200, nil)
		} else {
			c.JSON(500, gin.H{"error": err})
		}
	} else {
		c.JSON(403, gin.H{
			"message": "Duplicated address",
		})
	}
}

func insertReward(c *gin.Context) {
	var dr dailyReward
	if err := c.ShouldBindJSON(&dr); err != nil {
		c.JSON(400, gin.H{"message": err.Error()})
		return
	}
	var drRecord dailyReward
	res := db.Where("address = ?", dr.Address).Take(&drRecord)
	if res.Error != nil {
		if !errors.Is(res.Error, gorm.ErrRecordNotFound) {
			c.JSON(500, gin.H{"error": res.Error})
			return
		}
		if err := db.Create(&dr).Error; err != nil {
			c.JSON(500, gin.H{"error": err})
		}
		c.JSON(200, nil)
		return
	}
	c.JSON(400, gin.H{
		"message": "Duplicated address",
	})
}
