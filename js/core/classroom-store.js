/**
 * CLASSROOM STORE
 * Centralized State Management for Classroom Hunter AI
 */

class ClassroomStore {
  constructor() {
    this.STORAGE_KEY = 'CLASSROOM_HUNTER_STATE_V1';
    this.listeners = [];

    // Danh sách rỗng mặc định
    this.DEFAULT_ROSTER = [];

    // Initial state
    this.state = {
      students: [],
      calledStudents: [],
      luckyEscapedStudents: [],
      currentSelected: null,
      currentFate: null,
      luckRate: 0.25,
      activeMode: 'radar',
      eliminationMode: true,
      isMuted: false
    };

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.students) && parsed.students.length > 0) {
          this.state.students = parsed.students;
        } else {
          this.state.students = [...this.DEFAULT_ROSTER];
        }
        // Giữ lại calledStudents & luckyEscapedStudents qua reload để tránh gọi lặp
        if (Array.isArray(parsed.calledStudents)) {
          this.state.calledStudents = parsed.calledStudents;
        }
        if (Array.isArray(parsed.luckyEscapedStudents)) {
          this.state.luckyEscapedStudents = parsed.luckyEscapedStudents;
        }
        if (typeof parsed.luckRate === 'number') {
          this.state.luckRate = parsed.luckRate;
        }
        if (parsed.activeMode) {
          this.state.activeMode = parsed.activeMode;
        }
        if (typeof parsed.eliminationMode === 'boolean') {
          this.state.eliminationMode = parsed.eliminationMode;
        }
        if (typeof parsed.isMuted === 'boolean') {
          this.state.isMuted = parsed.isMuted;
        }
      } else {
        // First visit — load default roster
        this.state.students = [...this.DEFAULT_ROSTER];
      }
    } catch (e) {
      console.warn('ClassroomStore: Failed to load from storage', e);
      this.state.students = [...this.DEFAULT_ROSTER];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        students: this.state.students,
        calledStudents: this.state.calledStudents,
        luckyEscapedStudents: this.state.luckyEscapedStudents,
        luckRate: this.state.luckRate,
        activeMode: this.state.activeMode,
        eliminationMode: this.state.eliminationMode,
        isMuted: this.state.isMuted
      }));
    } catch (e) {
      console.warn('ClassroomStore: Failed to save to storage', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.saveToStorage();
    this.listeners.forEach(fn => fn(this.state));
  }

  getState() {
    return { ...this.state };
  }

  getRemainingStudents() {
    if (!this.state.eliminationMode) {
      return [...this.state.students];
    }
    return this.state.students.filter(
      name => !this.state.calledStudents.includes(name) && !this.state.luckyEscapedStudents.includes(name)
    );
  }

  setStudents(namesList) {
    // Deduplicate and filter empty
    const unique = [...new Set(namesList.map(n => n.trim()).filter(Boolean))];
    this.state.students = unique;
    this.state.calledStudents = [];
    this.state.luckyEscapedStudents = [];
    this.notify();
  }

  addStudent(name) {
    const trimmed = name.trim();
    if (trimmed && !this.state.students.includes(trimmed)) {
      this.state.students.push(trimmed);
      this.notify();
    }
  }

  removeStudent(name) {
    this.state.students = this.state.students.filter(n => n !== name);
    this.state.calledStudents = this.state.calledStudents.filter(n => n !== name);
    this.state.luckyEscapedStudents = this.state.luckyEscapedStudents.filter(n => n !== name);
    this.notify();
  }

  markAsCalled(name) {
    if (!this.state.calledStudents.includes(name)) {
      this.state.calledStudents.push(name);
    }
    this.notify();
  }

  markAsLucky(name) {
    if (!this.state.luckyEscapedStudents.includes(name)) {
      this.state.luckyEscapedStudents.push(name);
    }
    this.notify();
  }

  reroll(name) {
    // Remove from called list (put back into pool)
    this.state.calledStudents = this.state.calledStudents.filter(n => n !== name);
    this.notify();
  }

  resetRound() {
    this.state.calledStudents = [];
    this.state.luckyEscapedStudents = [];
    this.notify();
  }

  clearRoster() {
    this.state.students = [];
    this.state.calledStudents = [];
    this.state.luckyEscapedStudents = [];
    this.state.currentSelected = null;
    this.notify();
  }

  setLuckRate(rate) {
    this.state.luckRate = parseFloat(rate);
    this.notify();
  }

  setActiveMode(mode) {
    this.state.activeMode = mode;
    this.notify();
  }

  setEliminationMode(enabled) {
    this.state.eliminationMode = enabled;
    this.notify();
  }

  setMuted(isMuted) {
    this.state.isMuted = isMuted;
    this.notify();
  }
}

export const classroomStore = new ClassroomStore();
