// Board Controller
const BoardController = {
    // Board state
    currentBoard: null,
    isCreator: false,
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

    // Initialize board
    init: function(boardData, creator = false) {
        this.currentBoard = boardData;
        this.isCreator = creator;
        this.selectedAesthetic = boardData.aesthetic;
        
        this.updateUI();
        this.setupColorPicker();
        
        // Update recipient name in title
        document.getElementById('boardRecipientName').textContent = boardData.recipient_name;
    },

    // Update UI based on board state
    updateUI: function() {
        // Update title is now handled in init
        
        // Apply aesthetic
        this.applyAesthetic(this.currentBoard.aesthetic);
        
        // Show/hide creator view
        const creatorView = document.getElementById('creatorView');
        if (this.isCreator) {
            creatorView.classList.remove('hidden');
            this.updateShareLinks();
        } else {
            creatorView.classList.add('hidden');
        }
        
        // Show board page
        UIController.showBoardPage();
    },

    // Apply aesthetic to board
    applyAesthetic: function(aesthetic) {
        const boardPage = document.getElementById('boardPage');
        boardPage.style.background = this.aestheticBackgrounds[aesthetic] || this.aestheticBackgrounds['professional'];
    },

    // Update share links
    updateShareLinks: function() {
        if (!this.currentBoard) return;
        
        document.getElementById('contributorLink').value = 
            window.location.origin + (this.currentBoard.contributor_link || `/index.html?contribute=${this.currentBoard.id}`);
        
        document.getElementById('viewLink').value = 
            window.location.origin + (this.currentBoard.view_link || `/index.html?view=${this.currentBoard.view_token}`);
        
        document.getElementById('boardCode').textContent = this.currentBoard.join_code || 'ABC123';
    },

    // Setup color picker on board page
    setupColorPicker: function() {
        const colorPicker = document.getElementById('colorPicker');
        if (!colorPicker) return;
        
        colorPicker.innerHTML = '';
        const colors = this.aestheticColors[this.selectedAesthetic] || this.aestheticColors['professional'];
        
        colors.forEach((color, index) => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            if (index === 0) colorOption.classList.add('selected');
            
            colorOption.style.backgroundColor = color;
            colorOption.title = color;
            colorOption.onclick = (e) => {
                this.selectColor(color, e.currentTarget);
            };
            
            colorPicker.appendChild(colorOption);
        });
        
        this.selectedColor = colors[0];
    },

    // Select color
    selectColor: function(color, element) {
        this.selectedColor = color;
        document.querySelectorAll('#colorPicker .color-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        element.classList.add('selected');
    },

    // Post message from board page
    postMessage: async function() {
        const author = document.getElementById('commentAuthor').value || 'Anonymous';
        const message = document.getElementById('commentMessage').value;
        
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
            document.getElementById('commentAuthor').value = '';
            document.getElementById('commentMessage').value = '';
            
            // Show success message
            alert('Message posted successfully! ✨');
            
            // Auto-navigate to view page to see the new message
            this.navigateToViewPage();
            
        } catch (error) {
            alert('Error posting message! Please try again.');
            console.error('Error posting message:', error);
        }
    },

    // Navigate to view page (comments only)
    navigateToViewPage: function() {
        if (!this.currentBoard) return;
        
        // Initialize view page with current board data
        ViewController.init(this.currentBoard);
    },

    // Copy link
    copyLink: function(inputId) {
        const input = document.getElementById(inputId);
        input.select();
        document.execCommand('copy');
        alert('Link copied! 📋');
    },

    // Reset board
    reset: function() {
        this.currentBoard = null;
        this.isCreator = false;
        this.selectedColor = '#FFD700';
        this.selectedAesthetic = 'professional';
    }
};