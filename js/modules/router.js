class Router {
    constructor(routes) {
        this.routes = routes;
        this.viewContainer = document.getElementById('app-view');
        this.pageTitle = document.getElementById('page-title');
        this.navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Handle initial load
    }

    async handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const route = this.routes[hash] || this.routes['dashboard'];

        // Update Active Link
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${hash}`) {
                link.classList.add('active');
            }
        });

        // Update Title
        this.pageTitle.textContent = hash.charAt(0).toUpperCase() + hash.slice(1);

        // Render View
        this.viewContainer.innerHTML = await route.render();
        if (route.afterRender) await route.afterRender();
    }
}
