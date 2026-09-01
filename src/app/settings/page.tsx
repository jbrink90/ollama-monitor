"use client";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Minus, X } from "lucide-react";
import { useState, useEffect } from "react";

const refreshIntervalOptions = [
  { label: "1 second", value: 1000 },
  { label: "3 seconds", value: 3000 },
  { label: "5 seconds", value: 5000 },
  { label: "10 seconds", value: 10000 },
  { label: "30 seconds", value: 30000 },
  { label: "1 minute", value: 60000 },
  { label: "3 minutes", value: 180000 },
];

const DEFAULT_REFRESH_INTERVAL = 5000;
const DEFAULT_OLLAMA_INSTANCE = "http://127.0.0.1:11434";
const DEFAULT_TOTAL_RAM = 32;
const DEFAULT_TOTAL_VRAM = 12;

export default function SettingsPage() {
  const [refreshInterval, setRefreshInterval] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_REFRESH_INTERVAL;
    const saved = localStorage.getItem("refreshInterval");
    return saved ? Number(saved) : DEFAULT_REFRESH_INTERVAL;
  });
  const [ollamaInstance, setOllamaInstance] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_OLLAMA_INSTANCE;
    const saved = localStorage.getItem("ollamaInstance");
    return saved || DEFAULT_OLLAMA_INSTANCE;
  });
  const [totalRam, setTotalRam] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_TOTAL_RAM;
    const saved = localStorage.getItem("totalRam");
    return saved ? Number(saved) : DEFAULT_TOTAL_RAM;
  });
  const [totalVram, setTotalVram] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_TOTAL_VRAM;
    const saved = localStorage.getItem("totalVram");
    return saved ? Number(saved) : DEFAULT_TOTAL_VRAM;
  });

  const minimize = async () => {
    if (typeof window === "undefined") return;
    if (!("__TAURI_INTERNALS__" in window)) return;
    const settingsWindow = await WebviewWindow.getByLabel("settings");
    if (settingsWindow) {
      await settingsWindow.minimize();
    }
  };

  const close = async () => {
    if (typeof window === "undefined") return;
    if (!("__TAURI_INTERNALS__" in window)) return;
    const settingsWindow = await WebviewWindow.getByLabel("settings");
    if (settingsWindow) {
      await settingsWindow.hide();
    }
  };

  const changeRefreshInterval = (value: number) => {
    setRefreshInterval(value);
  };

  const changeOllamaInstance = (value: string) => {
    setOllamaInstance(value);
  };

  const changeTotalRam = (value: number) => {
    setTotalRam(value);
  };

  const changeTotalVram = (value: number) => {
    setTotalVram(value);
  };

  const saveSettings = async () => {
    if (typeof window === "undefined") return;

    localStorage.setItem("refreshInterval", String(refreshInterval));
    localStorage.setItem("ollamaInstance", ollamaInstance);
    localStorage.setItem("totalRam", String(totalRam));
    localStorage.setItem("totalVram", String(totalVram));

    if ("__TAURI_INTERNALS__" in window) {
      await emit("settings-changed", {
        refreshInterval,
        ollamaInstance,
        totalRam,
        totalVram,
      });
    }

    close();
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#23374b] border rounded-xl border-gray-300/30 text-white">
      <header
        data-tauri-drag-region
        className="shrink-0 flex flex-row justify-between w-full border-b-2 border-white/10 pb-4 pt-6"
      >
        <div className="flex flex-row gap-4 w-full pl-8 select-none">
          <h1 className="text-3xl">Settings</h1>
        </div>
        <div className="flex gap-6 w-full justify-end text-3xl pr-8 pb-4">
          <button className="cursor-pointer" onClick={minimize}>
            <Minus className="w-8 h-8" />
          </button>
          <button className="cursor-pointer" onClick={close}>
            <X className="w-8 h-8" />
          </button>
        </div>
      </header>
      <div className="flex-1 p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium">Refresh Interval</label>
            <select
              value={refreshInterval}
              onChange={(e) => changeRefreshInterval(Number(e.target.value))}
              className="bg-[#1a2a3a] border border-gray-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {refreshIntervalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium">Ollama Instance URL</label>
            <input
              type="text"
              value={ollamaInstance}
              onChange={(e) => changeOllamaInstance(e.target.value)}
              placeholder="http://127.0.0.1:11434"
              className="bg-[#1a2a3a] border border-gray-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium">System Memory (GB)</label>
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm text-white/70">Total RAM</label>
                <input
                  type="number"
                  min="1"
                  value={totalRam}
                  onChange={(e) => changeTotalRam(Number(e.target.value))}
                  className="bg-[#1a2a3a] border border-gray-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm text-white/70">Total VRAM</label>
                <input
                  type="number"
                  min="1"
                  value={totalVram}
                  onChange={(e) => changeTotalVram(Number(e.target.value))}
                  className="bg-[#1a2a3a] border border-gray-500/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveSettings}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
