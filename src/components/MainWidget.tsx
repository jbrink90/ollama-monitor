"use client";
import { listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { exit } from "@tauri-apps/plugin-process";
import {
  Gpu,
  MemoryStick,
  Minus,
  Pin,
  RefreshCw,
  Settings,
  X,
} from "lucide-react";
import { Inter } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getModelBrand } from "@/lib/ModelImageProvider";
import {
  calculateProcessorStats,
  combineOllamaModels,
  getOllamaModels,
  getOllamaPs,
  getOllamaUrl,
  getProcessorSplit,
  getRelativeExpiration,
  type OllamaPsModel,
} from "@/lib/ollama";
import RadialChart from "./RadialChart";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function MainWidget() {
  const [error, setError] = useState<string | null>(null);
  const [onTop, setOnTop] = useState(false);
  const [modelList, setModelList] = useState<OllamaPsModel[]>([]);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [totalRam, setTotalRam] = useState(32);
  const [totalVram, setTotalVram] = useState(12);

  const totalVramBytes = totalVram * 1024 ** 3;
  const totalRamBytes = totalRam * 1024 ** 3;

  // Load localStorage values after hydration to avoid mismatch
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedRefresh = localStorage.getItem("refreshInterval");
    if (savedRefresh) setRefreshInterval(Number(savedRefresh));
    const savedRam = localStorage.getItem("totalRam");
    if (savedRam) setTotalRam(Number(savedRam));
    const savedVram = localStorage.getItem("totalVram");
    if (savedVram) setTotalVram(Number(savedVram));
  }, []);

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

  const openSettings = async () => {
    if (typeof window === "undefined") return;

    // In browser, open settings in new tab
    if (!("__TAURI_INTERNALS__" in window)) {
      window.open("/settings", "_blank");
      return;
    }

    // In Tauri, show settings window
    const settings = await WebviewWindow.getByLabel("settings");

    if (settings) {
      await settings.show();
      await settings.setFocus();
    }
  };

  const minimize = async () => {
    if (typeof window === "undefined") return;
    // Only run inside Tauri
    if (!("__TAURI_INTERNALS__" in window)) return;

    await getCurrentWindow().minimize();
  };

  const refresh = async () => {
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
  };

  const close = async () => {
    if (typeof window === "undefined") return;
    // Only run inside Tauri
    if (!("__TAURI_INTERNALS__" in window)) return;
    await exit(0);
  };

  useEffect(() => {
    const setAlwaysOnTop = async () => {
      if (typeof window === "undefined") return;
      // Only run inside Tauri
      if (!("__TAURI_INTERNALS__" in window)) return;
      await getCurrentWindow().setAlwaysOnTop(onTop);
    };

    setAlwaysOnTop();
  }, [onTop]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval, refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("__TAURI_INTERNALS__" in window)) return;

    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      unlisten = await listen("settings-changed", (event) => {
        const payload = event.payload as {
          refreshInterval?: number;
          ollamaInstance?: string;
          totalRam?: number;
          totalVram?: number;
        };

        console.log("Settings changed:", payload);

        if (payload.refreshInterval !== undefined) {
          setRefreshInterval(payload.refreshInterval);
        }
        if (payload.ollamaInstance !== undefined) {
          refresh();
        }
        if (payload.totalRam !== undefined) {
          setTotalRam(payload.totalRam);
        }
        if (payload.totalVram !== undefined) {
          setTotalVram(payload.totalVram);
        }
      });
    };

    setupListener();

    return () => {
      unlisten?.();
    };
  }, [refresh]);

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden select-none spacing tracking-wider">
      <header
        data-tauri-drag-region
        className="shrink-0 flex flex-row justify-between w-full border-b-2 border-white/10 pb-4 pt-6"
      >
        <div className="flex flex-row gap-4 w-full pl-8 select-none">
          <Image
            src="/brain_cloud_logo.png"
            alt="Logo"
            width={63}
            height={63}
            priority
            className="w-[63] h-[63] select-none"
          />
          <div className="flex flex-col w-full pl-3 justify-end">
            <h1 className="text-2xl letter-spacing-[1px]">
              Ollama Model Monitor
            </h1>
            <span className="text-white/50 text-lg">
              {" "}
              {modelList.filter((m) => m.status === "Loaded").length} models
              loaded
            </span>
          </div>
        </div>
        <div className="flex gap-6 w-full justify-end text-3xl pr-8 pb-4 text-gray-300">
          <button className="cursor-pointer" onClick={refresh}>
            <RefreshCw className="w-8 h-8" />
          </button>
          <button className="cursor-pointer" onClick={() => setOnTop(!onTop)}>
            <Pin className="w-8 h-8" />
          </button>
          <button className="cursor-pointer" onClick={openSettings}>
            <Settings className="w-8 h-8" />
          </button>
          <button className="cursor-pointer" onClick={minimize}>
            <Minus className="w-8 h-8" />
          </button>
          <button className="cursor-pointer" onClick={close}>
            <X className="w-8 h-8" />
          </button>
        </div>
      </header>
      <div className="flex-1 min-h-0 min-w-0 w-full flex flex-col">
        {error && <div className="text-red-400">{error}</div>}
        <div className="w-full px-4 pt-4 shrink-0">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-center border-b-2 border-white/10 pb-3 text-white/50">
            <div className="text-left pl-4">MODEL</div>
            <div>STATUS</div>
            <div>GPU USAGE</div>
            <div>CPU USAGE</div>
          </div>
        </div>
        <div className="flex-1 min-h-0 min-w-0 w-full overflow-y-auto overflow-x-hidden widget-scrollbar">
          <div className="w-full pb-4 px-4">
            {modelList.map((model) => (
              <div
                key={model.name}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] text-center items-center border-b border-white/5"
              >
                <div className="flex flex-row pl-4 py-4">
                  <div className="flex items-center w-14">
                    <Image
                      src={getModelBrand(model.name).icon}
                      width={32}
                      height={32}
                      alt="GPU usage"
                      className="w-14 h-14 select-none"
                      priority
                    />
                  </div>
                  <div className="flex justify-center flex-col pl-8 items-center">
                    <span className={`flex ${inter.variable} text-xl`}>
                      {model.name.slice(model.name.lastIndexOf("/") + 1)}
                    </span>
                    <span
                      className={`flex ${inter.variable} text-md text-white/50 justify-center`}
                    >
                      {model.details.parameter_size} Parameters
                    </span>
                  </div>
                </div>

                <div className="py-4 flex flex-col">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full inline-block ${
                        model.status === "Loaded"
                          ? "bg-green-500"
                          : "bg-white/30"
                      }`}
                    />
                    <span className="text-lg">{model.status}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex flex-col items-center">
                      {model.status === "Loaded" ? (
                        <>
                          <span className="flex text-white/30 text-md">
                            Context: {model.context_length}
                          </span>
                          <span className="flex text-xs text-white/50">
                            Expires: {getRelativeExpiration(model.expires_at)}
                          </span>
                        </>
                      ) : (
                        <span></span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center text-white/50 text-md">
                  {model.status === "Loaded" ? (
                    <>
                      <RadialChart
                        value={getProcessorSplit(model).gpu}
                        color="#22c55e"
                        size={100}
                      />
                      <span>
                        {(gpuStats.used / 1024 / 1024 / 1024).toFixed(1)} GB
                      </span>
                    </>
                  ) : (
                    <span></span>
                  )}
                </div>

                <div className="flex flex-col items-center text-white/50 text-md">
                  {model.status === "Loaded" ? (
                    <>
                      <RadialChart
                        value={getProcessorSplit(model).cpu}
                        color="#3b82f6"
                        size={100}
                      />
                      <span>
                        {(cpuStats.used / 1024 / 1024 / 1024).toFixed(1)} GB
                      </span>
                    </>
                  ) : (
                    <span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer className="shrink-0 flex flex-row justify-between w-full border-t-2 py-4 border-white/20 pt-4">
        <div className="flex w-full pr-8 items-center justify-center">
          <Gpu className="w-12 h-12 text-gray-300" />
          <div className="flex flex-row gap-20 pl-6">
            <div className="flex flex-col">
              <div className="flex text-lg">GPU</div>
              <div className="flex text-sm text-white/50">vRAM Usage</div>
            </div>
            <div className="flex flex-col">
              <div className="flex text-2xl">
                {gpuStats.percentage.toFixed(0)}%
              </div>
              <div className="flex text-sm text-white/50">
                {(gpuStats.used / 1024 / 1024 / 1024).toFixed(1)} GB /{" "}
                {(gpuStats.total / 1024 / 1024 / 1024).toFixed(0)} GB
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full pr-8 items-center justify-center border-white/20 border-l-2">
          <MemoryStick className="w-12 h-12 text-gray-300" />
          <div className="flex flex-row gap-20 pl-6">
            <div className="flex flex-col">
              <div className="flex text-lg">PC</div>
              <div className="flex text-sm text-white/50">RAM Usage</div>
            </div>
            <div className="flex flex-col">
              <div className="flex text-2xl">
                {cpuStats.percentage.toFixed(0)}%
              </div>
              <div className="flex text-sm text-white/50">
                {(cpuStats.used / 1024 / 1024 / 1024).toFixed(1)} GB /{" "}
                {(cpuStats.total / 1024 / 1024 / 1024).toFixed(0)} GB
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
