package users

import (
	"github.com/gin-gonic/gin"
	"nftmart/app/global/consts"
	"nftmart/app/global/variable"
)

// The simulation Aop implements pre - and post-callbacks to a controller function

type DestroyAfter struct{}

func (d *DestroyAfter) After(context *gin.Context) {
	// 后置函数可以使用异步执行
	go func() {
		userId := context.GetFloat64(consts.ValidatorPrefix + "id")
		variable.ZapLog.Sugar().Infof("simulation Users delete operation， After callbacks,USER-ID：%.f\n", userId)
	}()
}
