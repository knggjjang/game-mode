import { useEffect, useCallback } from "react";
import { useGameModeStore } from "@/store/useGameModeStore";
import {
  getSystemInfo,
  getRecommendedToStop,
  optimizeSystem,
  ProcessInfo,
} from "@/services/gameModeService";

export function useSystemMonitor() {
  const {
    isActive,
    settings,
    memoryUsage,
    setMemoryUsage,
    setCpuUsage,
    setProcessesKilled,
    setMemoryFreed,
    setLastOptimized,
  } = useGameModeStore();

  // 시스템 정보 주기적으로 조회 및 임계값 모니터링
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(async () => {
      try {
        const sysInfo = await getSystemInfo();
        const currentMemory = Math.round(sysInfo.memory_usage_percent);
        setMemoryUsage(currentMemory);

        // CPU 사용률 계산 (시뮬레이션)
        setCpuUsage(Math.round(Math.random() * 40) + 5);

        // 메모리 임계값 체크
        if (
          settings.autoOptimizeOnHighMemory &&
          currentMemory >= settings.memoryThreshold
        ) {
          console.log(
            `Memory threshold exceeded: ${currentMemory}% >= ${settings.memoryThreshold}%`
          );
          // 자동 최적화 실행
          const result = await optimizeSystem();
          setProcessesKilled(result.processes_killed);
          setMemoryFreed(result.memory_freed / 1024 / 1024); // Convert to MB
          setLastOptimized(new Date());
        }
      } catch (error) {
        console.error("Failed to update system info:", error);
      }
    }, 2000); // 2초마다 업데이트

    return () => clearInterval(interval);
  }, [
    isActive,
    settings.autoOptimizeOnHighMemory,
    settings.memoryThreshold,
    setMemoryUsage,
    setCpuUsage,
    setProcessesKilled,
    setMemoryFreed,
    setLastOptimized,
  ]);

  // 권장 프로세스 목록 조회
  const getRecommendedProcesses = useCallback(async (): Promise<ProcessInfo[]> => {
    try {
      return await getRecommendedToStop();
    } catch (error) {
      console.error("Failed to get recommended processes:", error);
      return [];
    }
  }, []);

  return {
    getRecommendedProcesses,
  };
}
