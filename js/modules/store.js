class Store {
    constructor() {
        this.state = {
            user: JSON.parse(localStorage.getItem('sb_user')) || {
                name: 'Student',
                streak: 0,
                lastLogin: new Date().toISOString().split('T')[0]
            },
            subjects: JSON.parse(localStorage.getItem('sb_subjects')) || [],
            timetable: JSON.parse(localStorage.getItem('sb_timetable')) || null,
            settings: JSON.parse(localStorage.getItem('sb_settings')) || { theme: 'light' },
            // New Features
            flashcards: JSON.parse(localStorage.getItem('sb_flashcards')) || [],
            sessions: JSON.parse(localStorage.getItem('sb_sessions')) || [],
            papers: JSON.parse(localStorage.getItem('sb_papers')) || [],
            achievements: JSON.parse(localStorage.getItem('sb_achievements')) || [],
            countdowns: JSON.parse(localStorage.getItem('sb_countdowns')) || []
        };

        // Check streak on init
        this.checkStreak();
    }

    save(key) {
        localStorage.setItem(`sb_${key}`, JSON.stringify(this.state[key]));
    }

    getSubjects() {
        return this.state.subjects;
    }

    addSubject(subject) {
        this.state.subjects.push(subject);
        this.save('subjects');
    }

    updateSubject(updatedSubject) {
        const index = this.state.subjects.findIndex(s => s.id === updatedSubject.id);
        if (index !== -1) {
            this.state.subjects[index] = updatedSubject;
            this.save('subjects');
        }
    }

    deleteSubject(id) {
        this.state.subjects = this.state.subjects.filter(s => s.id !== id);
        this.save('subjects');
    }

    getTimetable() {
        return this.state.timetable;
    }

    saveTimetable(timetable) {
        this.state.timetable = timetable;
        this.save('timetable');
    }

    getSettings() {
        return this.state.settings;
    }

    // Flashcards
    getDecks() { return this.state.flashcards; }
    saveDecks(decks) {
        this.state.flashcards = decks;
        this.save('flashcards');
    }

    // Pomodoro Sessions
    getSessions() { return this.state.sessions; }
    logSession(duration) {
        this.state.sessions.push({
            timestamp: new Date().toISOString(),
            duration: duration // minutes
        });
        this.save('sessions');
        this.checkAchievements();
    }

    // Past Papers
    getPapers() { return this.state.papers; }
    addPaper(paper) {
        this.state.papers.push(paper);
        this.save('papers');
    }

    // Achievements
    getAchievements() { return this.state.achievements; }
    unlockAchievement(id, title, icon) {
        if (!this.state.achievements.find(a => a.id === id)) {
            this.state.achievements.push({ id, title, icon, date: new Date().toISOString() });
            this.save('achievements');
            return true; // Unlocked new
        }
        return false;
    }

    checkAchievements() {
        // Simple checks
        const totalHours = this.state.sessions.reduce((acc, s) => acc + s.duration, 0) / 60;
        if (totalHours >= 10) this.unlockAchievement('hours_10', 'Studied 10 Hours', '🤓');

        if (this.state.user.streak >= 5) this.unlockAchievement('streak_5', '5 Day Streak', '🔥');
    }

    toggleTheme() {
        this.state.settings.theme = this.state.settings.theme === 'light' ? 'dark' : 'light';
        this.save('settings');
        return this.state.settings.theme;
    }

    checkStreak() {
        const today = new Date().toISOString().split('T')[0];
        if (this.state.user.lastLogin !== today) {
            const last = new Date(this.state.user.lastLogin);
            const current = new Date(today);
            const diffTime = Math.abs(current - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                this.state.user.streak++;
            } else if (diffDays > 1) {
                this.state.user.streak = 0;
            }

            this.state.user.lastLogin = today;
            this.save('user');
        }
    }

    // Countdowns
    getCountdowns() {
        return this.state.countdowns.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    addCountdown(countdown) {
        this.state.countdowns.push(countdown);
        this.save('countdowns');
    }

    deleteCountdown(id) {
        this.state.countdowns = this.state.countdowns.filter(c => c.id !== id);
        this.save('countdowns');
    }

    getUser() {
        return this.state.user;
    }
}
