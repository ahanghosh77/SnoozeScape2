/**
 * Ambient Starfield Canvas
 * Draws a tranquil deep-space backdrop with multi-layered twinkling stars,
 * slow celestial drift, and occasional soft shooting stars.
 */

export class Starfield {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.animationId = null;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
    this.initStars(160);
    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
        speedY: Math.random() * 0.04 + 0.01,
        color: Math.random() > 0.8 ? '#fcd34d' : (Math.random() > 0.6 ? '#93c5fd' : '#ffffff')
      });
    }
  }

  addShootingStar() {
    if (this.shootingStars.length > 2) return;
    this.shootingStars.push({
      x: Math.random() * (this.width * 0.8),
      y: Math.random() * (this.height * 0.4),
      length: Math.random() * 80 + 40,
      speed: Math.random() * 4 + 3,
      angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008
    });
  }

  start() {
    if (!this.animationId) {
      this.loop();
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Deep cosmic gradient
    const gradient = this.ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.3, 50,
      this.width * 0.5, this.height * 0.5, this.width
    );
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
    gradient.addColorStop(0.5, 'rgba(10, 15, 30, 0.7)');
    gradient.addColorStop(1, 'rgba(3, 7, 18, 0.95)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render stars
    for (const star of this.stars) {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 0.95 || star.alpha < 0.2) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }

      star.y += star.speedY;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = star.alpha;
      this.ctx.shadowBlur = star.radius * 3;
      this.ctx.shadowColor = star.color;
      this.ctx.fill();
      this.ctx.restore();
    }

    // Occasional shooting star chance
    if (Math.random() < 0.004) {
      this.addShootingStar();
    }

    // Render shooting stars
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      const endX = s.x - Math.cos(s.angle) * s.length;
      const endY = s.y - Math.sin(s.angle) * s.length;

      const starGrad = this.ctx.createLinearGradient(s.x, s.y, endX, endY);
      starGrad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
      starGrad.addColorStop(0.3, `rgba(251, 191, 36, ${s.alpha * 0.7})`);
      starGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = starGrad;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      this.ctx.restore();

      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.alpha -= s.decay;

      if (s.alpha <= 0 || s.x > this.width || s.y > this.height) {
        this.shootingStars.splice(i, 1);
      }
    }

    this.animationId = requestAnimationFrame(this.loop);
  }
}
