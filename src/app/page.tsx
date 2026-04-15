"use client";

import React, { useState } from "react";
import { useGameModeStore } from "@/store/useGameModeStore";
import { useSystemMonitor } from "@/hooks/useSystemMonitor";
import {
  optimizeSystem,
  getRecommendedToStop,
  ProcessInfo,
} from "@/services/gameModeService";
import {
  Gamepad2,
  Settings as SettingsIcon,
  Minimize2,
  X,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function Dashboard() {
  const {
    isActive,
    settings,
    memoryUsage,
    cpuUsage,
    memoryFreed,
    processesKilled,
    toggleGameMode,
    updateSettings,
    setMemoryFreed,
    setProcessesKilled,
  } = useGameModeStore();

  const { getRecommendedProcesses } = useSystemMonitor();

  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings" | "processes">(
    "dashboard"
  );
  const [intervalValue, setIntervalValue] = useState(settings.autoOptimizeInterval);
  const [thresholdValue, setThresholdValue] = useState(settings.memoryThreshold);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [recommendedProcesses, setRecommendedProcesses] = useState<ProcessInfo[]>([]);

  React.useEffect(() => {
    setMounted(true);
    loadRecommendedProcesses();
  }, []);

  const loadRecommendedProcesses = async () => {
    try {
      const processes = await getRecommendedProcesses();
      setRecommendedProcesses(processes);
    } catch (error) {
      console.error("Failed to load recommended processes:", error);
    }
  };

  const handleIntervalChange = (value: number) => {
    setIntervalValue(value);
    updateSettings({ autoOptimizeInterval: value });
  };

  const handleThresholdChange = (value: number) => {
    setThresholdValue(value);
    updateSettings({ memoryThreshold: value });
  };

  const handleOptimizeNow = async () => {
    setIsOptimizing(true);
    try {
      const result = await optimizeSystem();
      setProcessesKilled(result.processes_killed);
      setMemoryFreed(result.memory_freed / 1024 / 1024); // Convert to MB

      // 프로세스 목록 새로고침
      await loadRecommendedProcesses();
    } catch (error) {
      console.error("Failed to optimize system:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden flex flex-col">
      {/* Title Bar */}
      <div className="h-12 bg-black/40 border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Gamepad2 size={16} className="text-green-500" />
          GAME MODE - Windows Gaming Optimizer
        </div>
        <div className="flex gap-2">
          <button className="w-8 h-8 hover:bg-white/10 rounded flex items-center justify-center transition-colors">
            <Minimize2 size={16} />
          </button>
          <button className="w-8 h-8 hover:bg-red-500/20 rounded flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Status Section */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isActive ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium">
              {isActive ? "Gaming Mode Active" : "Standby"}
            </span>
          </div>
          <p className="text-xs text-white/50">
            {isActive
              ? `Optimizing every ${settings.autoOptimizeInterval} minutes`
              : "Click the button to activate Gaming Mode"}
          </p>
        </div>

        {/* Gaming Mode Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={toggleGameMode}
            className={`w-40 h-40 rounded-full border-4 flex items-center justify-center text-6xl transition-all duration-300 ${
              isActive
                ? "border-green-500 bg-gradient-to-br from-green-500/25 to-green-500/5 shadow-[0_0_40px_rgba(34,197,94,0.6),inset_0_0_20px_rgba(34,197,94,0.2)]"
                : "border-green-500 bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            } hover:scale-105`}
          >
            🎮
          </button>
          <p className="text-sm text-white/60">Gaming Mode</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-white/10">
          {["dashboard", "settings", "processes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Memory Usage" value={`${memoryUsage}%`} />
              <StatCard label="CPU Usage" value={`${cpuUsage}%`} />
              <StatCard label="Memory Freed" value={`${memoryFreed} GB`} />
              <StatCard label="Processes Stopped" value={`${processesKilled}`} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleOptimizeNow}
                disabled={isOptimizing}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-semibold text-sm transition-all"
              >
                <Zap size={16} className={isOptimizing ? "animate-spin" : ""} />
                {isOptimizing ? "Optimizing..." : "Optimize Now"}
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className="flex-1 flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                <SettingsIcon size={16} /> Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Auto Optimization */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-green-500">
                Auto Optimization
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-white/80">
                      Interval (minutes)
                    </label>
                    <span className="text-green-500 font-semibold">
                      {intervalValue}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={intervalValue}
                    onChange={(e) => handleIntervalChange(Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-white/80">
                      Memory Threshold (%)
                    </label>
                    <span className="text-green-500 font-semibold">
                      {thresholdValue}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={thresholdValue}
                    onChange={(e) => handleThresholdChange(Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-green-500">
                Options
              </h3>

              <div className="space-y-3">
                <CheckboxItem
                  label="Start with Windows"
                  checked={settings.startWithWindows}
                  onChange={(checked) =>
                    updateSettings({ startWithWindows: checked })
                  }
                />
                <CheckboxItem
                  label="Auto-optimize on high memory usage"
                  checked={settings.autoOptimizeOnHighMemory}
                  onChange={(checked) =>
                    updateSettings({ autoOptimizeOnHighMemory: checked })
                  }
                />
                <CheckboxItem
                  label="Disable notifications"
                  checked={settings.disableNotifications}
                  onChange={(checked) =>
                    updateSettings({ disableNotifications: checked })
                  }
                />
                <CheckboxItem
                  label="Kill background services (risky)"
                  checked={settings.killBackgroundServices}
                  onChange={(checked) =>
                    updateSettings({ killBackgroundServices: checked })
                  }
                />
              </div>
            </div>

            {/* Save Button */}
            <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 px-4 py-3 rounded-lg font-semibold transition-all">
              Save Settings
            </button>
          </div>
        )}

        {activeTab === "processes" && (
          <div className="space-y-4">
            {/* Recommended to Stop */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-green-500">
                  Recommended to Stop ({recommendedProcesses.length})
                </h3>
                <button
                  onClick={loadRecommendedProcesses}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              {recommendedProcesses.length > 0 ? (
                <ProcessListWithPid processes={recommendedProcesses} />
              ) : (
                <p className="text-xs text-white/50 py-4">
                  No unnecessary processes found
                </p>
              )}
            </div>

            {/* Running Processes */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-green-500">
                Tips
              </h3>
              <div className="text-xs text-white/60 space-y-2">
                <p>💡 Click "Optimize Now" to automatically stop unnecessary processes</p>
                <p>💡 Processes are detected and stopped based on system recommendations</p>
                <p>⚠️ Be careful when manually stopping processes</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
      <p className="text-xs uppercase text-white/50 tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-green-500">{value}</p>
    </div>
  );
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-green-500"
      />
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );
}

function ProcessList({
  processes,
}: {
  processes: Array<{ name: string; memory: string }>;
}) {
  return (
    <div className="space-y-2">
      {processes.map((process, idx) => (
        <div key={idx} className="flex justify-between items-center p-2 text-sm">
          <span className="text-white/70">{process.name}</span>
          <span className="text-green-500 font-semibold">{process.memory}</span>
        </div>
      ))}
    </div>
  );
}

function ProcessListWithPid({
  processes,
}: {
  processes: ProcessInfo[];
}) {
  const formatMemory = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${Math.round(mb)} MB`;
  };

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {processes.map((process) => (
        <div
          key={process.pid}
          className="flex justify-between items-center p-2 text-sm border-b border-white/5"
        >
          <div className="flex-1">
            <div className="text-white/70">{process.name}</div>
            <div className="text-xs text-white/40">PID: {process.pid}</div>
          </div>
          <span className="text-green-500 font-semibold">
            {formatMemory(process.memory)}
          </span>
        </div>
      ))}
    </div>
  );
}
