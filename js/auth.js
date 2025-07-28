// Authentication module
class AuthManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.initializeAuth();
    }

    initializeAuth() {
        if (this.currentUser) {
            this.showUserSection();
        } else {
            this.showAuthButtons();
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
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

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-section')) {
                this.closeUserDropdown();
            }
        });
    }

    showLoginModal() {
        const modalBody = document.getElementById('modalBody');
        Utils.removeAllChildren(modalBody);

        const title = Utils.createElement('h2', '', 'Sign In');
        const form = Utils.createElement('form', 'auth-form');
        form.id = 'loginForm';

        const emailGroup = UIComponents.createFormGroup('Email', 'email', 'loginEmail', true);
        const passwordGroup = UIComponents.createFormGroup('Password', 'password', 'loginPassword', true);
        
        const submitBtn = UIComponents.createButton('Sign In', 'btn btn-primary');
        submitBtn.type = 'submit';
        submitBtn.style.width = '100%';

        const switchText = Utils.createElement('p', '');
        switchText.style.textAlign = 'center';
        switchText.style.marginTop = '16px';
        switchText.innerHTML = `Don't have an account? <a href="#" id="switchToSignup" style="color: var(--primary-color);">Register here</a>`;

        const demoInfo = Utils.createElement('div', '');
        demoInfo.style.marginTop = '16px';
        demoInfo.style.padding = '12px';
        demoInfo.style.background = 'var(--bg-secondary)';
        demoInfo.style.borderRadius = '8px';
        demoInfo.style.fontSize = '0.875rem';
        demoInfo.innerHTML = '<strong>Demo Account:</strong><br>Email: admin@bookmyshow.com<br>Password: admin123';

        form.appendChild(emailGroup);
        form.appendChild(passwordGroup);
        form.appendChild(submitBtn);

        modalBody.appendChild(title);
        modalBody.appendChild(form);
        modalBody.appendChild(switchText);
        modalBody.appendChild(demoInfo);

        form.addEventListener('submit', (e) => {
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
        Utils.removeAllChildren(modalBody);

        const title = Utils.createElement('h2', '', 'Register');
        const form = Utils.createElement('form', 'auth-form');
        form.id = 'signupForm';

        const nameGroup = UIComponents.createFormGroup('Full Name', 'text', 'signupName', true);
        const emailGroup = UIComponents.createFormGroup('Email', 'email', 'signupEmail', true);
        const passwordGroup = UIComponents.createFormGroup('Password', 'password', 'signupPassword', true);
        
        const submitBtn = UIComponents.createButton('Register', 'btn btn-primary');
        submitBtn.type = 'submit';
        submitBtn.style.width = '100%';

        const switchText = Utils.createElement('p', '');
        switchText.style.textAlign = 'center';
        switchText.style.marginTop = '16px';
        switchText.innerHTML = `Already have an account? <a href="#" id="switchToLogin" style="color: var(--primary-color);">Sign in here</a>`;

        form.appendChild(nameGroup);
        form.appendChild(emailGroup);
        form.appendChild(passwordGroup);
        form.appendChild(submitBtn);

        modalBody.appendChild(title);
        modalBody.appendChild(form);
        modalBody.appendChild(switchText);

        form.addEventListener('submit', (e) => {
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

        if (!Utils.validateEmail(email)) {
            this.showErrorMessage('Please enter a valid email address');
            return;
        }

        if (db.getUserByEmail(email)) {
            this.showErrorMessage('User with this email already exists');
            return;
        }

        const newUser = {
            id: Utils.generateId(),
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
        const authButtons = document.getElementById('authButtons');
        const userSection = document.getElementById('userSection');
        const userName = document.getElementById('userName');
        const adminLink = document.getElementById('adminLink');

        Utils.hideElement(authButtons);
        Utils.showElement(userSection);
        userName.textContent = this.currentUser.name;
        
        if (this.currentUser.role === 'admin') {
            Utils.showElement(adminLink);
        } else {
            Utils.hideElement(adminLink);
        }
    }

    showAuthButtons() {
        const authButtons = document.getElementById('authButtons');
        const userSection = document.getElementById('userSection');

        Utils.showElement(authButtons);
        Utils.hideElement(userSection);
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
        const modal = document.getElementById('modal');
        modal.classList.add('active');
    }

    hideModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('active');
    }

    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const existingToast = container.querySelector('.toast');
        
        if (existingToast) {
            existingToast.remove();
        }

        const toast = UIComponents.createToast(message, type);
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('slide-out');
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

window.authManager = new AuthManager();