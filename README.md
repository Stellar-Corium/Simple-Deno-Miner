# FCM Simple Miner

A simple miner written in typescript and using Deno.

To run this you need to change the name of `copy.env` to `.env` and fill it with information.

On a M1 pro Macbook this simple miner makes around 850k hashes per second when it uses all the cores available.

> Note: Please use a separated account for mining, having a secret key in plain text is always dangerous.

To run the miner execute `deno run --allow-all main.ts`