"use client";
import { listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { exit } from "@tauri-apps/plugin-process";
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

export default function MainWidget() {
  const [error, setError] = useState<string | null>(null);
  const [onTop, setOnTop] = useState(false);

  const [smallWidget, setSmallWidget] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const saved = localStorage.getItem("smallWidget");
    if (saved === null) {
      return false;
    }
    return saved === "true";
  });

  const [modelList, setModelList] = useState<OllamaPsModel[]>([]);
  const [refreshInterval, setRefreshInterval] = useState(() => {
    if (typeof window === "undefined") {
      return 5000;
    }
    const saved = localStorage.getItem("refreshInterval");
    return saved ? Number(saved) : 5000;
  });

  const [totalRam, setTotalRam] = useState(() => {
    if (typeof window === "undefined") {
      return 32;
    }
    const saved = localStorage.getItem("totalRam");
    return saved ? Number(saved) : 32;
  });

  const [totalVram, setTotalVram] = useState(() => {
    if (typeof window === "undefined") {
      return 12;
    }
    const saved = localStorage.getItem("totalVram");
    return saved ? Number(saved) : 12;
  });

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

    await getCurrentWindow().minimize();
  };

  const close = async () => {
    if (typeof window === "undefined") return;

    if (!("__TAURI_INTERNALS__" in window)) {
      return;
    }

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
    if (typeof window === "undefined") {
      return;
    }

    if (!("__TAURI_INTERNALS__" in window)) {
      return;
    }

    let unlisten:
      | (() => void)
      | undefined;

    const setupListener = async () => {
      unlisten = await listen(
        "settings-changed",
        (event) => {
          const payload =
            event.payload as {
              refreshInterval?: number;
              ollamaInstance?: string;
              totalRam?: number;
              totalVram?: number;
              smallWidget?: boolean;
            };

          console.log(
            "Settings changed:",
            payload,
          );

          if (
            payload.refreshInterval !==
            undefined
          ) {
            setRefreshInterval(
              payload.refreshInterval,
            );
          }

          if (
            payload.totalRam !== undefined
          ) {
            setTotalRam(
              payload.totalRam,
            );
          }

          if (
            payload.totalVram !== undefined
          ) {
            setTotalVram(
              payload.totalVram,
            );
          }

          if (
            payload.smallWidget !==
            undefined
          ) {
            setSmallWidget(
              payload.smallWidget,
            );
          }

          if (
            payload.ollamaInstance !==
            undefined
          ) {
            refresh();
          }
        },
      );
    };

    setupListener();

    return () => {
      unlisten?.();
    };
  }, [refresh]);

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