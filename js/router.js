// Router module
class Router {
    constructor() {
        this.routes = {
            'home': () => this.showPage('homePage'),
            'movies': () => {
                this.showPage('moviesPage');
                moviesManager.renderMoviesGrid();
            },
            'movie-details': (params) => {
                this.showPage('movieDetailsPage');
                moviesManager.renderMovieDetails(params.movieId);
            },
            'seat-selection': (params) => {
                this.showPage('seatSelectionPage');
                bookingManager.renderSeatSelection(params.showId);
            },
            'booking-confirmation': (params) => {
                this.showPage('bookingConfirmationPage');
                bookingManager.renderBookingConfirmation(params.bookingId);
            },
            'bookings': () => {
                this.showPage('bookingsPage');
                bookingManager.renderUserBookings();
            },
            'admin': () => {
                this.showPage('adminPage');
                adminManager.renderAdminPanel();
            }
        };
        
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.handleRoute();
        moviesManager.renderFeaturedMovies();
    }

    attachEventListeners() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.dataset.route) {
                e.preventDefault();
                this.navigate(e.target.dataset.route);
            }
        });

        // Handle modal close
        document.querySelector('.close-modal').addEventListener('click', () => {
            authManager.hideModal();
        });

        // Close modal when clicking outside
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                authManager.hideModal();
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
    }

    navigate(route, params = {}) {
        const url = params && Object.keys(params).length > 0 
            ? `#${route}?${new URLSearchParams(params)}` 
            : `#${route}`;
        history.pushState(null, null, url);
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash;
        let route = 'home';
        let params = {};

        if (hash) {
            const [routePart, paramsPart] = hash.slice(1).split('?');
            route = routePart || 'home';
            
            if (paramsPart) {
                params = Object.fromEntries(new URLSearchParams(paramsPart));
            }
        }

        this.updateActiveNavLink(route);

        if (this.routes[route]) {
            this.routes[route](params);
        } else {
            this.routes['home']();
        }
    }

    updateActiveNavLink(route) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.route === route) {
                link.classList.add('active');
            }
        });
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        document.getElementById(pageId).classList.add('active');
        Utils.scrollToTop();
    }
}

window.router = new Router();