/**
 * Ambient Audio Visualizer
 * Renders a slow, bioluminescent wave reflecting the soothing sound frequencies.
 */

export class AudioVisualizer {
  constructor(canvas, soundEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.soundEngine = soundEngine;
    this.analyser = null;
    this.dataArray = null;
    this.animationId = null;

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    this.canvas.width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 300;
    this.canvas.height = 70;
  }

  setupAnalyser() {
    if (!this.soundEngine.ctx || this.analyser) return;

    this.analyser = this.soundEngine.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.88;

    // Connect from master gain
    if (this.soundEngine.masterGain) {
      this.soundEngine.masterGain.connect(this.analyser);
    }

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }

  start() {
    this.setupAnalyser();
    if (!this.animationId) {
      this.render();
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render() {
    this.setupAnalyser();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerY = height * 0.5;

    if (this.analyser && this.soundEngine.isPlaying) {
      this.analyser.getByteFrequencyData(this.dataArray);
    } else {
      // Idle breathing wave
      this.dataArray = this.dataArray || new Uint8Array(32);
      const time = Date.now() * 0.002;
      for (let i = 0; i < this.dataArray.length; i++) {
        this.dataArray[i] = Math.sin(time + i * 0.3) * 12 + 15;
      }
    }

    const barWidth = width / (this.dataArray.length - 2);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY);

    for (let i = 0; i < this.dataArray.length; i++) {
      const v = this.dataArray[i] / 255.0;
      const amplitude = v * (height * 0.45);
      const x = i * barWidth;
      const y = i % 2 === 0 ? centerY - amplitude : centerY + amplitude;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        const prevX = (i - 1) * barWidth;
        const midX = (prevX + x) / 2;
        this.ctx.quadraticCurveTo(prevX, y, midX, y);
      }
    }

    // Glowing cyan/violet ambient line
    const gradient = this.ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
    gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.7)');
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0.4)');

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = 'rgba(167, 139, 250, 0.5)';
    this.ctx.stroke();

    this.ctx.restore();

    this.animationId = requestAnimationFrame(this.render);
  }
}
