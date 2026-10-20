/**
 * SnoozeScape Procedural Web Audio Engine
 * Generates continuous, multi-layered calming ambient soundscapes completely
 * client-side without downloading heavy audio files. Works 100% offline.
 */

export class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.fadeInterval = null;
    
    // Individual Sound Generators
    this.layers = {
      rain: { gain: null, node: null, volume: 0.35, active: true },
      waves: { gain: null, node: null, volume: 0.25, active: true },
      binaural: { gain: null, node: null, volume: 0.20, active: true },
      forest: { gain: null, node: null, volume: 0.15, active: false },
      fire: { gain: null, node: null, volume: 0.15, active: false }
    };

    this.timerMinutes = 30;
    this.timerRemainingSeconds = 0;
    this.timerCallback = null;
    this.timerInterval = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Initialise gain nodes for each layer
    for (const key of Object.keys(this.layers)) {
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(this.layers[key].active ? this.layers[key].volume : 0, this.ctx.currentTime);
      g.connect(this.masterGain);
      this.layers[key].gain = g;
    }
  }

  async start() {
    this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;

    this.startRainLayer();
    this.startWavesLayer();
    this.startBinauralLayer();
    this.startForestLayer();
    this.startFireLayer();

    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;

    for (const key of Object.keys(this.layers)) {
      if (this.layers[key].node) {
        try {
          if (typeof this.layers[key].node.stop === 'function') {
            this.layers[key].node.stop();
          } else if (typeof this.layers[key].node.disconnect === 'function') {
            this.layers[key].node.disconnect();
          }
        } catch (_) {}
        this.layers[key].node = null;
      }
    }

    this.isPlaying = false;
    this.stopTimer();
  }

  setMasterVolume(val) {
    if (!this.masterGain) return;
    const clamped = Math.max(0, Math.min(1, val));
    this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
  }

  setLayerVolume(layerKey, val) {
    const layer = this.layers[layerKey];
    if (!layer) return;
    layer.volume = Math.max(0, Math.min(1, val));
    if (layer.gain && layer.active) {
      layer.gain.gain.setTargetAtTime(layer.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleLayer(layerKey, forceState) {
    const layer = this.layers[layerKey];
    if (!layer) return false;
    layer.active = forceState !== undefined ? forceState : !layer.active;
    if (layer.gain) {
      const targetVol = layer.active ? layer.volume : 0;
      layer.gain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.08);
    }
    return layer.active;
  }

  // --- PROCEDURAL GENERATORS ---

  // 1. Procedural Gentle Rain (Pink Noise + Low-pass & Random Droplets)
  startRainLayer() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Pink noise approximation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to simulate soft rainfall outside a window
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;

    noiseSource.connect(filter);
    filter.connect(this.layers.rain.gain);
    noiseSource.start();
    this.layers.rain.node = noiseSource;
  }

  // 2. Procedural Ocean Waves / Wind (Brownian Noise with Sinusoidal Surge LFO)
  startWavesLayer() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    // LFO for slow tidal swell (period ~10-12 seconds)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.09; // ~11 seconds per cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 250; // Filter modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(this.layers.waves.gain);

    lfo.start();
    noiseSource.start();

    this.layers.waves.node = {
      stop: () => {
        try { noiseSource.stop(); } catch (_) {}
        try { lfo.stop(); } catch (_) {}
      }
    };
  }

  // 3. Deep Delta 432Hz Binaural Beat (432Hz Left, 435Hz Right -> 3Hz Delta Entrainment)
  startBinauralLayer() {
    const merger = this.ctx.createChannelMerger(2);

    // Left channel: 432 Hz
    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.value = 432;

    // Right channel: 435 Hz (produces 3.0 Hz delta wave in brain)
    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.value = 435;

    // Subtle harmonic warmth: 216Hz sub-octave
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = 216;
    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.35;
    subOsc.connect(subGain);

    oscLeft.connect(merger, 0, 0);  // Output 0 -> Left
    oscRight.connect(merger, 0, 1); // Output 0 -> Right
    subGain.connect(merger, 0, 0);
    subGain.connect(merger, 0, 1);

    merger.connect(this.layers.binaural.gain);

    oscLeft.start();
    oscRight.start();
    subOsc.start();

    this.layers.binaural.node = {
      stop: () => {
        try { oscLeft.stop(); } catch (_) {}
        try { oscRight.stop(); } catch (_) {}
        try { subOsc.stop(); } catch (_) {}
      }
    };
  }

  // 4. Night Forest & Distant Crickets (Gentle high harmonic chirp bursts)
  startForestLayer() {
    const forestGain = this.layers.forest.gain;

    // Background low rustle
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 4200;
    bpf.Q.value = 8;

    // Modulate cricket chirping
    const chirpLfo = this.ctx.createOscillator();
    chirpLfo.type = 'sine';
    chirpLfo.frequency.value = 18; // rapid chirp carrier

    const chirpGain = this.ctx.createGain();
    chirpGain.gain.value = 0.08;

    chirpLfo.connect(chirpGain.gain);
    noise.connect(bpf);
    bpf.connect(chirpGain);
    chirpGain.connect(forestGain);

    noise.start();
    chirpLfo.start();

    this.layers.forest.node = {
      stop: () => {
        try { noise.stop(); } catch (_) {}
        try { chirpLfo.stop(); } catch (_) {}
      }
    };
  }

  // 5. Fireplace Crackle (Impulse spikes & warm resonance)
  startFireLayer() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Occasional crackle spike
      const isPop = Math.random() < 0.002;
      const white = (Math.random() * 2 - 1);
      data[i] = isPop ? white * 0.9 : white * 0.015;
    }

    const fireSource = this.ctx.createBufferSource();
    fireSource.buffer = buffer;
    fireSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1200;

    fireSource.connect(lowpass);
    lowpass.connect(this.layers.fire.gain);
    fireSource.start();

    this.layers.fire.node = fireSource;
  }

  // --- SLEEP TIMER WITH GRADUAL FADE-OUT ---
  startTimer(minutes, onTick, onComplete) {
    this.stopTimer();
    this.timerMinutes = minutes;
    this.timerRemainingSeconds = minutes * 60;
    this.timerCallback = onTick;

    this.timerInterval = setInterval(() => {
      this.timerRemainingSeconds--;
      if (this.timerCallback) {
        this.timerCallback(this.timerRemainingSeconds);
      }

      // Start gentle fade-out in the final 2 minutes
      if (this.timerRemainingSeconds <= 120 && this.timerRemainingSeconds > 0) {
        const fadeRatio = this.timerRemainingSeconds / 120;
        this.setMasterVolume(0.7 * fadeRatio);
      }

      if (this.timerRemainingSeconds <= 0) {
        this.stopTimer();
        this.stop();
        if (onComplete) onComplete();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
