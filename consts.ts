import { Contract, Keypair, SorobanRpc } from "@stellar/stellar-sdk";
import { parse } from "@std/dotenv";
import { ensureFile } from "@std/fs";

await ensureFile(".env");
const envFile: string = await Deno.readTextFile(".env");
const parsedEnv: Record<string, string> = parse(envFile);

export const rpc: SorobanRpc.Server = new SorobanRpc.Server(parsedEnv.RPC_URL);
export const contract: Contract = new Contract(parsedEnv.CONTRACT_ID);
export const cpuCores: number = parseInt(parsedEnv.CPU_CORES, 10);
export const hashPerWorker: number = parseInt(parsedEnv.HASH_TIMES, 10);
export const submitTxs: boolean = parsedEnv.SUBMIT_TXS === "TRUE";

export const secret: string = parsedEnv.MINER_SECRET;
export const keypair: Keypair = Keypair.fromSecret(secret);
