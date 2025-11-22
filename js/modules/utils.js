const Utils = {
    quotes: [
        "The only way to do great work is to love what you do. – Steve Jobs",
        "Success is not the key to happiness. Happiness is the key to success. – Albert Schweitzer",
        "Believe you can and you're halfway there. – Theodore Roosevelt",
        "It always seems impossible until it's done. – Nelson Mandela",
        "Don't watch the clock; do what it does. Keep going. – Sam Levenson",
        "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
        "Start where you are. Use what you have. Do what you can. – Arthur Ashe",
        "Success is the sum of small efforts, repeated day in and day out. – Robert Collier"
    ],

    getRandomQuote() {
        return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    },

    getCalendarData(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay(); // 0 = Sunday

        return {
            year,
            month,
            monthName: firstDay.toLocaleString('default', { month: 'long' }),
            daysInMonth,
            startDay
        };
    }
};
