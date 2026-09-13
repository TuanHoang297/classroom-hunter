/**
 * RADAR MODE (Target Lock-On)
 * High-tech satellite radar with sonar sweeps, accelerating heartbeat, and laser reticle lock.
 */

import { audioSynthesizer } from '../core/audio-synthesizer.js';

export class RadarMode {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.container = canvas.parentElement; // .radar-container
    this.radarBeam = this.container.querySelector('.radar-beam');
    this.radarCrosshair = this.container.querySelector('.radar-crosshair');
    this.animationId = null;
    this.isRunning = false;
    this.students = [];
    this.blips = [];
    this.targetStudent = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const availableWidth = rect.width || window.innerWidth * 0.8;
    const size = Math.max(320, Math.min(availableWidth, 540));
    this.canvas.width = size;
    this.canvas.height = size;
    this.center = { x: size / 2, y: size / 2 };
    this.radius = size / 2 - 24;
    this.generateBlips();
    this.startIdleLoop();
  }

  setStudents(students) {
    this.students = students;
    this.generateBlips();
    this.startIdleLoop();
  }

  generateBlips() {
    this.lockedTargetIdx = -1;
    this.blips = this.students.map((name, i) => {
      // Distribute pseudo-randomly within radar circle
      const angle = (i / Math.max(1, this.students.length)) * Math.PI * 2 + Math.random() * 0.2;
      const distance = 0.22 * this.radius + Math.random() * (0.68 * this.radius);
      return {
        name,
        angle,
        distance,
        angleSpeed: (Math.random() * 0.008 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
        distSpeed: (Math.random() * 0.4 - 0.2),
        x: this.center.x + Math.cos(angle) * distance,
        y: this.center.y + Math.sin(angle) * distance,
        size: 6,
        opacity: 0.8,
        alpha: 0.9
      };
    });
  }

  startIdleLoop() {
    if (this.idleAnimationId) cancelAnimationFrame(this.idleAnimationId);
    this.idleLoop = () => {
      if (!this.isRunning && this.blips.length > 0) {
        const lockIdx = this.lockedTargetIdx !== undefined ? this.lockedTargetIdx : -1;
        this.updateBlipPositions(lockIdx);
        this.drawRadarBase();
        this.drawBlips(lockIdx);
      }
      this.idleAnimationId = requestAnimationFrame(this.idleLoop);
    };
    this.idleAnimationId = requestAnimationFrame(this.idleLoop);
  }

  updateBlipPositions(lockedIndex = -1) {
    this.blips.forEach((blip, idx) => {
      if (idx === lockedIndex) return; // Freeze locked target
      
      blip.angle += blip.angleSpeed;
      blip.distance += blip.distSpeed;
      
      // Keep within radar radius
      if (blip.distance > this.radius * 0.95) {
        blip.distSpeed *= -1;
        blip.distance = this.radius * 0.95;
      } else if (blip.distance < this.radius * 0.1) {
        blip.distSpeed *= -1;
        blip.distance = this.radius * 0.1;
      }
      
      blip.x = this.center.x + Math.cos(blip.angle) * blip.distance;
      blip.y = this.center.y + Math.sin(blip.angle) * blip.distance;
    });
  }

  drawRadarBase() {
    const { ctx, center, radius } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Vòng cung lưới đồng tâm (nét đứt)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    [0.25, 0.5, 0.75, 1].forEach(fraction => {
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius * fraction, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Trục tọa độ (Crosshairs)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(center.x - radius, center.y);
    ctx.lineTo(center.x + radius, center.y);
    ctx.moveTo(center.x, center.y - radius);
    ctx.lineTo(center.x, center.y + radius);
    ctx.stroke();

    // Tâm radar
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBlips(highlightIndex = -1) {
    const { ctx } = this;
    this.blips.forEach((blip, idx) => {
      const isTarget = idx === highlightIndex;
      ctx.save();
      ctx.fillStyle = isTarget ? '#ef4444' : '#fbbf24';
      ctx.shadowColor = isTarget ? 'rgba(239, 68, 68, 0.95)' : 'rgba(245, 158, 11, 0.7)';
      ctx.shadowBlur = isTarget ? 20 : 8;

      ctx.beginPath();
      ctx.arc(blip.x, blip.y, isTarget ? 10 : 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw short label
      ctx.fillStyle = isTarget ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
      ctx.font = isTarget ? 'bold 14px "Plus Jakarta Sans"' : '600 12px "Plus Jakarta Sans"';
      ctx.textAlign = 'center';
      const displayName = blip.name.length > 10 ? blip.name.slice(0, 9) + '…' : blip.name;
      ctx.fillText(displayName, blip.x, blip.y - 12);

      ctx.restore();
    });
  }

  startHunt(targetStudent, onComplete) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lockedTargetIdx = -1;
    this.targetStudent = targetStudent;

    if (this.radarBeam) this.radarBeam.classList.add('sweeping');
    if (this.radarCrosshair) this.radarCrosshair.classList.remove('active');
    if (this.container) this.container.classList.remove('target-locked');

    const targetIdx = this.students.indexOf(targetStudent);
    const startTime = performance.now();
    const huntDuration = 3800; // 3.8 seconds
    let lastHeartbeatTime = 0;
    let heartbeatInterval = 650;
    let crosshairLocked = false;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / huntDuration);

      if (currentTime - lastHeartbeatTime > heartbeatInterval) {
        audioSynthesizer.playHeartbeat(55 + progress * 20);
        lastHeartbeatTime = currentTime;
        heartbeatInterval = Math.max(160, 650 * (1 - progress * 0.75));
      }

      if (Math.random() < 0.03) {
        audioSynthesizer.playSonarPing();
      }

      const lockIdx = crosshairLocked ? targetIdx : -1;
      this.updateBlipPositions(lockIdx);
      this.drawRadarBase();

      // Cycle blip highlights rapidly
      const cycleIndex = progress < 0.85 
        ? Math.floor(Math.random() * this.blips.length) 
        : targetIdx;
      this.drawBlips(cycleIndex);

      // Lock on CSS crosshair when nearing end
      if (progress > 0.85 && targetIdx !== -1 && !crosshairLocked) {
        crosshairLocked = true;
        const targetBlip = this.blips[targetIdx];
        if (targetBlip && this.radarCrosshair) {
          const leftPct = (targetBlip.x / this.canvas.width) * 100;
          const topPct = (targetBlip.y / this.canvas.height) * 100;
          this.radarCrosshair.style.left = `${leftPct}%`;
          this.radarCrosshair.style.top = `${topPct}%`;
          this.radarCrosshair.classList.add('active');
          
          if (this.container) this.container.classList.add('target-locked');
          if (this.radarBeam) this.radarBeam.classList.remove('sweeping');
          
          audioSynthesizer.playTargetLockAlarm();
        }
      }

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.lockedTargetIdx = targetIdx;
        this.isRunning = false;
        // Chờ 800ms để quan sát mục tiêu bị khóa
        setTimeout(() => {
          if (onComplete) onComplete(targetStudent);
        }, 800);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stop() {
    this.isRunning = false;
    this.lockedTargetIdx = -1;
    if (this.radarBeam) this.radarBeam.classList.remove('sweeping');
    if (this.radarCrosshair) this.radarCrosshair.classList.remove('active');
    if (this.container) this.container.classList.remove('target-locked');
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.startIdleLoop();
  }
}
