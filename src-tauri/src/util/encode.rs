use sha3::{Digest, Sha3_256};


pub fn hash_password(password: &str) -> Vec<u8> {
    let mut hasher = Sha3_256::new();
    hasher.update(password);
    let result = hasher.finalize();
    result.to_vec()
}
