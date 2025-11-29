class AnalyticsView {
    constructor(store) {
        this.store = store;
    }

    async render(container) {
        const sessions = this.store.getSessions();
        const subjects = this.store.getSubjects();

        // Calculate data for charts
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const studyTimeData = last7Days.map(date => {
            return sessions
                .filter(s => s.timestamp.startsWith(date))
                .reduce((acc, s) => acc + s.duration, 0);
        });

        container.innerHTML = `
            <div class="analytics-container animate-fade-in">
                <h2>Analytics & Insights</h2>
                
                <div class="grid-2" style="margin-top: 1.5rem;">
                    <div class="card">
                        <h4>Study Time (Last 7 Days)</h4>
                        <canvas id="studyTimeChart"></canvas>
                    </div>
                    <div class="card">
                        <h4>Subject Distribution</h4>
                        <canvas id="subjectDistChart"></canvas>
                    </div>
                </div>

                <div class="card" style="margin-top: 1.5rem;">
                    <h4>💡 Insights</h4>
                    <ul style="margin-top: 1rem; padding-left: 1.5rem;">
                        <li>You're most productive on <strong>Mondays</strong>.</li>
                        <li>You've spent <strong>${Math.round(studyTimeData.reduce((a, b) => a + b, 0) / 60)} hours</strong> studying this week.</li>
                        <li>Keep it up! You're on a <strong>${this.store.getUser().streak} day streak</strong>.</li>
                    </ul>
                </div>
            </div>
        `;
    }

    async afterRender() {
        // Initialize Charts
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? '#334155' : '#e2e8f0';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        const ctxTime = document.getElementById('studyTimeChart').getContext('2d');
        new Chart(ctxTime, {
            type: 'bar', // Changed to bar for cleaner look
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Minutes Studied',
                    data: [30, 45, 60, 20, 90, 45, 60],
                    backgroundColor: '#4f46e5',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { grid: { color: gridColor }, ticks: { color: textColor } },
                    x: { grid: { display: false }, ticks: { color: textColor } }
                },
                plugins: { legend: { display: false } }
            }
        });

        const ctxSub = document.getElementById('subjectDistChart').getContext('2d');
        new Chart(ctxSub, {
            type: 'doughnut',
            data: {
                labels: ['Math', 'Science', 'History', 'English'],
                datasets: [{
                    data: [12, 19, 3, 5],
                    backgroundColor: ['#4f46e5', '#0ea5e9', '#64748b', '#94a3b8'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: { legend: { position: 'bottom', labels: { color: textColor } } }
            }
        });
    }
}
