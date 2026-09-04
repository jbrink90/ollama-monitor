"use client";

import { Minus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/settings";

const refreshIntervalOptions = [
  { label: "1 second", value: 1000 },
  { label: "3 seconds", value: 3000 },
  { label: "5 seconds", value: 5000 },
  { label: "10 seconds", value: 10000 },
  { label: "30 seconds", value: 30000 },
  { label: "1 minute", value: 60000 },
  { label: "3 minutes", value: 180000 },
];

export default function SettingsPage() {
  const [refreshInterval, setRefreshInterval] = useState(5000);

  const [ollamaInstance, setOllamaInstance] = useState(
    "http://127.0.0.1:11434",
  );

  const [totalRam, setTotalRam] = useState(32);

  const [totalVram, setTotalVram] = useState(12);

  const [smallWidget, setSmallWidget] = useState(false);

  const loadSettings = useCallback(() => {
    const settings = getSettings();

    setRefreshInterval(settings.refreshInterval);
    setOllamaInstance(settings.ollamaInstance);
    setTotalRam(settings.totalRam);
    setTotalVram(settings.totalVram);
    setSmallWidget(settings.smallWidget);
  }, []);

  useEffect(() => {
    loadSettings();

    window.addEventListener("focus", loadSettings);

    return () => {
      window.removeEventListener("focus", loadSettings);
    };
  }, [loadSettings]);

  const minimize = async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("__TAURI_INTERNALS__" in window)) {
      return;
    }

    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");

    const settingsWindow = await WebviewWindow.getByLabel("settings");

    if (settingsWindow) {
      await settingsWindow.minimize();
    }
  };

  const close = async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("__TAURI_INTERNALS__" in window)) {
      return;
    }

    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");

    const settingsWindow = await WebviewWindow.getByLabel("settings");

    if (settingsWindow) {
      await settingsWindow.hide();
    }
  };

  const handleSmallWidgetClick = () => {
    setSmallWidget((previous) => !previous);
  };

  const handleSaveSettings = async () => {
    const settings = {
      refreshInterval,
      ollamaInstance,
      totalRam,
      totalVram,
      smallWidget,
    };

    saveSettings(settings);

    await close();
  };

  return (
    <div
      className="
        h-screen
        w-screen
        flex
        flex-col
        bg-[#23374b]
        border
        rounded-xl
        border-gray-300/30
        text-white
      "
    >
      <header
        data-tauri-drag-region
        className="
          shrink-0
          flex
          flex-row
          justify-between
          w-full
          border-b-2
          border-white/10
          pb-4
          pt-6
        "
      >
        <div
          className="
            flex
            flex-row
            gap-4
            w-full
            pl-8
            select-none
          "
        >
          <h1 className="text-3xl">Settings</h1>
        </div>

        <div
          className="
            flex
            gap-6
            w-full
            justify-end
            text-3xl
            pr-8
            pb-4
          "
        >
          <button
            type="button"
            className="cursor-pointer"
            onClick={minimize}
            aria-label="Minimize"
          >
            <Minus className="w-8 h-8" />
          </button>

          <button
            type="button"
            className="cursor-pointer"
            onClick={close}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </header>

      <div
        className="
          flex-1
          overflow-y-auto
          p-8
        "
      >
        <div className="flex flex-col gap-6">
          {/* Widget Layout */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-lg font-medium" htmlFor="widgetLayout">
                Widget Layout
              </label>

              <p className="text-sm text-white/50 mt-1">
                Choose between the full dashboard and a compact widget.
              </p>
            </div>

            <div
              className="
                flex
                items-center
                justify-between
                bg-[#1a2a3a]
                border
                border-gray-500/50
                rounded-lg
                p-4
              "
            >
              <span className="font-medium">Small Widget</span>

              <button
                type="button"
                onClick={handleSmallWidgetClick}
                className={`
                  relative
                  w-14
                  h-7
                  rounded-full
                  transition-colors
                  cursor-pointer
                  ${smallWidget ? "bg-blue-600" : "bg-gray-600"}
                `}
                aria-label="Toggle small widget"
                aria-pressed={smallWidget}
              >
                <span
                  className={`
                    absolute
                    top-1
                    left-1
                    w-5
                    h-5
                    bg-white
                    rounded-full
                    shadow-md
                    transition-transform
                    ${smallWidget ? "translate-x-7" : "translate-x-0"}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Refresh Interval */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium" htmlFor="refreshInterval">
              Refresh Interval
            </label>

            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="
                bg-[#1a2a3a]
                border
                border-gray-500/50
                rounded-lg
                p-3
                text-white
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            >
              {refreshIntervalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ollama Instance */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium" htmlFor="ollamaInstance">
              Ollama Instance URL
            </label>

            <input
              type="text"
              value={ollamaInstance}
              onChange={(e) => setOllamaInstance(e.target.value)}
              placeholder="http://127.0.0.1:11434"
              className="
                bg-[#1a2a3a]
                border
                border-gray-500/50
                rounded-lg
                p-3
                text-white
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium" htmlFor="systemMemory">
              System Memory (GB)
            </label>

            <div className="flex gap-4">
              <div
                className="
                  flex-1
                  flex
                  flex-col
                  gap-2
                "
              >
                <label className="text-sm text-white/70" htmlFor="memory">
                  Total RAM
                </label>

                <input
                  type="number"
                  min="1"
                  value={totalRam}
                  onChange={(e) => setTotalRam(Number(e.target.value))}
                  className="
                    bg-[#1a2a3a]
                    border
                    border-gray-500/50
                    rounded-lg
                    p-3
                    text-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />
              </div>

              <div
                className="
                  flex-1
                  flex
                  flex-col
                  gap-2
                "
              >
                <label className="text-sm text-white/70" htmlFor="vMemory">
                  Total VRAM
                </label>

                <input
                  type="number"
                  min="1"
                  value={totalVram}
                  onChange={(e) => setTotalVram(Number(e.target.value))}
                  className="
                    bg-[#1a2a3a]
                    border
                    border-gray-500/50
                    rounded-lg
                    p-3
                    text-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                  "
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-medium
              py-3
              px-6
              rounded-lg
              transition-colors
              cursor-pointer
            "
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
