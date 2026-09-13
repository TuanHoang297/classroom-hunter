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
    // 1. Dark overlay to emphasize the light
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.zIndex = '9997';
    overlay.style.animation = 'godSaveFadeIn 0.5s forwards';

    // 2. Rotating God Rays (Sunburst)
    const rays = document.createElement('div');
    rays.style.position = 'fixed';
    rays.style.top = '50%';
    rays.style.left = '50%';
    rays.style.width = '200vw';
    rays.style.height = '200vw';
    rays.style.transform = 'translate(-50%, -50%)';
    rays.style.background = 'repeating-conic-gradient(from 0deg, rgba(253, 224, 71, 0.5) 0deg 15deg, transparent 15deg 30deg)';
    rays.style.zIndex = '9998';
    rays.style.pointerEvents = 'none';
    rays.style.animation = 'godSaveSpinRays 10s linear infinite, godSavePopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

    // 3. Giant God Save Text
    const textWrap = document.createElement('div');
    textWrap.style.position = 'fixed';
    textWrap.style.top = '25%';
    textWrap.style.left = '50%';
    textWrap.style.transform = 'translate(-50%, -50%)';
    textWrap.style.zIndex = '10000';
    textWrap.style.pointerEvents = 'none';
    textWrap.style.textAlign = 'center';

    const text = document.createElement('div');
    text.innerHTML = '🛡️ GOD SAVE! 👼';
    text.style.fontSize = '8vw';
    text.style.fontWeight = '900';
    text.style.color = '#fff';
    text.style.webkitTextStroke = '4px #ea580c';
    text.style.textShadow = '0 0 40px #fde047, 0 10px 0 #ea580c, 0 10px 30px rgba(0,0,0,0.8)';
    text.style.letterSpacing = '5px';
    text.style.animation = 'godSaveRubberBand 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
    text.style.whiteSpace = 'nowrap';
    
    textWrap.appendChild(text);

    // 4. Add keyframes dynamically
    const styleId = 'god-save-keyframes';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes godSaveFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes godSaveSpinRays { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes godSavePopIn { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.1); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes godSaveRubberBand {
          0% { transform: scale3d(0, 0, 0); }
          30% { transform: scale3d(1.25, 0.75, 1); }
          40% { transform: scale3d(0.75, 1.25, 1); }
          50% { transform: scale3d(1.15, 0.85, 1); }
          65% { transform: scale3d(0.95, 1.05, 1); }
          75% { transform: scale3d(1.05, 0.95, 1); }
          100% { transform: scale3d(1, 1, 1); }
        }
        @keyframes godSaveFlyUp {
          0% { transform: translateY(0) scale(0.5); opacity: 1; }
          100% { transform: translateY(-120vh) scale(1.5) rotate(360deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(overlay);
    document.body.appendChild(rays);
    document.body.appendChild(textWrap);

    // 5. Emojis flying up (Arcade celebration)
    const emojis = ['👼', '🛡️', '✨', '💛', '🌟', '🎉'];
    const flyingElements = [];
    for(let i=0; i<25; i++) {
        const el = document.createElement('div');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.position = 'fixed';
        el.style.left = (Math.random() * 100) + 'vw';
        el.style.bottom = '-10vh';
        el.style.fontSize = (2 + Math.random() * 3) + 'rem';
        el.style.zIndex = '9999';
        el.style.pointerEvents = 'none';
        el.style.animation = `godSaveFlyUp ${2 + Math.random()*2}s ease-in-out forwards`;
        el.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(el);
        flyingElements.push(el);
    }

    // 6. Cleanup after 3.5 seconds
    setTimeout(() => {
      overlay.style.transition = 'opacity 1s';
      overlay.style.opacity = '0';
      rays.style.transition = 'opacity 1s';
      rays.style.opacity = '0';
      textWrap.style.transition = 'all 1s cubic-bezier(0.5, -0.5, 0.5, 1.5)';
      textWrap.style.transform = 'translate(-50%, -50%) scale(0)';
    }, 3000);

    setTimeout(() => {
      overlay.remove();
      rays.remove();
      textWrap.remove();
      flyingElements.forEach(el => el.remove());
    }, 4000);
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
