// Initialize Store
const store = new Store();

// Initialize Theme
const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
};
applyTheme(store.getSettings().theme);

document.getElementById('theme-btn').addEventListener('click', () => {
    const newTheme = store.toggleTheme();
    applyTheme(newTheme);
});

// Define Routes
const routes = {
    'dashboard': new DashboardView(store),
    'subjects': new SubjectsView(store),
    'timetable': new TimetableView(store),
    'flashcards': new FlashcardsView(store),
    'pomodoro': new PomodoroView(store),
    'analytics': new AnalyticsView(store),
    'countdowns': new CountdownsView(store)
};

// Initialize Router
const router = new Router(routes);

// Update Greeting
document.getElementById('greeting').textContent = `Hello, ${store.getUser().name}!`;
