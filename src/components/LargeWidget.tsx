"use client";

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

import { getModelBrand } from "@/lib/ModelImageProvider";

import {
  getProcessorSplit,
  getRelativeExpiration,
  type OllamaPsModel,
} from "@/lib/ollama";

import RadialChart from "./RadialChart";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

interface ProcessorStats {
  used: number;
  total: number;
  percentage: number;
}

interface LargeWidgetProps {
  error: string | null;
  modelList: OllamaPsModel[];
  gpuStats: ProcessorStats;
  cpuStats: ProcessorStats;
  onTop: boolean;
  onToggleOnTop: () => void;
  onRefresh: () => void;
  onSettings: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export default function LargeWidget({
  error,
  modelList,
  gpuStats,
  cpuStats,
  onTop,
  onToggleOnTop,
  onRefresh,
  onSettings,
  onMinimize,
  onClose,
}: LargeWidgetProps) {
  const loadedModelCount =
    modelList.filter(
      (model) =>
        model.status === "Loaded",
    ).length;

  return (
    <main
      className="
        h-screen
        w-screen
        flex
        flex-col
        overflow-hidden
        select-none
        spacing
        tracking-wider
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
          <Image
            src="/brain_cloud_logo.png"
            alt="Logo"
            width={63}
            height={63}
            priority
            className="
              w-[63px]
              h-[63px]
              select-none
            "
          />

          <div
            className="
              flex
              flex-col
              w-full
              pl-3
              justify-end
            "
          >
            <h1
              className="
                text-2xl
                tracking-[1px]
              "
            >
              Ollama Monitor
            </h1>

            <span
              className="
                text-white/50
                text-lg
              "
            >
              {loadedModelCount} {loadedModelCount === 1
                ? "model"
                : "models"} loaded
            </span>
          </div>
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
            text-gray-300
          "
        >
          <button
            className="cursor-pointer"
            onClick={onRefresh}
            aria-label="Refresh"
          >
            <RefreshCw className="w-8 h-8" />
          </button>

          <button
            className={`
              cursor-pointer
              ${
                onTop
                  ? "text-blue-400"
                  : ""
              }
            `}
            onClick={onToggleOnTop}
            aria-label="Always on top"
          >
            <Pin className="w-8 h-8" />
          </button>

          <button
            className="cursor-pointer"
            onClick={onSettings}
            aria-label="Settings"
          >
            <Settings className="w-8 h-8" />
          </button>

          <button
            className="cursor-pointer"
            onClick={onMinimize}
            aria-label="Minimize"
          >
            <Minus className="w-8 h-8" />
          </button>

          <button
            className="cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </header>

      <div
        className="
          flex-1
          min-h-0
          min-w-0
          w-full
          flex
          flex-col
        "
      >
        {error && (
          <div className="text-red-400 px-4 pt-2">
            {error}
          </div>
        )}

        <div
          className="
            w-full
            px-4
            pt-4
            shrink-0
          "
        >
          <div
            className="
              grid
              grid-cols-[2fr_1fr_1fr_1fr]
              text-center
              border-b-2
              border-white/10
              pb-3
              text-white/50
            "
          >
            <div className="text-left pl-4">
              MODEL
            </div>

            <div>
              STATUS
            </div>

            <div>
              GPU USAGE
            </div>

            <div>
              CPU USAGE
            </div>
          </div>
        </div>

        <div
          className="
            flex-1
            min-h-0
            min-w-0
            w-full
            overflow-y-auto
            overflow-x-hidden
            widget-scrollbar
          "
        >
          <div
            className="
              w-full
              pb-4
              px-4
            "
          >
            {modelList.map(
              (model) => {
                const processorSplit =
                  getProcessorSplit(model);

                const modelName =
                  model.name.slice(
                    model.name.lastIndexOf("/") +
                      1,
                  );

                return (
                  <div
                    key={model.name}
                    className="
                      grid
                      grid-cols-[2fr_1fr_1fr_1fr]
                      text-center
                      items-center
                      border-b
                      border-white/5
                    "
                  >
                    <div
                      className="
                        flex
                        flex-row
                        pl-4
                        py-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          w-14
                        "
                      >
                        <Image
                          src={
                            getModelBrand(
                              model.name,
                            ).icon
                          }
                          width={56}
                          height={56}
                          alt={modelName}
                          className="
                            w-14
                            h-14
                            select-none
                          "
                          priority
                        />
                      </div>

                      <div
                        className="
                          flex
                          justify-center
                          flex-col
                          pl-8
                          items-center
                        "
                      >
                        <span
                          className={`
                            flex
                            ${inter.variable}
                            text-xl
                          `}
                        >
                          {modelName}
                        </span>

                        <span
                          className={`
                            flex
                            ${inter.variable}
                            text-md
                            text-white/50
                            justify-center
                          `}
                        >
                          {model.details.parameter_size} Parameters
                        </span>
                      </div>
                    </div>
                    <div
                      className="
                        py-4
                        flex
                        flex-col
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                        "
                      >
                        <span
                          className={`
                            h-2.5
                            w-2.5
                            rounded-full
                            inline-block
                            ${
                              model.status ===
                              "Loaded"
                                ? "bg-green-500"
                                : "bg-white/30"
                            }
                          `}
                        />

                        <span className="text-lg">
                          {model.status}
                        </span>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                        "
                      >
                        <div
                          className="
                            flex
                            flex-col
                            items-center
                          "
                        >
                          {model.status ===
                          "Loaded" ? (
                            <>
                              <span
                                className="
                                  flex
                                  text-white/30
                                  text-md
                                "
                              >
                                Context: {model.context_length}
                              </span>

                              <span
                                className="
                                  flex
                                  text-xs
                                  text-white/50
                                "
                              >
                                Expires: {getRelativeExpiration(
                                  model.expires_at,
                                )}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        text-white/50
                        text-md
                        gap-0
                      "
                    >
                      {model.status ===
                      "Loaded" ? (
                        <>
                          <RadialChart
                            value={
                              processorSplit.gpu
                            }
                            color="#22c55e"
                            size={100}
                          />

                          <span>
                            {(
                              gpuStats.used /
                              1024 /
                              1024 /
                              1024
                            ).toFixed(1)} GB
                          </span>
                        </>
                      ) : null}
                    </div>

                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        text-white/50
                        text-md
                        gap-0
                      "
                    >
                      {model.status ===
                      "Loaded" ? (
                        <>
                          <RadialChart
                            value={
                              processorSplit.cpu
                            }
                            color="#3b82f6"
                            size={100}
                          />

                          <span>
                            {(
                              cpuStats.used /
                              1024 /
                              1024 /
                              1024
                            ).toFixed(1)} GB
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      <footer
        className="
          shrink-0
          flex
          flex-row
          justify-between
          w-full
          border-t-2
          py-4
          border-white/20
          pt-4
        "
      >
        <div
          className="
            flex
            w-full
            pr-8
            items-center
            justify-center
          "
        >
          <Gpu
            className="
              w-12
              h-12
              text-gray-300
            "
          />

          <div
            className="
              flex
              flex-row
              gap-20
              pl-6
            "
          >
            <div className="flex flex-col">
              <div className="flex text-lg">
                GPU
              </div>

              <div
                className="
                  flex
                  text-sm
                  text-white/50
                "
              >
                VRAM Usage
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex text-2xl">
                {gpuStats.percentage.toFixed(
                  0,
                )}
                %
              </div>

              <div
                className="
                  flex
                  text-sm
                  text-white/50
                "
              >
                {(
                  gpuStats.used /
                  1024 /
                  1024 /
                  1024
                ).toFixed(1)} GB / {(
                  gpuStats.total /
                  1024 /
                  1024 /
                  1024
                ).toFixed(0)} GB
              </div>
            </div>
          </div>
        </div>
s
        <div
          className="
            flex
            w-full
            pr-8
            items-center
            justify-center
            border-white/20
            border-l-2
          "
        >
          <MemoryStick
            className="
              w-12
              h-12
              text-gray-300
            "
          />

          <div
            className="
              flex
              flex-row
              gap-20
              pl-6
            "
          >
            <div className="flex flex-col">
              <div className="flex text-lg">
                PC
              </div>

              <div
                className="
                  flex
                  text-sm
                  text-white/50
                "
              >
                RAM Usage
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex text-2xl">
                {cpuStats.percentage.toFixed(
                  0,
                )}
                %
              </div>

              <div
                className="
                  flex
                  text-sm
                  text-white/50
                "
              >
                {(
                  cpuStats.used /
                  1024 /
                  1024 /
                  1024
                ).toFixed(1)} GB / {(
                  cpuStats.total /
                  1024 /
                  1024 /
                  1024
                ).toFixed(0)} GB
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}