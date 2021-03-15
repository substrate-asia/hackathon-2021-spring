package db

import (
	"time"
	"nftmart/graph/models"
	"gorm.io/gorm"
)

func Seed(db *gorm.DB) error {

	if err := seedUsers(db); err != nil {
		return err
	}

	if err := seedTodos(db); err != nil {
		return err
	}

	return nil
}


func seedUsers(db *gorm.DB) error {


	users := []models.User{
		{
			Email:     "oshalygin@gmail.com",
			FirstName: "Oleg",
			LastName:  "Shalygin",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			Email:     "john.snow@gmail.com",
			FirstName: "John",
			LastName:  "Snow",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			Email:     "baby.yoda@gmail.com",
			FirstName: "Baby",
			LastName:  "Yoda",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}
	db.AutoMigrate(&models.User{})
	db.Create(&users)
	//for _, model := range users {
	//	var user models.User
	//	if err := db.Model(&user).Where("email = ?", model.Email).Select(); err != nil {
	//		if err := db.Insert(&model); err != nil {
	//			return err
	//		}
	//	}
	//}
	return nil
}

func seedTodos(db *gorm.DB) error {

	todos := []models.Todo{
		{
			Name:       "kubectl all the things",
			IsComplete: false,
			IsDeleted:  false,
			CreatedBy:  1,
			UpdatedBy:  1,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
		{
			Name:       "install a k8s cluster inside of another k8s cluster",
			IsComplete: false,
			IsDeleted:  false,
			CreatedBy:  2,
			UpdatedBy:  2,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
		{
			Name:       "inception",
			IsComplete: false,
			IsDeleted:  false,
			CreatedBy:  3,
			UpdatedBy:  3,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
	}
	//db.AutoMigrate(&models.Todo{})
	db.Create(&todos)
	//for _, model := range todos {
	//	if err := db.Model(&model).Where("name = ?", model.Name).Select(); err != nil {
	//		if result := db.Create(&model); result.Error != nil {
	//			return result.Error
	//		}
	//	}
	//}
	return nil
}
