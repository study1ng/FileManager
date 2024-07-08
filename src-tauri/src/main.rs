// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use filemanager::{fileset, load, login, registration};
use tauri::Manager;
use tauri::WindowEvent;

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
        .on_window_event(|event| {
            match event.event() {
                WindowEvent::CloseRequested { api, .. } => {
                    // フロントエンドにfilesetsを保存させる
                    let app_handle = event.window().app_handle();
                    app_handle.emit_all("close_window", ()).unwrap();
                    api.prevent_close();
                    app_handle.listen_global("close_window", move |_| {
                        console_log("got close_window".to_string());
                        let _ = event.window().close();
                    });
                }
                _ => {}
            }

        })
        .invoke_handler(tauri::generate_handler![
            console_log,
            registration::register,
            login::login,
            load::load_file_set_manager,
            fileset::read_filesets,
            fileset::save_filesets
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
