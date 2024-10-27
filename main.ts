import {
  Address,
  nativeToScVal,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  Observable,
  Subject,
  switchMap,
  timer,
} from "rxjs";
import { Worker } from "node:worker_threads";
import { Buffer } from "node:buffer";

import { fetchCurrentState } from "./utils.ts";
import type { Block, State, SubmitParams } from "./types.ts";
import {
  contract,
  cpuCores,
  hashPerWorker,
  keypair,
  rpc,
  submitTxs,
} from "./consts.ts";

const submit$: Subject<SubmitParams> = new Subject<SubmitParams>();
const reset$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);

const state$: Observable<{ block: Block; state: State }> = timer(0, 7000)
  .pipe(
    switchMap(() => fetchCurrentState({ contract, rpc })),
    distinctUntilChanged((
      previous: { block: Block; state: State },
      current: { block: Block; state: State },
    ): boolean => previous.state.current === current.state.current),
  );

let workers: Worker[] = [];

combineLatest([state$, reset$]).subscribe({
  next: async ([coreData]: [{ block: Block; state: State }, void]) => {
    console.log(
      `Start looking for Block ${
        coreData.block.index + 1n
      } with difficulty ${coreData.state.difficulty}`,
    );
    workers.forEach((w) => w.terminate());
    workers = Array.from({ length: cpuCores }).map(() =>
      new Worker("./worker.ts")
    );
    const tick: number = performance.now();
    await Promise.all(workers.map((worker) => {
      const message = "" + worker.threadId;

      return new Promise((r) => {
        worker.postMessage({
          index: nativeToScVal(coreData.state.current + 1n, { type: "u64" })
            .toXDR(),
          message: xdr.ScVal.scvString(message).toXDR(),
          prev_hash: xdr.ScVal.scvBytes(coreData.block.hash).toXDR(),
          miner: new Address(keypair.publicKey()).toScVal().toXDR(),
          difficulty: coreData.state.difficulty,
          times: hashPerWorker,
        });

        worker.on(
          "exit",
          () => console.log(`Worker ${worker.threadId} terminated`),
        );

        worker.on("message", (response) => {
          worker.terminate();

          if (response.type === "DONE") {
            console.log(
              `Start building tx for values block: ${
                coreData.state.current + 1n
              } with hash: ${response.payload.hash} and nonce: ${response.payload.nonce}`,
            );
            submit$.next({ ...response.payload, message });
            reset$.next();
          }
          r(0);
        });
      });
    }));
    const tock: number = performance.now();
    console.log(`It took ${tock - tick}ms to finish`);
  },
});

submit$.asObservable()
  .pipe(filter(() => submitTxs))
  .subscribe({
    next: async (payload: { hash: string; nonce: number; message: string }) => {
      const source = await rpc.getAccount(keypair.publicKey());
      const tx = new TransactionBuilder(source, {
        networkPassphrase: Networks.PUBLIC,
        fee: "10000000",
      }).setTimeout(0).addOperation(
        contract.call(
          "mine",
          xdr.ScVal.scvBytes(Buffer.from(payload.hash, "hex")),
          xdr.ScVal.scvString(payload.message),
          nativeToScVal(payload.nonce, { type: "u64" }),
          new Address(keypair.publicKey()).toScVal(),
        ),
      ).build();

      const sim = await rpc.simulateTransaction(tx);

      if (SorobanRpc.Api.isSimulationError(sim)) {
        console.error(sim.error);
        return;
      }
      const newTx = SorobanRpc.assembleTransaction(tx, sim).build();
      newTx.sign(keypair);
      console.log(`Sending tx`);
      rpc.sendTransaction(newTx);
    },
  });
