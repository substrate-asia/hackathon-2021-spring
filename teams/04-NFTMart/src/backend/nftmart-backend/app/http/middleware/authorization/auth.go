package authorization

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"nftmart/app/global/my_errors"
	"nftmart/app/global/variable"
	userstoken "nftmart/app/service/users/token"
	"nftmart/app/utils/response"
	"strings"
)

type HeaderParams struct {
	Authorization string `header:"Authorization"`
}

func CheckAuth() gin.HandlerFunc {
	return func(context *gin.Context) {
		//  模拟验证token
		headerParams := HeaderParams{}

		//  推荐使用 ShouldBindHeader 方式获取头参数
		if err := context.ShouldBindHeader(&headerParams); err != nil {
			variable.ZapLog.Error(my_errors.ErrorsValidatorBindParamsFail, zap.Error(err))
			context.Abort()
		}

		if len(headerParams.Authorization) >= 20 {
			token := strings.Split(headerParams.Authorization, " ")
			if len(token) == 2 && len(token[1]) >= 20 {
				tokenIsEffective,pubKey := userstoken.CreateUserFactory().IsPubKeyEffective(token[1])
				//tokenIsEffective := userstoken.CreateUserFactory().IsEffective(token[1])
				if tokenIsEffective {
					context.Set("pubKey",pubKey)
					context.Next()
				} else {
					response.ErrorAuthFail(context)
				}
			}
		} else {
			response.ErrorAuthFail(context)
		}

	}
}
