"use client";
import MainWidget from "@/components/MainWidget";

const DEFAULT_REFRESH_INTERVAL = "5000";
const DEFAULT_OLLAMA_INSTANCE = "http://127.0.0.1:11434";
const DEFAULT_TOTAL_RAM = "32";
const DEFAULT_TOTAL_VRAM = "12";

if (typeof window !== "undefined") {
  if (!localStorage.getItem("refreshInterval")) {
    localStorage.setItem("refreshInterval", DEFAULT_REFRESH_INTERVAL);
  }
  if (!localStorage.getItem("ollamaInstance")) {
    localStorage.setItem("ollamaInstance", DEFAULT_OLLAMA_INSTANCE);
  }
  if (!localStorage.getItem("totalRam")) {
    localStorage.setItem("totalRam", DEFAULT_TOTAL_RAM);
  }
  if (!localStorage.getItem("totalVram")) {
    localStorage.setItem("totalVram", DEFAULT_TOTAL_VRAM);
  }
}

export default function Home() {
  return <MainWidget />;
}
