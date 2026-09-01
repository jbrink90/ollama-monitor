export function getOllamaUrl(): string {
  if (typeof window !== "undefined") {
    const url = localStorage.getItem("ollamaInstance");
    if (url) return url;
    localStorage.setItem("ollamaInstance", "http://127.0.0.1:11434");
    return "http://127.0.0.1:11434";
  }
  return "http://127.0.0.1:11434";
}

export interface OllamaPsResponse {
  models: OllamaPsModel[];
}

export type OllamaModelStatus = "Loaded" | "Unloaded";

export interface OllamaPsModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  expires_at: string;
  size_vram: number;
  context_length: number;
  status: OllamaModelStatus;
}

export interface OllamaTagsResponse {
  models: OllamaTagsModel[];
}

export interface OllamaTagsModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export function getProcessorSplit(model: OllamaPsModel) {
  const gpu = (model.size_vram / model.size) * 100;
  const cpu = 100 - gpu;

  return {
    cpu: Math.round(cpu),
    gpu: Math.round(gpu),
  };
}

export function calculateProcessorStats(
  models: OllamaPsModel[],
  totalVram: number,
  totalRam: number,
) {
  const usedVram = models.reduce((total, model) => total + model.size_vram, 0);

  const usedRam = models.reduce(
    (total, model) => total + (model.size - model.size_vram),
    0,
  );

  return {
    gpu: {
      used: usedVram,
      total: totalVram,
      percentage: (usedVram / totalVram) * 100,
    },

    cpu: {
      used: usedRam,
      total: totalRam,
      percentage: (usedRam / totalRam) * 100,
    },
  };
}

export async function getOllamaModels(): Promise<OllamaTagsResponse> {
  const response = await fetch(`${getOllamaUrl()}/api/tags`);
  const data = await response.json();

  data.models.sort((a: OllamaTagsModel, b: OllamaTagsModel) => {
    return (
      new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()
    );
  });

  return data;
}

export async function getOllamaPs(): Promise<OllamaPsResponse> {
  try {
    const response = await fetch(`${getOllamaUrl()}/api/ps`);

    if (!response.ok) {
      throw new Error(
        `Ollama returned ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  } catch (error) {
    throw new Error(
      `Failed to reach Ollama at ${getOllamaUrl()}/api/ps: ${error}`,
    );
  }
}
export async function getOllamaPsMock(): Promise<OllamaPsResponse> {
  return {
    models: [
      {
        name: "qwen3:30b-a3b",
        model: "qwen3:30b-a3b",
        size: 19609891632,
        digest:
          "ad815644918f0eaab341c12b67837cc6dd4562342cdaf118f83d5d554cb37226",
        details: {
          parent_model: "",
          format: "gguf",
          family: "qwen3moe",
          families: ["qwen3moe"],
          parameter_size: "30.5B",
          quantization_level: "Q4_K_M",
        },
        expires_at: "2026-08-29T21:12:58.2577009-04:00",
        size_vram: 10639837756,
        context_length: 8192,
        status: "Loaded",
      },
    ],
  };
}

export function combineOllamaModels(
  loadedModels: OllamaPsModel[],
  allModels: OllamaTagsModel[],
): OllamaPsModel[] {
  const loaded = loadedModels.map((model) => ({
    ...model,
    status: "Loaded" as const,
  }));

  const loadedNames = new Set(loadedModels.map((model) => model.name));

  const unloaded = allModels
    .filter((model) => !loadedNames.has(model.name))
    .map((model) => ({
      ...model,
      expires_at: "",
      size_vram: 0,
      context_length: 0,
      status: "Unloaded" as const,
    }));

  return [...loaded, ...unloaded];
}

export function getRelativeExpiration(expiresAt: string): string {
  const expires = new Date(expiresAt);
  const now = new Date();

  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Expired";
  }

  const diffSeconds = Math.round(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds} sec${diffSeconds === 1 ? "" : "s"} from now`;
  }

  const diffMinutes = Math.round(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} from now`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} from now`;
  }

  const diffDays = Math.round(diffHours / 24);

  return `${diffDays} day${diffDays === 1 ? "" : "s"} from now`;
}
