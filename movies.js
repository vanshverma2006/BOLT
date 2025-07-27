// Movies module
class MoviesManager {
    constructor() {
        this.currentFilters = {
            genre: '',
            language: '',
            format: ''
        };
        this.selectedCity = 'mumbai';
        this.initializeMovies();
    }

    initializeMovies() {
        // City selector
        document.getElementById('citySelect').addEventListener('change', (e) => {
            this.selectedCity = e.target.value;
            this.refreshCurrentPage();
        });

        // Filter event listeners
        document.getElementById('genreFilter')?.addEventListener('change', (e) => {
            this.currentFilters.genre = e.target.value;
            this.renderMoviesGrid();
        });

        document.getElementById('languageFilter')?.addEventListener('change', (e) => {
            this.currentFilters.language = e.target.value;
            this.renderMoviesGrid();
        });

        document.getElementById('formatFilter')?.addEventListener('change', (e) => {
            this.currentFilters.format = e.target.value;
            this.renderMoviesGrid();
        });
    }

    refreshCurrentPage() {
        const currentRoute = window.location.hash.slice(1) || 'home';
        if (currentRoute === 'home') {
            this.renderFeaturedMovies();
        } else if (currentRoute === 'movies') {
            this.renderMoviesGrid();
        }
    }

    renderFeaturedMovies() {
        const movies = db.getAll('movies').slice(0, 4); // Show only first 4 movies
        const grid = document.getElementById('featuredMoviesGrid');
        
        if (!grid) return;

        grid.innerHTML = movies.map(movie => this.createMovieCard(movie)).join('');
        this.attachMovieCardListeners();
    }

    renderMoviesGrid() {
        const movies = db.getMoviesByFilters(this.currentFilters);
        const grid = document.getElementById('moviesGrid');
        
        if (!grid) return;

        if (movies.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-film"></i>
                    <h3>No movies found</h3>
                    <p>Try adjusting your filters to see more movies.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = movies.map(movie => this.createMovieCard(movie)).join('');
        this.attachMovieCardListeners();
    }

    createMovieCard(movie) {
        const stars = this.renderStars(movie.rating);
        return `
            <div class="movie-card fade-in" data-movie-id="${movie.id}">
                <div class="movie-poster">
                    <i class="fas fa-film"></i>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.name}</h3>
                    <div class="movie-details">
                        <div class="movie-genre">${movie.genre.charAt(0).toUpperCase() + movie.genre.slice(1)}</div>
                        <div class="movie-language">${movie.language.charAt(0).toUpperCase() + movie.language.slice(1)}</div>
                        <div class="movie-rating">
                            <span class="rating-stars">${stars}</span>
                            <span>${movie.rating}/5</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    attachMovieCardListeners() {
        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                const movieId = card.dataset.movieId;
                window.router.navigate('movie-details', { movieId });
            });
        });
    }

    renderMovieDetails(movieId) {
        const movie = db.getById('movies', movieId);
        if (!movie) {
            document.getElementById('movieDetailsContent').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Movie not found</h3>
                    <p>The requested movie could not be found.</p>
                </div>
            `;
            return;
        }

        const shows = db.getShowsByMovie(movieId, this.selectedCity);
        const stars = this.renderStars(movie.rating);

        document.getElementById('movieDetailsContent').innerHTML = `
            <div class="movie-details-container fade-in">
                <div class="movie-details-poster">
                    <i class="fas fa-film"></i>
                </div>
                <div class="movie-details-info">
                    <h1>${movie.name}</h1>
                    <div class="movie-meta">
                        <span><i class="fas fa-clock"></i> ${movie.duration} mins</span>
                        <span><i class="fas fa-language"></i> ${movie.language.charAt(0).toUpperCase() + movie.language.slice(1)}</span>
                        <span><i class="fas fa-tags"></i> ${movie.genre.charAt(0).toUpperCase() + movie.genre.slice(1)}</span>
                        <span class="movie-rating">
                            <span class="rating-stars">${stars}</span>
                            ${movie.rating}/5
                        </span>
                    </div>
                    <p class="movie-description">${movie.description}</p>
                    <div class="movie-cast">
                        <strong>Cast:</strong> ${movie.cast.join(', ')}
                    </div>
                </div>
            </div>
            
            <div class="shows-section fade-in">
                <h2>Book Tickets</h2>
                ${this.renderShows(shows)}
            </div>
        `;
    }

    renderShows(shows) {
        if (shows.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No shows available</h3>
                    <p>No shows available in ${this.selectedCity.charAt(0).toUpperCase() + this.selectedCity.slice(1)} for this movie.</p>
                </div>
            `;
        }

        // Group shows by theater and date
        const groupedShows = this.groupShowsByTheaterAndDate(shows);
        
        return Object.entries(groupedShows).map(([theaterId, theaterData]) => {
            const theaterShows = Object.entries(theaterData.dates).map(([date, dateShows]) => {
                const formattedDate = new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });
                
                const showTimes = dateShows.map(show => `
                    <button class="show-time-btn" data-show-id="${show.id}">
                        ${show.time} - ${show.format}
                        <br><small>₹${show.price}</small>
                    </button>
                `).join('');
                
                return `
                    <div class="show-date">
                        <h4>${formattedDate}</h4>
                        <div class="show-times">${showTimes}</div>
                    </div>
                `;
            }).join('');
            
            return `
                <div class="theater-group">
                    <div class="theater-name">
                        <i class="fas fa-map-marker-alt"></i>
                        ${theaterData.theater.name} - ${theaterData.theater.address}
                    </div>
                    ${theaterShows}
                </div>
            `;
        }).join('');
    }

    groupShowsByTheaterAndDate(shows) {
        const grouped = {};
        
        shows.forEach(show => {
            if (!grouped[show.theater.id]) {
                grouped[show.theater.id] = {
                    theater: show.theater,
                    dates: {}
                };
            }
            
            if (!grouped[show.theater.id].dates[show.date]) {
                grouped[show.theater.id].dates[show.date] = [];
            }
            
            grouped[show.theater.id].dates[show.date].push(show);
        });
        
        return grouped;
    }

    attachShowTimeListeners() {
        document.querySelectorAll('.show-time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!authManager.requireAuth()) return;
                
                const showId = btn.dataset.showId;
                window.router.navigate('seat-selection', { showId });
            });
        });
    }
}

// Initialize movies manager
window.moviesManager = new MoviesManager();