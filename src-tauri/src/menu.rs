use std::process::Command;
use std::path::Path;
use serde_json::Value;

async fn open_parent_folder(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    let parent = path.parent().ok_or("Failed to get parent folder")?;
    if parent.exists() && parent.is_dir() {
        let mut command = Command::new("powershell");
        command.arg("Invoke-Item");
        command.arg(parent.to_str().ok_or("Failed to convert parent path to string")?);
        command
            .spawn()
            .map_err(|error| String::from("Failed to open ") + parent.to_str().unwrap() + ": " + &error.to_string())?;
        Ok(())
    } else {
        Err("Parent folder does not exist".to_string())
    }
}

#[tauri::command]
pub async fn menu_action(command: String, args: Value) -> Result<Value, String> {
    match command.as_str() {
        "openParent" => {
            open_parent_folder(args["path"].as_str().unwrap().to_string()).await?;
            Ok(serde_json::json!({}))
        },
        _ => Err(format!("Unknown command: {}", command))
    }
}