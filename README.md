# FCM Simple Miner

A simple miner written in typescript and using Deno.

Before you run this miner, you need to change the name of `copy.env` to `.env` and fill it with your information.

On a M1 pro Macbook this simple miner makes around ~1.42 MH/s, using 16 workers this goes to more than 20 MH/s.

> Note: Please use a separated account for mining, having a secret key in plain
> text is always dangerous.

# Build and run the miner

This miner uses a combination of Deno and Rust so you will need to have both installed in your computer. Follow the next
steps:

- First generate the WASM package with `deno run build`
- Once the package has been generated, start the miner with `deno run start`

# Benchmark your computer

If you would like to know how many hashes per worker your computer can produce with this miner, you can run
`deno run benchmark` and after a few seconds you will see the results.