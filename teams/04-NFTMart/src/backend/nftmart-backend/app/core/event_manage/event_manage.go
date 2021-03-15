package event_manage

import (
	"nftmart/app/global/my_errors"
	"nftmart/app/global/variable"
	"strings"
	"sync"
)

// Define a global event storage variable. This module is only responsible for storing the key => function. It is less powerful than the container, but it is easier and faster to call
var sMap sync.Map

// Create an event management factory
func CreateEventManageFactory() *eventManage {

	return &eventManage{}
}

// Define an event management structure
type eventManage struct {
}

//  1.registered events
func (e *eventManage) Set(key string, keyFunc func(args ...interface{})) bool {
	//判断key下是否已有事件
	if _, exists := e.Get(key); exists == false {
		sMap.Store(key, keyFunc)
		return true
	} else {
		variable.ZapLog.Info(my_errors.ErrorsFuncEventAlreadyExists + " , in the key of：" + key)
	}
	return false
}

// 2.get event
func (e *eventManage) Get(key string) (interface{}, bool) {
	if value, exists := sMap.Load(key); exists {
		return value, exists
	}
	return nil, false
}

//  3.execute event
func (e *eventManage) Call(key string, args ...interface{}) {
	if valueInterface, exists := e.Get(key); exists {
		if fn, ok := valueInterface.(func(args ...interface{})); ok {
			fn(args...)
		} else {
			variable.ZapLog.Error(my_errors.ErrorsFuncEventNotCall + ", key name：" + key + ", 相关函数无法调用")
		}

	} else {
		variable.ZapLog.Error(my_errors.ErrorsFuncEventNotRegister + ", key name：" + key)
	}
}

//  4.delete event
func (e *eventManage) Delete(key string) {
	sMap.Delete(key)
}

//  5.Obfuscate the call based on the key prefix. Use with caution.
func (e *eventManage) FuzzyCall(keyPre string) {

	sMap.Range(func(key, value interface{}) bool {
		if keyName, ok := key.(string); ok {
			if strings.HasPrefix(keyName, keyPre) {
				e.Call(keyName)
			}
		}
		return true
	})
}
