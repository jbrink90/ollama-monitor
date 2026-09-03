# Ollama Monitor

A lightweight desktop dashboard for monitoring locally running [Ollama](https://ollama.com/) models. Built with Tauri + Next.js.

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

Defaults are set in `src/app/page.tsx`:

```ts
const DEFAULT_REFRESH_INTERVAL = "5000";
const DEFAULT_OLLAMA_INSTANCE = "http://127.0.0.1:11434";
const DEFAULT_TOTAL_RAM = "32";
const DEFAULT_TOTAL_VRAM = "12";
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

- [ ] Real system telemetry (CPU/GPU utilization, temps)
- [ ] Automatic hardware detection
- [ ] Configurable polling intervals
- [ ] System tray integration
- [ ] Cross-platform polish (Windows/Linux/macOS)

## License

MIT License - see [LICENSE](LICENSE) file for details.
