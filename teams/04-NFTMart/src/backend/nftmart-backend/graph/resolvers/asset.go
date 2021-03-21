package resolvers
/**
  asset 数据层具体操作实现
*/
import (
	"context"
	"fmt"
	"nftmart/graph/generated"
	"nftmart/graph/models"
)

type assetResolver struct{ *Resolver }
// Assert that assetResolver conforms to the generated.AssetResolver interface
var _ generated.AssetResolver = (*assetResolver)(nil)



func (r *queryResolver) Asset(ctx context.Context, id int) (*models.Asset, error) {

	asset := models.Asset{Id:id}

	err := r.DB.First(&asset, id).Error
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}

	return &asset, nil
}

func (r *queryResolver) Assets(ctx context.Context, collectionID *int, categoryID *int, status *int, sort *string,page *int, pageSize *int) ([]*models.Asset, error) {

	var assets []*models.Asset
	// default spilt page
	if page==nil{
		*page = 1
	}
	if pageSize == nil {
		*pageSize = 10
	}

	limit := *pageSize
	offset := (*page-1)*limit

    tx := r.DB.Limit(limit).Offset(offset)

    if collectionID != nil&&*collectionID!=0{
		tx.Where("class_id",*collectionID)
	}
	if categoryID != nil&&*categoryID!=0{
		tx.Where("category_id",*categoryID)
	}
	if status!=nil&&*status!=0{
		tx.Where("status",*status)
	}
	if sort != nil{
		tx.Order(*sort+" desc")
	}
	err := tx.Find(&assets).Error
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}

	return assets, nil
}

func (r *queryResolver) AssetsLastCreate(ctx context.Context,page *int, pageSize *int) ([]*models.Asset, error) {

	var assets []*models.Asset
	// default spilt page args
	if page==nil{
		*page = 1
	}
	if pageSize == nil {
		*pageSize = 10
	}

	limit := *pageSize
	offset := (*page-1)*limit

	tx := r.DB.Limit(limit).Offset(offset)

	tx.Where("status",1)

	tx.Order("created_at desc")

	err := tx.Find(&assets).Error
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}

	return assets, nil
}

func (r *queryResolver) AssetsLastTrade(ctx context.Context,page *int, pageSize *int) ([]*models.Asset, error) {

	var assets []*models.Asset
	// default spilt page
	if page==nil{
		*page = 1
	}
	if pageSize == nil {
		*pageSize = 10
	}
	limit := *pageSize
	offset := (*page-1)*limit

	tx := r.DB.Limit(limit).Offset(offset)

	tx.Where("status",2)

	tx.Order("created_at desc")

	err := tx.Find(&assets).Error
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}

	return assets, nil
}

func (r *queryResolver) AssetsLastShelve(ctx context.Context,page *int, pageSize *int) ([]*models.Asset, error) {

	var assets []*models.Asset
	// default spilt page
	if page==nil{
		*page = 1
	}
	if pageSize == nil {
		*pageSize = 10
	}
	limit := *pageSize
	offset := (*page-1)*limit

	tx := r.DB.Limit(limit).Offset(offset)

	tx.Where("status",3)

	tx.Order("created_at desc")

	err := tx.Find(&assets).Error
	if err !=nil {
		fmt.Println("err: ", err)
		return nil, err
	}

	return assets, nil
}

func (a assetResolver) AssetID(ctx context.Context, obj *models.Asset) (*int, error) {
	return nil,nil
}

func (a assetResolver) CollectionName(ctx context.Context, obj *models.Asset) (string, error) {

	collection := models.Collection{Id:obj.ClassId}
	err := a.DB.First(&collection, obj.ClassId).Error

	if err !=nil {
		fmt.Println("err: ", err)
		return collection.Name, err
	}

	return "", nil
}

func (a assetResolver) CategoryName(ctx context.Context, obj *models.Asset) (string, error) {

	collection := models.Collection{Id:obj.ClassId}
	err := a.DB.First(&collection, obj.ClassId).Error

	if err !=nil {
		fmt.Println("err: ", err)
		return collection.Name, err
	}

	return "", nil
}

func (a assetResolver) Price(ctx context.Context, obj *models.Asset) (int, error) {

   return 5,nil
}



