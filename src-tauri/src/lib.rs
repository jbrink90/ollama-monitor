// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  Manager,
};

#[tauri::command]
fn greet() -> String {
  let now = SystemTime::now();
  let epoch_ms = now.duration_since(UNIX_EPOCH)
    .map(|d| d.as_millis())
    .unwrap_or(0);
  format!("Hello world from Rust! Current epoch: {epoch_ms}")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let result = tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_process::init())
    .invoke_handler(tauri::generate_handler![greet])
    .setup(|app| {
      let quit_i = MenuItem::with_id(app, "quit", "Exit", true, None::<&str>)?;
      let settings_i = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&settings_i, &quit_i])?;

      let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(false)
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Ollama Monitor")
        .on_menu_event(move |app, event| match event.id.as_ref() {
          "quit" => {
            let _ = app.exit(0);
          }
          "settings" => {
            if let Some(settings_window) = app.get_webview_window("settings") {
              let _ = settings_window.show();
              let _ = settings_window.set_focus();
            }
          }
          _ => {}
        })
        .build(app)?;

      Ok(())
    })
    .run(tauri::generate_context!());

  if let Err(error) = result {
    eprintln!("error while running tauri application: {error}");
  }
}
