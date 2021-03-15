package resolvers
/**
  asset 数据层具体操作实现
*/
import (
	"context"
	"fmt"
	"nftmart/graph/models"
)


func (r *queryResolver) Category(ctx context.Context, id int) (*models.Category, error){

	category := models.Category{Id:id}

	err := r.DB.First(&category, id).Error
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}
	return &category, nil
}

func (r *queryResolver) Categorys(ctx context.Context, page *int, pageSize *int) ([]*models.Category, error) {

	var categorys []*models.Category

	if page==nil{
		*page = 1
	}
	if pageSize == nil {
		*pageSize = 10
	}
	limit := *pageSize
	offset := (*page-1)*limit
	err := r.DB.Limit(limit).Offset(offset).Order("created_at desc").Find(&categorys).Error
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}

	return categorys, nil
}
