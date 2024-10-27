import {
  Contract,
  nativeToScVal,
  scValToNative,
  SorobanRpc,
  xdr,
} from "@stellar/stellar-sdk";
import type { Block, State } from "./types.ts";

export async function fetchCurrentState(
  params: { rpc: SorobanRpc.Server; contract: Contract },
): Promise<{ block: Block; state: State }> {
  const instanceData: SorobanRpc.Api.LedgerEntryResult = await params.rpc
    .getContractData(
      params.contract,
      xdr.ScVal.scvLedgerKeyContractInstance(),
      SorobanRpc.Durability.Persistent,
    );

  const state: State = scValToNative(
    (instanceData.val.value() as any).val().value().storage()[0].val(),
  );

  const keyEntry = await params.rpc.getContractData(
    params.contract,
    xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol("Block"),
      nativeToScVal(state.current, { type: "u64" }),
    ]),
    SorobanRpc.Durability.Persistent,
  );

  const block: Block = scValToNative(keyEntry.val.contractData().val());
  return { state, block };
}
