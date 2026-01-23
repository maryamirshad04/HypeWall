// Board Controller
const BoardController = {
    // Board state
    currentBoard: null,
    currentRole: 'contributor', // 'creator', 'contributor', 'viewer'
    selectedColor: '#FFD700',
    selectedAesthetic: 'professional',

    // Aesthetic colors mapping
    aestheticColors: {
        'professional': ['#E8EAF6', '#C5CAE9', '#9FA8DA', '#7986CB', '#5C6BC0'],
        'dark-academia': ['#D4AF37', '#C19A6B', '#8B7355', '#654321', '#3E2723'],
        'cottage-core': ['#FFE4E1', '#FFB6C1', '#FFC0CB', '#FFDAB9', '#F0E68C'],
        'tech-neon': ['#00FF88', '#00D9FF', '#FF00FF', '#FFFF00', '#FF0080'],
        'retro-90s': ['#FF6B9D', '#C06C84', '#FFA07A', '#FFD700', '#87CEEB']
    },

    // Aesthetic background mapping
    aestheticBackgrounds: {
        'professional': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'dark-academia': 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)',
        'cottage-core': 'linear-gradient(135deg, #ffeaa7 0%, #dfe6e9 100%)',
        'tech-neon': 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
        'retro-90s': 'linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%)'
    },

    // Initialize board with strict role
    init: function (boardData, role = 'contributor') {
        this.currentBoard = boardData;
        this.currentRole = role;
        this.selectedAesthetic = boardData.aesthetic;

        this.updateUI();
        this.setupColorPickers();

        // Update recipient name based on role
        if (document.getElementById('creatorRecipientName'))
            document.getElementById('creatorRecipientName').textContent = boardData.recipient_name;
        if (document.getElementById('contributorRecipientName'))
            document.getElementById('contributorRecipientName').textContent = boardData.recipient_name;
        if (document.getElementById('viewRecipientName'))
            document.getElementById('viewRecipientName').textContent = boardData.recipient_name;
    },

    // Update UI based on strict role
    updateUI: function () {
        // Apply aesthetic
        this.applyAesthetic(this.currentBoard.aesthetic);

        // Update share links ONLY for creator
        if (this.currentRole === 'creator') {
            this.updateShareLinks();
        }

        // Load comments for viewer and creator
        if (this.currentRole === 'creator' || this.currentRole === 'viewer') {
            ViewController.init(this.currentBoard, this.currentRole);
        }
    },

    // Apply aesthetic to board
    applyAesthetic: function (aesthetic) {
        const bg = this.aestheticBackgrounds[aesthetic] || this.aestheticBackgrounds['professional'];

        // Apply to specific sections based on role
        if (this.currentRole === 'creator' && document.getElementById('creator-dashboard')) {
            document.getElementById('creator-dashboard').style.background = bg;
        } else if (this.currentRole === 'contributor' && document.getElementById('contributor-interface')) {
            document.getElementById('contributor-interface').style.background = bg;
        } else if (this.currentRole === 'viewer' && document.getElementById('viewer-interface')) {
            document.getElementById('viewer-interface').style.background = bg;
        }
    },

    // Update share links - ONLY for creator
    updateShareLinks: function () {
        if (!this.currentBoard || this.currentRole !== 'creator') return;

        if (document.getElementById('contributorLink')) {
            document.getElementById('contributorLink').value =
                window.location.origin + (this.currentBoard.contributor_link || `/index.html?contribute=${this.currentBoard.id}`);
        }

        if (document.getElementById('viewLink')) {
            document.getElementById('viewLink').value =
                window.location.origin + (this.currentBoard.view_link || `/index.html?view=${this.currentBoard.view_token}`);
        }

        if (document.getElementById('boardCode')) {
            document.getElementById('boardCode').textContent = this.currentBoard.join_code || 'ABC123';
        }
    },

    // Setup color pickers on board pages
    setupColorPickers: function () {
        // Only setup for roles that can post messages
        if (this.currentRole === 'creator' || this.currentRole === 'contributor') {
            this.setupColorPickerForId('creatorColorPicker');
            this.setupColorPickerForId('contributorColorPicker');
        }
    },

    setupColorPickerForId: function (elementId) {
        const colorPicker = document.getElementById(elementId);
        if (!colorPicker) return;

        colorPicker.innerHTML = '';
        const colors = this.aestheticColors[this.selectedAesthetic] || this.aestheticColors['professional'];

        colors.forEach((color, index) => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            if (index === 0) colorOption.classList.add('selected');

            colorOption.style.backgroundColor = color;
            colorOption.onclick = (e) => {
                this.selectColor(color, e.currentTarget);
            };

            colorPicker.appendChild(colorOption);
        });

        this.selectedColor = colors[0];
    },

    // Select color
    selectColor: function (color, element) {
        this.selectedColor = color;

        // Update all color pickers
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        if (element) {
            element.classList.add('selected');
        }
    },

    // Post message - available for creator and contributor only
    postMessage: async function (rolePrefix = 'contributor') {
        // Only allow posting if user is creator or contributor
        if (this.currentRole === 'viewer') {
            alert('Viewers cannot post messages!');
            return;
        }

        const authorInput = document.getElementById(`${rolePrefix}Author`);
        const messageInput = document.getElementById(`${rolePrefix}Message`);

        // Use appropriate input IDs based on role
        const author = authorInput ? authorInput.value : 'Anonymous';
        const message = messageInput ? messageInput.value : '';

        if (!message.trim()) {
            alert('Please write a message!');
            return;
        }

        try {
            await ApiService.addComment(this.currentBoard.id, {
                author: author,
                message: message,
                color: this.selectedColor
            });

            // Clear form
            if (authorInput) authorInput.value = '';
            if (messageInput) messageInput.value = '';

            // Show success message
            alert('Message posted successfully! ✨');

            // If creator, refresh comments immediately
            if (this.currentRole === 'creator') {
                ViewController.loadComments();
            }

        } catch (error) {
            alert('Error posting message! Please try again.');
            console.error('Error posting message:', error);
        }
    },

    // Copy link - ONLY for creator
    copyLink: function (inputId) {
        if (this.currentRole !== 'creator') {
            alert('Only the creator can copy links!');
            return;
        }

        const input = document.getElementById(inputId);
        if (input) {
            input.select();
            document.execCommand('copy');
            alert('Link copied! 📋');
        }
    },

    // Reset board
    reset: function () {
        this.currentBoard = null;
        this.currentRole = 'contributor';
        this.selectedColor = '#FFD700';
        this.selectedAesthetic = 'professional';
    }
};