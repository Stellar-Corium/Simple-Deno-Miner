import { Buffer } from "node:buffer";
import { parentPort } from "node:worker_threads";
import { find_block_hash_nonce } from "./pkg/fcm_wasm_miner.js";

if (!parentPort) {
  throw new Error();
}

parentPort.on("message", (params: {
  index: Buffer; // This the XDR version of the ScVal
  message: Buffer; // This the XDR version of the ScVal
  prev_hash: Buffer; // This the XDR version of the ScVal
  miner: Buffer; // This the XDR version of the ScVal
  difficulty: number;
  times: number;
}): void => {
  const response = find_block_hash_nonce(
    params.difficulty,
    params.index,
    params.message,
    params.prev_hash,
    params.miner,
  );

  console.log(`Found: ${response.hash} with nonce ${response.nonce}`);
  parentPort!.postMessage({
    type: "DONE",
    payload: { nonce: response.nonce, hash: response.hash },
  });

  parentPort!.postMessage({ type: "NOT_FOUND" });
});
