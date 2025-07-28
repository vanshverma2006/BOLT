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
            const content = document.getElementById('seatSelectionContent');
            const emptyState = UIComponents.createEmptyState(
                'fa-exclamation-triangle',
                'Show not found',
                'The requested show could not be found.'
            );
            Utils.removeAllChildren(content);
            content.appendChild(emptyState);
            return;
        }

        this.currentMovie = db.getById('movies', this.currentShow.movieId);
        this.currentTheater = db.getById('theaters', this.currentShow.theaterId);
        this.selectedSeats = [];

        const content = document.getElementById('seatSelectionContent');
        Utils.removeAllChildren(content);

        const container = Utils.createElement('div', 'seat-selection-container fade-in');
        
        // Movie show info
        const showInfo = this.createShowInfo();
        container.appendChild(showInfo);
        
        // Theater screen
        const screen = Utils.createElement('div', 'theater-screen');
        screen.innerHTML = '<i class="fas fa-desktop"></i> SCREEN';
        container.appendChild(screen);
        
        // Seat map
        const seatMap = this.createSeatMap();
        container.appendChild(seatMap);
        
        // Seat legend
        const legend = this.createSeatLegend();
        container.appendChild(legend);
        
        // Booking summary
        const summary = this.createBookingSummary();
        container.appendChild(summary);
        
        content.appendChild(container);
        this.attachSeatListeners();
    }

    createShowInfo() {
        const info = Utils.createElement('div', 'movie-show-info');
        
        const title = Utils.createElement('h1', '', this.currentMovie.name);
        
        const theater = Utils.createElement('p', '');
        theater.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${this.currentTheater.name}`;
        
        const date = Utils.createElement('p', '');
        date.innerHTML = `<i class="fas fa-calendar"></i> ${Utils.formatDate(this.currentShow.date)} at ${this.currentShow.time}`;
        
        const format = Utils.createElement('p', '');
        format.innerHTML = `<i class="fas fa-film"></i> ${this.currentShow.format}`;
        
        info.appendChild(title);
        info.appendChild(theater);
        info.appendChild(date);
        info.appendChild(format);
        
        return info;
    }

    createSeatMap() {
        const seatMap = Utils.createElement('div', 'seat-map');
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatsPerRow = 12;
        
        rows.forEach(row => {
            const seats = [];
            for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                const seatId = `${row}${seatNum}`;
                const seatStatus = this.currentShow.seats[seatId] || 'available';
                const seat = UIComponents.createSeat(seatId, seatStatus);
                seats.push(seat);
            }
            
            const seatRow = UIComponents.createSeatRow(row, seats);
            seatMap.appendChild(seatRow);
        });
        
        return seatMap;
    }

    createSeatLegend() {
        const legend = Utils.createElement('div', 'seat-legend');
        
        const availableItem = Utils.createElement('div', 'legend-item');
        const availableSeat = Utils.createElement('div', 'legend-seat');
        availableSeat.style.background = 'var(--bg-secondary)';
        availableSeat.style.border = '2px solid var(--success-color)';
        availableItem.appendChild(availableSeat);
        availableItem.appendChild(Utils.createElement('span', '', 'Available'));
        
        const selectedItem = Utils.createElement('div', 'legend-item');
        const selectedSeat = Utils.createElement('div', 'legend-seat');
        selectedSeat.style.background = 'var(--primary-color)';
        selectedItem.appendChild(selectedSeat);
        selectedItem.appendChild(Utils.createElement('span', '', 'Selected'));
        
        const bookedItem = Utils.createElement('div', 'legend-item');
        const bookedSeat = Utils.createElement('div', 'legend-seat');
        bookedSeat.style.background = 'var(--text-secondary)';
        bookedItem.appendChild(bookedSeat);
        bookedItem.appendChild(Utils.createElement('span', '', 'Booked'));
        
        legend.appendChild(availableItem);
        legend.appendChild(selectedItem);
        legend.appendChild(bookedItem);
        
        return legend;
    }

    createBookingSummary() {
        const summary = Utils.createElement('div', 'booking-summary');
        
        const title = Utils.createElement('h3', '', 'Booking Summary');
        summary.appendChild(title);
        
        const info = Utils.createElement('div', '');
        info.id = 'selectedSeatsInfo';
        info.appendChild(Utils.createElement('p', '', 'Please select seats to continue'));
        summary.appendChild(info);
        
        const actions = Utils.createElement('div', 'hidden');
        actions.id = 'bookingActions';
        const proceedBtn = UIComponents.createButton('Proceed to Payment', 'btn btn-primary');
        proceedBtn.id = 'proceedToPayment';
        proceedBtn.style.width = '100%';
        actions.appendChild(proceedBtn);
        summary.appendChild(actions);
        
        return summary;
    }

    attachSeatListeners() {
        document.querySelectorAll('.seat.available').forEach(seat => {
            seat.addEventListener('click', () => {
                const seatId = seat.dataset.seatId;
                this.toggleSeat(seatId, seat);
            });
        });

        const proceedBtn = document.getElementById('proceedToPayment');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                this.proceedToPayment();
            });
        }
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
        
        Utils.removeAllChildren(selectedSeatsInfo);
        
        if (this.selectedSeats.length === 0) {
            selectedSeatsInfo.appendChild(Utils.createElement('p', '', 'Please select seats to continue'));
            Utils.hideElement(bookingActions);
            return;
        }
        
        const totalAmount = this.selectedSeats.length * this.currentShow.price;
        const taxes = Math.round(totalAmount * 0.18);
        const finalAmount = totalAmount + taxes;
        
        const seatsItem = UIComponents.createSummaryItem('Selected Seats:', this.selectedSeats.join(', '));
        const seatsCountItem = UIComponents.createSummaryItem(`Seats (${this.selectedSeats.length}):`, Utils.formatCurrency(totalAmount));
        const taxesItem = UIComponents.createSummaryItem('Taxes & Fees:', Utils.formatCurrency(taxes));
        const totalItem = UIComponents.createSummaryItem('Total Amount:', Utils.formatCurrency(finalAmount));
        totalItem.classList.add('summary-total');
        
        selectedSeatsInfo.appendChild(seatsItem);
        selectedSeatsInfo.appendChild(seatsCountItem);
        selectedSeatsInfo.appendChild(taxesItem);
        selectedSeatsInfo.appendChild(totalItem);
        
        Utils.showElement(bookingActions);
    }

    proceedToPayment() {
        if (this.selectedSeats.length === 0) {
            authManager.showErrorMessage('Please select at least one seat');
            return;
        }

        this.showPaymentModal();
    }

    showPaymentModal() {
        const totalAmount = this.selectedSeats.length * this.currentShow.price;
        const taxes = Math.round(totalAmount * 0.18);
        const finalAmount = totalAmount + taxes;

        const modalBody = document.getElementById('modalBody');
        Utils.removeAllChildren(modalBody);

        const title = Utils.createElement('h2', '', 'Payment');
        
        const summary = Utils.createElement('div', 'payment-summary');
        const summaryTitle = Utils.createElement('h3', '', 'Booking Summary');
        
        const movieItem = UIComponents.createSummaryItem('Movie:', this.currentMovie.name);
        const theaterItem = UIComponents.createSummaryItem('Theater:', this.currentTheater.name);
        const dateTimeItem = UIComponents.createSummaryItem('Date & Time:', `${this.currentShow.date} at ${this.currentShow.time}`);
        const seatsItem = UIComponents.createSummaryItem('Seats:', this.selectedSeats.join(', '));
        const totalItem = UIComponents.createSummaryItem('Total Amount:', Utils.formatCurrency(finalAmount));
        totalItem.classList.add('summary-total');
        
        summary.appendChild(summaryTitle);
        summary.appendChild(movieItem);
        summary.appendChild(theaterItem);
        summary.appendChild(dateTimeItem);
        summary.appendChild(seatsItem);
        summary.appendChild(totalItem);
        
        const form = Utils.createElement('form', '');
        form.id = 'paymentForm';
        form.style.marginTop = '24px';
        
        const cardGroup = UIComponents.createFormGroup('Card Number', 'text', 'cardNumber', true);
        cardGroup.querySelector('input').placeholder = '1234 5678 9012 3456';
        cardGroup.querySelector('input').maxLength = 19;
        
        const gridDiv = Utils.createElement('div', '');
        gridDiv.style.display = 'grid';
        gridDiv.style.gridTemplateColumns = '1fr 1fr';
        gridDiv.style.gap = '16px';
        
        const expiryGroup = UIComponents.createFormGroup('Expiry Date', 'text', 'expiryDate', true);
        expiryGroup.querySelector('input').placeholder = 'MM/YY';
        expiryGroup.querySelector('input').maxLength = 5;
        
        const cvvGroup = UIComponents.createFormGroup('CVV', 'text', 'cvv', true);
        cvvGroup.querySelector('input').placeholder = '123';
        cvvGroup.querySelector('input').maxLength = 3;
        
        gridDiv.appendChild(expiryGroup);
        gridDiv.appendChild(cvvGroup);
        
        const nameGroup = UIComponents.createFormGroup('Cardholder Name', 'text', 'cardholderName', true);
        nameGroup.querySelector('input').placeholder = 'John Doe';
        
        const submitBtn = UIComponents.createButton(`Pay ${Utils.formatCurrency(finalAmount)}`, 'btn btn-primary');
        submitBtn.type = 'submit';
        submitBtn.style.width = '100%';
        submitBtn.style.marginTop = '16px';
        submitBtn.innerHTML = `<i class="fas fa-lock"></i> Pay ${Utils.formatCurrency(finalAmount)}`;
        
        const disclaimer = Utils.createElement('p', '');
        disclaimer.style.textAlign = 'center';
        disclaimer.style.fontSize = '0.875rem';
        disclaimer.style.color = 'var(--text-secondary)';
        disclaimer.style.marginTop = '16px';
        disclaimer.textContent = 'This is a demo payment. No actual transaction will be processed.';
        
        form.appendChild(cardGroup);
        form.appendChild(gridDiv);
        form.appendChild(nameGroup);
        form.appendChild(submitBtn);
        
        modalBody.appendChild(title);
        modalBody.appendChild(summary);
        modalBody.appendChild(form);
        modalBody.appendChild(disclaimer);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });

        authManager.showModal();
    }

    processPayment() {
        const paymentButton = document.querySelector('#paymentForm button');
        paymentButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        paymentButton.disabled = true;

        setTimeout(() => {
            const bookingSuccess = db.bookSeats(this.currentShow.id, this.selectedSeats);
            
            if (bookingSuccess) {
                const totalAmount = this.selectedSeats.length * this.currentShow.price;
                const taxes = Math.round(totalAmount * 0.18);
                const finalAmount = totalAmount + taxes;
                
                const booking = {
                    id: Utils.generateId(),
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
                paymentButton.innerHTML = `<i class="fas fa-lock"></i> Pay ${Utils.formatCurrency(finalAmount)}`;
                paymentButton.disabled = false;
            }
        }, 2000);
    }

    renderBookingConfirmation(bookingId) {
        const booking = db.getById('bookings', bookingId);
        const content = document.getElementById('bookingConfirmationContent');
        
        if (!booking) {
            const emptyState = UIComponents.createEmptyState(
                'fa-exclamation-triangle',
                'Booking not found'
            );
            Utils.removeAllChildren(content);
            content.appendChild(emptyState);
            return;
        }

        const movie = db.getById('movies', booking.movieId);
        const theater = db.getById('theaters', booking.theaterId);
        const show = db.getById('shows', booking.showId);

        Utils.removeAllChildren(content);

        const container = Utils.createElement('div', 'booking-confirmation fade-in');
        
        const successIcon = Utils.createElement('div', 'success-icon');
        successIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        
        const title = Utils.createElement('h1', '', 'Booking Confirmed!');
        const message = Utils.createElement('p', '', 'Your tickets have been booked successfully.');
        
        const ticket = this.createTicket(booking, movie, theater, show);
        
        const actions = Utils.createElement('div', '');
        actions.style.display = 'flex';
        actions.style.gap = '16px';
        actions.style.justifyContent = 'center';
        actions.style.marginTop = '32px';
        
        const printBtn = UIComponents.createButton('Print Ticket', 'btn btn-primary', () => window.print());
        printBtn.innerHTML = '<i class="fas fa-print"></i> Print Ticket';
        
        const homeBtn = UIComponents.createButton('Back to Home', 'btn btn-secondary', () => window.router.navigate('home'));
        homeBtn.innerHTML = '<i class="fas fa-home"></i> Back to Home';
        
        actions.appendChild(printBtn);
        actions.appendChild(homeBtn);
        
        container.appendChild(successIcon);
        container.appendChild(title);
        container.appendChild(message);
        container.appendChild(ticket);
        container.appendChild(actions);
        
        content.appendChild(container);
    }

    createTicket(booking, movie, theater, show) {
        const ticket = Utils.createElement('div', 'ticket');
        
        const header = Utils.createElement('div', 'ticket-header');
        const ticketId = Utils.createElement('div', 'ticket-id', `Booking ID: ${booking.id}`);
        const qrCode = Utils.createElement('div', 'qr-code');
        qrCode.innerHTML = '<i class="fas fa-qrcode"></i>';
        
        header.appendChild(ticketId);
        header.appendChild(qrCode);
        
        const details = Utils.createElement('div', 'ticket-details');
        
        const movieItem = UIComponents.createSummaryItem('Movie:', movie.name);
        const theaterItem = UIComponents.createSummaryItem('Theater:', theater.name);
        const dateTimeItem = UIComponents.createSummaryItem('Date & Time:', `${show.date} at ${show.time}`);
        const seatsItem = UIComponents.createSummaryItem('Seats:', booking.seats.join(', '));
        const amountItem = UIComponents.createSummaryItem('Amount Paid:', Utils.formatCurrency(booking.amount));
        
        details.appendChild(movieItem);
        details.appendChild(theaterItem);
        details.appendChild(dateTimeItem);
        details.appendChild(seatsItem);
        details.appendChild(amountItem);
        
        ticket.appendChild(header);
        ticket.appendChild(details);
        
        return ticket;
    }

    renderUserBookings() {
        if (!authManager.requireAuth()) return;

        const bookings = db.getBookingsByUser(authManager.currentUser.id);
        const content = document.getElementById('bookingsContent');
        
        Utils.removeAllChildren(content);

        if (bookings.length === 0) {
            const emptyState = UIComponents.createEmptyState(
                'fa-ticket-alt',
                'No bookings found',
                "You haven't made any bookings yet.",
                'Browse Movies',
                () => window.router.navigate('movies')
            );
            content.appendChild(emptyState);
            return;
        }

        const grid = Utils.createElement('div', 'bookings-grid fade-in');
        
        bookings.forEach(booking => {
            const card = this.createBookingCard(booking);
            grid.appendChild(card);
        });
        
        content.appendChild(grid);
    }

    createBookingCard(booking) {
        const movie = db.getById('movies', booking.movieId);
        const theater = db.getById('theaters', booking.theaterId);
        const show = db.getById('shows', booking.showId);
        
        const card = Utils.createElement('div', 'booking-card');
        
        const header = Utils.createElement('div', 'booking-header');
        const title = Utils.createElement('h3', '', movie.name);
        const status = UIComponents.createStatusBadge(booking.status);
        
        header.appendChild(title);
        header.appendChild(status);
        
        const details = Utils.createElement('div', 'booking-details');
        
        const info = Utils.createElement('div', 'booking-info');
        
        const theaterInfo = Utils.createElement('p', '');
        theaterInfo.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${theater.name}`;
        
        const dateInfo = Utils.createElement('p', '');
        dateInfo.innerHTML = `<i class="fas fa-calendar"></i> ${Utils.formatShortDate(show.date)} at ${show.time}`;
        
        const seatsInfo = Utils.createElement('p', '');
        seatsInfo.innerHTML = `<i class="fas fa-chair"></i> Seats: ${booking.seats.join(', ')}`;
        
        const amountInfo = Utils.createElement('p', '');
        amountInfo.innerHTML = `<i class="fas fa-credit-card"></i> Amount: ${Utils.formatCurrency(booking.amount)}`;
        
        const bookingDateInfo = Utils.createElement('p', '');
        bookingDateInfo.innerHTML = `<i class="fas fa-clock"></i> Booked on: ${new Date(booking.bookingDate).toLocaleDateString()}`;
        
        info.appendChild(theaterInfo);
        info.appendChild(dateInfo);
        info.appendChild(seatsInfo);
        info.appendChild(amountInfo);
        info.appendChild(bookingDateInfo);
        
        const actions = Utils.createElement('div', 'booking-actions');
        const viewTicketBtn = UIComponents.createButton('View Ticket', 'btn btn-secondary btn-sm', () => this.showTicket(booking.id));
        viewTicketBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> View Ticket';
        actions.appendChild(viewTicketBtn);
        
        details.appendChild(info);
        details.appendChild(actions);
        
        card.appendChild(header);
        card.appendChild(details);
        
        return card;
    }

    showTicket(bookingId) {
        const booking = db.getById('bookings', bookingId);
        const movie = db.getById('movies', booking.movieId);
        const theater = db.getById('theaters', booking.theaterId);
        const show = db.getById('shows', booking.showId);

        const modalBody = document.getElementById('modalBody');
        Utils.removeAllChildren(modalBody);

        const ticket = this.createTicket(booking, movie, theater, show);
        
        const actions = Utils.createElement('div', '');
        actions.style.display = 'flex';
        actions.style.gap = '16px';
        actions.style.justifyContent = 'center';
        actions.style.marginTop = '24px';
        
        const printBtn = UIComponents.createButton('Print Ticket', 'btn btn-primary', () => window.print());
        printBtn.innerHTML = '<i class="fas fa-print"></i> Print Ticket';
        actions.appendChild(printBtn);

        modalBody.appendChild(ticket);
        modalBody.appendChild(actions);

        authManager.showModal();
    }
}

window.bookingManager = new BookingManager();