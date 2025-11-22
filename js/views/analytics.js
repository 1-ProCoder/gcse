class AnalyticsView {
    constructor(store) {
        this.store = store;
    }

    async render() {
        const sessions = this.store.getSessions();
        const papers = this.store.getPapers();
        const achievements = this.store.getAchievements();
        const subjects = this.store.getSubjects();

        // Calculate real statistics
        const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        const totalHours = (totalMinutes / 60).toFixed(1);
        const todayMinutes = this.getTodayStudyTime(sessions);
        const todayHours = (todayMinutes / 60).toFixed(1);

        return `
            <div class="analytics-container fade-in">
                <div class="analytics-header">
                    <h2>Analytics Dashboard</h2>
                    <p class="text-muted">Track your progress and celebrate milestones.</p>
                </div>

                <!-- Study Stats Overview -->
                <div class="stats-overview">
                    <div class="stat-box-large">
                        <div class="stat-icon-large">📚</div>
                        <div class="stat-content">
                            <h2>${totalHours}h</h2>
                            <p>Total Study Time</p>
                        </div>
                    </div>
                    <div class="stat-box-large">
                        <div class="stat-icon-large">🔥</div>
                        <div class="stat-content">
                            <h2>${todayHours}h</h2>
                            <p>Today's Focus</p>
                        </div>
                    </div>
                    <div class="stat-box-large">
                        <div class="stat-icon-large">✅</div>
                        <div class="stat-content">
                            <h2>${sessions.length}</h2>
                            <p>Sessions Completed</p>
                        </div>
                    </div>
                </div>

                <!-- Achievements Section -->
                <div class="section-card">
                    <div class="section-header">
                        <h3>🏆 Achievements</h3>
                        <span class="badge-count">${achievements.length} Unlocked</span>
                    </div>
                    <div class="achievements-scroller">
                        ${achievements.length > 0 ? achievements.map(a => `
                            <div class="achievement-pill" title="${a.title}">
                                <span class="icon">${a.icon}</span>
                                <span class="title">${a.title}</span>
                            </div>
                        `).join('') : '<div class="empty-badge">Keep studying to unlock badges!</div>'}
                    </div>
                </div>

                <div class="analytics-grid">
                    <!-- Heatmap Section -->
                    <div class="section-card">
                        <h3>🔥 Revision Heatmap</h3>
                        <p class="text-muted-small">Last 30 days activity</p>
                        <div class="heatmap-wrapper">
                            <div class="heatmap-grid" id="heatmap"></div>
                        </div>
                        <div class="heatmap-legend">
                            <span>Less</span>
                            <div class="legend-scale">
                                <span class="l0"></span><span class="l1"></span><span class="l2"></span><span class="l3"></span>
                            </div>
                            <span>More</span>
                        </div>
                    </div>

                    <!-- Weekly Graph Section -->
                    <div class="section-card">
                        <h3>📊 Weekly Activity</h3>
                        <p class="text-muted-small">Study hours by day</p>
                        <div class="chart-wrapper">
                            <div class="bar-chart-premium">
                                ${this.generateWeeklyBars(sessions)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Past Papers Section -->
                <div class="section-card full-width">
                    <div class="header-actions">
                        <h3>📝 Past Paper Tracker</h3>
                        <button class="btn btn-primary btn-sm" id="add-paper-btn">+ Log Paper</button>
                    </div>
                    
                    <div class="table-responsive">
                        ${papers.length === 0 ? '<div class="empty-table">No past papers logged yet.</div>' : `
                        <table class="premium-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Subject</th>
                                    <th>Paper Type</th>
                                    <th>Score</th>
                                    <th>Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${papers.map(p => `
                                    <tr>
                                        <td>${new Date(p.date).toLocaleDateString()}</td>
                                        <td><span class="subject-tag">${p.subject}</span></td>
                                        <td>${p.type}</td>
                                        <td>
                                            <div class="score-bar-container">
                                                <div class="score-bar" style="width: ${p.score}%; background-color: ${this.getScoreColor(p.score)}"></div>
                                                <span>${p.score}%</span>
                                            </div>
                                        </td>
                                        <td>${this.getConfidenceEmoji(p.confidence)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        `}
                    </div>
                </div>

                <!-- Add Paper Modal -->
                <div id="paper-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>Log Past Paper</h3>
                        <div class="form-group">
                            <label>Subject</label>
                            <select id="paper-subject">
                                ${subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Paper Type</label>
                            <input type="text" id="paper-type" placeholder="e.g. 2023 Mock">
                        </div>
                        <div class="form-group">
                            <label>Score (%)</label>
                            <input type="number" id="paper-score" placeholder="0-100" min="0" max="100">
                        </div>
                        <div class="form-group">
                            <label>Confidence</label>
                            <select id="paper-confidence">
                                <option value="High">High Confidence 😃</option>
                                <option value="Medium">Medium 😐</option>
                                <option value="Low">Low 😟</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" id="cancel-paper">Cancel</button>
                            <button class="btn btn-primary" id="save-paper">Save Log</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getTodayStudyTime(sessions) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return sessions
            .filter(s => {
                if (!s.timestamp) return false;
                const sessionDate = new Date(s.timestamp);
                return !isNaN(sessionDate.getTime()) && sessionDate >= today;
            })
            .reduce((sum, s) => sum + s.duration, 0);
    }

    generateWeeklyBars(sessions) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const now = new Date();
        const weekData = new Array(7).fill(0);

        // Calculate actual study time for each day of the current week
        sessions.forEach(session => {
            if (!session.timestamp) return; // Skip sessions without timestamp
            const sessionDate = new Date(session.timestamp);
            if (isNaN(sessionDate.getTime())) return; // Skip invalid dates
            const daysDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));

            if (daysDiff < 7) {
                const dayIndex = (sessionDate.getDay() + 6) % 7; // Convert to Mon=0, Sun=6
                weekData[dayIndex] += session.duration;
            }
        });

        const maxMinutes = Math.max(...weekData, 60); // At least 60 min for scaling

        return days.map((day, idx) => {
            const minutes = weekData[idx];
            const hours = (minutes / 60).toFixed(1);
            const height = (minutes / maxMinutes) * 100;

            return `
                <div class="chart-col">
                    <div class="bar-fill" style="height: ${height}%" title="${hours}h"></div>
                    <span class="bar-label">${day}</span>
                    <span class="bar-value">${hours}h</span>
                </div>
            `;
        }).join('');
    }

    getScoreColor(score) {
        if (score >= 80) return '#10b981';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    }

    getConfidenceEmoji(conf) {
        if (conf === 'High') return '😃 High';
        if (conf === 'Medium') return '😐 Med';
        return '😟 Low';
    }

    async afterRender() {
        this.renderHeatmap();
        this.attachListeners();
    }

    renderHeatmap() {
        const grid = document.getElementById('heatmap');
        if (!grid) return;

        const sessions = this.store.getSessions();
        const now = new Date();
        const activityMap = {};

        // Build activity map from real sessions
        sessions.forEach(session => {
            if (!session.timestamp) return; // Skip sessions without timestamp
            const date = new Date(session.timestamp);
            if (isNaN(date.getTime())) return; // Skip invalid dates
            const dateKey = date.toISOString().split('T')[0];
            activityMap[dateKey] = (activityMap[dateKey] || 0) + session.duration;
        });

        // Generate last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];

            const el = document.createElement('div');
            el.className = 'heat-dot';
            el.title = dateKey;

            const minutes = activityMap[dateKey] || 0;
            if (minutes >= 120) el.classList.add('l3');
            else if (minutes >= 60) el.classList.add('l2');
            else if (minutes >= 30) el.classList.add('l1');
            else el.classList.add('l0');

            grid.appendChild(el);
        }
    }

    attachListeners() {
        const modal = document.getElementById('paper-modal');
        document.getElementById('add-paper-btn')?.addEventListener('click', () => modal.classList.remove('hidden'));
        document.getElementById('cancel-paper')?.addEventListener('click', () => modal.classList.add('hidden'));

        document.getElementById('save-paper')?.addEventListener('click', () => {
            const subject = document.getElementById('paper-subject').value;
            const type = document.getElementById('paper-type').value;
            const score = document.getElementById('paper-score').value;
            const confidence = document.getElementById('paper-confidence').value;

            if (subject && score) {
                this.store.addPaper({
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    subject,
                    type,
                    score: parseInt(score),
                    confidence
                });

                if (parseInt(score) === 100) {
                    this.store.unlockAchievement('perfect_score', 'Perfectionist', '💯');
                    alert('Achievement Unlocked: Perfectionist! 💯');
                }

                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            }
        });
    }
}
