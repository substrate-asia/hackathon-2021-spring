package graphql

import (
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/gin-gonic/gin"
	"nftmart/app/model"
	"nftmart/graph/generated"
	"nftmart/graph/resolvers"

)

type GraphController struct {

}

func (g *GraphController) GraphqlPOST() gin.HandlerFunc{
	schema := generated.NewExecutableSchema(generated.Config{
		Resolvers: &resolvers.Resolver{
			DB: model.UseDbConn(""),
		},
		Directives: generated.DirectiveRoot{},
		Complexity: generated.ComplexityRoot{},
	})
	srv :=handler.NewDefaultServer(schema);
	srv.Use(extension.FixedComplexityLimit(300))
	//h := handler.GraphQL(schema)
	return func(c *gin.Context) {
		srv.ServeHTTP(c.Writer, c.Request)
		//h.ServeHTTP(c.Writer, c.Request)
	}
}

