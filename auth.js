// Authentication module
class AuthManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.initializeAuth();
    }

    initializeAuth() {
        // Check if user is already logged in
        if (this.currentUser) {
            this.showUserSection();
        } else {
            this.showAuthButtons();
        }

        // Event listeners
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showLoginModal();
        });

        document.getElementById('signupBtn').addEventListener('click', () => {
            this.showSignupModal();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('userButton').addEventListener('click', () => {
            this.toggleUserDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-section')) {
                this.closeUserDropdown();
            }
        });
    }

    showLoginModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Sign In</h2>
            <form id="loginForm" class="auth-form">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" id="loginPassword" required>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Sign In</button>
                <p style="text-align: center; margin-top: 16px;">
                    Don't have an account? 
                    <a href="#" id="switchToSignup" style="color: var(--primary-color);">Register here</a>
                </p>
                <div style="margin-top: 16px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; font-size: 0.875rem;">
                    <strong>Demo Account:</strong><br>
                    Email: admin@bookmyshow.com<br>
                    Password: admin123
                </div>
            </form>
        `;

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('switchToSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupModal();
        });

        this.showModal();
    }

    showSignupModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Register</h2>
            <form id="signupForm" class="auth-form">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-input" id="signupName" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" id="signupEmail" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" id="signupPassword" required>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Register</button>
                <p style="text-align: center; margin-top: 16px;">
                    Already have an account? 
                    <a href="#" id="switchToLogin" style="color: var(--primary-color);">Sign in here</a>
                </p>
            </form>
        `;

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal();
        });

        this.showModal();
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = db.getUserByEmail(email);
        
        if (user && user.password === password) {
            this.setCurrentUser(user);
            this.showUserSection();
            this.hideModal();
            this.showSuccessMessage('Login successful!');
        } else {
            this.showErrorMessage('Invalid email or password');
        }
    }

    handleSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        // Check if user already exists
        if (db.getUserByEmail(email)) {
            this.showErrorMessage('User with this email already exists');
            return;
        }

        const newUser = {
            id: db.generateId(),
            name,
            email,
            password,
            role: 'user'
        };

        db.create('users', newUser);
        this.setCurrentUser(newUser);
        this.showUserSection();
        this.hideModal();
        this.showSuccessMessage('Registration successful!');
    }

    logout() {
        localStorage.removeItem('bookmyshow_currentUser');
        this.currentUser = null;
        this.showAuthButtons();
        this.closeUserDropdown();
        
        // Redirect to home if on protected pages
        const currentRoute = window.location.hash.slice(1) || 'home';
        if (['bookings', 'admin'].includes(currentRoute)) {
            window.router.navigate('home');
        }
        
        this.showSuccessMessage('Logged out successfully!');
    }

    getCurrentUser() {
        const userData = localStorage.getItem('bookmyshow_currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('bookmyshow_currentUser', JSON.stringify(user));
    }

    showUserSection() {
        document.getElementById('authButtons').style.display = 'none';
        document.getElementById('userSection').style.display = 'block';
        document.getElementById('userName').textContent = this.currentUser.name;
        
        // Show admin link if user is admin
        const adminLink = document.getElementById('adminLink');
        if (this.currentUser.role === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    }

    showAuthButtons() {
        document.getElementById('authButtons').style.display = 'flex';
        document.getElementById('userSection').style.display = 'none';
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('active');
    }

    closeUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.remove('active');
    }

    showModal() {
        document.getElementById('modal').classList.add('active');
    }

    hideModal() {
        document.getElementById('modal').classList.remove('active');
    }

    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--error-color)'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: var(--shadow-lg);
            animation: slideInRight 0.3s ease;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    requireAuth() {
        if (!this.currentUser) {
            this.showLoginModal();
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showErrorMessage('Admin access required');
            return false;
        }
        return true;
    }
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize auth manager
window.authManager = new AuthManager();