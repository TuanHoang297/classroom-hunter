/**
 * GACHA CHEST MODE (Mystery Box / SSR Summon)
 * Mystical treasure chest that rumbles, cracks with golden rays, and summons the chosen student.
 */

import { audioSynthesizer } from '../core/audio-synthesizer.js';

export class GachaMode {
  constructor(container) {
    this.container = container;
    this.chestWrap = null;
    this.isRunning = false;
    this.render();
  }

  setStudents(students) {
    this.students = students;
  }

  render() {
    this.container.innerHTML = `
      <div class="gacha-stage">
        <!-- Magic Circle Background -->
        <div class="gacha-magic-circle" id="gachaMagicCircle"></div>
        
        <!-- Chest Container -->
        <div class="gacha-chest-wrap" id="gachaChestWrap" title="Bấm để mở rương thần bí">
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <!-- Updated, more detailed Chest SVG -->
            <defs>
              <linearGradient id="chestBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#312e81"/>
                <stop offset="100%" stop-color="#1e1b4b"/>
              </linearGradient>
              <linearGradient id="chestGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fde047"/>
                <stop offset="50%" stop-color="#eab308"/>
                <stop offset="100%" stop-color="#a16207"/>
              </linearGradient>
              <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- Base Shadow -->
            <ellipse cx="100" cy="180" rx="75" ry="14" fill="rgba(0,0,0,0.8)" filter="blur(6px)" />
            
            <!-- Body -->
            <rect x="30" y="85" width="140" height="85" rx="12" fill="url(#chestBody)" stroke="url(#chestGold)" stroke-width="3" />
            <rect x="36" y="91" width="128" height="73" rx="8" fill="#0f172a" />
            
            <!-- Metal Bands -->
            <rect x="50" y="85" width="18" height="85" fill="url(#chestGold)" />
            <rect x="132" y="85" width="18" height="85" fill="url(#chestGold)" />
            <circle cx="59" cy="125" r="4" fill="#78350f" />
            <circle cx="141" cy="125" r="4" fill="#78350f" />
            <circle cx="59" cy="155" r="4" fill="#78350f" />
            <circle cx="141" cy="155" r="4" fill="#78350f" />

            <!-- Lid -->
            <path id="chestLid" d="M 25 85 Q 100 5 175 85 Z" fill="url(#chestBody)" stroke="url(#chestGold)" stroke-width="4" />
            <path d="M 45 83 Q 100 20 155 83" fill="none" stroke="url(#chestGold)" stroke-width="6" />
            
            <!-- Lock -->
            <circle cx="100" cy="90" r="18" fill="#111" stroke="url(#chestGold)" stroke-width="4" />
            <circle cx="100" cy="90" r="10" fill="#06b6d4" filter="url(#glowGold)" />
            <path d="M 100 84 L 100 102 M 94 90 L 106 90" stroke="#fff" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        
        <!-- Orbit Container for Floating Names -->
        <div id="gachaOrbitContainer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 4;"></div>

        <!-- Name Display Overlay (For final suck-in animation) -->
        <div id="gachaNameDisplay" style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); width: 100%; text-align: center; font-size: 2.2rem; font-weight: 800; color: #fff; text-shadow: 0 0 15px #0ea5e9, 0 0 30px #0ea5e9; opacity: 0; transition: all 0.2s ease; z-index: 5; letter-spacing: 2px;"></div>

        <!-- White Flash Overlay -->
        <div class="gacha-flash-overlay" id="gachaFlash"></div>

        <div style="margin-top: 30px; font-weight: 800; color: var(--gold-bright); letter-spacing: 2px; font-size: 1.15rem; text-shadow: 0 0 15px rgba(245, 158, 11, 0.8), 0 0 30px rgba(245, 158, 11, 0.4);">
          ✨ RƯƠNG THẦN BÍ LỚP HỌC ✨
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">
          Sẵn sàng triệu hồi nhân tố bí ẩn
        </div>
      </div>
    `;

    this.chestWrap = this.container.querySelector('#gachaChestWrap');
    this.magicCircle = this.container.querySelector('#gachaMagicCircle');
    this.flashOverlay = this.container.querySelector('#gachaFlash');
    this.nameDisplay = this.container.querySelector('#gachaNameDisplay');
  }

  startHunt(targetStudent, onComplete) {
    if (this.isRunning) return;
    this.isRunning = true;

    if (!this.chestWrap) this.render();
    
    this.chestWrap.classList.add('rumble');
    if (this.magicCircle) this.magicCircle.classList.add('summoning');
    
    this.orbitContainer = this.container.querySelector('#gachaOrbitContainer');
    this.nameDisplay = this.container.querySelector('#gachaNameDisplay');

    if (this.orbitContainer) {
      this.orbitContainer.innerHTML = '';
      this.orbitingNames = [];
      const numOrbits = Math.min(10, this.students.length > 0 ? this.students.length : 10);
      for(let i=0; i<numOrbits; i++) {
        const el = document.createElement('div');
        el.className = 'gacha-orbit-name';
        el.textContent = this.students && this.students.length > 0 ? this.students[Math.floor(Math.random() * this.students.length)] : '???';
        el.style.position = 'absolute';
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.color = 'rgba(255, 255, 255, 0.8)';
        el.style.fontWeight = '800';
        el.style.fontSize = '1.3rem';
        el.style.textShadow = '0 0 10px #0ea5e9, 0 0 20px #0ea5e9';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.whiteSpace = 'nowrap';
        el.style.transform = 'translate(-50%, -50%)';
        this.orbitContainer.appendChild(el);
        
        this.orbitingNames.push({
          el,
          angle: (Math.PI * 2 * i) / numOrbits,
          speed: 0.04 + Math.random() * 0.04,
          radiusX: 130 + Math.random() * 60,
          radiusY: 40 + Math.random() * 40,
          zOffset: Math.random() * Math.PI
        });
      }
      
      setTimeout(() => {
        if (!this.isRunning) return;
        this.orbitingNames.forEach(o => {
          o.el.style.transition = 'opacity 0.5s ease';
          o.el.style.opacity = '1';
        });
      }, 100);
    }

    const animateOrbit = () => {
      if (!this.isRunning) return;
      
      if (this.orbitingNames) {
        this.orbitingNames.forEach(o => {
          if (o.suckedIn) return;
          o.angle += o.speed;
          const x = Math.cos(o.angle) * o.radiusX;
          const y = Math.sin(o.angle) * o.radiusY - 40; 
          
          const depth = Math.sin(o.angle + o.zOffset);
          const scale = 0.6 + (depth + 1) * 0.35; 
          const opacity = 0.3 + (depth + 1) * 0.35; 

          o.el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
          if (o.el.style.opacity !== '0') {
             o.el.style.opacity = opacity.toString();
             o.el.style.zIndex = depth > 0 ? '5' : '3';
          }
          
          if (Math.random() < 0.04 && this.students && this.students.length > 0) {
            o.el.textContent = this.students[Math.floor(Math.random() * this.students.length)];
          }
        });
      }
      this.orbitAnimation = requestAnimationFrame(animateOrbit);
    };
    this.orbitAnimation = requestAnimationFrame(animateOrbit);

    let count = 0;
    const interval = setInterval(() => {
      audioSynthesizer.playHeartbeat(50 + count * 6);
      count++;
      
      if (count === 6) {
        this.chestWrap.classList.remove('rumble');
        this.chestWrap.classList.add('intense-shake');
        
        // Speed up orbit
        if (this.orbitingNames) {
          this.orbitingNames.forEach(o => {
            o.speed *= 1.8;
            o.el.style.color = '#fde047';
            o.el.style.textShadow = '0 0 10px #f59e0b, 0 0 20px #f59e0b';
          });
        }
      }

      if (count === 9) {
        // Suck orbiting names into chest
        if (this.orbitingNames) {
           this.orbitingNames.forEach(o => {
             o.suckedIn = true;
             o.el.style.transition = 'all 0.3s cubic-bezier(0.5, 0, 1, 1)';
             o.el.style.opacity = '0';
             o.el.style.transform = `translate(-50%, -50%) translate(0px, 0px) scale(0)`;
           });
        }
        
        // Show target student name falling from above into the chest
        if (this.nameDisplay) {
          this.nameDisplay.textContent = targetStudent;
          this.nameDisplay.style.transition = 'none';
          this.nameDisplay.style.opacity = '0';
          this.nameDisplay.style.transform = 'translate(-50%, -50%) translateY(-150px) scale(2)';
          this.nameDisplay.style.color = '#fff';
          this.nameDisplay.style.textShadow = '0 0 20px #fde047, 0 0 40px #f59e0b, 0 0 60px #f59e0b';
          
          void this.nameDisplay.offsetWidth; // force reflow
          
          this.nameDisplay.style.transition = 'all 0.35s cubic-bezier(0.5, 0, 1, 1)';
          this.nameDisplay.style.opacity = '1';
          this.nameDisplay.style.transform = 'translate(-50%, -50%) translateY(10px) scale(0)';
        }
      }

      if (count > 9) {
        clearInterval(interval);
        if (this.orbitAnimation) cancelAnimationFrame(this.orbitAnimation);
        
        this.chestWrap.classList.remove('intense-shake');
        this.chestWrap.classList.add('burst');
        
        if (this.flashOverlay) this.flashOverlay.classList.add('active');
        if (this.magicCircle) this.magicCircle.classList.add('climax');
        
        audioSynthesizer.playTargetLockAlarm();

        setTimeout(() => {
          this.isRunning = false;
          this.chestWrap.classList.remove('burst');
          if (this.magicCircle) this.magicCircle.classList.remove('summoning', 'climax');
          if (this.flashOverlay) this.flashOverlay.classList.remove('active');
          if (this.orbitContainer) this.orbitContainer.innerHTML = '';
          
          if (onComplete) onComplete(targetStudent);
        }, 1200); 
      }
    }, 280);
  }

  stop() {
    this.isRunning = false;
    if (this.orbitAnimation) cancelAnimationFrame(this.orbitAnimation);
    if (this.nameDisplay) this.nameDisplay.style.opacity = '0';
    if (this.orbitContainer) this.orbitContainer.innerHTML = '';
    if (this.chestWrap) this.chestWrap.classList.remove('rumble', 'intense-shake', 'burst');
    if (this.magicCircle) this.magicCircle.classList.remove('summoning', 'climax');
    if (this.flashOverlay) this.flashOverlay.classList.remove('active');
  }
}
