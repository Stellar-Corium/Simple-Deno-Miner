import { nativeToScVal } from "@stellar/stellar-sdk";
import sha3 from "js-sha3";
import { Buffer } from "node:buffer";
import { parentPort } from "node:worker_threads";

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
  const target: string = Array.from({ length: params.difficulty }).fill("0")
    .join("");

  if (params.times > 0) {
    for (let i = 0; i < params.times; i++) {
      const bytes = Buffer.concat([
        params.index,
        params.message,
        params.prev_hash,
        nativeToScVal(i, { type: "u64" }).toXDR(),
        params.miner,
      ]);

      const hash: string = sha3.keccak256(bytes);
      const found: boolean = hash.slice(0, params.difficulty) === target;

      if (found) {
        console.log(`Found: ${hash} with nonce ${i}`);
        parentPort!.postMessage({
          type: "DONE",
          payload: { nonce: i, hash },
        });
        return;
      }
    }
  } else {
    let found = false;
    for (let i = 0; !found; i++) {
      const bytes = Buffer.concat([
        params.index,
        params.message,
        params.prev_hash,
        nativeToScVal(i, { type: "u64" }).toXDR(),
        params.miner,
      ]);

      const hash: string = sha3.keccak256(bytes);
      found = hash.slice(0, params.difficulty) === target;

      if (found) {
        console.log(`Found: ${hash} with nonce ${i}`);
        parentPort!.postMessage({
          type: "DONE",
          payload: { nonce: i, hash },
        });
        return;
      }
    }
  }

  parentPort!.postMessage({ type: "NOT_FOUND" });
});
