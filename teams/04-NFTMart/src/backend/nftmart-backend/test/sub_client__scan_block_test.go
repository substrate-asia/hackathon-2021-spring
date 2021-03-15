package test

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	subClient "nftmart/app/utils/substrate_client"
	_ "nftmart/bootstrap"
	"testing"
)

//  substrate client  operation blockchain

// scan the blocks
func TestSubScanBlocks(t *testing.T) {
	api,err := subClient.GetOneSubstrateClient()
	assert.NoError(t, err)
	fmt.Println()
	fmt.Printf("Connected to node: %v\n", api.Client.URL())
	fmt.Println()
     // scan blocks process
	// get (lastBlockNumber,lastBlock)
	// for each(from last block to find start block)
	// get extrinsics by block.Block
	hash, err := api.RPC.Chain.GetBlockHashLatest()
	assert.NoError(t, err)
	fmt.Printf("Latest block: %v\n", hash.Hex())
	fmt.Printf("\tView in Polkadot/Substrate Apps: https://polkadot.js.org/apps/#/explorer/query/%v?"+
		"rpc=wss://serinus-5.kusama.network\n", hash.Hex())
	fmt.Printf("\tView in polkascan.io: https://polkascan.io/pre/kusama-cc2/block/%v\n", hash.Hex())
	fmt.Println()

	header, err := api.RPC.Chain.GetHeader(hash)
	assert.NoError(t, err)
	fmt.Printf("Block number: %v\n", header.Number)
	fmt.Printf("Parent hash: %v\n", header.ParentHash.Hex())
	fmt.Printf("State root: %v\n", header.StateRoot.Hex())
	fmt.Printf("Extrinsics root: %v\n", header.ExtrinsicsRoot.Hex())
	fmt.Println()

	block, err := api.RPC.Chain.GetBlock(hash)
	assert.NoError(t, err)
	fmt.Printf("Total extrinsics: %v\n", len(block.Block.Extrinsics))
	fmt.Println()
}

