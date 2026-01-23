// View Controller (Comments Only)
const ViewController = {
    // View state
    currentBoard: null,
    selectedAesthetic: 'professional',
    currentRole: 'viewer',

    // Aesthetic background mapping
    aestheticBackgrounds: {
        'professional': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'dark-academia': 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)',
        'cottage-core': 'linear-gradient(135deg, #ffeaa7 0%, #dfe6e9 100%)',
        'tech-neon': 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
        'retro-90s': 'linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%)'
    },

    // Initialize view page
    init: function (boardData, role = 'viewer') {
        this.currentBoard = boardData;
        this.selectedAesthetic = boardData.aesthetic;
        this.currentRole = role;

        this.setupViewPage();
        this.loadComments();
        this.setupAutoRefresh();
    },

    // Setup view page UI
    setupViewPage: function () {
        // Update recipient name
        document.getElementById('viewRecipientName').textContent = this.currentBoard.recipient_name;

        // Apply aesthetic background
        this.applyAestheticBackground();

        // Hide back button for viewers
        if (this.currentRole === 'viewer') {
            this.hideBackButton();
        }
    },

    // Apply aesthetic background to view page
    applyAestheticBackground: function () {
        const viewerInterface = document.getElementById('viewer-interface');
        if (viewerInterface) {
            viewerInterface.style.background = this.aestheticBackgrounds[this.selectedAesthetic] || this.aestheticBackgrounds['professional'];
        }
    },

    // Hide back button for viewers
    hideBackButton: function () {
        const backButtons = document.querySelectorAll('.btn-back-to-board, .btn-view-messages');
        backButtons.forEach(button => {
            button.style.display = 'none';
        });
    },

    // Load comments from API
    loadComments: async function () {
        if (!this.currentBoard) return;

        try {
            const comments = await ApiService.getComments(this.currentBoard.id);
            this.renderComments(comments);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    },

    // Render comments on view page
    renderComments: function (comments) {
        // Render for Viewer Dashboard
        this.renderCommentsToGrid('viewerCommentsGrid', 'emptyState', comments);

        // Render for Creator Dashboard (Embedded)
        this.renderCommentsToGrid('creatorCommentsGrid', null, comments);
    },

    renderCommentsToGrid: function (gridId, emptyId, comments) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.innerHTML = '';

        if (comments.length === 0 && emptyId) {
            const emptyState = document.getElementById(emptyId);
            if (emptyState) emptyState.style.display = 'flex';
            return;
        } else if (emptyId) {
            const emptyState = document.getElementById(emptyId);
            if (emptyState) emptyState.style.display = 'none';
        }

        comments.forEach(comment => {
            const card = document.createElement('div');
            card.className = 'comment-card';
            card.style.backgroundColor = comment.color;
            card.innerHTML = `
                <div class="comment-author">${comment.author}</div>
                <div class="comment-message">${comment.message}</div>
                <div class="comment-time">${this.formatDate(comment.created_at)}</div>
            `;
            grid.appendChild(card);
        });
    },

    // Format date for display
    formatDate: function (dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Setup auto-refresh for new comments
    setupAutoRefresh: function () {
        // Auto-refresh comments every 5 seconds for viewers and creators
        setInterval(() => {
            if (this.currentBoard &&
                (document.getElementById('viewer-interface') && !document.getElementById('viewer-interface').classList.contains('hidden')) ||
                (document.getElementById('creator-dashboard') && !document.getElementById('creator-dashboard').classList.contains('hidden'))) {
                this.loadComments();
            }
        }, 5000);
    },

    // Reset view controller
    reset: function () {
        this.currentBoard = null;
        this.selectedAesthetic = 'professional';
        this.currentRole = 'viewer';
    }
};