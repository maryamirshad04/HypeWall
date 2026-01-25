// View Controller - COMPLETE WORKING VERSION
const ViewController = {
    currentBoard: null,
    selectedAesthetic: 'professional',
    refreshInterval: null,

    aestheticBackgrounds: {
        'professional': 'images/professionalbg.jpeg',
        'dark-academia': 'images/dark-academiabg.jpeg',
        'cottage-core': 'images/cottage-corebg.jpeg',
        'tech-neon': 'images/tech-neonbg.jpeg',
        'retro-90s': 'images/retro-90sbg.jpeg'
    },

    init: function (boardData) {
        console.log('🚀 ViewController.init() called');
        console.log('📦 Board data:', boardData);
        
        this.currentBoard = boardData;
        this.selectedAesthetic = boardData.aesthetic || 'professional';
        
        console.log('🎨 Selected aesthetic:', this.selectedAesthetic);
        
        // IMPORTANT: Show view page FIRST to ensure DOM elements exist
        UIController.showViewPage();
        
        // Then setup everything else
        setTimeout(() => {
            this.setupViewPage();
            this.loadComments();
            this.setupAutoRefresh();
        }, 50); // Small delay to ensure DOM is ready
    },

    setupViewPage: function () {
        console.log('📄 Setting up view page...');
        
        // Set recipient name
        const recipientElement = document.getElementById('viewRecipientName');
        if (recipientElement) {
            recipientElement.textContent = this.currentBoard.recipient_name;
            console.log('✓ Recipient name set:', this.currentBoard.recipient_name);
        } else {
            console.error('✗ viewRecipientName element not found!');
        }
        
        // Apply background
        this.forceBackgroundImage();
    },

    forceBackgroundImage: function () {
        const viewPage = document.getElementById('viewPage');
        if (!viewPage) {
            console.error('✗ viewPage element not found!');
            return;
        }
        
        const theme = this.selectedAesthetic || 'professional';
        const imagePath = this.aestheticBackgrounds[theme];
        
        console.log('🎨 Forcing background:', imagePath, 'for theme:', theme);
        
        // Apply background with inline styles
        const styleString = `
            background-image: url('${imagePath}') !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            background-attachment: fixed !important;
            min-height: 100vh !important;
            display: block !important;
            padding: 100px 2rem 2rem !important;
        `.replace(/\s+/g, ' ').trim();
        
        viewPage.setAttribute('style', styleString);
        
        // Also add theme class
        viewPage.className = `view-page active theme-${theme}`;
        
        console.log('✅ Background forced successfully!');
        console.log('📊 Style attribute:', viewPage.getAttribute('style'));
    },

    loadComments: async function () {
        if (!this.currentBoard) {
            console.warn('⚠️ No current board');
            return;
        }

        console.log('💬 Loading comments for board:', this.currentBoard.id);

        try {
            const comments = await ApiService.getComments(this.currentBoard.id);
            console.log('✓ Comments loaded:', comments.length);
            this.renderComments(comments);
        } catch (error) {
            console.error('❌ Error loading comments:', error);
        }
    },

    renderComments: function (comments) {
        // Wait a moment to ensure DOM is ready
        setTimeout(() => {
            const grid = document.getElementById('commentsGrid');
            const emptyState = document.getElementById('emptyState');

            if (!grid) {
                console.error('✗ commentsGrid element not found!');
                console.log('📋 Searching for elements...');
                console.log('View page:', document.getElementById('viewPage'));
                console.log('All elements:', document.querySelectorAll('.comments-grid'));
                return;
            }

            if (comments.length === 0) {
                if (emptyState) emptyState.style.display = 'flex';
                grid.innerHTML = '';
                console.log('📭 No comments to display');
                return;
            } else {
                if (emptyState) emptyState.style.display = 'none';
            }

            grid.innerHTML = '';
            console.log('🎴 Rendering', comments.length, 'comment cards');

            comments.forEach(comment => {
                const card = document.createElement('div');
                card.className = 'comment-card';

                const rgbColor = this.hexToRgb(comment.color);
                if (rgbColor) {
                    card.style.backgroundColor = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.95)`;
                } else {
                    card.style.backgroundColor = comment.color;
                }

                card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';

                card.innerHTML = `
                    <div class="comment-author">${this.escapeHtml(comment.author)}</div>
                    <div class="comment-message">${this.escapeHtml(comment.message)}</div>
                    <div class="comment-time">${this.formatDate(comment.created_at)}</div>
                `;
                grid.appendChild(card);
            });

            console.log('✓ All comment cards rendered');
        }, 100);
    },

    hexToRgb: function (hex) {
        if (!hex) return null;
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        const bigint = parseInt(hex, 16);
        if (isNaN(bigint)) return null;
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    },

    escapeHtml: function (text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatDate: function (dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Just now';
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Just now';
        }
    },

    setupAutoRefresh: function () {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        console.log('⏱️ Setting up auto-refresh (5 seconds)');

        this.refreshInterval = setInterval(() => {
            const viewPage = document.getElementById('viewPage');
            if (this.currentBoard && viewPage && viewPage.classList.contains('active')) {
                this.loadComments();
            }
        }, 5000);
    },

    returnToBoard: function () {
        console.log('⬅️ Returning to board page');
        
        if (BoardController.currentBoard) {
            const authorInput = document.getElementById('commentAuthor');
            const messageInput = document.getElementById('commentMessage');
            if (authorInput) authorInput.value = '';
            if (messageInput) messageInput.value = '';
        }

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('✓ Auto-refresh stopped');
        }

        UIController.showBoardPage();
    },

    reset: function () {
        console.log('🔄 Resetting ViewController');
        
        this.currentBoard = null;
        this.selectedAesthetic = 'professional';

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }

        const viewPage = document.getElementById('viewPage');
        if (viewPage) {
            viewPage.style.backgroundImage = 'none';
            viewPage.style.background = '';
            viewPage.style.backgroundColor = '';
            viewPage.className = viewPage.className.replace(/theme-\w+/g, '').trim();
        }
        
        console.log('✓ Reset complete');
    }
};

// Emergency DOM fix for cached content
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM fully loaded, checking for cached issues...');
    
    const viewPage = document.getElementById('viewPage');
    if (viewPage) {
        // Check if view page has wrong cached content
        const html = viewPage.innerHTML.toLowerCase();
        const hasWrongContent = html.includes('view-button') || 
                               html.includes('car-button') || 
                               html.includes('dropdown-item') ||
                               html.includes('view-icon') ||
                               html.includes('view-text');
        
        const hasCorrectContent = html.includes('comments-grid') && 
                                 html.includes('view-recipientname') &&
                                 html.includes('empty-state');
        
        if (hasWrongContent || !hasCorrectContent) {
            console.error('❌ CACHED ISSUE DETECTED: View page has wrong content');
            console.log('HTML snippet:', viewPage.innerHTML.substring(0, 300));
            
            // Apply immediate fix
            viewPage.innerHTML = `
                <div class="view-header">
                    <h1>Messages for <span id="viewRecipientName"></span></h1>
                    <p class="view-subtitle">All the love and appreciation in one place</p>
                    <button class="btn-back-to-board" onclick="returnToBoard()">← Back to Board</button>
                </div>

                <div class="comments-container">
                    <div class="comments-grid" id="commentsGrid">
                        <!-- Comments will be loaded here -->
                    </div>

                    <div class="empty-state" id="emptyState">
                        <h3>No messages yet</h3>
                        <p>Be the first to send some love!</p>
                    </div>
                </div>
            `;
            
            console.log('✅ Cached content fixed on DOM load');
        }
    }
});

