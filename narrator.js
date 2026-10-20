/**
 * SnoozeScape Voice Narrator
 * Uses the Web Speech Synthesis API for 100% offline, privacy-first voice reading.
 * Tuned specifically for slow-cadence, hypnagogic bedtime relaxation.
 */

export class BedtimeNarrator {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.rate = 0.80; // Slow, tranquil pace
    this.pitch = 0.92; // Slightly warmer/lower soothing tone
    this.voices = [];
    this.selectedVoice = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
    // Prefer warm natural English voices
    const preferredNames = [
      'Natural', 'Samantha', 'Karen', 'Moira', 'Daniel', 
      'Google US English', 'Microsoft Zira', 'Alex'
    ];

    for (const name of preferredNames) {
      const match = this.voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
      if (match) {
        this.selectedVoice = match;
        break;
      }
    }

    if (!this.selectedVoice && this.voices.length > 0) {
      this.selectedVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
    }
  }

  speak(text, { onStart, onEnd, onBoundary }) {
    if (!this.synth) return;
    this.stop();

    if (!text || !text.trim()) return;

    // Filter out title formatting if present
    const cleanText = text.replace(/^[^\n]+\n+/, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech narration notice:', e);
      this.isSpeaking = false;
      this.isPaused = false;
      if (onEnd) onEnd();
    };

    if (onBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          onBoundary(event.charIndex, event.charLength || 5);
        }
      };
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
    }
  }

  setSpeed(rate) {
    this.rate = Math.max(0.5, Math.min(1.2, rate));
  }
}
