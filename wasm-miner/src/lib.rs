use hex::encode;
use tiny_keccak::Hasher;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct Response {
    pub hash: String,
    pub nonce: u64,
}

#[wasm_bindgen]
pub fn is_difficulty_correct(hash: &[u8], difficulty: u32) -> bool {
    let hex = encode(hash);
    let mut total_zeroes: u32 = 0;

    for char in hex.chars() {
        if char as u32 != 48 {
            break;
        } else {
            total_zeroes += 1;
        }
    }

    total_zeroes == difficulty
}

#[wasm_bindgen]
pub fn create_block_hash(
    index: &[u8],
    message: &[u8],
    prev_hash: &[u8],
    nonce: &[u8],
    miner: &[u8],
) -> Vec<u8> {
    let data: Vec<u8> = [
        index,
        message,
        prev_hash,
        nonce,
        miner
    ].concat();

    let mut hasher: tiny_keccak::Keccak = tiny_keccak::Keccak::v256();
    hasher.update(data.as_slice());
    let mut calculated_hash: Vec<u8> = vec![0u8; 32];
    hasher.finalize(&mut calculated_hash);

    calculated_hash
}

#[wasm_bindgen]
pub fn find_block_hash_nonce(
    difficulty: u32,
    index: &[u8],
    message: &[u8],
    prev_hash: &[u8],
    miner: &[u8],
) -> Response {
    let mut found: bool = false;
    let u64start: [u8; 4] = [0, 0, 0, 5];
    let mut nonce: u64 = 0;
    let mut hash: Vec<u8> = Vec::new();

    while !found {
        let calculated_hash: Vec<u8> = create_block_hash(
            &index,
            &message,
            &prev_hash,
            &[u64start.as_slice(), nonce.to_be_bytes().as_slice()].concat(),
            &miner,
        );

        if is_difficulty_correct(&calculated_hash, difficulty) {
            found = true;
        } else {
            nonce += 1;
        }
        hash = calculated_hash.to_vec();
    }

    Response {
        hash: encode(hash),
        nonce,
    }
}

#[cfg(test)]
mod test {
    use crate::create_block_hash;

    #[test]
    fn test_create_block() {
        let index: [u8; 12] = [0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 1];
        let message: [u8; 28] = [0, 0, 0, 14, 0, 0, 0, 18, 84, 104, 101, 32, 114, 97, 110, 100, 111, 109, 32, 109, 101, 115, 115, 97, 103, 101, 0, 0];
        let prev_hash: [u8; 40] = [0, 0, 0, 13, 0, 0, 0, 32, 70, 207, 147, 217, 66, 230, 4, 40, 240, 225, 22, 22, 65, 42, 200, 97, 41, 66, 186, 145, 104, 184, 92, 64, 14, 97, 241, 104, 247, 151, 78, 26];
        let nonce: [u8; 12] = [0, 0, 0, 5, 0, 0, 0, 0, 0, 78, 10, 57];
        let miner: [u8; 40] = [0, 0, 0, 18, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4];

        let hash: Vec<u8> = create_block_hash(&index, &message, &prev_hash, &nonce, &miner);

        assert_eq!(
            hash,
            [
                0, 0, 0, 56, 38, 109, 57, 170, 142, 27, 143, 23, 149, 96, 45, 107, 234, 142, 67,
                208, 5, 191, 37, 66, 121, 193, 142, 94, 226, 70, 117, 5
            ]
        );
    }
}