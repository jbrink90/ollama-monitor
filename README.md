# Ollama Monitor

A lightweight, cross-platform web or desktop dashboard for monitoring locally running [Ollama](https://ollama.com/) models. Built with Tauri + Next.js.

<p align="center">
  <img src="https://github.com/jbrink90/ollama-model-monitor/blob/main/screenshots/main.png?raw=true" alt="Main Dashboard" />
</p>

<p align="center">
  <img src="https://github.com/jbrink90/ollama-model-monitor/blob/main/screenshots/widget.png?raw=true" alt="Widget View" />
</p>

## Features

- Desktop widget UI with always-on-top toggle
- Real-time model monitoring via Ollama `/api/ps` and `/api/tags`
- Model memory placement (GPU/CPU allocation)
- VRAM usage calculations
- Loaded vs unloaded model status
- Model branding and parameter info
- Context length and expiration display
- Configurable refresh intervals
- Separate settings window

## Prerequisites

- Node.js
- Rust
- Tauri prerequisites for your OS
- Ollama running locally

## Setup

```bash
npm install
npm run tauri dev
```

## Configuration

Defaults are set in `src/lib/settings.ts`:

```ts
export const DEFAULT_SETTINGS = {
  refreshInterval: 5000,
  ollamaInstance: "http://127.0.0.1:11434",
  totalRam: 32,
  totalVram: 12,
  smallWidget: false,
} as const;
```

Or change settings via the settings window (⚙ icon) after the app loads.

## Build

```bash
npm run tauri build
```

## Important Notes

**Memory placement vs utilization**: The GPU/CPU percentages shown represent model memory allocation, not actual compute utilization. For example, a model with 54% GPU placement means 54% of the model's memory is in VRAM, not that the GPU is 54% utilized.

**CORS for packaged apps**: If the built app can't connect to Ollama, run:

```bash
setx OLLAMA_ORIGINS "http://tauri.localhost"
```

Then restart Ollama Desktop completely.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Desktop**: Tauri, Rust
- **Runtime**: Ollama

## Roadmap

- [ ] System telemetry (CPU/GPU utilization, temps) via Rust backend
- [ ] Light/Dark mode toggle
- [ ] Model management (load/unload)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Attributions

Icon created by <a href="https://www.flaticon.com/free-icons/machine-learning">alfanz - Flaticon</a>
Thank you to kvnxiao for the <a href="https://github.com/kvnxiao/tauri-nextjs-template">Tauri Next.js template</a>
