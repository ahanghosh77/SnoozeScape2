import { SoundscapeEngine } from './audio/soundscape.js';
import { AIModelManager } from './ai/model-manager.js';
import { BedtimeNarrator } from './speech/narrator.js';
import { Starfield } from './ui/starfield.js';
import { AudioVisualizer } from './ui/visualizer.js';
import { renderSlothMascot } from './ui/sloth-mascot.js';

// Application State
const soundEngine = new SoundscapeEngine();
const aiManager = new AIModelManager();
const narrator = new BedtimeNarrator();

let starfield = null;
let visualizer = null;
let activePreset = 'sloth';
let activeStoryRaw = '';
let activeTimerMinutes = 30;

// Presets Definition
const PRESETS = {
  sloth: {
    rain: 0.35, waves: 0.25, binaural: 0.20, forest: 0.0, fire: 0.0,
    actives: { rain: true, waves: true, binaural: true, forest: false, fire: false }
  },
  delta: {
    rain: 0.15, waves: 0.10, binaural: 0.50, forest: 0.0, fire: 0.0,
    actives: { rain: true, waves: true, binaural: true, forest: false, fire: false }
  },
  rain: {
    rain: 0.65, waves: 0.15, binaural: 0.15, forest: 0.0, fire: 0.0,
    actives: { rain: true, waves: true, binaural: true, forest: false, fire: false }
  },
  ocean: {
    rain: 0.0, waves: 0.60, binaural: 0.25, forest: 0.0, fire: 0.0,
    actives: { rain: false, waves: true, binaural: true, forest: false, fire: false }
  },
  hearth: {
    rain: 0.30, waves: 0.0, binaural: 0.15, forest: 0.20, fire: 0.45,
    actives: { rain: true, waves: false, binaural: true, forest: true, fire: true }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Visuals
  const starCanvas = document.getElementById('starfield-canvas');
  if (starCanvas) starfield = new Starfield(starCanvas);

  renderSlothMascot('sloth-mascot-container');

  const visCanvas = document.getElementById('visualizer-canvas');
  if (visCanvas) {
    visualizer = new AudioVisualizer(visCanvas, soundEngine);
  }

  // 2. Soundscape Master Toggle
  const masterBtn = document.getElementById('btn-master-soundscape');
  const playIcon = document.getElementById('play-icon');
  const playText = document.getElementById('play-text');

  masterBtn.addEventListener('click', async () => {
    if (!soundEngine.isPlaying) {
      await soundEngine.start();
      visualizer.start();
      soundEngine.startTimer(activeTimerMinutes, updateTimerDisplay, onTimerFinish);
      masterBtn.classList.add('playing');
      playText.textContent = 'Pause Soundscape';
      playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    } else {
      soundEngine.stop();
      visualizer.stop();
      masterBtn.classList.remove('playing');
      playText.textContent = 'Start Soundscape';
      playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    }
  });

  // 3. Setup Presets
  const presetChips = document.querySelectorAll('.preset-chip');
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const presetKey = chip.getAttribute('data-preset');
      applyPreset(presetKey);
    });
  });

  // 4. Setup Individual Layer Controls
  setupLayerControls();

  // 5. Setup Story Generator
  setupStoryGenerator();

  // 6. Setup Narrator
  setupNarrator();

  // 7. Setup Timer Buttons
  setupTimerControls();

  // 8. Night Dimmer Toggle
  const dimmerBtn = document.getElementById('btn-toggle-dimmer');
  const dimmerLabel = document.getElementById('dimmer-label');
  dimmerBtn.addEventListener('click', () => {
    document.body.classList.toggle('screen-dimmed');
    const isDimmed = document.body.classList.contains('screen-dimmed');
    dimmerLabel.textContent = isDimmed ? 'Restore Brightness' : 'Night Dimmer';
  });

  // 9. AI Engine Status & Ollama Auto-detect
  checkAIBackends();

  // Check Ollama button/modal
  const settingsBtn = document.getElementById('btn-open-settings');
  settingsBtn.addEventListener('click', async () => {
    const models = await aiManager.checkOllama();
    if (models.length > 0) {
      alert(`Local Ollama detected!\nAvailable open models: ${models.map(m => m.name).join(', ')}\n\nSwitched to Local Ollama Mode.`);
      document.getElementById('select-engine').value = 'ollama';
      aiManager.currentMode = 'ollama';
      updateEngineStatusUI();
    } else {
      alert(`No active Ollama detected on http://localhost:11434.\n\nSnoozeScape will run in-browser open-weight models via WebGPU or the instant Sloth Dreamweaver engine! 100% offline.`);
    }
  });
});

function applyPreset(presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) return;
  activePreset = presetKey;

  for (const [layerKey, vol] of Object.entries(preset)) {
    if (layerKey === 'actives') continue;
    soundEngine.setLayerVolume(layerKey, vol);

    // Update UI slider
    const slider = document.querySelector(`.sound-slider[data-layer="${layerKey}"]`);
    if (slider) slider.value = vol;

    // Update active state
    const isActive = preset.actives[layerKey];
    soundEngine.toggleLayer(layerKey, isActive);
    const row = document.getElementById(`layer-row-${layerKey}`);
    if (row) {
      if (isActive) row.classList.add('active');
      else row.classList.remove('active');
    }
  }
}

function setupLayerControls() {
  const layers = ['rain', 'waves', 'binaural', 'forest', 'fire'];

  layers.forEach(layerKey => {
    const btn = document.querySelector(`.layer-icon-btn[data-layer="${layerKey}"]`);
    const slider = document.querySelector(`.sound-slider[data-layer="${layerKey}"]`);
    const row = document.getElementById(`layer-row-${layerKey}`);

    if (btn) {
      btn.addEventListener('click', () => {
        const newState = soundEngine.toggleLayer(layerKey);
        if (newState) row.classList.add('active');
        else row.classList.remove('active');
      });
    }

    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        soundEngine.setLayerVolume(layerKey, val);
        if (val > 0 && !soundEngine.layers[layerKey].active) {
          soundEngine.toggleLayer(layerKey, true);
          row.classList.add('active');
        }
      });
    }
  });
}

function setupStoryGenerator() {
  const generateBtn = document.getElementById('btn-generate-story');
  const themeSelect = document.getElementById('select-theme');
  const moodSelect = document.getElementById('select-mood');
  const engineSelect = document.getElementById('select-engine');
  const storyContainer = document.getElementById('story-text-container');
  const storyScroll = document.getElementById('story-scroll-area');

  engineSelect.addEventListener('change', async (e) => {
    aiManager.currentMode = e.target.value;
    updateEngineStatusUI();

    if (e.target.value === 'browser-llm' && !aiManager.pipeline) {
      const statusText = document.getElementById('ai-engine-status-text');
      statusText.textContent = 'Preparing WebGPU open-weight neural pipeline...';
      await aiManager.loadBrowserModel((pct, msg) => {
        statusText.textContent = msg;
      });
      updateEngineStatusUI();
    }
  });

  generateBtn.addEventListener('click', async () => {
    const theme = themeSelect.value;
    const mood = moodSelect.value;

    narrator.stop();
    document.getElementById('narrate-label').textContent = 'Read Aloud';

    generateBtn.disabled = true;
    generateBtn.innerHTML = `
      <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      <span>Weaving...</span>
    `;

    storyContainer.innerHTML = `<p style="color: var(--text-dim); font-style: italic;">Weaving a tranquil bedtime tale...</p>`;

    try {
      activeStoryRaw = await aiManager.generateStory({
        theme,
        mood,
        slothFactor: 1.0,
        onToken: (chunk, fullText) => {
          renderStoryHTML(fullText, storyContainer);
          storyScroll.scrollTop = storyScroll.scrollHeight;
        }
      });

      renderStoryHTML(activeStoryRaw, storyContainer);
    } catch (err) {
      console.error('Generation error:', err);
      storyContainer.innerHTML = `<p style="color: #ef4444;">Could not complete tale. Falling back to Sloth Dreamweaver...</p>`;
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
        </svg>
        <span>Weave Another</span>
      `;
    }
  });
}

function renderStoryHTML(rawText, container) {
  if (!rawText) return;
  const lines = rawText.split('\n\n').filter(l => l.trim());
  let html = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (i === 0 && !line.includes('.')) {
      html += `<h3>${line}</h3>`;
    } else {
      // Split words to wrap in spans for narration highlight
      const words = line.split(' ');
      const wrapped = words.map(w => `<span class="story-word">${w}</span>`).join(' ');
      html += `<p>${wrapped}</p>`;
    }
  }

  container.innerHTML = html;
}

function setupNarrator() {
  const narrateBtn = document.getElementById('btn-narrate-story');
  const narrateLabel = document.getElementById('narrate-label');
  const storyContainer = document.getElementById('story-text-container');

  narrateBtn.addEventListener('click', () => {
    if (narrator.isSpeaking && !narrator.isPaused) {
      narrator.stop();
      narrateLabel.textContent = 'Read Aloud';
      clearWordHighlights();
      return;
    }

    const storyText = activeStoryRaw || storyContainer.innerText;
    if (!storyText || !storyText.trim()) return;

    narrateLabel.textContent = 'Stop Narration';

    narrator.speak(storyText, {
      onStart: () => {
        narrateLabel.textContent = 'Stop Narration';
      },
      onEnd: () => {
        narrateLabel.textContent = 'Read Aloud';
        clearWordHighlights();
      },
      onBoundary: (charIndex, charLength) => {
        // Highlighting active word boundary
        highlightWordAtIndex(charIndex);
      }
    });
  });
}

function highlightWordAtIndex(charIndex) {
  const words = document.querySelectorAll('.story-word');
  if (!words || words.length === 0) return;

  let accumulated = 0;
  for (let i = 0; i < words.length; i++) {
    const textLen = words[i].innerText.length + 1; // including space
    if (accumulated <= charIndex && charIndex < accumulated + textLen) {
      words.forEach(w => w.classList.remove('highlight'));
      words[i].classList.add('highlight');
      break;
    }
    accumulated += textLen;
  }
}

function clearWordHighlights() {
  const words = document.querySelectorAll('.story-word');
  words.forEach(w => w.classList.remove('highlight'));
}

function setupTimerControls() {
  const timerChips = document.querySelectorAll('.btn-timer-chip');
  timerChips.forEach(chip => {
    chip.addEventListener('click', () => {
      timerChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeTimerMinutes = parseInt(chip.getAttribute('data-mins'), 10) || 30;

      // Update timer display
      const display = document.getElementById('timer-display');
      display.textContent = `${activeTimerMinutes.toString().padStart(2, '0')}:00`;

      if (soundEngine.isPlaying) {
        soundEngine.startTimer(activeTimerMinutes, updateTimerDisplay, onTimerFinish);
      }
    });
  });
}

function updateTimerDisplay(remainingSecs) {
  const display = document.getElementById('timer-display');
  if (!display) return;
  const mins = Math.floor(remainingSecs / 60);
  const secs = remainingSecs % 60;
  display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function onTimerFinish() {
  const masterBtn = document.getElementById('btn-master-soundscape');
  const playText = document.getElementById('play-text');
  const playIcon = document.getElementById('play-icon');

  if (masterBtn) {
    masterBtn.classList.remove('playing');
    playText.textContent = 'Start Soundscape';
    playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  }

  const display = document.getElementById('timer-display');
  if (display) display.textContent = '00:00';
}

async function checkAIBackends() {
  const models = await aiManager.checkOllama();
  if (models.length > 0) {
    const statusText = document.getElementById('ai-engine-status-text');
    statusText.textContent = `Local Ollama available (${models.length} open models found)`;
  }
  updateEngineStatusUI();
}

function updateEngineStatusUI() {
  const pill = document.getElementById('active-model-pill');
  const statusText = document.getElementById('ai-engine-status-text');

  if (aiManager.currentMode === 'ollama') {
    pill.textContent = 'Ollama (Local)';
    pill.style.background = 'rgba(16, 185, 129, 0.2)';
    pill.style.color = '#34d399';
    statusText.textContent = 'Connected to local air-gapped Ollama instance';
  } else if (aiManager.currentMode === 'browser-llm') {
    pill.textContent = 'WebGPU (In-Browser)';
    pill.style.background = 'rgba(56, 189, 248, 0.2)';
    pill.style.color = '#38bdf8';
    statusText.textContent = 'Running open weights in-browser via Transformers.js';
  } else {
    pill.textContent = 'Sloth Dreamweaver';
    pill.style.background = 'rgba(139, 92, 246, 0.2)';
    pill.style.color = '#c4b5fd';
    statusText.textContent = 'Sloth Dreamweaver offline engine active (0s latency)';
  }
}
