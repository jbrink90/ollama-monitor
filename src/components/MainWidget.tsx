"use client";

import { useCallback, useEffect, useState } from "react";

import {
  calculateProcessorStats,
  combineOllamaModels,
  getOllamaModels,
  getOllamaPs,
  getOllamaUrl,
  type OllamaPsModel,
} from "@/lib/ollama";

import { getSettings } from "@/lib/settings";

import LargeWidget from "./LargeWidget";
import SmallWidget from "./SmallWidget";

export default function MainWidget() {
  const [error, setError] = useState<string | null>(null);

  const [onTop, setOnTop] = useState(false);

  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [smallWidget, setSmallWidget] = useState(false);

  const [refreshInterval, setRefreshInterval] = useState(5000);

  const [totalRam, setTotalRam] = useState(32);

  const [totalVram, setTotalVram] = useState(12);

  const [modelList, setModelList] = useState<OllamaPsModel[]>([]);

  const totalVramBytes = totalVram * 1024 ** 3;

  const totalRamBytes = totalRam * 1024 ** 3;

  const [gpuStats, setGpuStats] = useState({
    used: 0,
    total: totalVramBytes,
    percentage: 0,
  });

  const [cpuStats, setCpuStats] = useState({
    used: 0,
    total: totalRamBytes,
    percentage: 0,
  });

  const loadSettings = useCallback(() => {
    const settings = getSettings();

    setSmallWidget(settings.smallWidget);

    setRefreshInterval(settings.refreshInterval);

    setTotalRam(settings.totalRam);

    setTotalVram(settings.totalVram);

    setSettingsLoaded(true);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const resizeWindow = useCallback(async (isSmall: boolean) => {
    if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
      return;
    }

    const { LogicalSize } = await import("@tauri-apps/api/dpi");

    const { getCurrentWindow } = await import("@tauri-apps/api/window");

    const tauriWindow = getCurrentWindow();

    if (isSmall) {
      await tauriWindow.setSize(new LogicalSize(420, 275));
    } else {
      await tauriWindow.setSize(new LogicalSize(800, 800));
    }
  }, []);

  const toggleOnTop = useCallback(() => {
    setOnTop((previous) => !previous);
  }, []);

  useEffect(() => {
    if (!settingsLoaded) {
      return;
    }

    void resizeWindow(smallWidget);
  }, [settingsLoaded, smallWidget, resizeWindow]);

  const refresh = useCallback(async () => {
    console.log("Refreshing Ollama models");

    try {
      setError(null);

      const [psData, tagsData] = await Promise.all([
        getOllamaPs(),
        getOllamaModels(),
      ]);

      const models = combineOllamaModels(psData.models, tagsData.models);

      setModelList(models);

      const stats = calculateProcessorStats(
        psData.models,
        totalVramBytes,
        totalRamBytes,
      );

      setGpuStats(stats.gpu);

      setCpuStats(stats.cpu);
    } catch (error) {
      console.error(error);

      setError(`${String(error)}: ${getOllamaUrl()}`);
    }
  }, [totalRamBytes, totalVramBytes]);

  const openSettings = async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("__TAURI_INTERNALS__" in window)) {
      window.open("/settings", "_blank");

      return;
    }

    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");

    const settings = await WebviewWindow.getByLabel("settings");

    if (settings) {
      await settings.show();

      await settings.setFocus();
    }
  };

  const minimize = async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("__TAURI_INTERNALS__" in window)) {
      return;
    }

    const { getCurrentWindow } = await import("@tauri-apps/api/window");

    await getCurrentWindow().minimize();
  };

  const close = async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("__TAURI_INTERNALS__" in window)) {
      return;
    }

    const { exit } = await import("@tauri-apps/plugin-process");

    await exit(0);
  };

  useEffect(() => {
    const setAlwaysOnTop = async () => {
      if (typeof window === "undefined") {
        return;
      }

      if (!("__TAURI_INTERNALS__" in window)) {
        return;
      }

      const { getCurrentWindow } = await import("@tauri-apps/api/window");

      await getCurrentWindow().setAlwaysOnTop(onTop);
    };

    void setAlwaysOnTop();
  }, [onTop]);

  useEffect(() => {
    if (!settingsLoaded) {
      return;
    }

    void refresh();

    const timer = setInterval(refresh, refreshInterval);

    return () => {
      clearInterval(timer);
    };
  }, [settingsLoaded, refresh, refreshInterval]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return;
      }

      if (
        event.key === "refreshInterval" ||
        event.key === "totalRam" ||
        event.key === "totalVram" ||
        event.key === "smallWidget" ||
        event.key === "ollamaInstance"
      ) {
        loadSettings();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadSettings]);

  if (!settingsLoaded) {
    return null;
  }

  if (smallWidget) {
    return (
      <SmallWidget
        modelList={modelList}
        gpuStats={gpuStats}
        cpuStats={cpuStats}
        ollamaUrl={getOllamaUrl()}
        onTop={onTop}
        onToggleOnTop={toggleOnTop}
        onSettings={openSettings}
        onMinimize={minimize}
        onClose={close}
      />
    );
  }

  return (
    <LargeWidget
      error={error}
      modelList={modelList}
      gpuStats={gpuStats}
      cpuStats={cpuStats}
      onTop={onTop}
      onToggleOnTop={toggleOnTop}
      onRefresh={refresh}
      onSettings={openSettings}
      onMinimize={minimize}
      onClose={close}
    />
  );
}
