package test

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	subClient "nftmart/app/utils/substrate_client"
	_ "nftmart/bootstrap"
	"testing"
)

//  substrate client  operation blockchain

// search blockchain
func TestSubstrateRpcClient(t *testing.T) {
	api,err := subClient.GetOneSubstrateClient()
	assert.NoError(t, err)
	fmt.Println()
	fmt.Printf("Connected to node: %v\n", api.Client.URL())
	fmt.Println()
}

