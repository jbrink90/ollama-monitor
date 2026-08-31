# Ollama Model Monitor

A lightweight desktop dashboard for monitoring locally running [Ollama](https://ollama.com/) models.

Ollama Model Monitor provides a compact, always-on-top view of loaded models, model memory placement, VRAM consumption, and installed models. It is being built as a cross-platform Tauri desktop application with a Next.js/React frontend.

> **Project status:** Early development / prototype  
> The current UI is functional and uses mocked Ollama process data while the backend and cross-platform system telemetry are being developed.

---

## Features

### Currently implemented

- Tauri desktop application
- Next.js + React frontend
- Dark desktop-widget style interface
- Always-on-top toggle
- Minimize and close controls
- Separate settings window
- Refresh control
- Ollama `/api/ps` integration interface
- Mock `/api/ps` data with the same return type as the real API
- Ollama `/api/tags` integration interface
- Loaded model list
- Model branding/icons
- Human-readable model names for Hugging Face model paths
- Model parameter information
- Context length display
- Model expiration/keep-alive information utilities
- Per-model GPU/CPU **memory placement** calculation
- Aggregate VRAM usage calculation
- Loaded vs. unloaded model representation

---

## Why?

Ollama already provides excellent command-line tools and APIs for managing local models, but monitoring a local AI machine often means switching between several tools:

```text
ollama ps
ollama list
nvidia-smi
Open WebUI
AnythingLLM
```

Ollama Model Monitor aims to put the most useful information into one small desktop widget.

The intended result is something like:

```text
┌─────────────────────────────────────────────────────┐
│  ☁ AI Models Monitor                         ↻ 📌 ⚙ │
│    2 models loaded                                  │
├─────────────────────────────────────────────────────┤
│ MODEL                  STATUS       GPU       CPU    │
│                                                     │
│ 🟢 qwen3:30b-a3b       Loaded       54%      46%    │
│                         Context: 8192               │
│                                                     │
│ 🟢 qwen2.5-coder:7b    Loaded      100%       0%    │
│                         Context: 8192               │
│                                                     │
│ ⚪ llama3.2:8b         Unloaded       —        —    │
├─────────────────────────────────────────────────────┤
│       GPU                         CPU               │
│      83%                         --                  │
│   10.6 / 12 GB                 System CPU            │
└─────────────────────────────────────────────────────┘
```

---

## Important terminology

The project currently calculates two different kinds of information.

### Model GPU/CPU placement

Ollama's `/api/ps` response contains:

```json
{
  "size": 19609891632,
  "size_vram": 10639837756
}
```

The project uses these values to estimate where the model's memory is located:

```text
GPU percentage = size_vram / size × 100
CPU percentage = 100 - GPU percentage
```

For example:

```text
Model size: 19.61 GB
VRAM:       10.64 GB

GPU:        ~54%
CPU:        ~46%
```

These values represent **model memory placement**.

They do **not** represent actual CPU or GPU compute utilization.

The UI will therefore eventually distinguish between:

- **GPU allocation** — how much of a model is resident in GPU memory
- **CPU allocation** — how much of a model is resident in system memory
- **GPU utilization** — how busy the GPU actually is
- **CPU utilization** — how busy the CPU actually is

Actual CPU/GPU utilization requires system-level telemetry and is planned for the Tauri/Rust backend.

---

## Data sources

### Ollama `/api/ps`

The `/api/ps` endpoint provides information about currently loaded models.

Example:

```json
{
  "models": [
    {
      "name": "qwen3:30b-a3b",
      "model": "qwen3:30b-a3b",
      "size": 19609891632,
      "digest": "ad815644918f0eaab341c12b67837cc6dd4562342cdaf118f83d5d554cb37226",
      "details": {
        "parent_model": "",
        "format": "gguf",
        "family": "qwen3moe",
        "families": [
          "qwen3moe"
        ],
        "parameter_size": "30.5B",
        "quantization_level": "Q4_K_M"
      },
      "expires_at": "2026-08-30T01:24:21.6688138-04:00",
      "size_vram": 10639837756,
      "context_length": 8192
    }
  ]
}
```

This is the primary source for runtime model information.

### Ollama `/api/tags`

The `/api/tags` endpoint provides the complete list of installed models.

The application combines `/api/ps` and `/api/tags`:

```text
/api/ps
    ↓
Currently loaded models
    ↓
                 ┌───────────────┐
                 │               │
                 │ Model merger  │
                 │               │
                 └───────────────┘
                         ↑
    /api/tags            │
    ↓                    │
All installed models ────┘
```

Loaded models are retained with their runtime information.

Models found in `/api/tags` but not `/api/ps` are added to the model list with:

```text
status: "Unloaded"
```

This allows the widget to display both the current runtime state and the complete installed model inventory.

---

## Hugging Face model names

Ollama can expose model names containing multiple path components, for example:

```text
hf.co/unsloth/gemma-4-12b-it-GGUF:Q5_K_M
```

The application keeps the full name internally but shortens it for display by taking everything after the final `/`:

```text
hf.co/unsloth/gemma-4-12b-it-GGUF:Q5_K_M
                    ↓
gemma-4-12b-it-GGUF:Q5_K_M
```

This is presentation-only. The original Ollama model name is retained for API operations and model identity.

---

## Project architecture

The application is designed around three primary data layers.

```text
┌──────────────────────────┐
│          Ollama          │
│                          │
│ /api/ps                  │
│ /api/tags                │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     Ollama data layer    │
│                          │
│ API types                │
│ Mock API                 │
│ Model merging            │
│ Model calculations       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       Tauri / Rust       │
│                          │
│ OS telemetry             │
│ GPU telemetry            │
│ Native desktop features  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       React / Next.js    │
│                          │
│ Desktop widget UI        │
│ Model list               │
│ System statistics        │
└──────────────────────────┘
```

The goal is for the React frontend to consume normalized data without needing to know whether the underlying machine is running Windows, Linux, or macOS.

---

## Tech stack

### Frontend

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- `next/font`
- Next.js `Image`

### Desktop

- [Tauri](https://tauri.app/)
- Rust

### Runtime

- [Ollama](https://ollama.com/)

### Planned system telemetry

The backend is intended to use native OS APIs and/or Rust libraries for:

- CPU utilization
- System memory
- GPU information
- GPU utilization
- VRAM
- Temperature
- Power usage
- Fan speed

For NVIDIA systems, `nvidia-smi` is a useful initial data source.

---

## Development

### Prerequisites

Install:

- Node.js
- npm
- Rust
- Tauri prerequisites for your operating system
- Ollama

Verify the required tools:

```bash
node --version
npm --version
rustc --version
cargo --version
ollama --version
```

### Install dependencies

```bash
npm install
```

### Start the development application

```bash
npm run tauri dev
```

The exact npm scripts may change during development.

---

## Environment configuration

The Ollama server URL is configured through:

```text
NEXT_PUBLIC_OLLAMA_SERVER
```

For a local Ollama installation:

```env
NEXT_PUBLIC_OLLAMA_SERVER=http://localhost:11434
```

The application currently uses this value when making requests such as:

```text
GET /api/ps
GET /api/tags
```

A remote Ollama server can potentially be supported by changing this URL, subject to network access and CORS/security configuration.

---

## Current Ollama API layer

The project uses typed responses rather than allowing the frontend to work directly with arbitrary JSON.

The primary response type is conceptually:

```ts
export interface OllamaPsResponse {
  models: OllamaPsModel[];
}
```

And each running model is represented by:

```ts
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
}
```

The mock implementation intentionally returns:

```ts
Promise<OllamaPsResponse>
```

just like the real implementation.

That means the frontend can switch between:

```ts
getOllamaPsMock()
```

and:

```ts
getOllamaPs()
```

without changing the consuming code.

---

## VRAM calculations

The application calculates aggregate VRAM usage by summing `size_vram` for all currently loaded models.

Conceptually:

```ts
const usedVram = models.reduce(
  (total, model) => total + model.size_vram,
  0
);
```

GPU memory percentage is then:

```ts
const percentage = (usedVram / totalVram) * 100;
```

For example:

```text
GPU VRAM
───────────────
Used:       10.6 GB
Total:      12.0 GB
Usage:        83%
```

Only models returned by `/api/ps` are considered loaded and therefore contribute to current VRAM usage.

---

## Model processor placement

For an individual loaded model:

```ts
const gpu = (model.size_vram / model.size) * 100;
const cpu = 100 - gpu;
```

Example:

```text
19.61 GB model
10.64 GB VRAM

GPU allocation: 54%
CPU allocation: 46%
```

A model completely resident in VRAM will therefore report approximately:

```text
GPU allocation: 100%
CPU allocation:   0%
```

For an unloaded model, the UI should display unavailable values such as:

```text
GPU: —
CPU: —
```

rather than implying that the model is loaded and consuming zero resources.

---

## Relative expiration times

Ollama provides an ISO timestamp such as:

```text
2026-08-30T01:24:21.6688138-04:00
```

The UI converts this into a human-readable relative value:

```text
4 mins from now
2 hours from now
3 days from now
Expired
```

This corresponds to the model's Ollama keep-alive/expiration state.

---

## System telemetry roadmap

Ollama provides excellent model-level information, but actual machine utilization requires OS/GPU-level information.

### Windows

Initial NVIDIA support can use:

```bash
nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw --format=csv,noheader,nounits
```

This can provide:

- GPU name
- GPU utilization
- VRAM used
- VRAM total
- GPU temperature
- GPU power draw

CPU and system RAM will be collected through Windows-native APIs and/or a Rust system-information library.

### Linux

Linux provides system information through interfaces such as:

```text
/proc/stat
/proc/meminfo
```

NVIDIA GPUs can similarly be queried with:

```bash
nvidia-smi
```

### macOS

macOS requires a different approach because Apple Silicon uses unified memory rather than a traditional discrete VRAM model.

The application will eventually use macOS-native APIs and/or Rust libraries for:

- CPU utilization
- memory
- GPU information
- GPU activity where available

The data model is therefore designed so that GPU metrics can be optional.

---

## Intended system statistics

The eventual normalized backend data will resemble:

```ts
interface SystemStats {
  cpu: {
    usage: number;
    cores: number;
    threads: number;
  };

  memory: {
    used: number;
    total: number;
    percentage: number;
  };

  gpu?: {
    name: string;
    usage?: number;
    vramUsed?: number;
    vramTotal?: number;
    temperature?: number;
    powerUsage?: number;
    fanSpeed?: number;
  };
}
```

The frontend should not need platform-specific logic.

For example:

```text
Windows → Rust → SystemStats
Linux   → Rust → SystemStats
macOS   → Rust → SystemStats
                    ↓
               React widget
```

---

## Project structure

The structure is evolving, but the application is broadly organized around:

```text
.
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   └── ...
│   │
│   ├── components/
│   │   ├── MainWidget.tsx
│   │   └── ...
│   │
│   └── lib/
│       ├── ollama.ts
│       ├── ModelImageProvider.ts
│       └── ...
│
├── src-tauri/
│   ├── src/
│   ├── capabilities/
│   ├── tauri.conf.json
│   └── ...
│
├── public/
│   ├── brain_cloud_logo.png
│   ├── green_graph.png
│   ├── blue_graph.png
│   └── ...
│
├── package.json
├── tsconfig.json
├── next.config.*
└── README.md
```

The exact layout may change as the application grows.

---

## Design goals

### Lightweight

The monitor should remain small and unobtrusive rather than becoming another full-sized AI chat application.

### Local-first

The primary use case is monitoring locally hosted Ollama instances.

### Cross-platform

Windows, Linux, and macOS should share the same frontend and normalized telemetry model.

### Backend-aware

Native functionality should live in Tauri/Rust rather than being forced into browser APIs.

### Accurate terminology

The application should distinguish between:

- memory allocation
- resource utilization
- model state
- inference performance

This is particularly important because model VRAM placement is not the same thing as GPU utilization.

### Extensible

The architecture should allow additional telemetry providers and GPU vendors without requiring major frontend changes.

---

## Roadmap

### Phase 1 — Prototype

- [x] Tauri + Next.js application
- [x] Desktop widget UI
- [x] Ollama `/api/ps` model interface
- [x] Mock Ollama process data
- [x] Ollama `/api/tags` interface
- [x] Loaded/unloaded model concept
- [x] Model branding
- [x] VRAM calculations
- [x] Processor memory placement calculations
- [x] Always-on-top behavior
- [x] Settings window foundation

### Phase 2 — Real telemetry

- [ ] Detect total system RAM
- [ ] Detect CPU utilization
- [ ] Detect CPU core/thread count
- [ ] Detect GPU
- [ ] Detect total VRAM
- [ ] Detect GPU utilization
- [ ] Detect GPU temperature
- [ ] Detect GPU power
- [ ] Replace hard-coded hardware values

### Phase 3 — Ollama monitoring

- [ ] Automatic polling
- [ ] Configurable refresh interval
- [ ] Better model loading states
- [ ] Inference metrics
- [ ] Tokens per second
- [ ] Request/activity state
- [ ] Model load/unload events

### Phase 4 — Desktop integration

- [ ] System tray
- [ ] Launch at startup
- [ ] Start minimized
- [ ] Persistent settings
- [ ] Notifications
- [ ] Window position persistence

### Phase 5 — Cross-platform polish

- [ ] Windows telemetry
- [ ] Linux telemetry
- [ ] macOS telemetry
- [ ] NVIDIA support
- [ ] AMD support
- [ ] Apple Silicon support
- [ ] Graceful handling of unavailable metrics

---

## Known limitations

### CPU utilization is not currently available from Ollama

The Ollama `/api/ps` response does not provide actual CPU utilization.

The current CPU percentage shown for an individual model represents estimated **memory placement**, not CPU load.

### GPU utilization is not currently available from Ollama `/api/ps`

`size_vram` tells the application how much VRAM a model is using, but it does not indicate how busy the GPU is.

Actual GPU utilization requires GPU/system telemetry.

### Total VRAM is currently configured manually

The prototype currently uses a configured total VRAM value such as:

```ts
12 * 1024 * 1024 * 1024
```

This will eventually be replaced with automatic hardware detection.

### System RAM is not currently detected

The same applies to total system RAM.

The eventual Rust backend will provide this value.

### Model context usage

The `context_length` returned by `/api/ps` represents the model's configured/current context length as reported by Ollama. It should not be interpreted as the number of tokens currently being consumed by an active conversation.

Actual live context consumption may require additional Ollama/runtime information.

### CORS Issue in Packaged Tauri App

If the app works in development but fails to connect to Ollama after being built, allow Tauri's packaged WebView origin:

setx OLLAMA_ORIGINS "http://tauri.localhost"

Completely quit and restart Ollama Desktop.

Verify:

curl.exe -i -H "Origin: http://tauri.localhost" http://127.0.0.1:11434/api/ps

A successful response should include:

Access-Control-Allow-Origin: http://tauri.localhost
```

---

## Development philosophy

This project intentionally separates:

```text
What Ollama knows
```

from:

```text
What the operating system knows
```

and:

```text
What the GPU driver knows
```

Ollama is the authority for model state and model runtime information.

The operating system is the authority for CPU and system memory.

The GPU driver/platform APIs are the authority for GPU utilization and hardware telemetry.

Tauri/Rust acts as the bridge between these sources and the React UI.

---

## Contributing

The project is currently a personal development project and is still evolving rapidly.

Before contributing, expect APIs, component structure, and telemetry abstractions to change.

Ideas, bug reports, and improvements are welcome once the project reaches a more stable stage.

---

## License

License to be determined.

---

## Project name

**Ollama Model Monitor**

Repository/project identifier:

```text
ollama-model-monitor
```

The name may change as the project's scope develops.
