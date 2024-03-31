use serde_json;
use aes_gcm::aead::{rand_core::RngCore, OsRng};
use crate::util::{encode, load};

fn random_salt() -> [u8; 32] {
    let mut salt = [0u8; 32];
    OsRng.fill_bytes(&mut salt);
    salt
}

#[tauri::command]
pub async fn register(file_sets: serde_json::Value, file_set_name: &str, need_password: bool, password: &str) -> Result<(), String> {
    let mut file_sets = file_sets.clone();
    let salt = async {random_salt()};
    let password_hash = async {
        if need_password {
            encode::hash_password(password)
        } else {
            Vec::new()
        }
    };


    if file_sets[file_set_name].is_object() {
        return Err("File set already exists".to_string());
    }
    if !std::path::Path::new("./filesets").exists() {
        match std::fs::create_dir("./filesets") {
            Ok(_) => (),
            Err(_) => return Err("Failed to create file sets directory".to_string()),
        }
    }
    match std::fs::write(format!("./filesets/{}.json", file_set_name), "[]") {
        Ok(_) => (),
        Err(_) => return Err("Failed to create file set".to_string()),
    }
    file_sets[file_set_name] = serde_json::json!({
        "salt": salt.await,
        "password_hash": password_hash.await,
        "need_password": need_password,
        "last_accessed": chrono::Local::now().to_rfc3339(),
        "file_set_path": format!("./filesets/{}.json", file_set_name),
    });

    load::save_file_set_manager(file_sets).map_err(|err| err.to_string())
}

