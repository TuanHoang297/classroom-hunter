/**
 * CELEBRATION ENGINE
 * High-performance Canvas Confetti & Aura Particle Physics
 */

class CelebrationEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
  }

  init() {
    this.canvas = document.getElementById('confettiCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  triggerLuckyBurst() {
    this.explode('godsave');
    this.createHolyFlash();
  }

  createHolyFlash() {
    // Flash Overlay
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.background = 'radial-gradient(circle, rgba(253, 224, 71, 0.7) 0%, rgba(234, 88, 12, 0.4) 40%, rgba(0,0,0,0) 80%)';
    flash.style.zIndex = '9998';
    flash.style.pointerEvents = 'none';
    flash.style.opacity = '1';
    flash.style.transition = 'opacity 2s cubic-bezier(0.1, 0.8, 0.2, 1)';
    flash.style.mixBlendMode = 'screen';
    document.body.appendChild(flash);
    
    // Giant God Save Text Effect
    const text = document.createElement('div');
    text.textContent = 'GOD SAVE';
    text.style.position = 'fixed';
    text.style.top = '40%';
    text.style.left = '50%';
    text.style.transform = 'translate(-50%, -50%) scale(0.3)';
    text.style.fontSize = '8rem';
    text.style.fontWeight = '900';
    text.style.color = '#ffffff';
    text.style.webkitTextStroke = '4px #ea580c';
    text.style.textShadow = '0 0 30px #fde047, 0 0 60px #ea580c, 10px 10px 0px rgba(0,0,0,0.8)';
    text.style.zIndex = '10000';
    text.style.pointerEvents = 'none';
    text.style.opacity = '1';
    text.style.letterSpacing = '10px';
    text.style.transition = 'all 2s cubic-bezier(0.1, 0.8, 0.2, 1)';
    document.body.appendChild(text);

    // Force reflow
    void flash.offsetWidth;
    void text.offsetWidth;

    // Wait a bit before animating out so the user can see it!
    setTimeout(() => {
      flash.style.opacity = '0';
      text.style.transform = 'translate(-50%, -50%) scale(1.8)';
      text.style.opacity = '0';
      text.style.letterSpacing = '30px';
    }, 1200);

    // Remove from DOM after transition finishes
    setTimeout(() => {
      flash.remove();
      text.remove();
    }, 3200);
  }

  triggerEpicVictory() {
    this.explode('default');
  }

  /**
   * Launch colorful confetti explosion
   */
  explode(type = 'default') {
    if (!this.canvas || !this.ctx) this.init();
    if (!this.canvas || !this.ctx) return;

    let count = 100;
    let colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#3b82f6', '#f59e0b', '#10b981']; // Vibrant Neon
    
    if (type === 'godsave') {
      count = 350; // Massive explosion
      colors = ['#fde047', '#f59e0b', '#ffffff', '#fbbf24', '#ea580c', '#eab308']; // Golden & Holy White
    }

    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.45;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = type === 'godsave' 
        ? 15 + Math.random() * 30 
        : 8 + Math.random() * 18;
        
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - (type === 'godsave' ? 8 : 4),
        size: (type === 'godsave' ? 8 : 6) + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.35 + Math.random() * 0.2,
        drag: 0.94,
        opacity: 1,
        fadeSpeed: 0.008 + Math.random() * 0.012,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.fadeSpeed;

      if (p.opacity <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

export const celebrationEngine = new CelebrationEngine();
