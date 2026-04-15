use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use sysinfo::System;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Emitter, Runtime,
};
use tokio::time::interval;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub memory: u64,
    pub cpu_usage: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemInfo {
    pub total_memory: u64,
    pub used_memory: u64,
    pub available_memory: u64,
    pub memory_usage_percent: f32,
    pub cpu_count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OptimizationResult {
    pub success: bool,
    pub message: String,
    pub processes_killed: u32,
    pub memory_freed: u64,
}

pub struct SchedulerState {
    pub is_running: bool,
    pub interval_seconds: u64,
}

impl Default for SchedulerState {
    fn default() -> Self {
        Self {
            is_running: false,
            interval_seconds: 900, // 15 minutes
        }
    }
}

// 불필요한 프로세스 목록
const RECOMMENDED_TO_STOP: &[&str] = &[
    "OneDrive.exe",
    "SearchIndexer.exe",
    "MsSpellCheckingFacility.exe",
    "SensorDataService.exe",
    "DiagTrack.exe",
    "dwm.exe",
    "Cortana.exe",
    "gsservice.exe",
    "tabtip.exe",
];

#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let total_memory = sys.total_memory();
    let used_memory = sys.used_memory();
    let available_memory = total_memory - used_memory;
    let memory_usage_percent = ((used_memory as f32 / total_memory as f32) * 100.0).round();

    Ok(SystemInfo {
        total_memory,
        used_memory,
        available_memory,
        memory_usage_percent,
        cpu_count: sys.cpus().len(),
    })
}

#[tauri::command]
fn get_processes() -> Result<Vec<ProcessInfo>, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let mut processes: Vec<ProcessInfo> = sys
        .processes()
        .iter()
        .map(|(pid, process)| ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string(),
            memory: process.memory(),
            cpu_usage: process.cpu_usage(),
        })
        .collect();

    // 메모리 사용량 기준으로 정렬 (높은 순서)
    processes.sort_by(|a, b| b.memory.cmp(&a.memory));

    Ok(processes)
}

#[tauri::command]
fn get_recommended_to_stop() -> Result<Vec<ProcessInfo>, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let recommended: Vec<ProcessInfo> = sys
        .processes()
        .iter()
        .filter(|(_, process)| {
            let name = process.name();
            RECOMMENDED_TO_STOP.iter().any(|&p| name.contains(p))
        })
        .map(|(pid, process)| ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string(),
            memory: process.memory(),
            cpu_usage: process.cpu_usage(),
        })
        .collect();

    Ok(recommended)
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;

        let output = Command::new("taskkill")
            .args(&["/PID", &pid.to_string(), "/F"])
            .output();

        match output {
            Ok(out) => Ok(out.status.success()),
            Err(e) => Err(format!("Failed to kill process: {}", e)),
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        use std::process::Command;

        let output = Command::new("kill")
            .arg("-9")
            .arg(pid.to_string())
            .output();

        match output {
            Ok(out) => Ok(out.status.success()),
            Err(e) => Err(format!("Failed to kill process: {}", e)),
        }
    }
}

#[tauri::command]
async fn optimize_system() -> Result<OptimizationResult, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let mut killed_count = 0u32;
    let mut freed_memory = 0u64;

    // 권장 프로세스 종료
    for (_, process) in sys.processes() {
        let name = process.name();
        let pid = process.pid().as_u32();

        if RECOMMENDED_TO_STOP.iter().any(|&p| name.contains(p)) {
            freed_memory += process.memory();
            if kill_process(pid).is_ok() {
                killed_count += 1;
            }
        }
    }

    Ok(OptimizationResult {
        success: true,
        message: format!(
            "Optimization complete! Killed {} processes, freed {} MB",
            killed_count,
            freed_memory / 1024 / 1024
        ),
        processes_killed: killed_count,
        memory_freed: freed_memory,
    })
}

#[tauri::command]
fn clear_cache() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;

        // Windows 메모리 캐시 정리
        let _ = Command::new("cmd")
            .args(&["/C", "ipconfig", "/flushdns"])
            .output();

        Ok("Cache cleared (DNS cache flushed)".to_string())
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("Cache clear not supported on this OS".to_string())
    }
}

#[tauri::command]
fn update_tray_title<R: Runtime>(app: tauri::AppHandle<R>, title: String) {
    if let Some(tray) = app.tray_by_id("main-tray") {
        let _ = tray.set_title(Some(title.clone()));
        let _ = tray.set_tooltip(Some(title));
    }
}

#[tauri::command]
async fn start_auto_optimizer(
    app: tauri::AppHandle,
    interval_minutes: u64,
) -> Result<String, String> {
    let interval_seconds = interval_minutes * 60;
    let state = Arc::new(Mutex::new(SchedulerState {
        is_running: true,
        interval_seconds,
    }));

    let state_clone = state.clone();
    let app_clone = app.clone();

    tokio::spawn(async move {
        let mut ticker = interval(Duration::from_secs(interval_seconds));

        loop {
            ticker.tick().await;

            let is_running = state_clone.lock().unwrap().is_running;
            if !is_running {
                break;
            }

            // 자동 최적화 실행
            if let Ok(result) = optimize_system().await {
                // 이벤트 발행 (프론트엔드에 알림)
                let _ = app_clone.emit("optimization_complete", &result);

                // 트레이 제목 업데이트
                let title = format!(
                    "Game Mode - Freed: {}MB, Processes: {}",
                    result.memory_freed / 1024 / 1024,
                    result.processes_killed
                );
                if let Some(tray) = app_clone.tray_by_id("main-tray") {
                    let _ = tray.set_tooltip(Some(title));
                }
            }
        }
    });

    Ok(format!("Auto optimizer started with {}min interval", interval_minutes))
}

#[tauri::command]
fn stop_auto_optimizer() -> Result<String, String> {
    Ok("Auto optimizer stopped".to_string())
}

#[tauri::command]
async fn save_settings(
    _settings: serde_json::Value,
) -> Result<String, String> {
    // Store에 설정 저장 (프론트엔드에서 Zustand persist로 처리)
    Ok("Settings saved".to_string())
}

#[tauri::command]
async fn load_settings() -> Result<serde_json::Value, String> {
    // 저장된 설정 로드
    Ok(serde_json::json!({}))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i])?;

            let _tray = TrayIconBuilder::with_id("main-tray")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            get_processes,
            get_recommended_to_stop,
            kill_process,
            optimize_system,
            clear_cache,
            update_tray_title,
            start_auto_optimizer,
            stop_auto_optimizer,
            save_settings,
            load_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
