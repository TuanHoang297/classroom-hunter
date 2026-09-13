/**
 * APP CONTROLLER
 * Classroom Hunter - Main Application Driver
 * High-Impact Game Show Edition
 */

import { classroomStore } from './core/classroom-store.js';
import { audioSynthesizer } from './core/audio-synthesizer.js';
import { celebrationEngine } from './core/celebration.js';
import { LuckEngine } from './luck-engine.js';
import { RadarMode } from './modes/radar-mode.js';
import { GridMode } from './modes/grid-mode.js';
import { GachaMode } from './modes/gacha-mode.js';

class App {
  constructor() {
    this.radarMode = null;
    this.gridMode = null;
    this.gachaMode = null;
    this.isHunting = false;
    this.isDrawerOpen = false;

    this.currentCandidate = null;
    this.currentFate = null;

    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.initEngines();
    this.bindEvents();
    this.renderRoster();
    this.updateStats();

    // Initial audio mute state
    audioSynthesizer.setMuted(classroomStore.getState().isMuted);
    this.updateAudioButtonState();
  }

  cacheDom() {
    this.dom = {
      // Audio & System
      btnToggleSound: document.getElementById('btnToggleSound'),
      soundIconOn: document.getElementById('soundIconOn'),
      soundIconOff: document.getElementById('soundIconOff'),
      btnFullscreen: document.getElementById('btnFullscreen'),
      btnClearRoster: document.getElementById('btnClearRoster'),

      // Bottom Bar & Drawer
      btnToggleDrawer: document.getElementById('btnToggleDrawer'),
      drawerArrow: document.getElementById('drawerArrow'),
      rosterDrawer: document.getElementById('rosterDrawer'),
      btnOpenBulkModal: document.getElementById('btnOpenBulkModal'),
      badgeRemainingCount: document.getElementById('badgeRemainingCount'),

      // Stats
      statRemaining: document.getElementById('statRemaining'),
      statCalled: document.getElementById('statCalled'),
      statLucky: document.getElementById('statLucky'),

      // Settings
      luckRateSelect: document.getElementById('luckRateSelect'),
      eliminationToggle: document.getElementById('eliminationToggle'),
      btnToggleSettings: document.getElementById('btnToggleSettings'),
      settingsDropdown: document.getElementById('settingsDropdown'),

      // Quick Add & Chips
      quickAddInput: document.getElementById('quickAddInput'),
      btnQuickAdd: document.getElementById('btnQuickAdd'),
      studentsChipContainer: document.getElementById('studentsChipContainer'),

      // Stage & Action
      modeTabBtns: document.querySelectorAll('.mode-tab-btn'),
      radarView: document.getElementById('radarView'),
      gridView: document.getElementById('gridView'),
      gachaView: document.getElementById('gachaView'),
      radarCanvas: document.getElementById('radarCanvas'),
      gridContainer: document.getElementById('gridContainer'),
      gachaContainer: document.getElementById('gachaContainer'),
      btnLaunchHunt: document.getElementById('btnLaunchHunt'),

      // Fate Reveal Modal
      fateModal: document.getElementById('fateModal'),
      fateCard: document.getElementById('fateCard'),
      fateFrontTargetName: document.getElementById('fateFrontTargetName'),
      fateBackFace: document.getElementById('fateBackFace'),
      fateBackTargetName: document.getElementById('fateBackTargetName'),
      fateBackStatusHeader: document.getElementById('fateBackStatusHeader'),
      fateBadgeTitle: document.getElementById('fateBadgeTitle'),
      fateQuote: document.getElementById('fateQuote'),
      btnConfirmCalled: document.getElementById('btnConfirmCalled'),
      btnRerollStudent: document.getElementById('btnRerollStudent'),
      btnHuntNextImmediately: document.getElementById('btnHuntNextImmediately'),

      // Bulk Modal
      bulkModal: document.getElementById('bulkModal'),
      bulkTextarea: document.getElementById('bulkTextarea'),
      bulkLineCount: document.getElementById('bulkLineCount'),
      btnSaveBulk: document.getElementById('btnSaveBulk'),
      btnCloseBulkModal: document.getElementById('btnCloseBulkModal'),

      // Toast Notification
      toastContainer: document.getElementById('toastContainer')
    };
  }

  initEngines() {
    celebrationEngine.init();

    if (this.dom.radarCanvas) {
      this.radarMode = new RadarMode(this.dom.radarCanvas);
    }
    if (this.dom.gridContainer) {
      this.gridMode = new GridMode(this.dom.gridContainer);
    }
    if (this.dom.gachaContainer) {
      this.gachaMode = new GachaMode(this.dom.gachaContainer);
    }

    // Subscribe to store updates
    classroomStore.subscribe(state => {
      this.renderRoster();
      this.updateStats();
      this.updateActiveModeData();
      if (this.dom.luckRateSelect) {
        this.dom.luckRateSelect.value = state.luckRate.toString();
      }
      if (this.dom.eliminationToggle) {
        this.dom.eliminationToggle.checked = state.eliminationMode;
      }
    });

    // Set initial mode data
    this.updateActiveModeData();
  }

  bindEvents() {
    // Sound toggle
    this.dom.btnToggleSound?.addEventListener('click', () => {
      const isMuted = audioSynthesizer.toggleMute();
      classroomStore.setMuted(isMuted);
      this.updateAudioButtonState();
      this.showToast(isMuted ? '🔇 Đã tắt âm thanh' : '🔊 Đã bật âm thanh');
    });

    // Fullscreen toggle
    this.dom.btnFullscreen?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Clear / Reset Roster button
    this.dom.btnClearRoster?.addEventListener('click', () => {
      const confirmed = window.confirm(
        'Bạn có chắc muốn XÓA TOÀN BỘ danh sách lớp hiện tại để nhập lớp mới không?'
      );
      if (confirmed) {
        classroomStore.clearRoster();
        this.showToast('🗑️ Đã xóa danh sách lớp! Hãy bấm "Nhập / Sửa Danh Sách" để thêm lớp mới.');
        this.openBulkModal();
      }
    });

    // Drawer Toggle (View student list)
    this.dom.btnToggleDrawer?.addEventListener('click', () => {
      this.isDrawerOpen = !this.isDrawerOpen;
      if (this.dom.rosterDrawer) {
        this.dom.rosterDrawer.classList.toggle('open', this.isDrawerOpen);
      }
      if (this.dom.drawerArrow) {
        this.dom.drawerArrow.textContent = this.isDrawerOpen ? '▲' : '▼';
      }
    });

    // Bulk Modal events
    this.dom.btnOpenBulkModal?.addEventListener('click', () => {
      this.openBulkModal();
    });

    this.dom.btnCloseBulkModal?.addEventListener('click', () => {
      this.closeBulkModal();
    });

    this.dom.bulkTextarea?.addEventListener('input', () => {
      this.updateBulkLineCount();
    });

    this.dom.btnSaveBulk?.addEventListener('click', () => {
      const text = this.dom.bulkTextarea.value || '';
      const names = text
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);

      if (names.length === 0) {
        alert('Vui lòng nhập ít nhất 1 tên học sinh!');
        return;
      }

      classroomStore.setStudents(names);
      this.closeBulkModal();
      this.showToast(`✨ Đã lưu thành công ${names.length} bạn vào danh sách quay!`);
    });

    // Quick Add student
    this.dom.btnQuickAdd?.addEventListener('click', () => this.handleQuickAdd());
    this.dom.quickAddInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.handleQuickAdd();
    });

    // Settings
    this.dom.luckRateSelect?.addEventListener('change', e => {
      classroomStore.setLuckRate(parseFloat(e.target.value));
      const percent = Math.round(parseFloat(e.target.value) * 100);
      this.showToast(`🛡️ Đã chỉnh tỷ lệ God Save: ${percent}%`);
    });

    this.dom.eliminationToggle?.addEventListener('change', e => {
      classroomStore.setEliminationMode(e.target.checked);
      this.showToast(
        e.target.checked
          ? '🚫 Đã bật chế độ: Không gọi lặp lại'
          : '🔄 Đã bật chế độ: Có thể gọi lặp lại'
      );
    });

    // Settings Dropdown Toggle
    this.dom.btnToggleSettings?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = this.dom.settingsDropdown.style.display === 'block';
      this.dom.settingsDropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Close settings dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (this.dom.settingsDropdown && this.dom.settingsDropdown.style.display === 'block') {
        if (!this.dom.settingsDropdown.contains(e.target) && e.target !== this.dom.btnToggleSettings) {
          this.dom.settingsDropdown.style.display = 'none';
        }
      }
    });

    // Mode Switch Tabs
    this.dom.modeTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.switchMode(mode);
      });
    });

    // Space key to launch hunt
    window.addEventListener('keydown', e => {
      if (e.code === 'Space') {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;
        if (this.dom.fateModal?.classList.contains('active')) return;
        if (this.dom.bulkModal?.classList.contains('active')) return;

        e.preventDefault();
        this.startHunt();
      }
    });

    // Launch Hunt button
    this.dom.btnLaunchHunt?.addEventListener('click', () => {
      this.startHunt();
    });

    // Fate Modal Buttons
    this.dom.btnConfirmCalled?.addEventListener('click', () => {
      if (this.currentCandidate) {
        classroomStore.markAsCalled(this.currentCandidate);
      }
      this.closeFateModal();

      // Check if all students have been called
      const remaining = classroomStore.getRemainingStudents();
      if (remaining.length === 0 && classroomStore.getState().students.length > 0) {
        celebrationEngine.triggerEpicVictory();
        this.showToast('🎉 XUẤT SẮC! Cả lớp đều đã hoàn thành lên bảng giải bài!', 5000);
      }
    });

    this.dom.btnRerollStudent?.addEventListener('click', () => {
      if (this.currentCandidate) {
        // Xóa hoàn toàn khỏi danh sách nếu vắng mặt
        classroomStore.removeStudent(this.currentCandidate);
        this.showToast(`🗑️ Đã xóa "${this.currentCandidate}" khỏi danh sách lớp`);
      }
      this.closeFateModal();
    });

    this.dom.btnHuntNextImmediately?.addEventListener('click', () => {
      this.closeFateModal();
      setTimeout(() => {
        this.startHunt();
      }, 300);
    });
  }

  handleQuickAdd() {
    const val = this.dom.quickAddInput?.value?.trim();
    if (val) {
      classroomStore.addStudent(val);
      this.dom.quickAddInput.value = '';
      this.showToast(`➕ Đã thêm bạn: ${val}`);
    }
  }

  openBulkModal() {
    const current = classroomStore.getState().students;
    if (this.dom.bulkTextarea) {
      this.dom.bulkTextarea.value = current.join('\n');
    }
    this.updateBulkLineCount();
    this.dom.bulkModal?.classList.add('active');
    setTimeout(() => this.dom.bulkTextarea?.focus(), 150);
  }

  closeBulkModal() {
    this.dom.bulkModal?.classList.remove('active');
  }

  updateBulkLineCount() {
    const text = this.dom.bulkTextarea?.value || '';
    const count = text.split('\n').map(l => l.trim()).filter(Boolean).length;
    if (this.dom.bulkLineCount) {
      this.dom.bulkLineCount.textContent = count;
    }
  }

  switchMode(mode) {
    classroomStore.setActiveMode(mode);

    this.dom.modeTabBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    if (this.dom.radarView) this.dom.radarView.style.display = mode === 'radar' ? 'block' : 'none';
    if (this.dom.gridView) this.dom.gridView.style.display = mode === 'grid' ? 'block' : 'none';
    if (this.dom.gachaView) this.dom.gachaView.style.display = mode === 'gacha' ? 'block' : 'none';

    this.updateActiveModeData();
  }

  updateActiveModeData() {
    const pool = classroomStore.getRemainingStudents();
    const activeMode = classroomStore.getState().activeMode;

    if (activeMode === 'radar' && this.radarMode) {
      this.radarMode.resize();
      this.radarMode.setStudents(pool);
    } else if (activeMode === 'grid' && this.gridMode) {
      this.gridMode.setStudents(pool);
    } else if (activeMode === 'gacha' && this.gachaMode) {
      this.gachaMode.setStudents(pool);
    }
  }

  startHunt() {
    if (this.isHunting) return;

    const remaining = classroomStore.getRemainingStudents();
    const total = classroomStore.getState().students.length;

    if (total === 0) {
      this.showToast('⚠️ Danh sách lớp hiện đang trống! Hãy bấm "Nhập / Sửa Danh Sách".');
      this.openBulkModal();
      return;
    }

    if (remaining.length === 0) {
      classroomStore.resetRound();
      this.showToast('🔄 Tất cả bạn học sinh đều đã được gọi! Tự động bắt đầu vòng mới.');
      return;
    }

    this.isHunting = true;
    if (this.dom.btnLaunchHunt) {
      this.dom.btnLaunchHunt.disabled = true;
    }

    // Pick candidate randomly
    const targetStudent = remaining[Math.floor(Math.random() * remaining.length)];
    this.currentCandidate = targetStudent;

    // Evaluate luck outcome
    const fate = LuckEngine.evaluate(classroomStore.getState().luckRate);
    this.currentFate = fate;

    const activeMode = classroomStore.getState().activeMode;

    const onHuntFinished = (chosenStudent) => {
      this.isHunting = false;
      if (this.dom.btnLaunchHunt) {
        this.dom.btnLaunchHunt.disabled = false;
      }
      this.revealFateModal(chosenStudent, this.currentFate);
    };

    if (activeMode === 'radar' && this.radarMode) {
      this.radarMode.startHunt(targetStudent, onHuntFinished);
    } else if (activeMode === 'grid' && this.gridMode) {
      this.gridMode.startHunt(targetStudent, onHuntFinished);
    } else if (activeMode === 'gacha' && this.gachaMode) {
      this.gachaMode.startHunt(targetStudent, onHuntFinished);
    } else {
      onHuntFinished(targetStudent);
    }
  }

  revealFateModal(student, fate) {
    if (!this.dom.fateModal) return;

    // Reset card state to front face
    this.dom.fateCard?.classList.remove('flipped');
    this.dom.fateBackFace?.classList.remove('fate-must-answer', 'fate-lucky-escape');

    if (this.dom.fateFrontTargetName) {
      this.dom.fateFrontTargetName.textContent = student;
    }
    if (this.dom.fateBackTargetName) {
      this.dom.fateBackTargetName.textContent = student;
    }

    // Configure Back Face based on fate
    if (fate.isLucky) {
      this.dom.fateBackFace?.classList.add('fate-lucky-escape');
      if (this.dom.fateBackStatusHeader) this.dom.fateBackStatusHeader.textContent = '🛡️ VẬN MAY THẦN KỲ 🛡️';
      if (this.dom.fateBadgeTitle) {
        this.dom.fateBadgeTitle.textContent = 'GOD SAVE — ĐƯỢC MIỄN!';
        this.dom.fateBadgeTitle.className = 'fate-stamp stamp-lucky-escape';
      }
      if (this.dom.fateQuote) this.dom.fateQuote.textContent = `"${fate.quote}"`;

      // Actions: show Next Immediately, hide Confirm
      if (this.dom.btnHuntNextImmediately) this.dom.btnHuntNextImmediately.style.display = 'inline-flex';
      if (this.dom.btnConfirmCalled) this.dom.btnConfirmCalled.style.display = 'none';
      if (this.dom.btnRerollStudent) this.dom.btnRerollStudent.style.display = 'none';

      classroomStore.markAsLucky(student);
    } else {
      this.dom.fateBackFace?.classList.add('fate-must-answer');
      if (this.dom.fateBackStatusHeader) this.dom.fateBackStatusHeader.textContent = '🎯 MỤC TIÊU PHẢI TRẢ LỜI 🎯';
      if (this.dom.fateBadgeTitle) {
        this.dom.fateBadgeTitle.textContent = 'MỜI LÊN BẢNG LÀM BÀI!';
        this.dom.fateBadgeTitle.className = 'fate-stamp stamp-must-answer';
      }
      if (this.dom.fateQuote) this.dom.fateQuote.textContent = `"${fate.quote}"`;

      // Actions: show Confirm & Reroll, hide Next Immediately
      if (this.dom.btnHuntNextImmediately) this.dom.btnHuntNextImmediately.style.display = 'none';
      if (this.dom.btnConfirmCalled) this.dom.btnConfirmCalled.style.display = 'inline-flex';
      if (this.dom.btnRerollStudent) this.dom.btnRerollStudent.style.display = 'inline-flex';
    }

    // Show modal
    this.dom.fateModal.classList.add('active');

    // Flip card with dramatic suspense after 800ms
    setTimeout(() => {
      this.dom.fateCard?.classList.add('flipped');

      if (fate.isLucky) {
        audioSynthesizer.playLuckyFanfare();
        celebrationEngine.triggerLuckyBurst();
      } else {
        audioSynthesizer.playTargetLockAlarm();
        celebrationEngine.triggerEpicVictory(); // Bắn pháo hoa cho cả trường hợp bình thường
      }
    }, 850);
  }

  closeFateModal() {
    this.dom.fateModal?.classList.remove('active');
    setTimeout(() => {
      this.dom.fateCard?.classList.remove('flipped');
    }, 300);
  }

  renderRoster() {
    if (!this.dom.studentsChipContainer) return;

    const { students, calledStudents, luckyEscapedStudents } = classroomStore.getState();
    this.dom.studentsChipContainer.innerHTML = '';

    if (students.length === 0) {
      this.dom.studentsChipContainer.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.88rem; padding: 12px 6px;">
          Chưa có học sinh nào. Hãy bấm "Nhập / Sửa Danh Sách" để thêm lớp.
        </div>
      `;
      return;
    }

    students.forEach(name => {
      const chip = document.createElement('div');
      chip.className = 'student-chip';

      const isCalled = calledStudents.includes(name);
      const isLucky = luckyEscapedStudents.includes(name);

      if (isCalled) chip.classList.add('chip-called');
      if (isLucky) chip.classList.add('chip-lucky');

      chip.innerHTML = `
        <span>${isLucky ? '🛡️ ' : isCalled ? '✅ ' : ''}${name}</span>
        <button class="chip-remove-btn" title="Xóa bạn này khỏi danh sách">&times;</button>
      `;

      chip.querySelector('.chip-remove-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        classroomStore.removeStudent(name);
      });

      this.dom.studentsChipContainer.appendChild(chip);
    });
  }

  updateStats() {
    const { students, calledStudents, luckyEscapedStudents } = classroomStore.getState();
    const remaining = classroomStore.getRemainingStudents();

    if (this.dom.statRemaining) this.dom.statRemaining.textContent = remaining.length;
    if (this.dom.statCalled) this.dom.statCalled.textContent = calledStudents.length;
    if (this.dom.statLucky) this.dom.statLucky.textContent = luckyEscapedStudents.length;
    if (this.dom.badgeRemainingCount) this.dom.badgeRemainingCount.textContent = `${students.length} bạn`;
  }

  updateAudioButtonState() {
    const isMuted = audioSynthesizer.isMuted;
    if (this.dom.soundIconOn) this.dom.soundIconOn.style.display = isMuted ? 'none' : 'block';
    if (this.dom.soundIconOff) this.dom.soundIconOff.style.display = isMuted ? 'block' : 'none';
  }

  showToast(message, duration = 3200) {
    if (!this.dom.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.textContent = message;

    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Instantiate and launch
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
