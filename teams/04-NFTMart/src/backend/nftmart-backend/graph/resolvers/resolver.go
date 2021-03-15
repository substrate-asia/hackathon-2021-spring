//go:generate go run github.com/99designs/gqlgen --verbose
package resolvers

import (
	"gorm.io/gorm"
	"nftmart/graph/generated"
)
/**
  interface define
 */
type Resolver struct {
	DB *gorm.DB
}

func (r *Resolver) Mutation() generated.MutationResolver {
	return &mutationResolver{r}
}
func (r *Resolver) Query() generated.QueryResolver {
	return &queryResolver{r}
}
func (r *Resolver) Asset() generated.AssetResolver {
	return &assetResolver{r}
}
func (r *Resolver) Collection() generated.CollectionResolver {
	return &collectionResolver{r}
}
func (r *Resolver) Todo() generated.TodoResolver {
	return &todoResolver{r}
}
type mutationResolver struct{ *Resolver }

type queryResolver struct{ *Resolver }










