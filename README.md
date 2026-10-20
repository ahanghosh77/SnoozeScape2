# 🦥 SnoozeScape: Offline Wind-Down Bedtime Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026%20Open--Source%20AI%20Challenge-ff7557.svg)](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)
[![Theme: Slow and Steady](https://img.shields.io/badge/Theme-Slow%20%26%20Steady-10b981.svg)](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)
[![Privacy: 100% Offline](https://img.shields.io/badge/Privacy-100%25%20Offline%20AI-6366f1.svg)]()

> *"Sloths move at their own pace, conserve their energy, and do things slowly. SnoozeScape channels your inner sloth by doing the work so you don't have to."*

**SnoozeScape** is a private, zero-subscription bedtime companion built with **open-source AI at its core**. Built in celebration of **International Sloth Day (October 20)** for the **Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady**, SnoozeScape weaves personalized, tranquil bedtime micro-stories and generates continuous, procedural ambient soundscapes completely offline on your device.

---

## 🌟 Why Open Innovation Matters

In an era where tech giants funnel bedtime habits, microphone streams, and personal routines to closed cloud datacenters behind costly monthly paywalls, **SnoozeScape proves that open-source AI is vastly superior for bedtime wellness:**

1. **100% Offline & Airplane-Ready**:
   - Runs on a laptop, bedside tablet, or phone with **zero internet connection**.
   - Perfect for off-grid cabins, red-eye flights in airplane mode, or rural areas without reliable Wi-Fi.
2. **Absolute Bedtime Privacy**:
   - Closed APIs log user prompts, sleep schedules, and intimate thoughts to remote corporate servers.
   - SnoozeScape executes open-weight models (like `SmolLM2` or `Qwen2.5`) directly in the client browser using WebGPU/WASM or local air-gapped Ollama instances. Your bedtime data never leaves your bedroom.
3. **$0/Month Forever (Rewards True Laziness)**:
   - No surprise token bills, credit card requirements, or rate limits. Set it up once, channel your inner sloth, and let it lull you to sleep every night for free.
4. **Instant, Zero-Download Fallback**:
   - Includes the embedded **Sloth Dreamweaver Engine**—a rich, deterministic yet combinatorial story generator that works in 0.1s on any low-end device without waiting for multi-gigabyte downloads.

---

## ✨ Features

- **Procedural Web Audio Soundscape Generator**:
  - **Gentle Rain**: Pink noise buffer with low-pass resonance and random raindrop impulses.
  - **Tidal Swell & Ocean Wind**: Brownian noise swept with ultra-slow LFO filters (~11s breathing period).
  - **432Hz Delta Sleep Frequency**: Pure sine wave binaural beats (432Hz left, 435Hz right) inducing 3.0Hz delta brainwave entrainment for restorative REM sleep.
  - **Night Forest**: Sub-audible leaf rustle combined with rhythmic high-harmonic cricket chirps.
  - **Hearth Crackle**: Thermal Poisson impulse bursts simulating a warm cedar fireplace.
- **Multi-Tier Open-Source AI Engine**:
  - **Tier 1 (In-Browser Open Weights)**: Uses `@huggingface/transformers` (Transformers.js v3) running quantized open models (`SmolLM2-135M-Instruct` or `Qwen1.5-0.5B-Chat`) via WebGPU/WASM ONNX.
  - **Tier 2 (Air-Gapped Local Ollama)**: Auto-detects local Ollama instances on `http://localhost:11434` for power users running `llama3.2`, `mistral`, or `phi3`.
  - **Tier 3 (Sloth Dreamweaver Engine)**: Instant procedural bedtime micro-story generation with zero network lag and 100% reliability.
- **Sleep Fade Timer with Smart Attenuation**:
  - Select 15, 30, 45, or 60-minute wind-down intervals.
  - In the final 2 minutes, sound volume gently ramps down to silence to prevent waking you up.
- **Bedtime Voice Narrator**:
  - Built-in Web Speech API integration tuned to a calming, slowed cadence (0.8x rate, 0.92x pitch) with real-time word-by-word visual reading highlights.
- **Barnaby the Sloth Mascot**:
  - Animated SVG sloth gently breathing on a golden crescent moon with floating Zzz particles.
- **Bedside Night Dimmer**:
  - One-click dark mode that attenuates screen brightness to 20% for zero eye strain in pitch-black rooms.
- **Ambient Dynamic Starfield**:
  - Canvas-driven celestial night sky with multi-plane star drift and shooting stars.

---

## 🏛️ System Architecture

```mermaid
graph TD
    User([🛌 Slothful User]) -->|Selects Mood / Preset| UI[SnoozeScape Frontend UI]
    
    subgraph Client Browser
        UI --> Starfield[Celestial Starfield Canvas]
        UI --> Visualizer[Audio Waveform Visualizer]
        UI --> Mascot[Barnaby Sloth Mascot]
        
        subgraph Open AI Engine
            UI --> Router{AI Mode Selector}
            Router -->|Tier 1: WebGPU / ONNX| TransformersJS["@huggingface/transformers (SmolLM2 / Qwen)"]
            Router -->|Tier 2: Air-Gapped| OllamaLocal["Local Ollama API (localhost:11434)"]
            Router -->|Tier 3: Instant Offline| Dreamweaver[Sloth Dreamweaver Procedural Engine]
        end
        
        subgraph Web Audio Synthesizer
            UI --> SoundEngine[SoundscapeEngine]
            SoundEngine --> Rain[Pink Noise Rain Generator]
            SoundEngine --> Waves[Brownian Wave LFO]
            SoundEngine --> Delta[432Hz / 3Hz Delta Binaural Beats]
            SoundEngine --> Forest[Night Crickets Filter]
            SoundEngine --> Fire[Hearth Poisson Crackle]
            SoundEngine --> SleepTimer[Gradual Fade-out Timer]
        end

        subgraph Offline Voice
            Dreamweaver --> Narrator[BedtimeNarrator (Web Speech API)]
            TransformersJS --> Narrator
            OllamaLocal --> Narrator
            Narrator --> AudioOut([Speakers / Headphones])
            SoundEngine --> AudioOut
        end
    end
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 / 22 / 24)
- Any modern web browser (Chrome, Edge, Firefox, Brave, Safari) with Web Audio support. WebGPU is optional but recommended for browser neural inference.

### 1. Clone & Install
```bash
git clone https://github.com/ahanghosh77/amul-kool-3d.git snoozescape
cd snoozescape
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🐳 Docker Deployment

Run SnoozeScape anywhere in a self-contained, lightweight Alpine container:

```bash
docker build -t snoozescape:latest .
docker run -d -p 8080:80 --name snoozescape snoozescape:latest
```
Visit `http://localhost:8080`.

---

## ☁️ Deploy to Render (Best Use of Render)

SnoozeScape includes native [Render](https://render.com) Blueprint support (`render.yaml`).

1. Fork or push this repository to your GitHub account.
2. Sign in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect this repository; Render will automatically detect `render.yaml` and configure:
   - **Environment**: Static Site
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `./dist`
   - **Headers**: Configured with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` for full WebGPU/WASM compatibility.
5. Click **Apply** to deploy your live bedtime companion.

---

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript (ESNext Modules), HTML5 Semantic Architecture.
- **Styling**: Vanilla CSS3 Custom Design System (Glassmorphism, CSS Grid, Custom Range Inputs, Dark Velvet Palette).
- **Audio**: Web Audio API (procedural synthesis, biquad filters, LFO modulation, stereo panners, analyser node).
- **Voice**: Web Speech Synthesis API.
- **Open-Source AI**:
  - `@huggingface/transformers` (Transformers.js v3) for in-browser ONNX quantized weights (`SmolLM2`, `Qwen1.5`).
  - Native integration with [Ollama](https://ollama.ai) for local LLMs (`llama3.2`, `mistral`, `phi3`).
  - Embedded Sloth Dreamweaver Engine for instant offline bedtime tales.
- **Bundler & Tooling**: Vite 6, Nginx, Docker.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details. Built with ❤️ for Hacktoberfest 2026 and International Sloth Day.
