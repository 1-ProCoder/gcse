class DashboardView {
    constructor(store) {
        this.store = store;
    }

    async render() {
        const user = this.store.getUser();
        const subjects = this.store.getSubjects();

        // Calculate task stats
        let totalTasks = 0;
        let completedTasks = 0;
        subjects.forEach(sub => {
            if (sub.topics) {
                sub.topics.forEach(topic => {
                    totalTasks++;
                    if (topic.completed) completedTasks++;
                });
            }
        });

        // Calculate study time
        const sessions = this.store.getSessions();
        const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        // Get upcoming countdowns
        const countdowns = this.store.getCountdowns();
        const now = new Date();
        const upcomingCountdowns = countdowns.filter(c => new Date(c.date) > now).slice(0, 3);

        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        const quote = Utils.getRandomQuote();

        return `
            <div class="dashboard-grid">
                <!-- Welcome & Progress Section -->
                <div class="card welcome-card">
                    <div class="welcome-text">
                        <h3>Welcome back, ${user.name}! 👋</h3>
                        <p class="quote">"${quote}"</p>
                    </div>
                    <div class="progress-container">
                        <div class="progress-info">
                            <span>Daily Progress</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${progress}%"></div>
                        </div>
                        <p class="task-stat">${completedTasks} of ${totalTasks} tasks completed</p>
                    </div>
                </div>

                <!-- Stats Row -->
                <div class="stats-row">
                    <div class="card stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-info">
                            <h4>${totalHours}h ${remainingMinutes}m</h4>
                            <p>Total Study Time</p>
                        </div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-info">
                            <h4>${user.streak} Days</h4>
                            <p>Study Streak</p>
                        </div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-icon">📚</div>
                        <div class="stat-info">
                            <h4>${subjects.length}</h4>
                            <p>Active Subjects</p>
                        </div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-info">
                            <h4>${completedTasks}</h4>
                            <p>Topics Done</p>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Countdowns -->
                ${upcomingCountdowns.length > 0 ? `
                    <div class="card">
                        <h3 style="margin-bottom: 1rem;">⏰ Upcoming Events</h3>
                        <div class="grid-3">
                            ${upcomingCountdowns.map(countdown => {
            const targetDate = new Date(countdown.date);
            const timeRemaining = this.calculateTimeRemaining(now, targetDate);

            return `
                                    <div class="countdown-card">
                                        <div class="countdown-header">
                                            <div>
                                                <h4 style="margin-bottom: 0.25rem;">${countdown.title}</h4>
                                                <span class="countdown-type ${countdown.type}">${countdown.type}</span>
                                            </div>
                                        </div>
                                        <div class="countdown-time" style="margin-top: 0.75rem;">
                                            <div class="time-unit">
                                                <span class="time-value">${timeRemaining.days}</span>
                                                <span class="time-label">Days</span>
                                            </div>
                                            <div class="time-unit">
                                                <span class="time-value">${timeRemaining.hours}</span>
                                                <span class="time-label">Hrs</span>
                                            </div>
                                            <div class="time-unit">
                                                <span class="time-value">${timeRemaining.minutes}</span>
                                                <span class="time-label">Min</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Calendar Widget -->
                <div class="card calendar-card">
                    <div class="calendar-header">
                        <h3 id="cal-month-year">Month Year</h3>
                        <div class="cal-nav">
                            <button class="btn-icon" id="prev-month">←</button>
                            <button class="btn-icon" id="next-month">→</button>
                        </div>
                    </div>
                    <div class="calendar-grid" id="calendar-grid">
                        <!-- Days injected by JS -->
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        this.initCalendar();
    }

    calculateTimeRemaining(now, target) {
        const diff = target - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes };
    }

    initCalendar() {
        const date = new Date();
        let currentMonth = date.getMonth();
        let currentYear = date.getFullYear();

        const renderCal = (month, year) => {
            const data = Utils.getCalendarData(year, month);
            document.getElementById('cal-month-year').textContent = `${data.monthName} ${data.year}`;

            const grid = document.getElementById('calendar-grid');
            grid.innerHTML = '';

            // Weekday headers
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            days.forEach(d => {
                const el = document.createElement('div');
                el.className = 'cal-day-header';
                el.textContent = d;
                grid.appendChild(el);
            });

            // Empty slots
            for (let i = 0; i < data.startDay; i++) {
                const el = document.createElement('div');
                el.className = 'cal-day empty';
                grid.appendChild(el);
            }

            // Days
            const today = new Date();
            for (let i = 1; i <= data.daysInMonth; i++) {
                const el = document.createElement('div');
                el.className = 'cal-day';
                el.textContent = i;

                if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    el.classList.add('today');
                }
                grid.appendChild(el);
            }
        };

        renderCal(currentMonth, currentYear);

        document.getElementById('prev-month').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCal(currentMonth, currentYear);
        });

        document.getElementById('next-month').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCal(currentMonth, currentYear);
        });
    }
}
