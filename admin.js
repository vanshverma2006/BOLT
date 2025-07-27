// Admin module
class AdminManager {
    constructor() {
        this.currentTab = 'movies';
        this.initializeAdmin();
    }

    initializeAdmin() {
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
        });
    }

    switchTab(tab) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        this.currentTab = tab;
        this.renderTabContent();
    }

    renderAdminPanel() {
        if (!authManager.requireAdmin()) {
            document.getElementById('adminContent').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lock"></i>
                    <h3>Access Denied</h3>
                    <p>You need admin privileges to access this page.</p>
                </div>
            `;
            return;
        }

        this.renderTabContent();
    }

    renderTabContent() {
        const content = document.getElementById('adminContent');
        
        switch (this.currentTab) {
            case 'movies':
                this.renderMoviesTab(content);
                break;
            case 'theaters':
                this.renderTheatersTab(content);
                break;
            case 'shows':
                this.renderShowsTab(content);
                break;
            case 'bookings':
                this.renderBookingsTab(content);
                break;
        }
    }

    renderMoviesTab(content) {
        const movies = db.getAll('movies');
        
        content.innerHTML = `
            <div class="admin-section active fade-in">
                <div class="admin-actions">
                    <button class="btn-primary" onclick="adminManager.showAddMovieModal()">
                        <i class="fas fa-plus"></i> Add Movie
                    </button>
                </div>
                
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Movie Name</th>
                                <th>Genre</th>
                                <th>Language</th>
                                <th>Duration</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${movies.map(movie => `
                                <tr>
                                    <td>${movie.name}</td>
                                    <td>${movie.genre}</td>
                                    <td>${movie.language}</td>
                                    <td>${movie.duration} mins</td>
                                    <td>${movie.rating}/5</td>
                                    <td>
                                        <button class="btn-secondary btn-sm" onclick="adminManager.editMovie('${movie.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-danger btn-sm" onclick="adminManager.deleteMovie('${movie.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderTheatersTab(content) {
        const theaters = db.getAll('theaters');
        
        content.innerHTML = `
            <div class="admin-section active fade-in">
                <div class="admin-actions">
                    <button class="btn-primary" onclick="adminManager.showAddTheaterModal()">
                        <i class="fas fa-plus"></i> Add Theater
                    </button>
                </div>
                
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Theater Name</th>
                                <th>City</th>
                                <th>Address</th>
                                <th>Screens</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${theaters.map(theater => `
                                <tr>
                                    <td>${theater.name}</td>
                                    <td>${theater.city}</td>
                                    <td>${theater.address}</td>
                                    <td>${theater.screens}</td>
                                    <td>
                                        <button class="btn-secondary btn-sm" onclick="adminManager.editTheater('${theater.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-danger btn-sm" onclick="adminManager.deleteTheater('${theater.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderShowsTab(content) {
        const shows = db.getAll('shows');
        const movies = db.getAll('movies');
        const theaters = db.getAll('theaters');
        
        // Create lookup maps
        const movieMap = Object.fromEntries(movies.map(m => [m.id, m.name]));
        const theaterMap = Object.fromEntries(theaters.map(t => [t.id, t.name]));
        
        content.innerHTML = `
            <div class="admin-section active fade-in">
                <div class="admin-actions">
                    <button class="btn-primary" onclick="adminManager.showAddShowModal()">
                        <i class="fas fa-plus"></i> Add Show
                    </button>
                </div>
                
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Movie</th>
                                <th>Theater</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Format</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${shows.slice(0, 50).map(show => `
                                <tr>
                                    <td>${movieMap[show.movieId] || 'Unknown'}</td>
                                    <td>${theaterMap[show.theaterId] || 'Unknown'}</td>
                                    <td>${show.date}</td>
                                    <td>${show.time}</td>
                                    <td>${show.format}</td>
                                    <td>₹${show.price}</td>
                                    <td>
                                        <button class="btn-secondary btn-sm" onclick="adminManager.editShow('${show.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-danger btn-sm" onclick="adminManager.deleteShow('${show.id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <p style="margin-top: 16px; color: var(--text-secondary);">
                    Showing first 50 shows. Total shows: ${shows.length}
                </p>
            </div>
        `;
    }

    renderBookingsTab(content) {
        const bookings = db.getAll('bookings');
        const movies = db.getAll('movies');
        const theaters = db.getAll('theaters');
        const users = db.getAll('users');
        
        // Create lookup maps
        const movieMap = Object.fromEntries(movies.map(m => [m.id, m.name]));
        const theaterMap = Object.fromEntries(theaters.map(t => [t.id, t.name]));
        const userMap = Object.fromEntries(users.map(u => [u.id, u.name]));
        
        content.innerHTML = `
            <div class="admin-section active fade-in">
                <div class="admin-stats">
                    <div class="stat-card">
                        <div class="stat-value">${bookings.length}</div>
                        <div class="stat-label">Total Bookings</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">₹${bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${bookings.reduce((sum, b) => sum + b.seats.length, 0)}</div>
                        <div class="stat-label">Seats Booked</div>
                    </div>
                </div>
                
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>User</th>
                                <th>Movie</th>
                                <th>Theater</th>
                                <th>Seats</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookings.map(booking => `
                                <tr>
                                    <td>${booking.id}</td>
                                    <td>${userMap[booking.userId] || 'Unknown'}</td>
                                    <td>${movieMap[booking.movieId] || 'Unknown'}</td>
                                    <td>${theaterMap[booking.theaterId] || 'Unknown'}</td>
                                    <td>${booking.seats.join(', ')}</td>
                                    <td>₹${booking.amount}</td>
                                    <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
                                    <td><span class="status-${booking.status}">${booking.status.toUpperCase()}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    showAddMovieModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Add New Movie</h2>
            <form id="movieForm">
                <div class="form-group">
                    <label class="form-label">Movie Name</label>
                    <input type="text" class="form-input" id="movieName" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="movieDescription" required></textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Genre</label>
                        <select class="form-select" id="movieGenre" required>
                            <option value="">Select Genre</option>
                            <option value="action">Action</option>
                            <option value="comedy">Comedy</option>
                            <option value="drama">Drama</option>
                            <option value="horror">Horror</option>
                            <option value="romance">Romance</option>
                            <option value="thriller">Thriller</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Language</label>
                        <select class="form-select" id="movieLanguage" required>
                            <option value="">Select Language</option>
                            <option value="hindi">Hindi</option>
                            <option value="english">English</option>
                            <option value="tamil">Tamil</option>
                            <option value="telugu">Telugu</option>
                        </select>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Duration (minutes)</label>
                        <input type="number" class="form-input" id="movieDuration" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Rating</label>
                        <input type="number" class="form-input" id="movieRating" min="1" max="5" step="0.1" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Cast (comma separated)</label>
                    <input type="text" class="form-input" id="movieCast" placeholder="Actor 1, Actor 2, Actor 3">
                </div>
                <div class="form-group">
                    <label class="form-label">Formats</label>
                    <div style="display: flex; gap: 16px; margin-top: 8px;">
                        <label><input type="checkbox" value="2D" id="format2D"> 2D</label>
                        <label><input type="checkbox" value="3D" id="format3D"> 3D</label>
                        <label><input type="checkbox" value="IMAX" id="formatIMAX"> IMAX</label>
                    </div>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 16px;">
                    Add Movie
                </button>
            </form>
        `;

        document.getElementById('movieForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddMovie();
        });

        authManager.showModal();
    }

    handleAddMovie() {
        const formats = [];
        if (document.getElementById('format2D').checked) formats.push('2D');
        if (document.getElementById('format3D').checked) formats.push('3D');
        if (document.getElementById('formatIMAX').checked) formats.push('IMAX');

        const movie = {
            name: document.getElementById('movieName').value,
            description: document.getElementById('movieDescription').value,
            genre: document.getElementById('movieGenre').value,
            language: document.getElementById('movieLanguage').value,
            duration: parseInt(document.getElementById('movieDuration').value),
            rating: parseFloat(document.getElementById('movieRating').value),
            cast: document.getElementById('movieCast').value.split(',').map(c => c.trim()),
            format: formats,
            poster: 'https://images.pexels.com/photos/7991234/pexels-photo-7991234.jpeg?auto=compress&cs=tinysrgb&w=400'
        };

        db.create('movies', movie);
        authManager.hideModal();
        authManager.showSuccessMessage('Movie added successfully!');
        this.renderTabContent();
    }

    deleteMovie(movieId) {
        if (confirm('Are you sure you want to delete this movie?')) {
            db.delete('movies', movieId);
            authManager.showSuccessMessage('Movie deleted successfully!');
            this.renderTabContent();
        }
    }

    showAddTheaterModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Add New Theater</h2>
            <form id="theaterForm">
                <div class="form-group">
                    <label class="form-label">Theater Name</label>
                    <input type="text" class="form-input" id="theaterName" required>
                </div>
                <div class="form-group">
                    <label class="form-label">City</label>
                    <select class="form-select" id="theaterCity" required>
                        <option value="">Select City</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="delhi">Delhi</option>
                        <option value="bangalore">Bangalore</option>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="pune">Pune</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Address</label>
                    <textarea class="form-textarea" id="theaterAddress" required></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Number of Screens</label>
                    <input type="number" class="form-input" id="theaterScreens" min="1" max="20" required>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 16px;">
                    Add Theater
                </button>
            </form>
        `;

        document.getElementById('theaterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTheater();
        });

        authManager.showModal();
    }

    handleAddTheater() {
        const theater = {
            name: document.getElementById('theaterName').value,
            city: document.getElementById('theaterCity').value,
            address: document.getElementById('theaterAddress').value,
            screens: parseInt(document.getElementById('theaterScreens').value)
        };

        db.create('theaters', theater);
        authManager.hideModal();
        authManager.showSuccessMessage('Theater added successfully!');
        this.renderTabContent();
    }

    deleteTheater(theaterId) {
        if (confirm('Are you sure you want to delete this theater?')) {
            db.delete('theaters', theaterId);
            authManager.showSuccessMessage('Theater deleted successfully!');
            this.renderTabContent();
        }
    }
}

// Add admin styles
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .admin-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
    }
    
    .stat-card {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 24px;
        text-align: center;
        box-shadow: var(--shadow-sm);
    }
    
    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 8px;
    }
    
    .stat-label {
        color: var(--text-secondary);
        font-weight: 500;
    }
    
    .data-table-container {
        overflow-x: auto;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
    }
    
    .btn-sm {
        padding: 6px 12px;
        font-size: 0.75rem;
        margin: 0 2px;
    }
`;
document.head.appendChild(adminStyles);

// Initialize admin manager
window.adminManager = new AdminManager();