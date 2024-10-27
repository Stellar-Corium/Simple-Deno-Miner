import { Buffer } from "node:buffer";

export interface Block {
  index: bigint;
  message: string;
  prev_hash: Buffer;
  nonce: bigint;
  miner: string;
  hash: Buffer;
  timestamp: bigint;
}

export interface State {
  fcm: string;
  current: bigint;
  difficulty: number;
  is_nuked: boolean;
  finder: string;
}

export interface SubmitParams {
  hash: string;
  nonce: number;
  message: string;
}
