class SubjectsView {
    constructor(store) {
        this.store = store;
        this.activeSubjectId = null;
    }

    async render() {
        const subjects = this.store.getSubjects();

        if (this.activeSubjectId) {
            return this.renderSubjectDetails(subjects.find(s => s.id === this.activeSubjectId));
        }

        return `
            <div class="subjects-container">
                <div class="header-actions">
                    <h3>Your Subjects</h3>
                    <button class="btn btn-primary" id="add-subject-btn">+ New Subject</button>
                </div>

                <div class="grid-3" id="subjects-grid">
                    ${subjects.length === 0 ? '<p class="empty-state">No subjects yet. Add one to get started!</p>' : ''}
                    ${subjects.map(subject => `
                        <div class="card subject-card" style="border-left: 5px solid ${subject.color}" data-id="${subject.id}">
                            <div class="subject-header">
                                <h4>${subject.name}</h4>
                                <button class="btn-icon delete-subject-btn" data-id="${subject.id}">×</button>
                            </div>
                            <p class="topic-count">${subject.topics ? subject.topics.length : 0} Topics</p>
                            <div class="progress-mini">
                                <div class="progress-fill" style="width: ${this.calculateProgress(subject)}%; background-color: ${subject.color}"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Add Subject Modal (Hidden by default) -->
                <div id="subject-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>Add New Subject</h3>
                        <input type="text" id="subject-name" placeholder="Subject Name (e.g. Math)">
                        <input type="color" id="subject-color" value="#6366f1">
                        <div class="modal-actions">
                            <button class="btn btn-secondary" id="cancel-subject">Cancel</button>
                            <button class="btn btn-primary" id="save-subject">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSubjectDetails(subject) {
        if (!subject) {
            this.activeSubjectId = null;
            return this.render();
        }

        return `
            <div class="subject-details">
                <button class="btn btn-secondary mb-4" id="back-btn">← Back to Subjects</button>
                
                <div class="card details-header" style="border-top: 5px solid ${subject.color}">
                    <h2>${subject.name}</h2>
                    <div class="progress-container">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${this.calculateProgress(subject)}%; background-color: ${subject.color}"></div>
                        </div>
                    </div>
                </div>

                <div class="topics-section">
                    <div class="header-actions">
                        <h3>Topics</h3>
                        <button class="btn btn-primary" id="add-topic-btn">+ Add Topic</button>
                    </div>
                    
                    <div class="topics-list" id="topics-list">
                        ${subject.topics && subject.topics.length > 0 ? subject.topics.map((topic, index) => `
                            <div class="card topic-card ${topic.completed ? 'completed' : ''}">
                                <div class="topic-check">
                                    <input type="checkbox" class="topic-checkbox" data-idx="${index}" ${topic.completed ? 'checked' : ''}>
                                </div>
                                <div class="topic-info">
                                    <div class="topic-main">
                                        <h4>${topic.name}</h4>
                                        <span class="badge ${topic.difficulty.toLowerCase()}">${topic.difficulty}</span>
                                    </div>
                                    <p class="topic-meta">⏱ ${topic.estimatedTime} mins</p>
                                    ${topic.notes ? `<p class="topic-notes">${topic.notes}</p>` : ''}
                                </div>
                                <button class="btn-icon delete-topic-btn" data-idx="${index}">×</button>
                            </div>
                        `).join('') : '<p class="empty-state">No topics added yet.</p>'}
                    </div>
                </div>

                <!-- Add Topic Modal -->
                <div id="topic-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>Add Topic</h3>
                        <input type="text" id="topic-name" placeholder="Topic Name">
                        <select id="topic-difficulty">
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                        <input type="number" id="topic-time" placeholder="Est. Time (mins)">
                        <textarea id="topic-notes" placeholder="Notes..."></textarea>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" id="cancel-topic">Cancel</button>
                            <button class="btn btn-primary" id="save-topic">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateProgress(subject) {
        if (!subject.topics || subject.topics.length === 0) return 0;
        const completed = subject.topics.filter(t => t.completed).length;
        return Math.round((completed / subject.topics.length) * 100);
    }

    async afterRender() {
        if (this.activeSubjectId) {
            this.attachDetailsListeners();
        } else {
            this.attachMainListeners();
        }
    }

    attachMainListeners() {
        // Show Modal
        const modal = document.getElementById('subject-modal');
        document.getElementById('add-subject-btn')?.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        // Hide Modal
        document.getElementById('cancel-subject')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Save Subject
        document.getElementById('save-subject')?.addEventListener('click', () => {
            const name = document.getElementById('subject-name').value;
            const color = document.getElementById('subject-color').value;
            if (name) {
                this.store.addSubject({
                    id: Date.now().toString(),
                    name,
                    color,
                    topics: []
                });
                this.store.save('subjects'); // Ensure persistence
                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            }
        });

        // Click Subject Card
        document.querySelectorAll('.subject-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-subject-btn')) {
                    this.activeSubjectId = card.dataset.id;
                    this.render().then(html => {
                        document.getElementById('app-view').innerHTML = html;
                        this.afterRender();
                    });
                }
            });
        });

        // Delete Subject
        document.querySelectorAll('.delete-subject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this subject?')) {
                    this.store.deleteSubject(btn.dataset.id);
                    this.render().then(html => {
                        document.getElementById('app-view').innerHTML = html;
                        this.afterRender();
                    });
                }
            });
        });
    }

    attachDetailsListeners() {
        const subject = this.store.getSubjects().find(s => s.id === this.activeSubjectId);
        if (!subject) return;

        // Back Button
        document.getElementById('back-btn')?.addEventListener('click', () => {
            this.activeSubjectId = null;
            this.render().then(html => {
                document.getElementById('app-view').innerHTML = html;
                this.afterRender();
            });
        });

        // Add Topic Modal
        const modal = document.getElementById('topic-modal');
        document.getElementById('add-topic-btn')?.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
        document.getElementById('cancel-topic')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Save Topic
        document.getElementById('save-topic')?.addEventListener('click', () => {
            const name = document.getElementById('topic-name').value;
            const difficulty = document.getElementById('topic-difficulty').value;
            const time = document.getElementById('topic-time').value;
            const notes = document.getElementById('topic-notes').value;

            if (name) {
                subject.topics.push({
                    id: Date.now().toString(),
                    name,
                    difficulty,
                    estimatedTime: time || 30,
                    notes,
                    completed: false
                });
                this.store.updateSubject(subject);
                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            }
        });

        // Toggle Completion
        document.querySelectorAll('.topic-checkbox').forEach(box => {
            box.addEventListener('change', (e) => {
                const idx = e.target.dataset.idx;
                subject.topics[idx].completed = e.target.checked;
                this.store.updateSubject(subject);
                // Re-render to update progress bar
                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            });
        });

        // Delete Topic
        document.querySelectorAll('.delete-topic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = btn.dataset.idx;
                subject.topics.splice(idx, 1);
                this.store.updateSubject(subject);
                this.render().then(html => {
                    document.getElementById('app-view').innerHTML = html;
                    this.afterRender();
                });
            });
        });
    }
}
