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
        const citySelect = document.getElementById('citySelect');
        citySelect.addEventListener('change', (e) => {
            this.selectedCity = e.target.value;
            this.refreshCurrentPage();
        });

        this.attachFilterListeners();
    }

    attachFilterListeners() {
        const genreFilter = document.getElementById('genreFilter');
        const languageFilter = document.getElementById('languageFilter');
        const formatFilter = document.getElementById('formatFilter');

        if (genreFilter) {
            genreFilter.addEventListener('change', (e) => {
                this.currentFilters.genre = e.target.value;
                this.renderMoviesGrid();
            });
        }

        if (languageFilter) {
            languageFilter.addEventListener('change', (e) => {
                this.currentFilters.language = e.target.value;
                this.renderMoviesGrid();
            });
        }

        if (formatFilter) {
            formatFilter.addEventListener('change', (e) => {
                this.currentFilters.format = e.target.value;
                this.renderMoviesGrid();
            });
        }
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
        const movies = db.getAll('movies').slice(0, 4);
        const grid = document.getElementById('featuredMoviesGrid');
        
        if (!grid) return;

        Utils.removeAllChildren(grid);
        
        movies.forEach(movie => {
            const card = UIComponents.createMovieCard(movie);
            grid.appendChild(card);
        });

        this.attachMovieCardListeners();
    }

    renderMoviesGrid() {
        const movies = db.getMoviesByFilters(this.currentFilters);
        const grid = document.getElementById('moviesGrid');
        
        if (!grid) return;

        Utils.removeAllChildren(grid);

        if (movies.length === 0) {
            const emptyState = UIComponents.createEmptyState(
                'fa-film',
                'No movies found',
                'Try adjusting your filters to see more movies.'
            );
            emptyState.style.gridColumn = '1 / -1';
            grid.appendChild(emptyState);
            return;
        }

        movies.forEach(movie => {
            const card = UIComponents.createMovieCard(movie);
            grid.appendChild(card);
        });

        this.attachMovieCardListeners();
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
        const content = document.getElementById('movieDetailsContent');
        
        if (!movie) {
            const emptyState = UIComponents.createEmptyState(
                'fa-exclamation-triangle',
                'Movie not found',
                'The requested movie could not be found.'
            );
            Utils.removeAllChildren(content);
            content.appendChild(emptyState);
            return;
        }

        const shows = db.getShowsByMovie(movieId, this.selectedCity);
        
        Utils.removeAllChildren(content);

        const container = Utils.createElement('div', 'movie-details-container fade-in');
        
        // Movie poster
        const poster = Utils.createElement('div', 'movie-details-poster');
        const posterIcon = Utils.createElement('i', 'fas fa-film');
        poster.appendChild(posterIcon);
        
        // Movie info
        const info = Utils.createElement('div', 'movie-details-info');
        
        const title = Utils.createElement('h1', '', movie.name);
        
        const meta = Utils.createElement('div', 'movie-meta');
        const duration = Utils.createElement('span', '');
        duration.innerHTML = `<i class="fas fa-clock"></i> ${movie.duration} mins`;
        
        const language = Utils.createElement('span', '');
        language.innerHTML = `<i class="fas fa-language"></i> ${movie.language.charAt(0).toUpperCase() + movie.language.slice(1)}`;
        
        const genre = Utils.createElement('span', '');
        genre.innerHTML = `<i class="fas fa-tags"></i> ${movie.genre.charAt(0).toUpperCase() + movie.genre.slice(1)}`;
        
        const rating = Utils.createElement('span', 'movie-rating');
        const stars = Utils.createElement('span', 'rating-stars');
        stars.innerHTML = UIComponents.renderStars(movie.rating);
        rating.appendChild(stars);
        rating.appendChild(Utils.createElement('span', '', ` ${movie.rating}/5`));
        
        meta.appendChild(duration);
        meta.appendChild(language);
        meta.appendChild(genre);
        meta.appendChild(rating);
        
        const description = Utils.createElement('p', 'movie-description', movie.description);
        
        const cast = Utils.createElement('div', 'movie-cast');
        cast.innerHTML = `<strong>Cast:</strong> ${movie.cast.join(', ')}`;
        
        info.appendChild(title);
        info.appendChild(meta);
        info.appendChild(description);
        info.appendChild(cast);
        
        container.appendChild(poster);
        container.appendChild(info);
        
        // Shows section
        const showsSection = Utils.createElement('div', 'shows-section fade-in');
        const showsTitle = Utils.createElement('h2', '', 'Book Tickets');
        showsSection.appendChild(showsTitle);
        
        const showsContent = this.renderShows(shows);
        showsSection.appendChild(showsContent);
        
        content.appendChild(container);
        content.appendChild(showsSection);
    }

    renderShows(shows) {
        if (shows.length === 0) {
            return UIComponents.createEmptyState(
                'fa-calendar-times',
                'No shows available',
                `No shows available in ${this.selectedCity.charAt(0).toUpperCase() + this.selectedCity.slice(1)} for this movie.`
            );
        }

        const groupedShows = this.groupShowsByTheaterAndDate(shows);
        const container = Utils.createElement('div', 'shows-container');
        
        Object.entries(groupedShows).forEach(([theaterId, theaterData]) => {
            const theaterGroup = Utils.createElement('div', 'theater-group');
            
            const theaterName = Utils.createElement('div', 'theater-name');
            theaterName.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${theaterData.theater.name} - ${theaterData.theater.address}`;
            theaterGroup.appendChild(theaterName);
            
            Object.entries(theaterData.dates).forEach(([date, dateShows]) => {
                const showDate = Utils.createElement('div', 'show-date');
                
                const dateTitle = Utils.createElement('h4', '', Utils.formatShortDate(date));
                showDate.appendChild(dateTitle);
                
                const showTimes = Utils.createElement('div', 'show-times');
                
                dateShows.forEach(show => {
                    const timeBtn = Utils.createElement('button', 'show-time-btn');
                    timeBtn.dataset.showId = show.id;
                    timeBtn.innerHTML = `${show.time} - ${show.format}<br><small>₹${show.price}</small>`;
                    showTimes.appendChild(timeBtn);
                });
                
                showDate.appendChild(showTimes);
                theaterGroup.appendChild(showDate);
            });
            
            container.appendChild(theaterGroup);
        });
        
        // Attach show time listeners
        setTimeout(() => this.attachShowTimeListeners(), 100);
        
        return container;
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

window.moviesManager = new MoviesManager();