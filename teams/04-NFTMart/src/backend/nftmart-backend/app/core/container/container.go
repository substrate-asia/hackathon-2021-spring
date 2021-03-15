package container

import (
	"nftmart/app/global/my_errors"
	"nftmart/app/global/variable"
	"strings"
	"sync"
)

// Define a global key-value pair storage container

var sMap sync.Map

// Create a container factory
func CreateContainersFactory() *containers {
	return &containers{}
}

// Define a container struct
type containers struct {
}

//  1.Register code with the container as a key-value pair
func (c *containers) Set(key string, value interface{}) (res bool) {

	if _, exists := c.KeyIsExists(key); exists == false {
		sMap.Store(key, value)
		res = true
	} else {
		variable.ZapLog.Warn(my_errors.ErrorsContainerKeyAlreadyExists + ", relation key：" + key)
	}
	return
}

//  2.delete
func (c *containers) Delete(key string) {
	sMap.Delete(key)
}

//  3.Pass the key to get the value from the container
func (c *containers) Get(key string) interface{} {
	if value, exists := c.KeyIsExists(key); exists {
		return value
	}
	return nil
}

//  4. Determine if the key is registered
func (c *containers) KeyIsExists(key string) (interface{}, bool) {
	return sMap.Load(key)
}

// Deletes the registered content in the container by obfuscating the key prefix
func (c *containers) FuzzyDelete(keyPre string) {
	sMap.Range(func(key, value interface{}) bool {
		if keyname, ok := key.(string); ok {
			if strings.HasPrefix(keyname, keyPre) {
				sMap.Delete(keyname)
			}
		}
		return true
	})
}
