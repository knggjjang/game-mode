import { useEffect, useCallback } from "react";
import { useGameModeStore } from "@/store/useGameModeStore";
import {
  getSystemInfo,
  getRecommendedToStop,
  ProcessInfo,
} from "@/services/gameModeService";

export function useSystemMonitor() {
  const {
    isActive,
    settings,
    setMemoryUsage,
    setCpuUsage,
    setProcessesKilled,
  } = useGameModeStore();

  // 시스템 정보 주기적으로 조회
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(async () => {
      try {
        const sysInfo = await getSystemInfo();
        setMemoryUsage(Math.round(sysInfo.memory_usage_percent));

        // CPU 사용률 계산 (시뮬레이션)
        setCpuUsage(Math.round(Math.random() * 40) + 5);
      } catch (error) {
        console.error("Failed to update system info:", error);
      }
    }, 2000); // 2초마다 업데이트

    return () => clearInterval(interval);
  }, [isActive, setMemoryUsage, setCpuUsage]);

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
