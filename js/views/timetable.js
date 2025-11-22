class TimetableView {
    constructor(store) {
        this.store = store;
    }

    async render() {
        const timetable = this.store.getTimetable();

        if (timetable) {
            return this.renderTimetable(timetable);
        }

        const subjects = this.store.getSubjects();
        if (subjects.length === 0) {
            return `
                <div class="card center-content">
                    <h3>No Subjects Found</h3>
                    <p>Please add some subjects in the 'Subjects' tab before creating a timetable.</p>
                    <a href="#subjects" class="btn btn-primary mt-2">Go to Subjects</a>
                </div>
            `;
        }

        return `
            <div class="timetable-container">
                <div class="card form-card">
                    <h3>📅 Create Your Study Schedule</h3>
                    <p class="text-muted">Tell us your availability and we'll balance your study time.</p>
                    
                    <form id="timetable-form">
                        <div class="form-group">
                            <label>Exam Date / Goal Date</label>
                            <input type="date" id="exam-date" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Daily Study Hours</label>
                            <input type="number" id="daily-hours" min="1" max="12" value="2" required>
                        </div>

                        <div class="form-group">
                            <label>Select Subjects to Study</label>
                            <div class="checkbox-group">
                                ${subjects.map(s => `
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="subjects" value="${s.id}" checked>
                                        ${s.name}
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary full-width">Generate Timetable ✨</button>
                    </form>
                </div>
            </div>
        `;
    }

    renderTimetable(timetable) {
        return `
            <div class="timetable-results">
                <div class="header-actions">
                    <h3>Your Weekly Schedule</h3>
                    <button class="btn btn-secondary" id="reset-timetable">Create New</button>
                </div>

                <div class="timetable-grid">
                    ${Object.entries(timetable.schedule).map(([day, slots]) => `
                        <div class="card day-card">
                            <h4 class="day-title">${day}</h4>
                            <div class="day-slots">
                                ${slots.length > 0 ? slots.map(slot => `
                                    <div class="slot" style="border-left: 4px solid ${slot.color}">
                                        <span class="slot-subject">${slot.subject}</span>
                                        <span class="slot-time">${slot.duration} mins</span>
                                    </div>
                                `).join('') : '<p class="text-muted">Rest Day 😴</p>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async afterRender() {
        const form = document.getElementById('timetable-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateTimetable();
            });
        }

        const resetBtn = document.getElementById('reset-timetable');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.store.saveTimetable(null);
                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            });
        }
    }

    generateTimetable() {
        const subjects = this.store.getSubjects();
        const selectedIds = Array.from(document.querySelectorAll('input[name="subjects"]:checked')).map(cb => cb.value);
        const dailyHours = parseInt(document.getElementById('daily-hours').value);

        if (selectedIds.length === 0) {
            alert('Please select at least one subject.');
            return;
        }

        const activeSubjects = subjects.filter(s => selectedIds.includes(s.id));
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const schedule = {};

        // Simple Algorithm: Round Robin distribution
        // In a real app, this would be more complex based on difficulty/exam date

        days.forEach(day => {
            schedule[day] = [];
            let timeRemaining = dailyHours * 60; // minutes

            // Randomly pick subjects to fill the day
            // Shuffle subjects for variety
            const shuffled = [...activeSubjects].sort(() => 0.5 - Math.random());

            shuffled.forEach(sub => {
                if (timeRemaining >= 60) {
                    schedule[day].push({
                        subject: sub.name,
                        color: sub.color,
                        duration: 60
                    });
                    timeRemaining -= 60;
                } else if (timeRemaining > 0) {
                    schedule[day].push({
                        subject: sub.name,
                        color: sub.color,
                        duration: timeRemaining
                    });
                    timeRemaining = 0;
                }
            });
        });

        const timetable = {
            createdAt: new Date().toISOString(),
            schedule
        };

        this.store.saveTimetable(timetable);
        this.render().then(html => {
            document.getElementById('app-view').innerHTML = html;
            this.afterRender();
        });
    }
}
