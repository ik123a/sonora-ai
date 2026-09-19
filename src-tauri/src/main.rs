#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use keyring::Entry;
use tauri::Manager;

#[tauri::command]
fn store_api_key(service: String, account: String, secret: String) -> Result<(), String> {
    Entry::new(&service, &account).map_err(|e| e.to_string())?
        .set_password(&secret).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_api_key(service: String, account: String) -> Result<Option<String>, String> {
    let entry = Entry::new(&service, &account).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(v) => Ok(Some(v)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn list_music_dir(path: String) -> Result<Vec<String>, String> {
    let mut out = Vec::new();
    let rd = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    for e in rd.flatten() {
        if let Some(ext) = e.path().extension().and_then(|x| x.to_str()) {
            if ["mp3","flac","wav","aac","m4a","ogg","opus","aiff","aif"].contains(&ext.to_lowercase().as_str()) {
                out.push(e.path().to_string_lossy().to_string());
            }
        }
    }
    Ok(out)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::Builder::default().build())
        .plugin(tauri_plugin_fs::Builder::default().build())
        .plugin(tauri_plugin_notification::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::default().build())
        .setup(|app| {
            let _ = app.get_window("main");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![store_api_key, load_api_key, list_music_dir])
        .run(tauri::generate_context!())
        .expect("failed to run sonora-ai");
}
