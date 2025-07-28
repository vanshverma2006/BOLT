// Main application initialization
class App {
    constructor() {
        this.init();
    }

    init() {
        this.addGlobalErrorHandler();
        this.addOnlineOfflineHandlers();
        this.addServiceWorkerSupport();
        
        console.log('BookMyShow app initialized successfully!');
    }

    addGlobalErrorHandler() {
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
            if (window.authManager) {
                authManager.showErrorMessage('An unexpected error occurred. Please try again.');
            }
        });
    }

    addOnlineOfflineHandlers() {
        window.addEventListener('online', () => {
            if (window.authManager) {
                authManager.showSuccessMessage('Connection restored');
            }
        });

        window.addEventListener('offline', () => {
            if (window.authManager) {
                authManager.showErrorMessage('Connection lost. Some features may not work.');
            }
        });
    }

    addServiceWorkerSupport() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Service worker registration can be added here if needed
                // navigator.serviceWorker.register('/sw.js')
                //     .then(registration => console.log('SW registered'))
                //     .catch(registrationError => console.log('SW registration failed'));
            });
        }
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = overlay.querySelector('p');
        loadingText.textContent = message;
        Utils.showElement(overlay);
        return overlay;
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        Utils.hideElement(overlay);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});