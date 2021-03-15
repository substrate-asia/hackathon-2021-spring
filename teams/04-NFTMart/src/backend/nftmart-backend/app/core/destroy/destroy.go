package destroy

import (
	"go.uber.org/zap"
	"nftmart/app/core/event_manage"
	"nftmart/app/global/consts"
	"nftmart/app/global/variable"
	"os"
	"os/signal"
	"syscall"
)

func init() {
	//  Used for system signal monitoring
	go func() {
		c := make(chan os.Signal)
		signal.Notify(c, os.Interrupt, os.Kill, syscall.SIGQUIT, syscall.SIGINT, syscall.SIGTERM) // 监听可能的退出信号
		received := <-c                                                                           //接收信号管道中的值
		variable.ZapLog.Warn(consts.ProcessKilled, zap.String("signalvalue", received.String()))
		(event_manage.CreateEventManageFactory()).FuzzyCall(variable.EventDestroyPrefix)
		close(c)
		os.Exit(1)
	}()

}
