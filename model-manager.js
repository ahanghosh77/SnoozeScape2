/**
 * SnoozeScape Open-Source AI Model Manager
 * Multi-tier offline AI architecture:
 * 1. In-browser Open-Weights via Transformers.js (WebGPU/WASM ONNX)
 * 2. Local Ollama Server integration (for air-gapped workstations)
 * 3. Embedded Sloth Dreamweaver Procedural Story Engine (zero-download instant fallback)
 */

export class AIModelManager {
  constructor() {
    this.currentMode = 'procedural'; // 'browser-llm' | 'ollama' | 'procedural'
    this.pipeline = null;
    this.isLoadingModel = false;
    this.loadProgress = 0;
    this.statusMessage = 'Sloth Dreamweaver ready';
    
    // Model choices for in-browser execution
    this.availableModels = [
      { id: 'HuggingFaceTB/SmolLM2-135M-Instruct', name: 'SmolLM2 135M (Ultra-fast, ~140MB)', dtype: 'q4' },
      { id: 'Xenova/Qwen1.5-0.5B-Chat', name: 'Qwen1.5 0.5B Chat (Balanced, ~350MB)', dtype: 'q4' }
    ];
    this.selectedModelId = this.availableModels[0].id;

    // Local Ollama config
    this.ollamaUrl = 'http://localhost:11434';
    this.ollamaModel = 'llama3.2:latest';
    this.isOllamaAvailable = false;
  }

  async checkOllama() {
    try {
      const res = await fetch(`${this.ollamaUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const data = await res.json();
        this.isOllamaAvailable = true;
        return data.models || [];
      }
    } catch (_) {
      this.isOllamaAvailable = false;
    }
    return [];
  }

  async loadBrowserModel(onProgress) {
    if (this.pipeline) return this.pipeline;

    this.isLoadingModel = true;
    this.statusMessage = 'Downloading open-weight model to browser cache...';

    try {
      // Dynamic import to prevent blocking bundle if WebGPU is not active
      const { pipeline, env } = await import('@huggingface/transformers');
      
      // Configure local caching
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      // Check WebGPU availability
      const device = navigator.gpu ? 'webgpu' : 'wasm';

      this.pipeline = await pipeline('text-generation', this.selectedModelId, {
        dtype: 'q4',
        device: device,
        progress_callback: (progress) => {
          if (progress.status === 'progress') {
            this.loadProgress = Math.round(progress.progress || 0);
            this.statusMessage = `Downloading open weights (${progress.file || ''}): ${this.loadProgress}%`;
            if (onProgress) onProgress(this.loadProgress, this.statusMessage);
          } else if (progress.status === 'done') {
            this.statusMessage = 'Weights cached. Finalizing neural pipeline...';
            if (onProgress) onProgress(100, this.statusMessage);
          }
        }
      });

      this.isLoadingModel = false;
      this.statusMessage = `Ready (${device.toUpperCase()} Accelerated)`;
      return this.pipeline;
    } catch (err) {
      console.warn('WebGPU/Browser model load fallback to procedural engine:', err);
      this.isLoadingModel = false;
      this.statusMessage = 'In-browser model unavailable on this device. Using Sloth Dreamweaver.';
      this.currentMode = 'procedural';
      return null;
    }
  }

  async generateStory({ theme, mood, slothFactor, onToken }) {
    if (this.currentMode === 'ollama' && this.isOllamaAvailable) {
      return this.generateWithOllama({ theme, mood, slothFactor, onToken });
    }

    if (this.currentMode === 'browser-llm' && this.pipeline) {
      return this.generateWithBrowserModel({ theme, mood, slothFactor, onToken });
    }

    // Default: Sloth Dreamweaver Procedural Offline Generator
    return this.generateProceduralStory({ theme, mood, slothFactor, onToken });
  }

  async generateWithOllama({ theme, mood, slothFactor, onToken }) {
    const prompt = `Write a soothing, extremely slow-paced bedtime micro-story (around 150-200 words) to help the reader fall asleep.
Theme: ${theme}.
Mood: ${mood}.
Tone: Gentle, rhythmic, calming, tranquil. No tension, no sudden events, just soft sensory descriptions of stillness, slow breaths, and peaceful rest.`;

    try {
      const res = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.ollamaModel,
          prompt: prompt,
          stream: true,
          options: {
            temperature: 0.6,
            top_p: 0.9
          }
        })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullStory = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              fullStory += parsed.response;
              if (onToken) onToken(parsed.response, fullStory);
            }
          } catch (_) {}
        }
      }

      return fullStory;
    } catch (err) {
      console.error('Ollama generation error, falling back to procedural:', err);
      return this.generateProceduralStory({ theme, mood, slothFactor, onToken });
    }
  }

  async generateWithBrowserModel({ theme, mood, slothFactor, onToken }) {
    const prompt = `<|user|>\nWrite a gentle, slow-moving bedtime story about ${theme} with a ${mood} atmosphere. Help me fall asleep quietly.\n<|assistant|>\n`;
    try {
      const output = await this.pipeline(prompt, {
        max_new_tokens: 180,
        temperature: 0.7,
        repetition_penalty: 1.15,
        do_sample: true
      });
      const rawText = output[0]?.generated_text || '';
      const storyOnly = rawText.replace(prompt, '').trim();
      if (onToken) onToken(storyOnly, storyOnly);
      return storyOnly;
    } catch (err) {
      console.error('Browser model generation error:', err);
      return this.generateProceduralStory({ theme, mood, slothFactor, onToken });
    }
  }

  // Sloth Dreamweaver: Deterministic yet deeply combinatorial sensory generator
  async generateProceduralStory({ theme, mood, slothFactor = 1, onToken }) {
    const stories = {
      sloth: [
        {
          title: "Barnaby's Golden Canopy",
          paragraphs: [
            "High in the emerald crown of the rainforest, Barnaby the sloth loosened his gentle grip on the ancient cecropia branch. Below him, the dusk turned the world to velvet.",
            "He closed his amber eyes, savoring the cool mist rolling across the broad leaves. Each breath came slow, steady, and unhurried—a quiet rhythm that matched the heartbeat of the forest.",
            "The fireflies awoke one by one, trailing soft lanterns in the quiet air. Barnaby felt the moss beneath him cradle his shoulders. With nothing left to do and nowhere to go, he settled into sleep, weightless and profoundly content."
          ]
        },
        {
          title: "The Sloth Who Outsmarted the Sun",
          paragraphs: [
            "The afternoon sun had surrendered its warmth to the evening indigo. Barnaby hung suspended between two moss-draped boughs, watching the shadows stretch like lazy ribbons across the glade.",
            "A cool breeze stirred his fur, carrying the sweet aroma of wild orchids and wet earth. He let out a long, effortless sigh, feeling tension melt away from his limbs.",
            "Above him, the constellations took their familiar places in the sky. He curled his paws in peaceful stillness, allowing the gentle lull of the nocturnal world to sweep him into peaceful slumber."
          ]
        }
      ],
      forest: [
        {
          title: "The Whispering Pines of Moon Hollow",
          paragraphs: [
            "Deep in the heart of Moon Hollow, the pine needles formed a fragrant, yielding carpet beneath the tall timber. The mountain air was crisp and still.",
            "A tiny brook purled over smooth slate pebbles, its song unchanging across centuries. The silver moonlight filtered through the needle boughs, drawing calm patterns across the forest floor.",
            "With each passing moment, the woods grew quieter. The tall evergreens swayed in the softest breeze, inviting you to release the burdens of the day and drift into deep, undisturbed rest."
          ]
        }
      ],
      ocean: [
        {
          title: "Starlight on the Calm Lagoon",
          paragraphs: [
            "The tide was coming in with a slow, meditative whisper against the pale shore. The surface of the lagoon lay as still as dark mirror glass, holding the reflection of distant stars.",
            "Warm sea foam brushed the shoreline and receded, leaving behind a rhythm of effortless ebb and flow. You can feel your breathing slowing to match the pulse of the vast, quiet water.",
            "Out on the horizon, the edge between the sky and the sea dissolves into deep navy. Everything is calm. Everything is safe. The ocean holds the night, and sleep arrives gently."
          ]
        }
      ],
      stars: [
        {
          title: "The Celestial Observatory",
          paragraphs: [
            "At the crest of the quiet hill stands the old stone observatory, open to the tranquil expanse of the cosmos. Up here, silence has a gentle, comforting weight.",
            "A meteor streaks lazily across the Andromeda constellation, leaving a trailing ember of silver light before fading into indigo quiet. The universe moves at its own ancient, patient pace.",
            "Wrapped in warm wool blankets, you watch the nebulae pulse with faint luminescence. Your eyelids grow delightfully heavy, surrendered to the peaceful infinity of the night."
          ]
        }
      ],
      rain: [
        {
          title: "The Attic Window in Autumn",
          paragraphs: [
            "The steady rhythm of twilight rain tapped against the sloped glass of the attic dormer. Inside, the cedar hearth glowed with soft embers, casting amber warmth across the wood floor.",
            "Outside, the rain rinsed away the busy noise of the town, replacing it with a continuous, soothing murmur. A cup of chamomile tea steamed faintly on the side table.",
            "The duvet was thick and welcoming. As the droplets traced gentle paths down the windowpane, your mind let go of every thought, sinking into the enveloping comfort of the storm."
          ]
        }
      ]
    };

    // Pick theme collection
    const category = stories[theme] || stories['sloth'];
    const selected = category[Math.floor(Math.random() * category.length)];
    const fullText = `${selected.title}\n\n` + selected.paragraphs.join('\n\n');

    // Simulate gentle streaming output
    const words = fullText.split(' ');
    let streamed = '';

    for (let i = 0; i < words.length; i++) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      streamed += chunk;
      if (onToken) onToken(chunk, streamed);
      // Gentle delay for relaxing visual pacing
      await new Promise(r => setTimeout(r, 45));
    }

    return fullText;
  }
}
