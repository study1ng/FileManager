use serde_json;

static FILE_SET_MANAGER_PATH: &str = "FileSetManager.json";


// 最初に一回だけ呼び出される.
#[tauri::command]
pub fn load_file_set_manager() -> Result<serde_json::Value, String> {
    if !std::path::Path::new(FILE_SET_MANAGER_PATH).exists() {
        match std::fs::write(FILE_SET_MANAGER_PATH, "{}") {
            Ok(_) => (),
            Err(_) => return Err("Failed to create file sets".to_string()),
        }
    }

    let file_sets = match std::fs::read_to_string(FILE_SET_MANAGER_PATH) { 
        Ok(file_sets) => file_sets,
        Err(_) => return Err("Failed to read file sets".to_string()),
    };

    let file_sets: serde_json::Value = match serde_json::from_str(&file_sets) { 
        Ok(file_sets) => file_sets,
        Err(_) => return Err("Failed to parse file sets".to_string()),
    };
    #[cfg(debug_assertions)]
    for (key, value) in file_sets.as_object().unwrap() {
        println!("{}", key);
        for (key, value) in value.as_object().unwrap() {
            println!("{}: {}", key, value);
        }
    }
    Ok(file_sets)
}

pub fn save_file_set_manager(file_sets: serde_json::Value) -> Result<(), String> {
    let file_sets = match serde_json::to_string_pretty(&file_sets) {
        Ok(file_sets) => file_sets,
        Err(_) => return Err("Failed to serialize file sets".to_string()),
    };
    match std::fs::write(FILE_SET_MANAGER_PATH, file_sets) {
        Ok(_) => Ok(()),
        Err(_) => Err("Failed to write file sets".to_string()),
    }
}
