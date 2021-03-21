export type NodeType = 'testnet' | 'production' | 'development';

export interface NodeItem {
  name: string;
  url: string;
}

export type NodesType = Record<NodeType, NodeItem[]>;

export const Nodes: NodesType = {
    production: [],
    testnet: [
      {
        name: 'Polkadot',
        // url: 'wss://rpc.polkadot.io'
        url:'wss://new.staging.jupiter.patract.cn'
      }
    ],
    development: [
      {
        name: 'Local',
        url: 'ws://127.0.0.1:9944'
      }
    ]
  };