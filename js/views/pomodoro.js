class PomodoroView {
    constructor(store) {
        this.store = store;
        this.timer = null;
        this.timeLeft = 25 * 60;
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.mode = 'focus';
        this.customDurations = {
            focus: 25,
            short: 5,
            long: 15
        };
    }

    async render() {
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        const sessions = this.store.getSessions();
        const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

        return `
            <div class="pomodoro-container fade-in">
                <div class="timer-wrapper ${this.mode}">
                    <div class="timer-header">
                        <div class="mode-selector">
                            <button class="mode-pill ${this.mode === 'focus' ? 'active' : ''}" data-mode="focus">
                                Focus (${this.customDurations.focus}m)
                            </button>
                            <button class="mode-pill ${this.mode === 'short' ? 'active' : ''}" data-mode="short">
                                Short (${this.customDurations.short}m)
                            </button>
                            <button class="mode-pill ${this.mode === 'long' ? 'active' : ''}" data-mode="long">
                                Long (${this.customDurations.long}m)
                            </button>
                        </div>
                    </div>

                    <div class="timer-circle-container">
                        <div class="timer-circle" style="background: conic-gradient(var(--primary) ${progress}%, transparent 0);">
                            <div class="timer-inner">
                                <span class="timer-time">${this.formatTime(this.timeLeft)}</span>
                                <span class="timer-status">${this.isRunning ? (this.mode === 'focus' ? 'Focusing...' : 'Relaxing...') : 'Paused'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="timer-controls-premium">
                        <button class="btn-control main ${this.isRunning ? 'pause' : 'start'}" id="toggle-timer">
                            ${this.isRunning ? '⏸ Pause' : '▶ Start'}
                        </button>
                        <button class="btn-control reset" id="reset-timer">
                            ↺ Reset
                        </button>
                        <button class="btn-control settings" id="settings-timer">
                            ⚙️
                        </button>
                    </div>
                </div>

                <div class="pomodoro-stats">
                    <div class="stat-box">
                        <span class="stat-val">${sessions.length}</span>
                        <span class="stat-label">Sessions</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-val">${Math.round(totalMinutes / 60)}h</span>
                        <span class="stat-label">Total Focus</span>
                    </div>
                </div>

                <!-- Settings Modal -->
                <div id="timer-settings-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>Timer Settings</h3>
                        <div class="form-group">
                            <label>Focus Duration (minutes)</label>
                            <input type="number" id="focus-duration" value="${this.customDurations.focus}" min="1" max="120">
                        </div>
                        <div class="form-group">
                            <label>Short Break (minutes)</label>
                            <input type="number" id="short-duration" value="${this.customDurations.short}" min="1" max="30">
                        </div>
                        <div class="form-group">
                            <label>Long Break (minutes)</label>
                            <input type="number" id="long-duration" value="${this.customDurations.long}" min="1" max="60">
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" id="cancel-settings">Cancel</button>
                            <button class="btn btn-primary" id="save-settings">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    async afterRender() {
        const toggleBtn = document.getElementById('toggle-timer');
        const resetBtn = document.getElementById('reset-timer');
        const settingsBtn = document.getElementById('settings-timer');
        const modeBtns = document.querySelectorAll('.mode-pill');
        const display = document.querySelector('.timer-time');
        const circle = document.querySelector('.timer-circle');
        const status = document.querySelector('.timer-status');

        const updateUI = () => {
            display.textContent = this.formatTime(this.timeLeft);
            const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
            circle.style.background = `conic-gradient(var(--primary) ${progress}%, transparent 0)`;
            status.textContent = this.isRunning ? (this.mode === 'focus' ? 'Focusing...' : 'Relaxing...') : 'Paused';
        };

        toggleBtn?.addEventListener('click', () => {
            if (this.isRunning) {
                this.pauseTimer();
            } else {
                this.startTimer(updateUI);
            }
            this.render().then(html => {
                document.getElementById('app-view').innerHTML = html;
                this.afterRender();
            });
        });

        resetBtn?.addEventListener('click', () => {
            this.pauseTimer();
            this.resetTimer();
            this.render().then(html => {
                document.getElementById('app-view').innerHTML = html;
                this.afterRender();
            });
        });

        settingsBtn?.addEventListener('click', () => {
            document.getElementById('timer-settings-modal').classList.remove('hidden');
        });

        document.getElementById('cancel-settings')?.addEventListener('click', () => {
            document.getElementById('timer-settings-modal').classList.add('hidden');
        });

        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.customDurations.focus = parseInt(document.getElementById('focus-duration').value);
            this.customDurations.short = parseInt(document.getElementById('short-duration').value);
            this.customDurations.long = parseInt(document.getElementById('long-duration').value);

            this.pauseTimer();
            this.resetTimer();

            document.getElementById('timer-settings-modal').classList.add('hidden');
            this.render().then(html => {
                document.getElementById('app-view').innerHTML = html;
                this.afterRender();
            });
        });

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.pauseTimer();
                this.mode = btn.dataset.mode;
                this.resetTimer();

                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            });
        });
    }

    startTimer(updateCallback) {
        if (this.isRunning) return;
        this.isRunning = true;

        this.timer = setInterval(() => {
            this.timeLeft--;
            updateCallback();

            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timer);
    }

    resetTimer() {
        if (this.mode === 'focus') this.totalTime = this.customDurations.focus * 60;
        else if (this.mode === 'short') this.totalTime = this.customDurations.short * 60;
        else if (this.mode === 'long') this.totalTime = this.customDurations.long * 60;
        this.timeLeft = this.totalTime;
    }

    completeSession() {
        this.pauseTimer();
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play();

        if (this.mode === 'focus') {
            this.store.logSession(this.totalTime / 60);
            alert('Focus Session Complete! Take a break.');
        } else {
            alert('Break over! Time to focus.');
        }

        this.resetTimer();
        this.render().then(html => {
            document.getElementById('app-view').innerHTML = html;
            this.afterRender();
        });
    }
}
