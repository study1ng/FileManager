use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use pbkdf2::pbkdf2_hmac_array;
use sha2::Sha256;
use serde::{Serialize, Deserialize};

fn make_key(password: &[u8], salt: &[u8]) -> [u8; 32] {
    let n = 600_000;
    pbkdf2_hmac_array::<Sha256, 32>(password, salt, n)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Encrypted {
    nonce: Vec<u8>,
    ciphertext: Vec<u8>,
}
impl Encrypted {
    pub fn new(nonce: Vec<u8>, ciphertext: Vec<u8>) -> Self {
        Self { nonce, ciphertext }
    }
    pub fn encrypt(text: &[u8], password: &str, salt: &[u8]) -> Self {
        let key = make_key(password.as_bytes(), salt);
        let key = Key::<Aes256Gcm>::from_slice(&key);
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
        let ciphertext = Aes256Gcm::new(key).encrypt(&nonce, text).unwrap();
        Self::new(nonce.to_vec(), ciphertext)
    }
    pub fn decrypt(&self, password: &str, salt: &[u8]) -> Vec<u8> {
        let key = make_key(password.as_bytes(), salt);
        let key = Key::<Aes256Gcm>::from_slice(&key);
        let nonce = Nonce::from_slice(&self.nonce);
        Aes256Gcm::new(key)
            .decrypt(&nonce, self.ciphertext.as_ref())
            .unwrap()
    }
}
