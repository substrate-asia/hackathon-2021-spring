package dataloaders

import (
	"net/http"

	"gorm.io/gorm"
)

// The following are context keys which will be referenced for various loaders
const UserLoader = "userLoader"

func setLoader(db *gorm.DB, dataloader func(db *gorm.DB, w http.ResponseWriter, r *http.Request, next http.Handler)) func(handler http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			dataloader(db, w, r, next)
		})
	}
}

func NewMiddleware(session *gorm.DB) []func(handler http.Handler) http.Handler {
	return []func(handler http.Handler) http.Handler{
		setLoader(session, User),
	}
}
