import { invoke } from "@tauri-apps/api/core";

export interface ProcessInfo {
  pid: number;
  name: string;
  memory: number;
  cpu_usage: number;
}

export interface SystemInfo {
  total_memory: number;
  used_memory: number;
  available_memory: number;
  memory_usage_percent: number;
  cpu_count: number;
}

export interface OptimizationResult {
  success: boolean;
  message: string;
  processes_killed: number;
  memory_freed: number;
}

/**
 * 시스템 정보 조회
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  try {
    return await invoke<SystemInfo>("get_system_info");
  } catch (error) {
    console.error("Failed to get system info:", error);
    throw error;
  }
}

/**
 * 모든 프로세스 조회
 */
export async function getProcesses(): Promise<ProcessInfo[]> {
  try {
    return await invoke<ProcessInfo[]>("get_processes");
  } catch (error) {
    console.error("Failed to get processes:", error);
    throw error;
  }
}

/**
 * 종료 권장 프로세스 조회
 */
export async function getRecommendedToStop(): Promise<ProcessInfo[]> {
  try {
    return await invoke<ProcessInfo[]>("get_recommended_to_stop");
  } catch (error) {
    console.error("Failed to get recommended processes:", error);
    throw error;
  }
}

/**
 * 프로세스 강제 종료
 */
export async function killProcess(pid: number): Promise<boolean> {
  try {
    return await invoke<boolean>("kill_process", { pid });
  } catch (error) {
    console.error(`Failed to kill process ${pid}:`, error);
    throw error;
  }
}

/**
 * 시스템 최적화 (불필요한 프로세스 종료)
 */
export async function optimizeSystem(): Promise<OptimizationResult> {
  try {
    return await invoke<OptimizationResult>("optimize_system");
  } catch (error) {
    console.error("Failed to optimize system:", error);
    throw error;
  }
}

/**
 * 캐시 정리
 */
export async function clearCache(): Promise<string> {
  try {
    return await invoke<string>("clear_cache");
  } catch (error) {
    console.error("Failed to clear cache:", error);
    throw error;
  }
}

/**
 * 트레이 제목 업데이트
 */
export async function updateTrayTitle(title: string): Promise<void> {
  try {
    await invoke<void>("update_tray_title", { title });
  } catch (error) {
    console.error("Failed to update tray title:", error);
    // 트레이 업데이트 실패는 무시
  }
}
