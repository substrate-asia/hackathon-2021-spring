import React from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import types from "./types";
import emitter from "util/events";

const provider = new WsProvider("wss://testnet.shopbring.network");

class PolkadotApi {
  constructor() {
    const self = this;
    this.ready = false;
    this.runtimeVersion = null;
    this.api = new ApiPromise({ provider, types });
    this.api.isReady
      .then(() => {
        self.ready = true;
        self.setVersion();
        console.log("API ready");
        emitter.emit("connected", self.api);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  setVersion() {
    this.api.derive.chain.bestNumberFinalized().then((blockIndex) => {
      this.api.rpc.chain
        .getBlockHash(this.api.createType("BlockNumber", blockIndex))
        .then((blockHash) => {
          this.api.rpc.state
            .getRuntimeVersion(blockHash)
            .then((runtimeVersion) => {
              console.log(
                "runtimeVersion specVersion:",
                runtimeVersion.specVersion
              );
              this.runtimeVersion = runtimeVersion;
            });
        });
    });
  }
}

export const polkadotApi = new PolkadotApi();
export const PolkadotContext = React.createContext(polkadotApi);
