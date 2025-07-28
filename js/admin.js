// Admin module
class AdminManager {
    constructor() {
        this.currentTab = 'movies';
        this.initializeAdmin();
    }

    initializeAdmin() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
        });
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        this.currentTab = tab;
        this.renderTabContent();
    }

    renderAdminPanel() {
        if (!authManager.requireAdmin()) {
            const content = document.getElementById('adminContent');
            const emptyState = UIComponents.createEmptyState(
                'fa-lock',
                'Access Denied',
                'You need admin privileges to access this page.'
            );
            Utils.removeAllChildren(content);
            content.appendChild(emptyState);
            return;
        }

        this.renderTabContent();
    }

    renderTabContent() {
        const content = document.getElementById('adminContent');
        Utils.removeAllChildren(content);
        
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
        
        const section = Utils.createElement('div', 'admin-section active fade-in');
        
        const actions = Utils.createElement('div', 'admin-actions');
        const addBtn = UIComponents.createButton('Add Movie', 'btn btn-primary', () => this.showAddMovieModal());
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Movie';
        actions.appendChild(addBtn);
        
        const tableData = movies.map(movie => ({
            name: movie.name,
            genre: movie.genre,
            language: movie.language,
            duration: `${movie.duration} mins`,
            rating: `${movie.rating}/5`
        }));
        
        const tableActions = [
            {
                text: '<i class="fas fa-edit"></i>',
                className: 'btn-secondary',
                handler: (movie) => this.editMovie(movie.id)
            },
            {
                text: '<i class="fas fa-trash"></i>',
                className: 'btn-danger',
                handler: (movie) => this.deleteMovie(movie.id)
            }
        ];
        
        const table = UIComponents.createDataTable(
            ['Movie Name', 'Genre', 'Language', 'Duration', 'Rating'],
            tableData,
            tableActions
        );
        
        section.appendChild(actions);
        section.appendChild(table);
        content.appendChild(section);
    }

    renderTheatersTab(content) {
        const theaters = db.getAll('theaters');
        
        const section = Utils.createElement('div', 'admin-section active fade-in');
        
        const actions = Utils.createElement('div', 'admin-actions');
        const addBtn = UIComponents.createButton('Add Theater', 'btn btn-primary', () => this.showAddTheaterModal());
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Theater';
        actions.appendChild(addBtn);
        
        const tableData = theaters.map(theater => ({
            name: theater.name,
            city: theater.city,
            address: theater.address,
            screens: theater.screens
        }));
        
        const tableActions = [
            {
                text: '<i class="fas fa-edit"></i>',
                className: 'btn-secondary',
                handler: (theater) => this.editTheater(theater.id)
            },
            {
                text: '<i class="fas fa-trash"></i>',
                className: 'btn-danger',
                handler: (theater) => this.deleteTheater(theater.id)
            }
        ];
        
        const table = UIComponents.createDataTable(
            ['Theater Name', 'City', 'Address', 'Screens'],
            tableData,
            tableActions
        );
        
        section.appendChild(actions);
        section.appendChild(table);
        content.appendChild(section);
    }

    renderShowsTab(content) {
        const shows = db.getAll('shows').slice(0, 50);
        const movies = db.getAll('movies');
        const theaters = db.getAll('theaters');
        
        const movieMap = Object.fromEntries(movies.map(m => [m.id, m.name]));
        const theaterMap = Object.fromEntries(theaters.map(t => [t.id, t.name]));
        
        const section = Utils.createElement('div', 'admin-section active fade-in');
        
        const actions = Utils.createElement('div', 'admin-actions');
        const addBtn = UIComponents.createButton('Add Show', 'btn btn-primary', () => this.showAddShowModal());
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Show';
        actions.appendChild(addBtn);
        
        const tableData = shows.map(show => ({
            movie: movieMap[show.movieId] || 'Unknown',
            theater: theaterMap[show.theaterId] || 'Unknown',
            date: show.date,
            time: show.time,
            format: show.format,
            price: Utils.formatCurrency(show.price)
        }));
        
        const tableActions = [
            {
                text: '<i class="fas fa-edit"></i>',
                className: 'btn-secondary',
                handler: (show) => this.editShow(show.id)
            },
            {
                text: '<i class="fas fa-trash"></i>',
                className: 'btn-danger',
                handler: (show) => this.deleteShow(show.id)
            }
        ];
        
        const table = UIComponents.createDataTable(
            ['Movie', 'Theater', 'Date', 'Time', 'Format', 'Price'],
            tableData,
            tableActions
        );
        
        const note = Utils.createElement('p', '');
        note.style.marginTop = '16px';
        note.style.color = 'var(--text-secondary)';
        note.textContent = `Showing first 50 shows. Total shows: ${db.getAll('shows').length}`;
        
        section.appendChild(actions);
        section.appendChild(table);
        section.appendChild(note);
        content.appendChild(section);
    }

    renderBookingsTab(content) {
        const bookings = db.getAll('bookings');
        const movies = db.getAll('movies');
        const theaters = db.getAll('theaters');
        const users = db.getAll('users');
        
        const movieMap = Object.fromEntries(movies.map(m => [m.id, m.name]));
        const theaterMap = Object.fromEntries(theaters.map(t => [t.id, t.name]));
        const userMap = Object.fromEntries(users.map(u => [u.id, u.name]));
        
        const section = Utils.createElement('div', 'admin-section active fade-in');
        
        // Stats
        const stats = Utils.createElement('div', 'admin-stats');
        
        const totalBookings = this.createStatCard(bookings.length.toString(), 'Total Bookings');
        const totalRevenue = this.createStatCard(
            Utils.formatCurrency(bookings.reduce((sum, b) => sum + b.amount, 0)),
            'Total Revenue'
        );
        const totalSeats = this.createStatCard(
            bookings.reduce((sum, b) => sum + b.seats.length, 0).toString(),
            'Seats Booked'
        );
        
        stats.appendChild(totalBookings);
        stats.appendChild(totalRevenue);
        stats.appendChild(totalSeats);
        
        const tableData = bookings.map(booking => ({
            id: booking.id,
            user: userMap[booking.userId] || 'Unknown',
            movie: movieMap[booking.movieId] || 'Unknown',
            theater: theaterMap[booking.theaterId] || 'Unknown',
            seats: booking.seats.join(', '),
            amount: Utils.formatCurrency(booking.amount),
            date: new Date(booking.bookingDate).toLocaleDateString(),
            status: booking.status.toUpperCase()
        }));
        
        const table = UIComponents.createDataTable(
            ['Booking ID', 'User', 'Movie', 'Theater', 'Seats', 'Amount', 'Date', 'Status'],
            tableData
        );
        
        section.appendChild(stats);
        section.appendChild(table);
        content.appendChild(section);
    }

    createStatCard(value, label) {
        const card = Utils.createElement('div', 'stat-card');
        const valueEl = Utils.createElement('div', 'stat-value', value);
        const labelEl = Utils.createElement('div', 'stat-label', label);
        
        card.appendChild(valueEl);
        card.appendChild(labelEl);
        
        return card;
    }

    showAddMovieModal() {
        const modalBody = document.getElementById('modalBody');
        Utils.removeAllChildren(modalBody);

        const title = Utils.createElement('h2', '', 'Add New Movie');
        const form = Utils.createElement('form', '');
        form.id = 'movieForm';

        const nameGroup = UIComponents.createFormGroup('Movie Name', 'text', 'movieName', true);
        const descGroup = UIComponents.createTextareaGroup('Description', 'movieDescription', true);
        
        const gridDiv = Utils.createElement('div', '');
        gridDiv.style.display = 'grid';
        gridDiv.style.gridTemplateColumns = '1fr 1fr';
        gridDiv.style.gap = '16px';
        
        const genreOptions = [
            { value: '', text: 'Select Genre' },
            { value: 'action', text: 'Action' },
            { value: 'comedy', text: 'Comedy' },
            { value: 'drama', text: 'Drama' },
            { value: 'horror', text: 'Horror' },
            { value: 'romance', text: 'Romance' },
            { value: 'thriller', text: 'Thriller' }
        ];
        
        const languageOptions = [
            { value: '', text: 'Select Language' },
            { value: 'hindi', text: 'Hindi' },
            { value: 'english', text: 'English' },
            { value: 'tamil', text: 'Tamil' },
            { value: 'telugu', text: 'Telugu' }
        ];
        
        const genreGroup = UIComponents.createSelectGroup('Genre', 'movieGenre', genreOptions, true);
        const languageGroup = UIComponents.createSelectGroup('Language', 'movieLanguage', languageOptions, true);
        
        gridDiv.appendChild(genreGroup);
        gridDiv.appendChild(languageGroup);
        
        const gridDiv2 = Utils.createElement('div', '');
        gridDiv2.style.display = 'grid';
        gridDiv2.style.gridTemplateColumns = '1fr 1fr';
        gridDiv2.style.gap = '16px';
        
        const durationGroup = UIComponents.createFormGroup('Duration (minutes)', 'number', 'movieDuration', true);
        const ratingGroup = UIComponents.createFormGroup('Rating', 'number', 'movieRating', true);
        ratingGroup.querySelector('input').min = '1';
        ratingGroup.querySelector('input').max = '5';
        ratingGroup.querySelector('input').step = '0.1';
        
        gridDiv2.appendChild(durationGroup);
        gridDiv2.appendChild(ratingGroup);
        
        const castGroup = UIComponents.createFormGroup('Cast (comma separated)', 'text', 'movieCast');
        castGroup.querySelector('input').placeholder = 'Actor 1, Actor 2, Actor 3';
        
        const formatGroup = Utils.createElement('div', 'form-group');
        const formatLabel = Utils.createElement('label', 'form-label', 'Formats');
        const formatDiv = Utils.createElement('div', '');
        formatDiv.style.display = 'flex';
        formatDiv.style.gap = '16px';
        formatDiv.style.marginTop = '8px';
        
        const format2D = Utils.createElement('label', '');
        format2D.innerHTML = '<input type="checkbox" value="2D" id="format2D"> 2D';
        
        const format3D = Utils.createElement('label', '');
        format3D.innerHTML = '<input type="checkbox" value="3D" id="format3D"> 3D';
        
        const formatIMAX = Utils.createElement('label', '');
        formatIMAX.innerHTML = '<input type="checkbox" value="IMAX" id="formatIMAX"> IMAX';
        
        formatDiv.appendChild(format2D);
        formatDiv.appendChild(format3D);
        formatDiv.appendChild(formatIMAX);
        
        formatGroup.appendChild(formatLabel);
        formatGroup.appendChild(formatDiv);
        
        const submitBtn = UIComponents.createButton('Add Movie', 'btn btn-primary');
        submitBtn.type = 'submit';
        submitBtn.style.width = '100%';
        submitBtn.style.marginTop = '16px';

        form.appendChild(nameGroup);
        form.appendChild(descGroup);
        form.appendChild(gridDiv);
        form.appendChild(gridDiv2);
        form.appendChild(castGroup);
        form.appendChild(formatGroup);
        form.appendChild(submitBtn);

        modalBody.appendChild(title);
        modalBody.appendChild(form);

        form.addEventListener('submit', (e) => {
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
        Utils.removeAllChildren(modalBody);

        const title = Utils.createElement('h2', '', 'Add New Theater');
        const form = Utils.createElement('form', '');
        form.id = 'theaterForm';

        const nameGroup = UIComponents.createFormGroup('Theater Name', 'text', 'theaterName', true);
        
        const cityOptions = [
            { value: '', text: 'Select City' },
            { value: 'mumbai', text: 'Mumbai' },
            { value: 'delhi', text: 'Delhi' },
            { value: 'bangalore', text: 'Bangalore' },
            { value: 'hyderabad', text: 'Hyderabad' },
            { value: 'pune', text: 'Pune' }
        ];
        
        const cityGroup = UIComponents.createSelectGroup('City', 'theaterCity', cityOptions, true);
        const addressGroup = UIComponents.createTextareaGroup('Address', 'theaterAddress', true);
        
        const screensGroup = UIComponents.createFormGroup('Number of Screens', 'number', 'theaterScreens', true);
        screensGroup.querySelector('input').min = '1';
        screensGroup.querySelector('input').max = '20';
        
        const submitBtn = UIComponents.createButton('Add Theater', 'btn btn-primary');
        submitBtn.type = 'submit';
        submitBtn.style.width = '100%';
        submitBtn.style.marginTop = '16px';

        form.appendChild(nameGroup);
        form.appendChild(cityGroup);
        form.appendChild(addressGroup);
        form.appendChild(screensGroup);
        form.appendChild(submitBtn);

        modalBody.appendChild(title);
        modalBody.appendChild(form);

        form.addEventListener('submit', (e) => {
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

    editMovie(movieId) {
        // Placeholder for edit functionality
        authManager.showErrorMessage('Edit functionality coming soon!');
    }

    editTheater(theaterId) {
        // Placeholder for edit functionality
        authManager.showErrorMessage('Edit functionality coming soon!');
    }

    editShow(showId) {
        // Placeholder for edit functionality
        authManager.showErrorMessage('Edit functionality coming soon!');
    }

    deleteShow(showId) {
        if (confirm('Are you sure you want to delete this show?')) {
            db.delete('shows', showId);
            authManager.showSuccessMessage('Show deleted successfully!');
            this.renderTabContent();
        }
    }

    showAddShowModal() {
        // Placeholder for add show functionality
        authManager.showErrorMessage('Add show functionality coming soon!');
    }
}

window.adminManager = new AdminManager();