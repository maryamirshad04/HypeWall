// Board Controller
const BoardController = {
    // Board state
    currentBoard: null,
    isCreator: false,
    selectedColor: '#FFD700',
    selectedAesthetic: 'professional',

    // Aesthetic colors mapping for COMMENTS ONLY
    aestheticColors: {
        'professional': ['#E8EAF6', '#C5CAE9', '#9FA8DA', '#7986CB', '#5C6BC0'],
        'dark-academia': ['#D4AF37', '#C19A6B', '#8B7355', '#654321', '#3E2723'],
        'cottage-core': ['#87eafc', '#6eefd1', '#54e098', '#5acd65', '#d9f0b3'],
        'tech-neon': ['#00FF88', '#00D9FF', '#FF00FF', '#FFFF00', '#FF0080'],
        'retro-90s': ['#FF6B9D', '#C06C84', '#FFA07A', '#FFD700', '#87CEEB']
    },

    // Aesthetic background images mapping for VIEW PAGE
    aestheticBackgrounds: {
        'professional': 'images/professionalbg.jpeg',
        'dark-academia': 'images/dark-academiabg.jpeg',
        'cottage-core': 'images/cottage-corebg.jpeg',
        'tech-neon': 'images/tech-neonbg.jpeg',
        'retro-90s': 'images/retro-90sbg.jpeg'
    },

    // Board page form colors by aesthetic
    boardPageColors: {
        'professional': {
            backgroundColor: '#F0F5FF', // Light blue background
            formBackground: '#E8EAF6', // Light blue-grey for forms
            textColor: '#1a1a1a',
            borderColor: '#7986CB',
            accentColor: '#5C6BC0'
        },
        'dark-academia': {
            backgroundColor: '#F5F1E8', // Pale beige/brown background
            formBackground: '#D7CCC8', // Light brown for forms
            textColor: '#3E2723', // Dark brown text
            borderColor: '#8B7355',
            accentColor: '#654321'
        },
        'tech-neon': {
            backgroundColor: '#0A0A1A', // Dark blue-grey background
            formBackground: '#1A1A2E', // Darker blue-grey for forms
            textColor: '#FFFFFF', // White text
            borderColor: '#00FF88',
            accentColor: '#00D9FF'
        },
        'cottage-core': {
            backgroundColor: '#93e9ce', // Pale yellow background
            formBackground: '#2bbda5', // Slightly darker pale yellow for forms
            textColor: '#1e513d', // Brown text
            borderColor: '#58e7e5',
            accentColor: '#07abde'
        },
        'retro-90s': {
            backgroundColor: '#FFEBEE', // Pale pink background
            formBackground: '#FFE4E1', // Light pink for forms
            textColor: '#C2185B', // Pink text
            borderColor: '#FF6B9D',
            accentColor: '#FF0080'
        }
    },

    // Initialize board
    init: function (boardData, creator = false) {
        this.currentBoard = boardData;
        this.isCreator = creator;
        this.selectedAesthetic = boardData.aesthetic;

        this.updateUI();
        this.setupColorPicker();

        // Update recipient name in title
        document.getElementById('boardRecipientName').textContent = boardData.recipient_name;
    },

    // Update UI based on board state
    updateUI: function () {
        // Apply aesthetic-themed styling to board page
        this.applyBoardPageStyle();

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

    // Apply aesthetic-themed styling to board page
    applyBoardPageStyle: function () {
        const boardPage = document.getElementById('boardPage');
        if (!boardPage) return;

        const colors = this.boardPageColors[this.selectedAesthetic] || this.boardPageColors['professional'];

        // Apply background color to board page
        boardPage.style.backgroundColor = colors.backgroundColor;
        boardPage.style.backgroundImage = 'none';
        boardPage.style.color = colors.textColor;
        boardPage.style.backgroundSize = 'auto';
        boardPage.style.backgroundRepeat = 'repeat';
        boardPage.style.backgroundAttachment = 'scroll';

        // Style the share-section and message-form with aesthetic colors
        const shareSections = document.querySelectorAll('.share-section, .message-form');
        shareSections.forEach(section => {
            section.style.color = colors.textColor;
            section.style.backgroundColor = colors.formBackground;
            section.style.border = `1px solid ${colors.borderColor}`;
            section.style.boxShadow = `0 4px 15px rgba(0, 0, 0, 0.1), 0 2px 4px ${colors.borderColor}20`;
        });

        // Style buttons
        const buttons = document.querySelectorAll('.btn-view-messages, .copy-btn, .create-button');
        buttons.forEach(button => {
            button.style.backgroundColor = colors.accentColor;
            button.style.color = colors.textColor === '#FFFFFF' ? '#000000' : '#FFFFFF'; // Contrast text
            button.style.border = `1px solid ${colors.borderColor}`;
            button.style.transition = 'all 0.3s ease';
            
            // Hover effect
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = this.darkenColor(colors.accentColor, 20);
                button.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = colors.accentColor;
                button.style.transform = 'translateY(0)';
            });
        });

        // Style form inputs
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            input.style.color = colors.textColor;
            input.style.border = `2px solid ${colors.borderColor}`;
            input.style.borderRadius = '8px';
            input.style.padding = '0.75rem 1rem';
            
            input.addEventListener('focus', () => {
                input.style.borderColor = colors.accentColor;
                input.style.boxShadow = `0 0 0 3px ${colors.accentColor}40`;
            });
            
            input.addEventListener('blur', () => {
                input.style.borderColor = colors.borderColor;
                input.style.boxShadow = 'none';
            });
        });

        // Style labels
        const labels = document.querySelectorAll('.form-group label');
        labels.forEach(label => {
            label.style.color = colors.textColor;
            label.style.fontWeight = '600';
        });

        // Style headings
        const headings = document.querySelectorAll('.board-header h1, .share-section h3, .message-form h3');
        headings.forEach(heading => {
            heading.style.color = colors.textColor;
        });

        // Style board title
        const boardTitle = document.getElementById('boardTitle');
        if (boardTitle) {
            boardTitle.style.color = colors.textColor;
            boardTitle.style.textShadow = `1px 1px 2px ${colors.borderColor}40`;
        }

        // Style share item headings
        const shareHeadings = document.querySelectorAll('.share-item h4');
        shareHeadings.forEach(heading => {
            heading.style.color = colors.accentColor;
        });

        // Style color picker label
        const colorLabel = document.querySelector('.color-picker-section label');
        if (colorLabel) {
            colorLabel.style.color = colors.textColor;
        }
    },

    // Helper function to darken colors
    darkenColor: function (color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    },

    // Update share links
    updateShareLinks: function () {
        if (!this.currentBoard) return;

        document.getElementById('contributorLink').value =
            window.location.origin + (this.currentBoard.contributor_link || `/index.html?contribute=${this.currentBoard.id}`);

        document.getElementById('viewLink').value =
            window.location.origin + (this.currentBoard.view_link || `/index.html?view=${this.currentBoard.view_token}`);

        document.getElementById('boardCode').textContent = this.currentBoard.join_code || 'ABC123';
    },

    // Setup color picker on board page (COMMENT COLORS ONLY)
    setupColorPicker: function () {
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
            colorOption.style.border = '2px solid rgba(255, 255, 255, 0.8)';
            colorOption.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            
            // Add hover effect
            colorOption.addEventListener('mouseenter', () => {
                colorOption.style.transform = 'scale(1.1)';
                colorOption.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            });
            
            colorOption.addEventListener('mouseleave', () => {
                if (!colorOption.classList.contains('selected')) {
                    colorOption.style.transform = 'scale(1)';
                    colorOption.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                }
            });

            colorOption.onclick = (e) => {
                this.selectColor(color, e.currentTarget);
            };

            colorPicker.appendChild(colorOption);
        });

        this.selectedColor = colors[0];
    },

    // Select color for comments
    selectColor: function (color, element) {
        this.selectedColor = color;
        document.querySelectorAll('#colorPicker .color-option').forEach(opt => {
            opt.classList.remove('selected');
            opt.style.transform = 'scale(1)';
            opt.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        });
        element.classList.add('selected');
        element.style.transform = 'scale(1.2)';
        element.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
    },

    // Post message from board page
    postMessage: async function () {
        const author = document.getElementById('commentAuthor').value || 'Anonymous';
        const message = document.getElementById('commentMessage').value;

        if (!message.trim()) {
            alert('Please write a message!');
            return;
        }

        try {
            console.log('📤 Posting message...');
            
            await ApiService.addComment(this.currentBoard.id, {
                author: author,
                message: message,
                color: this.selectedColor
            });

            console.log('✅ Message posted successfully!');

            // Clear form
            document.getElementById('commentAuthor').value = '';
            document.getElementById('commentMessage').value = '';

            // Show success message with aesthetic color
            const colors = this.boardPageColors[this.selectedAesthetic];
            const alertBox = document.createElement('div');
            alertBox.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background-color: ${colors.accentColor};
                color: ${colors.textColor === '#FFFFFF' ? '#000000' : '#FFFFFF'};
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                font-weight: 600;
                animation: slideIn 0.3s ease;
            `;
            alertBox.textContent = 'Message posted successfully! ✨';
            document.body.appendChild(alertBox);
            
            setTimeout(() => {
                alertBox.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => document.body.removeChild(alertBox), 300);
            }, 2000);

            // Navigate to view page after success
            setTimeout(() => {
                console.log('🔄 Navigating to view page...');
                this.navigateToViewPage();
            }, 2200);

        } catch (error) {
            console.error('❌ Error posting message:', error);
            
            // Error message with aesthetic color
            const colors = this.boardPageColors[this.selectedAesthetic];
            const alertBox = document.createElement('div');
            alertBox.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background-color: #FF6B6B;
                color: white;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                font-weight: 600;
                animation: slideIn 0.3s ease;
            `;
            alertBox.textContent = 'Error posting message! Please try again.';
            document.body.appendChild(alertBox);
            
            setTimeout(() => {
                alertBox.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => document.body.removeChild(alertBox), 300);
            }, 3000);
        }
    },

    // Navigate to view page (VIEW PAGE will handle its own aesthetics)
    navigateToViewPage: function () {
        if (!this.currentBoard) return;

        // Initialize view page with current board data
        ViewController.init(this.currentBoard);
    },

    // Copy link with aesthetic styling
    copyLink: function (inputId) {
        const input = document.getElementById(inputId);
        input.select();
        document.execCommand('copy');
        
        // Show styled notification
        const colors = this.boardPageColors[this.selectedAesthetic];
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 18px;
            background-color: ${colors.accentColor};
            color: ${colors.textColor === '#FFFFFF' ? '#000000' : '#FFFFFF'};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-weight: 600;
            font-size: 0.9rem;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = 'Link copied! 📋';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 1500);
    },

    // Get background image for aesthetic
    getBackgroundImage: function(aesthetic) {
        return this.aestheticBackgrounds[aesthetic] || this.aestheticBackgrounds['professional'];
    },

    // Reset board
    reset: function () {
        this.currentBoard = null;
        this.isCreator = false;
        this.selectedColor = '#FFD700';
        this.selectedAesthetic = 'professional';

        // Clear board page styling
        const boardPage = document.getElementById('boardPage');
        if (boardPage) {
            boardPage.style.background = '';
            boardPage.style.color = '';
            boardPage.style.backgroundColor = '';
            boardPage.style.backgroundImage = '';
        }
        
        // Reset all buttons and inputs
        const buttons = document.querySelectorAll('.btn-view-messages, .copy-btn, .create-button');
        buttons.forEach(button => {
            button.style.cssText = '';
        });
        
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.style.cssText = '';
        });
    }
};

// Add animation styles to CSS (you should add this to your main.css)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);