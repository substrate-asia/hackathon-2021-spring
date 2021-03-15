package resolvers
/**
  todo 数据层具体操作实现
 */
import (
	"context"
	"errors"
	"fmt"
	"time"
	"nftmart/graph/dataloaders"
	"nftmart/graph/generated"
	"nftmart/graph/models"
)

type todoResolver struct{ *Resolver }

// Assert that todoResolver conforms to the generated.TodoResolver interface
var _ generated.TodoResolver = (*todoResolver)(nil)

func (r *queryResolver) Todo(ctx context.Context, id int) (*models.Todo, error) {
	todo := models.Todo{};
	//err := r.DB.First(&todo, id).Error
	err := r.DB.Where("id = ?", id).First(&todo).Error
	if err != nil{
		fmt.Println("err: ", err)
		return nil, err
	}
	return &todo, nil
}
func (r *queryResolver) Todos(ctx context.Context, limit *int, offset *int) ([]models.Todo, error) {
	var todos []models.Todo

	err := r.DB.Find(&todos).Error;
	if err != nil{
		return nil, err
	}
	return todos, nil
}

func (r *todoResolver) CreatedBy(ctx context.Context, obj *models.Todo) (*models.User, error) {
	return ctx.Value(dataloaders.UserLoader).(*generated.UserLoader).Load(obj.CreatedBy)
}
func (r *todoResolver) UpdatedBy(ctx context.Context, obj *models.Todo) (*models.User, error) {
	return ctx.Value(dataloaders.UserLoader).(*generated.UserLoader).Load(obj.UpdatedBy)
}

func (r *mutationResolver) TodoCreate(ctx context.Context, todo models.TodoInput) (*models.Todo, error) {
	// Validate that createdby id actually exists
	 err := r.DB.Select(&models.User{ID: todo.CreatedBy}).Error
	// TODO
	if err != nil {
		return nil,err
	}

	t := models.Todo{
		Name: todo.Name,

		CreatedBy: todo.CreatedBy,
		UpdatedBy: todo.CreatedBy,

		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err = r.DB.Create(&t).Error
	if err != nil {
		return nil, err
	}

	return &t, nil
}

func (r *mutationResolver) TodoComplete(ctx context.Context, id int, updatedBy int) (*models.Todo, error) {
	// Validate that updatedBy id actually exists
	err := r.DB.Select(&models.User{ID: updatedBy})
	if err != nil {
		return nil, errors.New(fmt.Sprintf("user %d does not exist", updatedBy))
	}

	todo := models.Todo{
		ID: id,
	}

	r.DB.Select(&todo)
	//if err != nil {
	//	return nil, errors.New(fmt.Sprintf("todo %d does not exist", updatedBy))
	//}

	todo.UpdatedBy = updatedBy
	todo.IsComplete = true
	todo.UpdatedAt = time.Now()

	r.DB.Save(&todo)

	return &todo, nil
}

func (r *mutationResolver) TodoDelete(ctx context.Context, id int, updatedBy int) (*models.Todo, error) {
	// Validate that updatedBy id actually exists
	err := r.DB.Select(&models.User{ID: updatedBy})
	if err != nil {
		return nil, errors.New(fmt.Sprintf("user %d does not exist", updatedBy))
	}

	todo := models.Todo{
		ID: id,
	}

	r.DB.Select(&todo)
	//if err != nil {
	//	return nil, errors.New(fmt.Sprintf("todo %d does not exist", updatedBy))
	//}

	todo.UpdatedBy = updatedBy
	todo.IsDeleted = true
	todo.UpdatedAt = time.Now()

	r.DB.Delete(&todo)

	return &todo, nil
}
