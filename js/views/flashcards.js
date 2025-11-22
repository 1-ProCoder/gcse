class FlashcardsView {
    constructor(store) {
        this.store = store;
        this.activeDeckId = null;
        this.reviewSession = null;
    }

    async render() {
        const decks = this.store.getDecks();

        if (this.reviewSession) {
            return this.renderReview();
        }

        if (this.activeDeckId) {
            return this.renderDeckDetails(decks.find(d => d.id === this.activeDeckId));
        }

        return `
            <div class="flashcards-container fade-in">
                <div class="header-actions">
                    <div>
                        <h2>Flashcard Decks</h2>
                        <p class="text-muted">Master your subjects with spaced repetition.</p>
                    </div>
                    <button class="btn btn-primary" id="create-deck-btn">
                        <span class="icon">+</span> New Deck
                    </button>
                </div>

                <div class="decks-grid">
                    ${decks.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon">🗂️</div>
                            <h3>No Decks Yet</h3>
                            <p>Create a deck to start building your knowledge base.</p>
                        </div>
                    ` : ''}
                    ${decks.map(deck => {
            const dueCount = this.getDueCount(deck);
            return `
                            <div class="deck-card-premium" data-id="${deck.id}">
                                <div class="deck-card-top">
                                    <div class="deck-icon">${deck.name.charAt(0).toUpperCase()}</div>
                                    <div class="deck-menu">
                                        <button class="btn-icon-sm edit-btn" data-id="${deck.id}" title="Edit deck">✏️</button>
                                        <button class="btn-icon-sm delete-deck-btn" data-id="${deck.id}" title="Delete deck">🗑️</button>
                                    </div>
                                </div>
                                <div class="deck-info">
                                    <h3>${deck.name}</h3>
                                    <p class="deck-meta">
                                        <span class="card-count">📚 ${deck.cards.length} cards</span>
                                        ${dueCount > 0 ? `<span class="due-indicator">• ${dueCount} due</span>` : ''}
                                    </p>
                                </div>
                                <div class="deck-actions">
                                    <button class="btn btn-primary btn-block study-btn" data-id="${deck.id}" ${dueCount === 0 ? 'disabled' : ''}>
                                        ${dueCount > 0 ? '🎯 Study Now' : '✅ All Done'}
                                    </button>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>

                <!-- Create Deck Modal -->
                <div id="deck-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>Create New Deck</h3>
                        <div class="form-group">
                            <label>Deck Name</label>
                            <input type="text" id="deck-name" placeholder="e.g. Biology Terms">
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" id="cancel-deck">Cancel</button>
                            <button class="btn btn-primary" id="save-deck">Create Deck</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDeckDetails(deck) {
        return `
            <div class="deck-details fade-in">
                <div class="details-header-row">
                    <button class="btn-text" id="back-to-decks">← Back to Decks</button>
                    <div class="deck-title-group">
                        <h2>${deck.name}</h2>
                        <span class="badge">${deck.cards.length} Cards</span>
                    </div>
                    <button class="btn btn-primary" id="add-card-btn">+ Add Card</button>
                </div>
                
                <div class="cards-list-premium">
                    ${deck.cards.length === 0 ? `
                        <div class="empty-state-small">
                            <p>This deck is empty. Add some cards!</p>
                        </div>
                    ` : ''}
                    ${deck.cards.map((card, idx) => `
                        <div class="flashcard-row">
                            <div class="card-text">
                                <span class="label">Q</span>
                                <p>${card.front}</p>
                            </div>
                            <div class="card-divider"></div>
                            <div class="card-text">
                                <span class="label">A</span>
                                <p>${card.back}</p>
                            </div>
                            <button class="btn-icon-sm delete-card-btn" data-idx="${idx}">🗑️</button>
                        </div>
                    `).join('')}
                </div>

                <!-- Add Card Modal -->
                <div id="card-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>Add Flashcard</h3>
                        <div class="form-group">
                            <label>Front (Question)</label>
                            <textarea id="card-front" rows="3" placeholder="Enter question..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Back (Answer)</label>
                            <textarea id="card-back" rows="3" placeholder="Enter answer..."></textarea>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" id="cancel-card">Cancel</button>
                            <button class="btn btn-primary" id="save-card">Add Card</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderReview() {
        const card = this.reviewSession.cards[this.reviewSession.index];
        const isFlipped = this.reviewSession.flipped;
        const progress = ((this.reviewSession.index) / this.reviewSession.cards.length) * 100;

        return `
            <div class="review-wrapper fade-in">
                <div class="review-header">
                    <button class="btn-text" id="quit-review">Quit</button>
                    <div class="review-progress">
                        <span>${this.reviewSession.index + 1} / ${this.reviewSession.cards.length}</span>
                        <div class="progress-bar-mini">
                            <div class="fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>

                <div class="flashcard-stage">
                    <div class="premium-flashcard ${isFlipped ? 'flipped' : ''}" id="flashcard">
                        <div class="card-face front">
                            <div class="face-content">
                                <span class="face-label">Question</span>
                                <h3>${card.front}</h3>
                                <p class="hint">Click to flip</p>
                            </div>
                        </div>
                        <div class="card-face back">
                            <div class="face-content">
                                <span class="face-label">Answer</span>
                                <h3>${card.back}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="review-controls">
                    ${!isFlipped ? `
                        <button class="btn btn-primary btn-lg btn-wide" id="flip-btn">Show Answer</button>
                    ` : `
                        <div class="rating-grid">
                            <button class="btn-rating again" data-rating="1">
                                <span class="time">1m</span>
                                <span class="label">Again</span>
                            </button>
                            <button class="btn-rating hard" data-rating="2">
                                <span class="time">10m</span>
                                <span class="label">Hard</span>
                            </button>
                            <button class="btn-rating good" data-rating="3">
                                <span class="time">1d</span>
                                <span class="label">Good</span>
                            </button>
                            <button class="btn-rating easy" data-rating="4">
                                <span class="time">4d</span>
                                <span class="label">Easy</span>
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    getDueCount(deck) {
        const now = new Date().getTime();
        return deck.cards.filter(c => c.dueDate <= now).length;
    }

    async afterRender() {
        if (this.reviewSession) {
            this.attachReviewListeners();
        } else if (this.activeDeckId) {
            this.attachDeckListeners();
        } else {
            this.attachMainListeners();
        }
    }

    attachMainListeners() {
        const modal = document.getElementById('deck-modal');
        document.getElementById('create-deck-btn')?.addEventListener('click', () => modal.classList.remove('hidden'));
        document.getElementById('cancel-deck')?.addEventListener('click', () => modal.classList.add('hidden'));

        document.getElementById('save-deck')?.addEventListener('click', () => {
            const name = document.getElementById('deck-name').value;
            if (name) {
                const decks = this.store.getDecks();
                decks.push({ id: Date.now().toString(), name, cards: [] });
                this.store.saveDecks(decks);
                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            }
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering study
                this.activeDeckId = btn.dataset.id;
                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            });
        });

        document.querySelectorAll('.delete-deck-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const deckId = btn.dataset.id;
                const decks = this.store.getDecks();
                const deck = decks.find(d => d.id === deckId);

                if (confirm(`Are you sure you want to delete "${deck.name}"? This will delete all ${deck.cards.length} cards in this deck.`)) {
                    const updatedDecks = decks.filter(d => d.id !== deckId);
                    this.store.saveDecks(updatedDecks);
                    this.render().then(html => {
                        document.getElementById('app-view').innerHTML = html;
                        this.afterRender();
                    });
                }
            });
        });

        document.querySelectorAll('.study-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startReview(btn.dataset.id);
            });
        });
    }

    attachDeckListeners() {
        document.getElementById('back-to-decks')?.addEventListener('click', () => {
            this.activeDeckId = null;
            this.render().then(html => {
                document.getElementById('app-view').innerHTML = html;
                this.afterRender();
            });
        });

        const modal = document.getElementById('card-modal');
        document.getElementById('add-card-btn')?.addEventListener('click', () => modal.classList.remove('hidden'));
        document.getElementById('cancel-card')?.addEventListener('click', () => modal.classList.add('hidden'));

        document.getElementById('save-card')?.addEventListener('click', () => {
            const front = document.getElementById('card-front').value;
            const back = document.getElementById('card-back').value;
            if (front && back) {
                const decks = this.store.getDecks();
                const deck = decks.find(d => d.id === this.activeDeckId);
                deck.cards.push({
                    id: Date.now().toString(),
                    front,
                    back,
                    dueDate: Date.now(),
                    interval: 0,
                    ease: 2.5
                });
                this.store.saveDecks(decks);
                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            }
        });

        document.querySelectorAll('.delete-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.dataset.idx;
                const decks = this.store.getDecks();
                const deck = decks.find(d => d.id === this.activeDeckId);
                deck.cards.splice(idx, 1);
                this.store.saveDecks(decks);
                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            });
        });
    }

    attachReviewListeners() {
        const cardEl = document.getElementById('flashcard');
        const flipBtn = document.getElementById('flip-btn');

        const flipAction = () => {
            if (!this.reviewSession.flipped) {
                this.reviewSession.flipped = true;
                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            }
        };

        cardEl?.addEventListener('click', flipAction);
        flipBtn?.addEventListener('click', flipAction);

        document.getElementById('quit-review')?.addEventListener('click', () => {
            this.reviewSession = null;
            this.render().then(html => {
                document.getElementById('app-view').innerHTML = html;
                this.afterRender();
            });
        });

        document.querySelectorAll('.btn-rating').forEach(btn => {
            btn.addEventListener('click', () => {
                this.processRating(parseInt(btn.dataset.rating));
            });
        });
    }

    startReview(deckId) {
        const decks = this.store.getDecks();
        const deck = decks.find(d => d.id === deckId);
        const dueCards = deck.cards.filter(c => c.dueDate <= Date.now());

        if (dueCards.length > 0) {
            this.reviewSession = {
                deckId,
                cards: dueCards,
                index: 0,
                flipped: false
            };
            this.render().then(html => {
                document.getElementById('app-view').innerHTML = html;
                this.afterRender();
            });
        }
    }

    processRating(rating) {
        const card = this.reviewSession.cards[this.reviewSession.index];

        if (rating === 1) {
            card.interval = 0;
        } else {
            if (card.interval === 0) card.interval = 1;
            else if (card.interval === 1) card.interval = 3;
            else card.interval = Math.round(card.interval * card.ease);

            if (rating === 2) card.ease -= 0.15;
            if (rating === 4) card.ease += 0.15;
            if (card.ease < 1.3) card.ease = 1.3;
        }

        const now = Date.now();
        if (rating === 1) {
            card.dueDate = now + 60000;
        } else {
            card.dueDate = now + (card.interval * 24 * 60 * 60 * 1000);
        }

        const decks = this.store.getDecks();
        const deck = decks.find(d => d.id === this.reviewSession.deckId);
        const originalCardIndex = deck.cards.findIndex(c => c.id === card.id);
        deck.cards[originalCardIndex] = card;
        this.store.saveDecks(decks);

        this.reviewSession.index++;
        this.reviewSession.flipped = false;

        if (this.reviewSession.index >= this.reviewSession.cards.length) {
            this.reviewSession = null;
            this.store.unlockAchievement('flashcards_done', 'Flashcard Master', '🃏');
            alert('Review Session Complete! Great job.');
            this.render().then(html => {
                document.getElementById('app-view').innerHTML = html;
                this.afterRender();
            });
        } else {
            this.render().then(html => {
                document.getElementById('app-view').innerHTML = html;
                this.afterRender();
            });
        }
    }
}
