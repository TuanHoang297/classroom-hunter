/**
 * CYBER BATTLE GRID MODE
 * High-voltage lightning hop across student roster cards with deceleration physics.
 */

import { audioSynthesizer } from '../core/audio-synthesizer.js';
import { cryptoShuffle, cryptoRandomInt } from '../utils/random.js';

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

    // Tạo chuỗi nhảy ngẫu nhiên thực sự bằng Fisher-Yates shuffle theo chu kỳ
    const n = this.students.length;
    const totalSteps = Math.max(n * 2, 35) + cryptoRandomInt(15);
    
    // Xây dựng sequence: shuffle nhiều vòng rồi kết thúc bằng targetIdx
    const buildSequence = () => {
      const seq = [];
      const rounds = Math.ceil(totalSteps / n) + 1;
      for (let r = 0; r < rounds; r++) {
        const arr = Array.from({ length: n }, (_, i) => i);
        // Dùng cryptoShuffle — Fisher-Yates với crypto entropy
        cryptoShuffle(arr);
        seq.push(...arr);
      }
      return seq;
    };

    const sequence = buildSequence();
    // Đảm bảo bước cuối là target
    sequence[totalSteps - 1] = targetIdx;

    let currentIndex = sequence[0];
    let delay = 40;
    const maxDelay = 380;
    let currentStep = 0;

    const step = () => {
      this.cardElements.forEach(c => c.classList.remove('highlight', 'target-locked', 'glitch-anim'));

      // Lấy index từ sequence đã shuffle sẵn
      currentIndex = sequence[Math.min(currentStep, totalSteps - 1)];

      const activeCard = this.cardElements[currentIndex];
      if (activeCard) {
        if (currentStep >= totalSteps - 1) {
          activeCard.classList.add('target-locked');
          // Cuộn màn hình ở bước cuối cùng
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          activeCard.classList.add('highlight');
          // Add random glitch occasionally
          if (cryptoRandomInt(10) > 6) activeCard.classList.add('glitch-anim');
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
