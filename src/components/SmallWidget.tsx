"use client";
import {
  Cpu,
  MemoryStick,
  Microchip,
  Minus,
  Pin,
  Server,
  Settings,
  X,
} from "lucide-react";
import Image from "next/image";
import { getModelBrand } from "@/lib/ModelImageProvider";
import {
  getProcessorSplit,
  type OllamaPsModel,
} from "@/lib/ollama";

interface ProcessorStats {
  used: number;
  total: number;
  percentage: number;
}
interface SmallWidgetProps {
  modelList: OllamaPsModel[];
  gpuStats: ProcessorStats;
  cpuStats: ProcessorStats;
  ollamaUrl: string;
  onTop: boolean;
  onToggleOnTop: () => void;
  onSettings: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export default function SmallWidget({
  modelList,
  gpuStats,
  cpuStats,
  ollamaUrl,
  onTop,
  onToggleOnTop,
  onSettings,
  onMinimize,
  onClose,
}: SmallWidgetProps) {

  const loadedModels =
    modelList.filter(
      (model) =>
        model.status === "Loaded",
    );

  const primaryModel = loadedModels[0];

  const additionalModelCount =
    loadedModels.length > 1
      ? loadedModels.length - 1
      : 0;

  if (!primaryModel) {
    return (
      <main
        className="
          h-screen
          w-screen
          overflow-hidden
          select-none
          text-white
        "
      >
        <div
          className="
            h-full
            w-full
            flex
            flex-col
            overflow-hidden
            bg-white/[0.07]
            backdrop-blur-xl
            border
            border-white/15
          "
        >

          <header
            data-tauri-drag-region
            className="
              shrink-0
              flex
              items-center
              justify-between
              px-5
              pt-4
              pb-3
              border-b
              border-white/10
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-center
                  w-9
                  h-9
                "
              >
                <Image
                  src="/brain_cloud_logo.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  priority
                  className="
                    w-9
                    h-9
                    select-none
                  "
                />
              </div>

              <div>
                <h1
                  className="
                    text-base
                    font-medium
                    tracking-wide
                  "
                >
                  Ollama Monitor
                </h1>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-xs
                    text-white/50
                  "
                >
                  <span
                    className="
                      w-2
                      h-2
                      rounded-full
                      bg-white/30
                    "
                  />

                  <span>
                    0 models loaded
                  </span>
                </div>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-1
              "
            >
              <button
                type="button"
                onClick={onToggleOnTop}
                className={`
                  p-2
                  rounded-lg
                  transition-colors
                  cursor-pointer
                  ${onTop
                    ? "text-blue-400"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                  }
                `}
                aria-label="Always on top"
              >
                <Pin className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onSettings}
                className="
                  p-2
                  rounded-lg
                  text-white/50
                  hover:text-white
                  hover:bg-white/10
                  transition-colors
                  cursor-pointer
                "
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onMinimize}
                className="
                  p-2
                  rounded-lg
                  text-white/50
                  hover:text-white
                  hover:bg-white/10
                  transition-colors
                  cursor-pointer
                "
                aria-label="Minimize"
              >
                <Minus className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="
                  p-2
                  rounded-lg
                  text-white/50
                  hover:text-white
                  hover:bg-white/10
                  transition-colors
                  cursor-pointer
                "
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div
            className="
              flex-1
              flex
              flex-col
              items-center
              justify-center
              text-center
              mt-1
              text-sm
              text-white/40
            "
          >

                No models loaded
            </div>


          <footer
            className="
              shrink-0
              border-t
              border-white/10
              px-5
              py-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                min-w-0
              "
            >
              <Server
                className="
                  w-4
                  h-4
                  shrink-0
                  text-green-400
                "
              />

              <span
                className="
                  text-sm
                  text-white/70
                  shrink-0
                "
              >
                Ollama
              </span>

              <span
                className="
                  w-1.5
                  h-1.5
                  shrink-0
                  rounded-full
                  bg-green-400
                "
              />

              <span
                className="
                  text-xs
                  text-white/40
                  truncate
                "
              >
                {ollamaUrl}
              </span>
            </div>
          </footer>
        </div>
      </main>
    );
  }

  const modelName =
    primaryModel.name.slice(
      primaryModel.name.lastIndexOf("/") +
      1,
    );

  const modelBrand =
    getModelBrand(primaryModel.name);

  const processorSplit =
    getProcessorSplit(primaryModel);

  const isLoaded =
    primaryModel.status === "Loaded";

  const contextInThousands =
    primaryModel.context_length
      ? Math.round(
        primaryModel.context_length /
        1000,
      )
      : null;

  return (
    <main
      className="
        h-screen
        w-screen
        overflow-hidden
        select-none
        text-white
      "
    >
      <div
        className="
          h-full
          w-full
          flex
          flex-col
          overflow-hidden
          bg-white/[0.07]
          backdrop-blur-xl
          border
          border-white/15
        "
      >

        <header
          data-tauri-drag-region
          className="
            shrink-0
            flex
            items-center
            justify-between
            px-5
            pt-4
            pb-3
            border-b
            border-white/10
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-center
                w-9
                h-9
              "
            >
              <Image
                src="/brain_cloud_logo.png"
                alt="Logo"
                width={36}
                height={36}
                priority
                className="
                  w-9
                  h-9
                  select-none
                "
              />
            </div>

            <div>
              <h1
                className="
                  text-base
                  font-medium
                  tracking-wide
                "
              >
                AI Models Monitor
              </h1>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-white/50
                "
              >
                <span
                  className={`
                    w-2
                    h-2
                    rounded-full
                    ${loadedModels.length > 0
                      ? "bg-green-400"
                      : "bg-white/30"
                    }
                  `}
                />

                <span>
                  {loadedModels.length} {loadedModels.length === 1
                    ? "model"
                    : "models"} loaded
                </span>
              </div>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-1
            "
          >
            <button
                type="button"
              onClick={onToggleOnTop}
              className={`
                p-2
                rounded-lg
                transition-colors
                cursor-pointer
                ${onTop
                  ? "text-blue-400"
                  : "text-white/50 hover:text-white hover:bg-white/10"
                }
              `}
              aria-label="Always on top"
            >
              <Pin className="w-5 h-5" />
            </button>

            <button 
              type="button"
              onClick={onSettings}
              className="
                p-2
                rounded-lg
                text-white/50
                hover:text-white
                hover:bg-white/10
                transition-colors
                cursor-pointer
              "
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onMinimize}
              className="
                p-2
                rounded-lg
                text-white/50
                hover:text-white
                hover:bg-white/10
                transition-colors
                cursor-pointer
              "
              aria-label="Minimize"
            >
              <Minus className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                p-2
                rounded-lg
                text-white/50
                hover:text-white
                hover:bg-white/10
                transition-colors
                cursor-pointer
              "
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <section
          className="
            shrink-0
            flex
            items-center
            justify-between
            px-5
            py-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              min-w-0
            "
          >
            <div
              className="
                flex
                items-center
                justify-center
                shrink-0
                w-12
                h-12
              "
            >
              <Image
                src={modelBrand.icon}
                width={48}
                height={48}
                alt={modelName}
                className="
                  w-12
                  h-12
                  object-contain
                  select-none
                "
                priority
              />
            </div>

            <div className="min-w-0">
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <h2
                  className="
                    text-lg
                    font-medium
                    truncate
                  "
                >
                  {modelName}
                </h2>

                {additionalModelCount > 0 && (
                  <span
                    className="
                      shrink-0
                      text-xs
                      px-2
                      py-0.5
                      rounded-md
                      bg-white/10
                      text-white/50
                    "
                  >
                    +{additionalModelCount}
                  </span>
                )}
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  mt-1
                  text-xs
                "
              >
                <span
                  className={
                    isLoaded
                      ? "text-green-400"
                      : "text-white/40"
                  }
                >
                  {primaryModel.status}
                </span>

                <span className="text-white/25">
                  •
                </span>

                <span className="text-white/50">
                  {
                    primaryModel.details
                      .parameter_size
                  }
                </span>
              </div>
            </div>
          </div>

          {contextInThousands !== undefined && (
            <div
              className="
                shrink-0
                ml-3
                px-2.5
                py-1.5
                rounded-xl
                bg-green-400/10
                border
                border-green-400/10
                text-green-300
                text-xs
                font-medium
              "
            >
              {contextInThousands}K ctx
            </div>
          )}
        </section>

        <section
          className="
            flex-1
            min-h-0
            px-5
            pb-4
          "
        >
          <div
            className="
              grid
              grid-cols-2
              gap-x-5
              gap-y-4
            "
          >
            <StatRow
              icon={
                <Microchip className="w-5 h-5" />
              }
              label="GPU"
              value={`${isLoaded
                  ? processorSplit.gpu.toFixed(0)
                  : 0
                }%`}
              iconClass="text-green-400"
              valueClass="text-green-400"
            />

            <StatRow
              icon={
                <Cpu className="w-5 h-5" />
              }
              label="CPU"
              value={`${isLoaded
                  ? processorSplit.cpu.toFixed(0)
                  : 0
                }%`}
              iconClass="text-blue-300"
              valueClass="text-blue-300"
            />

            <StatRow
              icon={
                <MemoryStick className="w-5 h-5" />
              }
              label="VRAM"
              value={`${(
                gpuStats.used /
                1024 /
                1024 /
                1024
              ).toFixed(1)} / ${(
                gpuStats.total /
                1024 /
                1024 /
                1024
              ).toFixed(0)} GB`}
              iconClass="text-purple-400"
              valueClass="text-purple-400"
            />

            <StatRow
              icon={
                <MemoryStick className="w-5 h-5" />
              }
              label="RAM"
              value={`${(
                cpuStats.used /
                1024 /
                1024 /
                1024
              ).toFixed(1)} / ${(
                cpuStats.total /
                1024 /
                1024 /
                1024
              ).toFixed(0)} GB`}
              iconClass="text-blue-400"
              valueClass="text-blue-400"
            />
          </div>
        </section>

        <footer
          className="
            shrink-0
            border-t
            border-white/10
            px-5
            py-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              min-w-0
            "
          >
            <Server
              className="
                w-4
                h-4
                shrink-0
                text-green-400
              "
            />

            <span
              className="
                text-sm
                text-white/70
                shrink-0
              "
            >
              Ollama
            </span>

            <span
              className="
                w-1.5
                h-1.5
                shrink-0
                rounded-full
                bg-green-400
              "
            />

            <span
              className="
                text-xs
                text-white/40
                truncate
              "
            >
              {ollamaUrl}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}

interface StatRowProps {
  icon: React.ReactNode;

  label: string;

  value: string;

  iconClass?: string;

  valueClass?: string;
}

function StatRow({
  icon,
  label,
  value,
  iconClass = "text-white/50",
  valueClass = "text-white",
}: StatRowProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        min-w-0
      "
    >
      <div
        className={`
          shrink-0
          ${iconClass}
        `}
      >
        {icon}
      </div>

      <span
        className="
          text-xs
          text-white/50
          shrink-0
        "
      >
        {label}
      </span>

      <div
        className="
          h-5
          w-px
          bg-white/10
          shrink-0
        "
      />

      <span
        className={`
          text-xs
          font-medium
          whitespace-nowrap
          truncate
          ${valueClass}
        `}
      >
        {value}
      </span>
    </div>
  );
}