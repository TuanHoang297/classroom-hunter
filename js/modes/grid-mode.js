/**
 * CYBER BATTLE GRID MODE
 * High-voltage lightning hop across student roster cards with deceleration physics.
 */

import { audioSynthesizer } from '../core/audio-synthesizer.js';

export class GridMode {
  constructor(container) {
    this.container = container;
    this.students = [];
    this.cardElements = [];
    this.isRunning = false;
    this.timerId = null;
  }

  setStudents(students) {
    this.students = students;
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.cardElements = [];

    if (this.students.length === 0) {
      this.container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 10px; color: var(--text-muted); font-size: 0.9rem;">
          Chưa có học sinh nào trong danh sách lớp.
        </div>
      `;
      return;
    }

    this.students.forEach((name, idx) => {
      const card = document.createElement('div');
      card.className = 'grid-student-item';
      card.dataset.index = idx;
      card.textContent = name;
      this.container.appendChild(card);
      this.cardElements.push(card);
    });
  }

  startHunt(targetStudent, onComplete) {
    if (this.isRunning || this.students.length === 0) return;
    
    const targetIdx = this.students.indexOf(targetStudent);
    if (targetIdx === -1) {
      if (onComplete) onComplete(targetStudent);
      return;
    }

    this.isRunning = true;
    this.container.classList.add('is-hunting');

    let currentIndex = Math.floor(Math.random() * this.students.length);
    
    let delay = 40;
    const maxDelay = 380;
    const totalSteps = 35 + Math.floor(Math.random() * 15);
    let currentStep = 0;

    const step = () => {
      this.cardElements.forEach(c => c.classList.remove('highlight', 'target-locked', 'glitch-anim'));

      // Nhảy ngẫu nhiên, bước cuối cùng ép vào mục tiêu
      if (currentStep >= totalSteps - 1) {
        currentIndex = targetIdx;
      } else {
        // Nhảy ngẫu nhiên hoàn toàn sang 1 ô khác
        let next = Math.floor(Math.random() * this.students.length);
        if (next === currentIndex) next = (next + 1) % this.students.length;
        currentIndex = next;
      }

      const activeCard = this.cardElements[currentIndex];
      if (activeCard) {
        if (currentStep >= totalSteps - 1) {
          activeCard.classList.add('target-locked');
          // Cuộn màn hình ở bước cuối cùng
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          activeCard.classList.add('highlight');
          // Add random glitch occasionally
          if (Math.random() > 0.6) activeCard.classList.add('glitch-anim');
        }
      }

      audioSynthesizer.playClick();
      currentStep++;

      if (currentStep < totalSteps) {
        const progress = currentStep / totalSteps;
        delay = 40 + Math.pow(progress, 2.5) * (maxDelay - 40);
        this.timerId = setTimeout(step, delay);
      } else {
        this.isRunning = false;
        audioSynthesizer.playTargetLockAlarm();
        setTimeout(() => {
          this.container.classList.remove('is-hunting');
          if (onComplete) onComplete(targetStudent);
        }, 850);
      }
    };

    step();
  }

  stop() {
    this.isRunning = false;
    this.container.classList.remove('is-hunting');
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.cardElements.forEach(c => c.classList.remove('highlight', 'target-locked', 'glitch-anim'));
  }
}
