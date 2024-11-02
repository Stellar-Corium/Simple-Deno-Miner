import { find_block_hash_nonce } from "./pkg/fcm_wasm_miner.js";
import { Address, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "node:buffer";

const tick: number = performance.now();
const response = find_block_hash_nonce(
  6,
  nativeToScVal(1, { type: "u64" }).toXDR(),
  xdr.ScVal.scvString("The random message").toXDR(),
  xdr.ScVal.scvBytes(
    Buffer.from(
      "46cf93d942e60428f0e11616412ac8612942ba9168b85c400e61f168f7974e1a",
      "hex",
    ),
  ).toXDR(),
  new Address("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAITA4")
    .toScVal().toXDR(),
);
const tock: number = performance.now();
console.log(
  `It took ${tock - tick}ms to complete, that's a hash rate of: ${
    (5114425 / ((tock - tick) / 1000)).toFixed(2).replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ",",
    )
  } hashes per second`,
);
console.log(
  "Found the correctly the hash: 00000038266d39aa8e1b8f1795602d6bea8e43d005bf254279c18e5ee2467505",
  response.hash ===
    "00000038266d39aa8e1b8f1795602d6bea8e43d005bf254279c18e5ee2467505",
);
console.log(`Use the correct nonce: 5114425`, response.nonce === 5114425n);
