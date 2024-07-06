// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use filemanager::{login, registration, load, fileset};
use tauri::Manager;

#[tauri::command]
fn console_log(message: String) {
    println!("{}", message);
}

fn main() {
    tauri::Builder::default()
    .setup(|app| {
        #[cfg(debug_assertions)] // only include this code on debug builds
        {
            let window = app.get_window("main").unwrap();
            window.open_devtools();
            // window.close_devtools();
        }
        Ok(())
    })
        .invoke_handler(tauri::generate_handler![
            console_log, registration::register, login::login, load::load_file_set_manager, fileset::read_filesets, fileset::save_filesets
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
