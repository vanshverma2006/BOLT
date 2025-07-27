// Simple localStorage-based database simulation
class Database {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize default data if not exists
        if (!localStorage.getItem('bookmyshow_users')) {
            const defaultUsers = [
                {
                    id: 'admin',
                    name: 'Admin User',
                    email: 'admin@bookmyshow.com',
                    password: 'admin123',
                    role: 'admin'
                }
            ];
            localStorage.setItem('bookmyshow_users', JSON.stringify(defaultUsers));
        }

        if (!localStorage.getItem('bookmyshow_movies')) {
            const defaultMovies = [
                {
                    id: 'movie1',
                    name: 'The Amazing Spider-Man',
                    description: 'A thrilling superhero adventure featuring Spider-Man in his most spectacular battle yet.',
                    language: 'english',
                    genre: 'action',
                    duration: 148,
                    rating: 4.5,
                    format: ['2D', '3D', 'IMAX'],
                    cast: ['Tom Holland', 'Zendaya', 'Willem Dafoe'],
                    poster: 'https://images.pexels.com/photos/7991158/pexels-photo-7991158.jpeg?auto=compress&cs=tinysrgb&w=400'
                },
                {
                    id: 'movie2',
                    name: 'Romantic Comedy',
                    description: 'A heartwarming romantic comedy that will make you laugh and cry.',
                    language: 'hindi',
                    genre: 'romance',
                    duration: 125,
                    rating: 4.2,
                    format: ['2D'],
                    cast: ['Actress Name', 'Actor Name'],
                    poster: 'https://images.pexels.com/photos/7991456/pexels-photo-7991456.jpeg?auto=compress&cs=tinysrgb&w=400'
                },
                {
                    id: 'movie3',
                    name: 'Horror Nights',
                    description: 'A spine-chilling horror movie that will keep you on the edge of your seat.',
                    language: 'english',
                    genre: 'horror',
                    duration: 110,
                    rating: 3.8,
                    format: ['2D', '3D'],
                    cast: ['Horror Actor', 'Scream Queen'],
                    poster: 'https://images.pexels.com/photos/7991234/pexels-photo-7991234.jpeg?auto=compress&cs=tinysrgb&w=400'
                },
                {
                    id: 'movie4',
                    name: 'Comedy Central',
                    description: 'A hilarious comedy that will leave you in splits with non-stop laughter.',
                    language: 'hindi',
                    genre: 'comedy',
                    duration: 135,
                    rating: 4.1,
                    format: ['2D'],
                    cast: ['Comedy Star', 'Funny Actor'],
                    poster: 'https://images.pexels.com/photos/7991789/pexels-photo-7991789.jpeg?auto=compress&cs=tinysrgb&w=400'
                },
                {
                    id: 'movie5',
                    name: 'Action Thriller',
                    description: 'An intense action thriller with heart-pounding sequences and stunning visuals.',
                    language: 'english',
                    genre: 'thriller',
                    duration: 142,
                    rating: 4.3,
                    format: ['2D', '3D', 'IMAX'],
                    cast: ['Action Hero', 'Thriller Star'],
                    poster: 'https://images.pexels.com/photos/7991567/pexels-photo-7991567.jpeg?auto=compress&cs=tinysrgb&w=400'
                },
                {
                    id: 'movie6',
                    name: 'Drama Queen',
                    description: 'An emotional drama that explores the depths of human relationships and love.',
                    language: 'tamil',
                    genre: 'drama',
                    duration: 158,
                    rating: 4.4,
                    format: ['2D'],
                    cast: ['Drama Actor', 'Emotional Star'],
                    poster: 'https://images.pexels.com/photos/7991890/pexels-photo-7991890.jpeg?auto=compress&cs=tinysrgb&w=400'
                }
            ];
            localStorage.setItem('bookmyshow_movies', JSON.stringify(defaultMovies));
        }

        if (!localStorage.getItem('bookmyshow_theaters')) {
            const defaultTheaters = [
                {
                    id: 'theater1',
                    name: 'PVR Cinemas',
                    city: 'mumbai',
                    address: 'Phoenix Mills, Lower Parel',
                    screens: 8
                },
                {
                    id: 'theater2',
                    name: 'INOX Multiplex',
                    city: 'mumbai',
                    address: 'R City Mall, Ghatkopar',
                    screens: 6
                },
                {
                    id: 'theater3',
                    name: 'Cinepolis',
                    city: 'delhi',
                    address: 'DLF Mall of India, Noida',
                    screens: 10
                },
                {
                    id: 'theater4',
                    name: 'PVR Select City',
                    city: 'delhi',
                    address: 'Select City Walk, Saket',
                    screens: 12
                }
            ];
            localStorage.setItem('bookmyshow_theaters', JSON.stringify(defaultTheaters));
        }

        if (!localStorage.getItem('bookmyshow_shows')) {
            const defaultShows = this.generateDefaultShows();
            localStorage.setItem('bookmyshow_shows', JSON.stringify(defaultShows));
        }

        if (!localStorage.getItem('bookmyshow_bookings')) {
            localStorage.setItem('bookmyshow_bookings', JSON.stringify([]));
        }
    }

    generateDefaultShows() {
        const movies = JSON.parse(localStorage.getItem('bookmyshow_movies') || '[]');
        const theaters = JSON.parse(localStorage.getItem('bookmyshow_theaters') || '[]');
        const shows = [];
        const times = ['10:00', '13:30', '17:00', '20:30'];
        
        let showId = 1;
        
        movies.forEach(movie => {
            theaters.forEach(theater => {
                times.forEach(time => {
                    // Generate shows for next 7 days
                    for (let day = 0; day < 7; day++) {
                        const showDate = new Date();
                        showDate.setDate(showDate.getDate() + day);
                        
                        const show = {
                            id: `show${showId++}`,
                            movieId: movie.id,
                            theaterId: theater.id,
                            date: showDate.toISOString().split('T')[0],
                            time: time,
                            price: this.getRandomPrice(),
                            seats: this.generateSeats(),
                            format: movie.format[Math.floor(Math.random() * movie.format.length)]
                        };
                        shows.push(show);
                    }
                });
            });
        });
        
        return shows;
    }

    generateSeats() {
        const seats = {};
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatsPerRow = 12;
        
        rows.forEach(row => {
            for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                const seatId = `${row}${seatNum}`;
                // Randomly book some seats (20% chance)
                seats[seatId] = Math.random() < 0.2 ? 'booked' : 'available';
            }
        });
        
        return seats;
    }

    getRandomPrice() {
        const prices = [150, 200, 250, 300, 350, 400];
        return prices[Math.floor(Math.random() * prices.length)];
    }

    // Generic CRUD operations
    create(table, data) {
        const items = this.getAll(table);
        data.id = data.id || this.generateId();
        items.push(data);
        localStorage.setItem(`bookmyshow_${table}`, JSON.stringify(items));
        return data;
    }

    getAll(table) {
        return JSON.parse(localStorage.getItem(`bookmyshow_${table}`) || '[]');
    }

    getById(table, id) {
        const items = this.getAll(table);
        return items.find(item => item.id === id);
    }

    update(table, id, data) {
        const items = this.getAll(table);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            localStorage.setItem(`bookmyshow_${table}`, JSON.stringify(items));
            return items[index];
        }
        return null;
    }

    delete(table, id) {
        const items = this.getAll(table);
        const filteredItems = items.filter(item => item.id !== id);
        localStorage.setItem(`bookmyshow_${table}`, JSON.stringify(filteredItems));
        return true;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Specific query methods
    getUserByEmail(email) {
        const users = this.getAll('users');
        return users.find(user => user.email === email);
    }

    getMoviesByFilters(filters) {
        let movies = this.getAll('movies');
        
        if (filters.genre) {
            movies = movies.filter(movie => movie.genre === filters.genre);
        }
        
        if (filters.language) {
            movies = movies.filter(movie => movie.language === filters.language);
        }
        
        if (filters.format) {
            movies = movies.filter(movie => movie.format.includes(filters.format));
        }
        
        return movies;
    }

    getShowsByMovie(movieId, city) {
        const shows = this.getAll('shows');
        const theaters = this.getAll('theaters');
        
        return shows
            .filter(show => show.movieId === movieId)
            .map(show => {
                const theater = theaters.find(t => t.id === show.theaterId);
                return {
                    ...show,
                    theater: theater
                };
            })
            .filter(show => !city || show.theater.city === city);
    }

    getBookingsByUser(userId) {
        const bookings = this.getAll('bookings');
        return bookings.filter(booking => booking.userId === userId);
    }

    bookSeats(showId, seatIds) {
        const shows = this.getAll('shows');
        const show = shows.find(s => s.id === showId);
        
        if (!show) return false;
        
        // Check if all seats are available
        const unavailableSeats = seatIds.filter(seatId => show.seats[seatId] !== 'available');
        if (unavailableSeats.length > 0) {
            return false;
        }
        
        // Book the seats
        seatIds.forEach(seatId => {
            show.seats[seatId] = 'booked';
        });
        
        localStorage.setItem('bookmyshow_shows', JSON.stringify(shows));
        return true;
    }
}

// Create global database instance
window.db = new Database();