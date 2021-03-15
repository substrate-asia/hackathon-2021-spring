package resolvers
/**
  user 数据层具体操作实现
*/
import (
	"context"
	"fmt"
	"nftmart/graph/generated"
	"nftmart/graph/models"
)

type collectionResolver struct{ *Resolver }

// Assert that collectionResolver conforms to the generated.CollectionResolver interface
var _ generated.CollectionResolver = (*collectionResolver)(nil)



func (c collectionResolver) ClassID(ctx context.Context, obj *models.Collection) (int, error) {

   return 0,nil;
}

func (c collectionResolver) ExternalLinks(ctx context.Context, obj *models.Collection) (*string, error) {
	//panic("implement me")
	return nil,nil;
}



//根据NFT集合ID查询一条信息
func (r *queryResolver) Collection(ctx context.Context, id int) (*models.Collection, error) {

	collection := models.Collection{Id:id}

	err := r.DB.First(&collection, id).Error
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}

	return &collection, nil
}
/**
  查询所有NFT集合
 */
func (r *queryResolver) Collections(ctx context.Context, page *int, pageSize *int) ([]*models.Collection, error) {

	var collections []*models.Collection
    if page==nil{
    	*page = 1
	}
	if pageSize == nil {
		*pageSize = 10
	}
	 limit := *pageSize
	 offset := (*page-1)*limit
	err := r.DB.Limit(limit).Offset(offset).Order("created_at desc").Find(&collections).Error
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}

	return collections, nil
}
