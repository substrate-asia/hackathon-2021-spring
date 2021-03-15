package resolvers
/**
  user 数据层具体操作实现
*/
import (
	"context"
	"fmt"
	"time"
	"nftmart/graph/models"
)

//根据用户ID查询一条信息
func (r *queryResolver) User(ctx context.Context, id int) (*models.User, error) {
	user := models.User{ID: id}
	err := r.DB.First(&user, id).Error
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}

	return &user, nil
}
/**
  查询所有用户
 */
func (r *queryResolver) Users(ctx context.Context, limit *int, offset *int) ([]models.User, error) {
	var users []models.User

	err := r.DB.Find(&users).Error;
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}

	return users, nil
}

func (r *mutationResolver) UserCreate(ctx context.Context, user models.UserInput) (*models.User, error) {
	usr := models.User{
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err :=r.DB.Create(&usr).Error
	if err !=nil {
		return nil, err
	}

	return &usr, nil
}
