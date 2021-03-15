export interface Block {
  hash: string;
  height: number;
  relayer: string;
  miner: string;
  difficulty: number;
  nonce: number;
}