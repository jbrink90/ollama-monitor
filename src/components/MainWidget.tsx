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
import LargeWidget from "./LargeWidget";
import SmallWidget from "./SmallWidget";
import { getSettings } from "@/lib/settings";

export default function MainWidget() {
  const [error, setError] = useState<string | null>(null);
  const [onTop, setOnTop] = useState(false);


  const [smallWidget, setSmallWidget] =
    useState(false);

  const [refreshInterval, setRefreshInterval] =
    useState(5000);

  const [totalRam, setTotalRam] =
    useState(32);

  const [totalVram, setTotalVram] =
    useState(12);






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

  const resizeWindow = useCallback(async (isSmall: boolean) => {
    if (!("__TAURI_INTERNALS__" in window)) {
      return;
    }

    const { LogicalSize } = await import("@tauri-apps/api/dpi");
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const tauriWindow = getCurrentWindow();
    if (isSmall) {
      await tauriWindow.setSize(
        new LogicalSize(420, 275),
      );
    } else {
      await tauriWindow.setSize(
        new LogicalSize(800, 800),
      );
    }
  }, []);

  useEffect(() => {
    resizeWindow(smallWidget);
  }, [smallWidget, resizeWindow]);

  const loadSettings = useCallback(() => {
    const settings = getSettings();

    setSmallWidget(settings.smallWidget);
    setRefreshInterval(settings.refreshInterval);
    setTotalRam(settings.totalRam);
    setTotalVram(settings.totalVram);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const refresh = useCallback(async () => {
    console.log("Refreshing Ollama models");

    try {
      setError(null);

      const [psData, tagsData] =
        await Promise.all([
          getOllamaPs(),
          getOllamaModels(),
        ]);

      const models = combineOllamaModels(
        psData.models,
        tagsData.models,
      );

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

      setError(
        `${String(error)}: ${getOllamaUrl()}`,
      );
    }
  }, [
    totalRamBytes,
    totalVramBytes,
  ]);

  const openSettings = async () => {
    if (typeof window === "undefined") return;

    if (!("__TAURI_INTERNALS__" in window)) {
      window.open(
        "/settings",
        "_blank",
      );

      return;
    }

    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const settings =
      await WebviewWindow.getByLabel(
        "settings",
      );

    if (settings) {
      await settings.show();

      await settings.setFocus();
    }
  };

  const minimize = async () => {
    if (typeof window === "undefined") return;

    if (!("__TAURI_INTERNALS__" in window)) {
      return;
    }

    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().minimize();
  };

  const close = async () => {
    if (typeof window === "undefined") return;

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
      await getCurrentWindow().setAlwaysOnTop(
        onTop,
      );
    };

    setAlwaysOnTop();
  }, [onTop]);

  useEffect(() => {
    resizeWindow(smallWidget);
  }, [smallWidget, resizeWindow]);

  useEffect(() => {
    refresh();

    const timer = setInterval(
      refresh,
      refreshInterval,
    );

    return () => {
      clearInterval(timer);
    };
  }, [
    refresh,
    refreshInterval,
  ]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea === localStorage) {
        const { key, newValue } = event;

        if (key === "refreshInterval") {
          setRefreshInterval(Number(newValue));
        } else if (key === "totalRam") {
          setTotalRam(Number(newValue));
        } else if (key === "totalVram") {
          setTotalVram(Number(newValue));
        } else if (key === "smallWidget") {
          setSmallWidget(newValue === "true");
        }
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange,
      );
    };
  }, []);

  if (smallWidget) {
    return (
      <SmallWidget
        modelList={modelList}
        gpuStats={gpuStats}
        cpuStats={cpuStats}
        ollamaUrl={getOllamaUrl()}
        onTop={onTop}
        onToggleOnTop={() =>
          setOnTop((previous) => !previous)
        }
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
      onToggleOnTop={() =>
        setOnTop((previous) => !previous)
      }
      onRefresh={refresh}
      onSettings={openSettings}
      onMinimize={minimize}
      onClose={close}
    />
  );
}