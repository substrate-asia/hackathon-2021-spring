package gorm_v2

import (
	gsrpc "github.com/centrifuge/go-substrate-rpc-client/v2"
	"nftmart/app/global/variable"
)
// get one substrate rpc client
func GetOneSubstrateClient() (*gsrpc.SubstrateAPI, error) {
	HosPrefix := variable.ConfigYml.GetString("Substrate.HosPrefix")
	host := variable.ConfigYml.GetString("Substrate.Host")
	port := variable.ConfigYml.GetString("Substrate.Port")
	substrate_rpc_url := HosPrefix+host+":"+port
	return gsrpc.NewSubstrateAPI(substrate_rpc_url)
}
