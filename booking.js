// Booking module
class BookingManager {
    constructor() {
        this.selectedSeats = [];
        this.currentShow = null;
        this.currentMovie = null;
        this.currentTheater = null;
    }

    renderSeatSelection(showId) {
        this.currentShow = db.getById('shows', showId);
        if (!this.currentShow) {
            document.getElementById('seatSelectionContent').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Show not found</h3>
                    <p>The requested show could not be found.</p>
                </div>
            `;
            return;
        }

        this.currentMovie = db.getById('movies', this.currentShow.movieId);
        this.currentTheater = db.getById('theaters', this.currentShow.theaterId);
        this.selectedSeats = [];

        const showDate = new Date(this.currentShow.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        document.getElementById('seatSelectionContent').innerHTML = `
            <div class="seat-selection-container fade-in">
                <div class="movie-show-info">
                    <h1>${this.currentMovie.name}</h1>
                    <p><i class="fas fa-map-marker-alt"></i> ${this.currentTheater.name}</p>
                    <p><i class="fas fa-calendar"></i> ${showDate} at ${this.currentShow.time}</p>
                    <p><i class="fas fa-film"></i> ${this.currentShow.format}</p>
                </div>

                <div class="theater-screen">
                    <i class="fas fa-desktop"></i> SCREEN
                </div>

                <div class="seat-map">
                    ${this.renderSeatMap()}
                </div>

                <div class="seat-legend">
                    <div class="legend-item">
                        <div class="legend-seat" style="background: var(--bg-secondary); border: 2px solid var(--success-color);"></div>
                        <span>Available</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-seat" style="background: var(--primary-color);"></div>
                        <span>Selected</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-seat" style="background: var(--text-secondary);"></div>
                        <span>Booked</span>
                    </div>
                </div>

                <div class="booking-summary">
                    <h3>Booking Summary</h3>
                    <div id="selectedSeatsInfo">
                        <p>Please select seats to continue</p>
                    </div>
                    <div id="bookingActions" style="display: none;">
                        <button class="btn-primary" id="proceedToPayment" style="width: 100%;">
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.attachSeatListeners();
    }

    renderSeatMap() {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatsPerRow = 12;
        
        return rows.map(row => {
            const seats = [];
            for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                const seatId = `${row}${seatNum}`;
                const seatStatus = this.currentShow.seats[seatId] || 'available';
                
                seats.push(`
                    <div class="seat ${seatStatus}" data-seat-id="${seatId}">
                        ${seatNum}
                    </div>
                `);
            }
            
            return `
                <div class="seat-row">
                    <div class="seat-row-label">${row}</div>
                    ${seats.join('')}
                </div>
            `;
        }).join('');
    }

    attachSeatListeners() {
        document.querySelectorAll('.seat.available').forEach(seat => {
            seat.addEventListener('click', () => {
                const seatId = seat.dataset.seatId;
                this.toggleSeat(seatId, seat);
            });
        });

        document.getElementById('proceedToPayment')?.addEventListener('click', () => {
            this.proceedToPayment();
        });
    }

    toggleSeat(seatId, seatElement) {
        if (seatElement.classList.contains('selected')) {
            seatElement.classList.remove('selected');
            seatElement.classList.add('available');
            this.selectedSeats = this.selectedSeats.filter(id => id !== seatId);
        } else {
            if (this.selectedSeats.length >= 6) {
                authManager.showErrorMessage('You can select maximum 6 seats');
                return;
            }
            seatElement.classList.remove('available');
            seatElement.classList.add('selected');
            this.selectedSeats.push(seatId);
        }
        
        this.updateBookingSummary();
    }

    updateBookingSummary() {
        const selectedSeatsInfo = document.getElementById('selectedSeatsInfo');
        const bookingActions = document.getElementById('bookingActions');
        
        if (this.selectedSeats.length === 0) {
            selectedSeatsInfo.innerHTML = '<p>Please select seats to continue</p>';
            bookingActions.style.display = 'none';
            return;
        }
        
        const totalAmount = this.selectedSeats.length * this.currentShow.price;
        const taxes = Math.round(totalAmount * 0.18);
        const finalAmount = totalAmount + taxes;
        
        selectedSeatsInfo.innerHTML = `
            <div class="summary-item">
                <span>Selected Seats:</span>
                <span>${this.selectedSeats.join(', ')}</span>
            </div>
            <div class="summary-item">
                <span>Seats (${this.selectedSeats.length}):</span>
                <span>₹${totalAmount}</span>
            </div>
            <div class="summary-item">
                <span>Taxes & Fees:</span>
                <span>₹${taxes}</span>
            </div>
            <div class="summary-item summary-total">
                <span>Total Amount:</span>
                <span>₹${finalAmount}</span>
            </div>
        `;
        
        bookingActions.style.display = 'block';
    }

    proceedToPayment() {
        if (this.selectedSeats.length === 0) {
            authManager.showErrorMessage('Please select at least one seat');
            return;
        }

        // Simulate payment processing
        this.showPaymentModal();
    }

    showPaymentModal() {
        const totalAmount = this.selectedSeats.length * this.currentShow.price;
        const taxes = Math.round(totalAmount * 0.18);
        const finalAmount = totalAmount + taxes;

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Payment</h2>
            <div class="payment-summary">
                <h3>Booking Summary</h3>
                <div class="summary-item">
                    <span>Movie:</span>
                    <span>${this.currentMovie.name}</span>
                </div>
                <div class="summary-item">
                    <span>Theater:</span>
                    <span>${this.currentTheater.name}</span>
                </div>
                <div class="summary-item">
                    <span>Date & Time:</span>
                    <span>${this.currentShow.date} at ${this.currentShow.time}</span>
                </div>
                <div class="summary-item">
                    <span>Seats:</span>
                    <span>${this.selectedSeats.join(', ')}</span>
                </div>
                <div class="summary-item summary-total">
                    <span>Total Amount:</span>
                    <span>₹${finalAmount}</span>
                </div>
            </div>
            
            <form id="paymentForm" style="margin-top: 24px;">
                <div class="form-group">
                    <label class="form-label">Card Number</label>
                    <input type="text" class="form-input" placeholder="1234 5678 9012 3456" maxlength="19" required>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">Expiry Date</label>
                        <input type="text" class="form-input" placeholder="MM/YY" maxlength="5" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">CVV</label>
                        <input type="text" class="form-input" placeholder="123" maxlength="3" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Cardholder Name</label>
                    <input type="text" class="form-input" placeholder="John Doe" required>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 16px;">
                    <i class="fas fa-lock"></i> Pay ₹${finalAmount}
                </button>
            </form>
            <p style="text-align: center; font-size: 0.875rem; color: var(--text-secondary); margin-top: 16px;">
                This is a demo payment. No actual transaction will be processed.
            </p>
        `;

        document.getElementById('paymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });

        authManager.showModal();
    }

    processPayment() {
        // Simulate payment processing delay
        const paymentButton = document.querySelector('#paymentForm button');
        paymentButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        paymentButton.disabled = true;

        setTimeout(() => {
            // Book the seats
            const bookingSuccess = db.bookSeats(this.currentShow.id, this.selectedSeats);
            
            if (bookingSuccess) {
                // Create booking record
                const totalAmount = this.selectedSeats.length * this.currentShow.price;
                const taxes = Math.round(totalAmount * 0.18);
                const finalAmount = totalAmount + taxes;
                
                const booking = {
                    id: db.generateId(),
                    userId: authManager.currentUser.id,
                    showId: this.currentShow.id,
                    movieId: this.currentMovie.id,
                    theaterId: this.currentTheater.id,
                    seats: [...this.selectedSeats],
                    amount: finalAmount,
                    bookingDate: new Date().toISOString(),
                    status: 'confirmed'
                };
                
                db.create('bookings', booking);
                
                authManager.hideModal();
                window.router.navigate('booking-confirmation', { bookingId: booking.id });
            } else {
                authManager.showErrorMessage('Booking failed. Some seats may have been booked by others.');
                paymentButton.innerHTML = '<i class="fas fa-lock"></i> Pay ₹' + finalAmount;
                paymentButton.disabled = false;
            }
        }, 2000);
    }

    renderBookingConfirmation(bookingId) {
        const booking = db.getById('bookings', bookingId);
        if (!booking) {
            document.getElementById('bookingConfirmationContent').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Booking not found</h3>
                </div>
            `;
            return;
        }

        const movie = db.getById('movies', booking.movieId);
        const theater = db.getById('theaters', booking.theaterId);
        const show = db.getById('shows', booking.showId);

        document.getElementById('bookingConfirmationContent').innerHTML = `
            <div class="booking-confirmation fade-in">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h1>Booking Confirmed!</h1>
                <p>Your tickets have been booked successfully.</p>
                
                <div class="ticket">
                    <div class="ticket-header">
                        <div class="ticket-id">Booking ID: ${booking.id}</div>
                        <div class="qr-code">
                            <i class="fas fa-qrcode"></i>
                        </div>
                    </div>
                    <div class="ticket-details">
                        <div class="summary-item">
                            <span>Movie:</span>
                            <span>${movie.name}</span>
                        </div>
                        <div class="summary-item">
                            <span>Theater:</span>
                            <span>${theater.name}</span>
                        </div>
                        <div class="summary-item">
                            <span>Date & Time:</span>
                            <span>${show.date} at ${show.time}</span>
                        </div>
                        <div class="summary-item">
                            <span>Seats:</span>
                            <span>${booking.seats.join(', ')}</span>
                        </div>
                        <div class="summary-item">
                            <span>Amount Paid:</span>
                            <span>₹${booking.amount}</span>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 16px; justify-content: center; margin-top: 32px;">
                    <button class="btn-primary" onclick="window.print()">
                        <i class="fas fa-print"></i> Print Ticket
                    </button>
                    <button class="btn-secondary" onclick="window.router.navigate('home')">
                        <i class="fas fa-home"></i> Back to Home
                    </button>
                </div>
            </div>
        `;
    }

    renderUserBookings() {
        if (!authManager.requireAuth()) return;

        const bookings = db.getBookingsByUser(authManager.currentUser.id);
        const bookingsContent = document.getElementById('bookingsContent');

        if (bookings.length === 0) {
            bookingsContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>No bookings found</h3>
                    <p>You haven't made any bookings yet.</p>
                    <button class="btn-primary" onclick="window.router.navigate('movies')">
                        Browse Movies
                    </button>
                </div>
            `;
            return;
        }

        const bookingCards = bookings.map(booking => {
            const movie = db.getById('movies', booking.movieId);
            const theater = db.getById('theaters', booking.theaterId);
            const show = db.getById('shows', booking.showId);
            
            const bookingDate = new Date(booking.bookingDate).toLocaleDateString();
            const showDate = new Date(show.date).toLocaleDateString();
            
            return `
                <div class="booking-card">
                    <div class="booking-header">
                        <h3>${movie.name}</h3>
                        <span class="booking-status status-${booking.status}">${booking.status.toUpperCase()}</span>
                    </div>
                    <div class="booking-details">
                        <div class="booking-info">
                            <p><i class="fas fa-map-marker-alt"></i> ${theater.name}</p>
                            <p><i class="fas fa-calendar"></i> ${showDate} at ${show.time}</p>
                            <p><i class="fas fa-chair"></i> Seats: ${booking.seats.join(', ')}</p>
                            <p><i class="fas fa-credit-card"></i> Amount: ₹${booking.amount}</p>
                            <p><i class="fas fa-clock"></i> Booked on: ${bookingDate}</p>
                        </div>
                        <div class="booking-actions">
                            <button class="btn-secondary btn-sm" onclick="bookingManager.showTicket('${booking.id}')">
                                <i class="fas fa-ticket-alt"></i> View Ticket
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        bookingsContent.innerHTML = `
            <div class="bookings-grid fade-in">
                ${bookingCards}
            </div>
        `;
    }

    showTicket(bookingId) {
        const booking = db.getById('bookings', bookingId);
        const movie = db.getById('movies', booking.movieId);
        const theater = db.getById('theaters', booking.theaterId);
        const show = db.getById('shows', booking.showId);

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="ticket">
                <div class="ticket-header">
                    <div class="ticket-id">Booking ID: ${booking.id}</div>
                    <div class="qr-code">
                        <i class="fas fa-qrcode"></i>
                    </div>
                </div>
                <div class="ticket-details">
                    <div class="summary-item">
                        <span>Movie:</span>
                        <span>${movie.name}</span>
                    </div>
                    <div class="summary-item">
                        <span>Theater:</span>
                        <span>${theater.name}</span>
                    </div>
                    <div class="summary-item">
                        <span>Date & Time:</span>
                        <span>${show.date} at ${show.time}</span>
                    </div>
                    <div class="summary-item">
                        <span>Seats:</span>
                        <span>${booking.seats.join(', ')}</span>
                    </div>
                    <div class="summary-item">
                        <span>Amount Paid:</span>
                        <span>₹${booking.amount}</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 16px; justify-content: center; margin-top: 24px;">
                <button class="btn-primary" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Ticket
                </button>
            </div>
        `;

        authManager.showModal();
    }
}

// Add booking card styles
const bookingStyles = document.createElement('style');
bookingStyles.textContent = `
    .bookings-grid {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .booking-card {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 24px;
        box-shadow: var(--shadow-sm);
    }
    
    .booking-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--border-color);
    }
    
    .booking-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }
    
    .booking-status {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-confirmed {
        background: var(--success-color);
        color: white;
    }
    
    .booking-details {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
    }
    
    .booking-info p {
        margin: 8px 0;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-secondary);
    }
    
    .booking-info i {
        width: 16px;
        color: var(--primary-color);
    }
    
    .btn-sm {
        padding: 8px 16px;
        font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
        .booking-details {
            flex-direction: column;
            gap: 16px;
        }
        
        .booking-actions {
            align-self: stretch;
        }
        
        .booking-actions button {
            width: 100%;
        }
    }
`;
document.head.appendChild(bookingStyles);

// Initialize booking manager
window.bookingManager = new BookingManager();