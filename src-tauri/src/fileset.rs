use crate::util::crypt::{self, Encrypted};
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Write;
use std::{fs, process::Command};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Fileset {
    name: String,
    path: String,
    tags: Vec<String>,
    opener: String,
}

impl Fileset {
    pub fn open(&self) {
        Command::new(self.opener.clone())
            .arg(self.path.clone())
            .spawn().unwrap();
    }
}

#[tauri::command]
pub fn read_filesets(
    fileset_manager: serde_json::Value,
    name: &str,
    password: &str,
) -> Result<Vec<Fileset>, String> {
    let target = format!("filesets/{}.json", name);
    let fileset_info = fileset_manager.get(name).unwrap();
    let salt: Vec<u8> = fileset_info["salt"]
        .as_array()
        .unwrap()
        .iter()
        .map(|x| x.as_u64().unwrap() as u8)
        .collect();
    let target = fs::read_to_string(target).map_err(|_| "Failed to read fileset file")?;
    let target: Encrypted = serde_json::from_str(&target).map_err(|_| "Failed to parse fileset file")?;
    let target = target.decrypt(password, salt.as_slice());
    let target = String::from_utf8(target).map_err(|_| "Failed to convert fileset file to string")?;
    let target = serde_json::from_str(&target).map_err(|_| "Failed to parse fileset file")?;

    println!("target: {:?}", target);
    Ok(target)
}

#[tauri::command]
pub fn save_filesets(
    fileset_manager: serde_json::Value,
    name: &str,
    password: &str,
    filesets: Vec<Fileset>,
) -> Result<(), String> {
    let target_path = format!("filesets/{}.json", name);
    println!("saved: {:?}", filesets);
    let target = serde_json::to_string(&filesets).map_err(|_| "Failed to serialize filesets")?;
    let target = crypt::Encrypted::encrypt(
        target.as_bytes(),
        password,
        fileset_manager[name]["salt"]
            .as_array()
            .unwrap()
            .iter()
            .map(|x| x.as_u64().unwrap() as u8)
            .collect::<Vec<_>>()
            .as_slice(),
    );
    let target = serde_json::to_string(&target).map_err(|_| "Failed to serialize encrypted filesets")?;
    File::create(target_path)
        .map_err(|_| "Failed to create fileset file")?
        .write_all(target.as_bytes())
        .map_err(|_| "Failed to write fileset file")?;
    Ok(())
}
