class CountdownsView {
    constructor(store) {
        this.store = store;
    }

    async render() {
        const countdowns = this.store.getCountdowns();
        const now = new Date();

        return `
            <div class="countdowns-container fade-in">
                <div class="header-actions">
                    <div>
                        <h2>Countdown Timers</h2>
                        <p class="text-muted">Track important dates for exams, tests, and events.</p>
                    </div>
                    <button class="btn btn-primary" id="add-countdown-btn">
                        <span class="icon">+</span> New Countdown
                    </button>
                </div>

                <div class="grid-2">
                    ${countdowns.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon">⏰</div>
                            <h3>No Countdowns Yet</h3>
                            <p>Add a countdown to track your important dates.</p>
                        </div>
                    ` : ''}
                    ${countdowns.map(countdown => {
            const targetDate = new Date(countdown.date);
            const timeRemaining = this.calculateTimeRemaining(now, targetDate);
            const isPast = targetDate < now;

            return `
                            <div class="countdown-card ${isPast ? 'past' : ''}">
                                <div class="countdown-header">
                                    <div>
                                        <h3>${countdown.title}</h3>
                                        <span class="countdown-type ${countdown.type}">${countdown.type}</span>
                                    </div>
                                    <button class="btn-icon-sm delete-countdown-btn" data-id="${countdown.id}" title="Delete">🗑️</button>
                                </div>
                                <p class="text-muted">${new Date(countdown.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                ${isPast ? `
                                    <div class="countdown-past">
                                        <p>This event has passed</p>
                                    </div>
                                ` : `
                                    <div class="countdown-time">
                                        <div class="time-unit">
                                            <span class="time-value">${timeRemaining.days}</span>
                                            <span class="time-label">Days</span>
                                        </div>
                                        <div class="time-unit">
                                            <span class="time-value">${timeRemaining.hours}</span>
                                            <span class="time-label">Hours</span>
                                        </div>
                                        <div class="time-unit">
                                            <span class="time-value">${timeRemaining.minutes}</span>
                                            <span class="time-label">Minutes</span>
                                        </div>
                                    </div>
                                `}
                            </div>
                        `;
        }).join('')}
                </div>

                <!-- Add Countdown Modal -->
                <div id="countdown-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>Create Countdown</h3>
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="countdown-title" placeholder="e.g. Biology Final Exam">
                        </div>
                        <div class="form-group">
                            <label>Type</label>
                            <select id="countdown-type">
                                <option value="exam">Exam</option>
                                <option value="test">Test</option>
                                <option value="event">Event</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Date & Time</label>
                            <input type="datetime-local" id="countdown-date">
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" id="cancel-countdown">Cancel</button>
                            <button class="btn btn-primary" id="save-countdown">Create</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateTimeRemaining(now, target) {
        const diff = target - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes };
    }

    async afterRender() {
        const modal = document.getElementById('countdown-modal');

        document.getElementById('add-countdown-btn')?.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        document.getElementById('cancel-countdown')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        document.getElementById('save-countdown')?.addEventListener('click', () => {
            const title = document.getElementById('countdown-title').value;
            const type = document.getElementById('countdown-type').value;
            const date = document.getElementById('countdown-date').value;

            if (title && date) {
                this.store.addCountdown({
                    id: Date.now().toString(),
                    title,
                    type,
                    date: new Date(date).toISOString()
                });

                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            }
        });

        document.querySelectorAll('.delete-countdown-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Delete this countdown?')) {
                    this.store.deleteCountdown(btn.dataset.id);
                    this.render().then(html => {
                        document.getElementById('app-view').innerHTML = html;
                        this.afterRender();
                    });
                }
            });
        });
    }
}
