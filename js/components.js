// Reusable UI Components
class UIComponents {
    static createMovieCard(movie) {
        const card = Utils.createElement('div', 'movie-card fade-in');
        card.dataset.movieId = movie.id;

        const poster = Utils.createElement('div', 'movie-poster');
        const posterIcon = Utils.createElement('i', 'fas fa-film');
        poster.appendChild(posterIcon);

        const info = Utils.createElement('div', 'movie-info');
        
        const title = Utils.createElement('h3', 'movie-title', movie.name);
        
        const details = Utils.createElement('div', 'movie-details');
        
        const genre = Utils.createElement('div', 'movie-genre', 
            movie.genre.charAt(0).toUpperCase() + movie.genre.slice(1));
        
        const language = Utils.createElement('div', 'movie-language', 
            movie.language.charAt(0).toUpperCase() + movie.language.slice(1));
        
        const rating = Utils.createElement('div', 'movie-rating');
        const stars = Utils.createElement('span', 'rating-stars');
        stars.innerHTML = this.renderStars(movie.rating);
        const ratingText = Utils.createElement('span', '', `${movie.rating}/5`);
        
        rating.appendChild(stars);
        rating.appendChild(ratingText);
        
        details.appendChild(genre);
        details.appendChild(language);
        details.appendChild(rating);
        
        info.appendChild(title);
        info.appendChild(details);
        
        card.appendChild(poster);
        card.appendChild(info);
        
        return card;
    }

    static renderStars(rating) {
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

    static createEmptyState(icon, title, message, buttonText = null, buttonAction = null) {
        const container = Utils.createElement('div', 'empty-state');
        
        const iconElement = Utils.createElement('i', `fas ${icon}`);
        const titleElement = Utils.createElement('h3', '', title);
        const messageElement = Utils.createElement('p', '', message);
        
        container.appendChild(iconElement);
        container.appendChild(titleElement);
        container.appendChild(messageElement);
        
        if (buttonText && buttonAction) {
            const button = Utils.createElement('button', 'btn btn-primary', buttonText);
            button.addEventListener('click', buttonAction);
            container.appendChild(button);
        }
        
        return container;
    }

    static createLoadingSpinner(message = 'Loading...') {
        const container = Utils.createElement('div', 'loading');
        const spinner = Utils.createElement('div', 'spinner');
        const text = Utils.createElement('span', '', message);
        
        container.appendChild(spinner);
        container.appendChild(text);
        
        return container;
    }

    static createToast(message, type = 'info') {
        const toast = Utils.createElement('div', `toast ${type}`, message);
        return toast;
    }

    static createFormGroup(labelText, inputType, inputId, required = false) {
        const group = Utils.createElement('div', 'form-group');
        
        const label = Utils.createElement('label', 'form-label', labelText);
        label.setAttribute('for', inputId);
        
        const input = Utils.createElement('input', 'form-input');
        input.type = inputType;
        input.id = inputId;
        if (required) input.required = true;
        
        group.appendChild(label);
        group.appendChild(input);
        
        return group;
    }

    static createSelectGroup(labelText, selectId, options, required = false) {
        const group = Utils.createElement('div', 'form-group');
        
        const label = Utils.createElement('label', 'form-label', labelText);
        label.setAttribute('for', selectId);
        
        const select = Utils.createElement('select', 'form-select');
        select.id = selectId;
        if (required) select.required = true;
        
        options.forEach(option => {
            const optionElement = Utils.createElement('option', '', option.text);
            optionElement.value = option.value;
            select.appendChild(optionElement);
        });
        
        group.appendChild(label);
        group.appendChild(select);
        
        return group;
    }

    static createTextareaGroup(labelText, textareaId, required = false) {
        const group = Utils.createElement('div', 'form-group');
        
        const label = Utils.createElement('label', 'form-label', labelText);
        label.setAttribute('for', textareaId);
        
        const textarea = Utils.createElement('textarea', 'form-textarea');
        textarea.id = textareaId;
        if (required) textarea.required = true;
        
        group.appendChild(label);
        group.appendChild(textarea);
        
        return group;
    }

    static createButton(text, className = 'btn btn-primary', clickHandler = null) {
        const button = Utils.createElement('button', className, text);
        if (clickHandler) {
            button.addEventListener('click', clickHandler);
        }
        return button;
    }

    static createDataTable(headers, data, actions = []) {
        const container = Utils.createElement('div', 'data-table-container');
        const table = Utils.createElement('table', 'data-table');
        
        // Create header
        const thead = Utils.createElement('thead');
        const headerRow = Utils.createElement('tr');
        
        headers.forEach(header => {
            const th = Utils.createElement('th', '', header);
            headerRow.appendChild(th);
        });
        
        if (actions.length > 0) {
            const actionTh = Utils.createElement('th', '', 'Actions');
            headerRow.appendChild(actionTh);
        }
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = Utils.createElement('tbody');
        
        data.forEach(row => {
            const tr = Utils.createElement('tr');
            
            Object.values(row).forEach(value => {
                const td = Utils.createElement('td', '', value);
                tr.appendChild(td);
            });
            
            if (actions.length > 0) {
                const actionTd = Utils.createElement('td');
                actions.forEach(action => {
                    const button = Utils.createElement('button', `btn ${action.className} btn-sm`, action.text);
                    button.addEventListener('click', () => action.handler(row));
                    actionTd.appendChild(button);
                });
                tr.appendChild(actionTd);
            }
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        container.appendChild(table);
        
        return container;
    }

    static createSeat(seatId, status) {
        const seat = Utils.createElement('div', `seat ${status}`, seatId.slice(1));
        seat.dataset.seatId = seatId;
        return seat;
    }

    static createSeatRow(rowLabel, seats) {
        const row = Utils.createElement('div', 'seat-row');
        
        const label = Utils.createElement('div', 'seat-row-label', rowLabel);
        row.appendChild(label);
        
        seats.forEach(seat => {
            row.appendChild(seat);
        });
        
        return row;
    }

    static createSummaryItem(label, value) {
        const item = Utils.createElement('div', 'summary-item');
        const labelSpan = Utils.createElement('span', '', label);
        const valueSpan = Utils.createElement('span', '', value);
        
        item.appendChild(labelSpan);
        item.appendChild(valueSpan);
        
        return item;
    }

    static createStatusBadge(status) {
        const badge = Utils.createElement('span', `status-badge status-${status}`, status.toUpperCase());
        return badge;
    }
}

// Export for use in other modules
window.UIComponents = UIComponents;