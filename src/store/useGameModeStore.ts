import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameModeSettings {
  theme: "light" | "dark" | "system";
  autoOptimizeInterval: number; // minutes
  memoryThreshold: number; // percentage
  startWithWindows: boolean;
  autoOptimizeOnHighMemory: boolean;
  disableNotifications: boolean;
  killBackgroundServices: boolean;
}

interface GameModeState {
  isActive: boolean;
  settings: GameModeSettings;
  memoryUsage: number;
  cpuUsage: number;
  memoryFreed: number;
  processesKilled: number;
  lastOptimizedAt: Date | null;

  // Actions
  toggleGameMode: () => void;
  updateSettings: (settings: Partial<GameModeSettings>) => void;
  setMemoryUsage: (usage: number) => void;
  setCpuUsage: (usage: number) => void;
  setMemoryFreed: (freed: number) => void;
  setProcessesKilled: (count: number) => void;
  setLastOptimized: (date: Date) => void;
}

const defaultSettings: GameModeSettings = {
  theme: "system",
  autoOptimizeInterval: 15,
  memoryThreshold: 80,
  startWithWindows: true,
  autoOptimizeOnHighMemory: true,
  disableNotifications: false,
  killBackgroundServices: false,
};

export const useGameModeStore = create<GameModeState>()(
  persist(
    (set) => ({
      isActive: false,
      settings: defaultSettings,
      memoryUsage: 34,
      cpuUsage: 12,
      memoryFreed: 0,
      processesKilled: 0,
      lastOptimizedAt: null,

      toggleGameMode: () =>
        set((state) => ({ isActive: !state.isActive })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setMemoryUsage: (usage) => set({ memoryUsage: usage }),
      setCpuUsage: (usage) => set({ cpuUsage: usage }),
      setMemoryFreed: (freed) => set({ memoryFreed: freed }),
      setProcessesKilled: (count) => set({ processesKilled: count }),
      setLastOptimized: (date) => set({ lastOptimizedAt: date }),
    }),
    {
      name: "game-mode-store",
    }
  )
);
