// Main application router and initialization
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
                // Attach show time listeners after rendering
                setTimeout(() => moviesManager.attachShowTimeListeners(), 100);
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

        // Load initial route
        this.handleRoute();
        
        // Initialize featured movies on home page
        moviesManager.renderFeaturedMovies();
    }

    navigate(route, params = {}) {
        const url = params ? `#${route}?${new URLSearchParams(params)}` : `#${route}`;
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

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.route === route) {
                link.classList.add('active');
            }
        });

        // Execute route handler
        if (this.routes[route]) {
            this.routes[route](params);
        } else {
            this.routes['home']();
        }
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        document.getElementById(pageId).classList.add('active');
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Application initialization
class App {
    constructor() {
        this.init();
    }

    init() {
        // Initialize router
        window.router = new Router();
        
        // Add loading states
        this.addLoadingStates();
        
        // Add responsive menu toggle for mobile
        this.addMobileMenu();
        
        // Add smooth scrolling
        this.addSmoothScrolling();
        
        console.log('BookMyShow app initialized successfully!');
    }

    addLoadingStates() {
        // Add loading spinner styles
        const loadingStyles = document.createElement('style');
        loadingStyles.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(4px);
            }
            
            .loading-content {
                text-align: center;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--border-color);
                border-top: 3px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
        `;
        document.head.appendChild(loadingStyles);
    }

    addMobileMenu() {
        // Add mobile menu styles and functionality
        const mobileStyles = document.createElement('style');
        mobileStyles.textContent = `
            .mobile-menu-btn {
                display: none;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-primary);
            }
            
            @media (max-width: 768px) {
                .mobile-menu-btn {
                    display: block;
                }
                
                .nav-links {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background: var(--bg-primary);
                    border-top: 1px solid var(--border-color);
                    flex-direction: column;
                    padding: 16px 0;
                    box-shadow: var(--shadow-lg);
                }
                
                .nav-links.active {
                    display: flex;
                }
                
                .nav-link {
                    padding: 12px 24px;
                    width: 100%;
                    text-align: left;
                }
                
                .city-selector {
                    padding: 0 24px;
                }
            }
        `;
        document.head.appendChild(mobileStyles);
    }

    addSmoothScrolling() {
        // Add smooth scrolling behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    showLoading(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    hideLoading(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(registrationError => console.log('SW registration failed'));
    });
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    authManager.showErrorMessage('An unexpected error occurred. Please try again.');
});

// Handle online/offline status
window.addEventListener('online', () => {
    authManager.showSuccessMessage('Connection restored');
});

window.addEventListener('offline', () => {
    authManager.showErrorMessage('Connection lost. Some features may not work.');
});