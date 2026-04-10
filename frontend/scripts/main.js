// Main Application - FIXED VERSION
const App = {
    // Initialize application
    init: function() {
        console.log('App initializing...');
        
        // Make sure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.startApp();
            });
        } else {
            this.startApp();
        }
    },

    // Start the application
    startApp: function() {
        console.log('Starting app...');
        
        // Initialize controllers
        try {
            if (typeof UIController !== 'undefined') {
                UIController.init();
            } else {
                console.error('UIController not found');
            }
            
            this.bindEvents();
            this.checkForBoardInURL();
            
            console.log('App started successfully');
        } catch (error) {
            console.error('Error starting app:', error);
        }
    },

    // Bind global events
    bindEvents: function() {
        // Expose functions to global scope
        window.createBoard = () => this.createBoard();
        window.joinBoard = () => this.joinBoard();
        window.postMessage = () => BoardController.postMessage();
        window.copyLink = (inputId) => BoardController.copyLink(inputId);
        window.navigateToViewPage = () => BoardController.navigateToViewPage();
        window.returnToBoard = () => {
            if (typeof ViewController !== 'undefined') {
                ViewController.returnToBoard();
            }
        };
        
        console.log('Global functions bound');
    },

    // Check for board in URL parameters
    checkForBoardInURL: function() {
        console.log('Checking URL parameters...');
        
        const boardId = Utils.getUrlParameter('board');
        const code = Utils.getUrlParameter('code');
        const contribute = Utils.getUrlParameter('contribute');
        const view = Utils.getUrlParameter('view');
        
        console.log('URL parameters:', { boardId, code, contribute, view });
        
        if (boardId) {
            console.log('Loading board by ID:', boardId);
            this.loadBoard(boardId);
        } else if (code) {
            console.log('Joining board with code:', code);
            const joinCodeInput = document.getElementById('joinCode');
            if (joinCodeInput) {
                joinCodeInput.value = code.toUpperCase();
            }
            this.joinBoardWithCode(code);
        } else if (contribute) {
            console.log('Loading board for contribution:', contribute);
            this.loadBoardForContribution(contribute);
        } else if (view) {
            console.log('Loading board by view token:', view);
            this.loadBoardByViewToken(view);
        } else {
            console.log('No URL parameters found, showing landing page');
        }
    },

    // Select aesthetic
    selectAesthetic: function(aesthetic) {
        console.log('Aesthetic selected:', aesthetic);
        BoardController.selectedAesthetic = aesthetic;
        UIController.openLibraryModal();
    },

    // Create new board - FIXED VERSION
    createBoard: async function() {
        console.log('createBoard() called');
        
        const recipientName = document.getElementById('recipientName');
        if (!recipientName) {
            console.error('recipientName input not found!');
            alert('Error: Form element not found. Please refresh the page.');
            return;
        }
        
        const name = recipientName.value.trim();
        const aesthetic = BoardController.selectedAesthetic;
        
        console.log('Creating board with:', { name, aesthetic });
        
        if (!name) {
            alert('Please enter a recipient name!');
            return;
        }
        
        try {
            console.log('Calling API to create board...');
            const boardData = await ApiService.createBoard(aesthetic, name);
            console.log('Board created successfully:', boardData);
            
            // Initialize board as creator (true means creator)
            BoardController.init(boardData, true);
            
            // Close library modal
            UIController.closeLibrary();
            
            // Show success message
            const colors = BoardController.boardPageColors[aesthetic] || BoardController.boardPageColors['professional'];
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
            alertBox.textContent = 'Board created successfully! 🎉';
            document.body.appendChild(alertBox);
            
            setTimeout(() => {
                alertBox.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => document.body.removeChild(alertBox), 300);
            }, 2000);
            
        } catch (error) {
            console.error('Error creating board:', error);
            
            // Check if it's a network error
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                alert('Network error: Cannot connect to the server. Please make sure:\n1. Flask server is running on port 5000\n2. Check console for CORS errors');
            } else {
                alert('Error creating board: ' + error.message);
            }
        }
    },

    // Join board with code
    joinBoard: async function() {
        const joinCodeInput = document.getElementById('joinCode');
        if (!joinCodeInput) {
            alert('Join code input not found!');
            return;
        }
        
        const code = joinCodeInput.value.trim().toUpperCase();
        
        if (!code) {
            alert('Please enter a join code!');
            return;
        }
        
        console.log('Joining board with code:', code);
        
        await this.joinBoardWithCode(code);
    },

    // Join board with code (internal)
    joinBoardWithCode: async function(code) {
        try {
            const boardData = await ApiService.joinBoard(code);
            console.log('Board joined successfully:', boardData);
            
            // Initialize board as contributor (false means not creator)
            BoardController.init(boardData, false);
            UIController.closeJoinModal();
            
            // Show success message
            const colors = BoardController.boardPageColors[boardData.aesthetic] || BoardController.boardPageColors['professional'];
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
            alertBox.textContent = 'Board joined successfully! 🎉';
            document.body.appendChild(alertBox);
            
            setTimeout(() => {
                alertBox.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => document.body.removeChild(alertBox), 300);
            }, 2000);
            
        } catch (error) {
            console.error('Error joining board:', error);
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                alert('Network error: Cannot connect to the server. Please check if server is running.');
            } else if (error.message.includes('404')) {
                alert('Invalid code! Please check and try again.');
            } else {
                alert('Error joining board: ' + error.message);
            }
        }
    },

    // Load existing board (for board page)
    loadBoard: async function(boardId) {
        try {
            const boardData = await ApiService.getBoard(boardId);
            const isCreator = this.checkIfCreator(boardData);
            
            console.log('Loading board as:', isCreator ? 'creator' : 'contributor');
            BoardController.init(boardData, isCreator);
            
        } catch (error) {
            console.error('Error loading board:', error);
            alert('Unable to load board. Please check the URL.');
        }
    },

    // Load board for contribution
    loadBoardForContribution: async function(boardId) {
        try {
            const boardData = await ApiService.getBoard(boardId);
            console.log('Loading board for contribution:', boardData);
            BoardController.init(boardData, false); // false = contributor
            
        } catch (error) {
            console.error('Error loading board for contribution:', error);
            alert('Unable to load board. Please check the URL.');
        }
    },

    // Load board by view token (for view page only)
    loadBoardByViewToken: async function(viewToken) {
        try {
            const boardData = await ApiService.getBoardByViewToken(viewToken);
            console.log('Loading board by view token:', boardData);
            
            // Initialize view controller
            if (typeof ViewController !== 'undefined') {
                ViewController.init(boardData);
            }
            
        } catch (error) {
            console.error('Error loading board by view token:', error);
            alert('Unable to load board. Please check the URL.');
        }
    },

    // Check if user is creator of the board
    checkIfCreator: function(boardData) {
        // Check if user accessed via creator link (has board ID in URL)
        const boardId = Utils.getUrlParameter('board');
        return boardId === boardData.id;
    }
};

// Initialize the application
console.log('App script loaded');
App.init();