export const DEFAULT_SETTINGS = {
  refreshInterval: 5000,
  ollamaInstance: "http://127.0.0.1:11434",
  totalRam: 32,
  totalVram: 12,
  smallWidget: false,
} as const;

export type AppSettings = {
  refreshInterval: number;
  ollamaInstance: string;
  totalRam: number;
  totalVram: number;
  smallWidget: boolean;
};

export function getSettings(): AppSettings {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SETTINGS };
  }

  return {
    refreshInterval: Number(
      localStorage.getItem("refreshInterval") ??
        DEFAULT_SETTINGS.refreshInterval,
    ),

    ollamaInstance:
      localStorage.getItem("ollamaInstance") ?? DEFAULT_SETTINGS.ollamaInstance,

    totalRam: Number(
      localStorage.getItem("totalRam") ?? DEFAULT_SETTINGS.totalRam,
    ),

    totalVram: Number(
      localStorage.getItem("totalVram") ?? DEFAULT_SETTINGS.totalVram,
    ),

    smallWidget:
      (localStorage.getItem("smallWidget") ??
        String(DEFAULT_SETTINGS.smallWidget)) === "true",
  };
}

export function initializeSettings() {
  if (typeof window === "undefined") return;

  const settings = getSettings();

  localStorage.setItem("refreshInterval", String(settings.refreshInterval));

  localStorage.setItem("ollamaInstance", settings.ollamaInstance);

  localStorage.setItem("totalRam", String(settings.totalRam));

  localStorage.setItem("totalVram", String(settings.totalVram));

  localStorage.setItem("smallWidget", String(settings.smallWidget));
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;

  localStorage.setItem("refreshInterval", String(settings.refreshInterval));

  localStorage.setItem("ollamaInstance", settings.ollamaInstance);

  localStorage.setItem("totalRam", String(settings.totalRam));

  localStorage.setItem("totalVram", String(settings.totalVram));

  localStorage.setItem("smallWidget", String(settings.smallWidget));
}
