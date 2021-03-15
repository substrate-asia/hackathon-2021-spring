package users

import (
	"github.com/gin-gonic/gin"
	"nftmart/app/global/consts"
	"nftmart/app/global/variable"
)

// The simulation Aop implements pre - and post-callbacks to a controller function

type DestroyBefore struct{}

// The preceding function must have a return value so that it can control whether the process continues downward
func (d *DestroyBefore) Before(context *gin.Context) bool {
	userId := context.GetFloat64(consts.ValidatorPrefix + "id")
	variable.ZapLog.Sugar().Infof("simulation Users delete operation， Before callbacks,USER-ID：%.f\n", userId)
	if userId > 10 {
		return true
	} else {
		return false
	}
}
