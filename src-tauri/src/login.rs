use crate::{util::hash, load};

fn check_password(file_sets: &serde_json::Value, file_set_name: &str, password: &str) -> Result<bool, String> {
    let hashed_password = file_sets[file_set_name]["password_hash"].as_array().ok_or("Password hash is not an array".to_string())?;
    let hashed_password1 = hash::hash_password(password);
    #[cfg(debug_assertions)]
    {
        println!("{}", if hashed_password == &hashed_password1 { "Password is correct" } else { "Password is incorrect" });
    };
    Ok(hashed_password == &hashed_password1)
}

#[tauri::command]
pub fn login(file_sets: serde_json::Value, file_set_name: &str, password: &str) -> Result<(), String> {
    let mut file_sets = file_sets.clone();
    #[cfg(debug_assertions)]
    {
        println!();
        println!("login was called with the following parameters:");
        println!("file_set_name: {}", file_set_name);
        println!("password: {}", password);
        for (key, value) in file_sets[file_set_name].as_object().unwrap() {
            println!("{}: {}", key, value);
        }
        println!();
    }
    
    let need_password = file_sets[file_set_name]["need_password"].as_bool().ok_or("Need password is not a boolean".to_string())?;
    if need_password {
        if !check_password(&file_sets, file_set_name, password)? {
            return Err("Password is incorrect".to_string());
        }
    }
    file_sets[file_set_name]["last_accessed"] = serde_json::json!(chrono::Local::now().to_rfc3339());
    load::save_file_set_manager(file_sets).inspect(|_| {
        #[cfg(debug_assertions)]
        {
            println!("File set manager was saved");
        }
    })
}
