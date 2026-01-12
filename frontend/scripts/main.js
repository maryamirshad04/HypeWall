// Main Application
const App = {
    // Initialize application
    init: function() {
        UIController.init();
        this.bindEvents();
        this.checkForBoardInURL();
    },

    // Bind global events
    bindEvents: function() {
        // Global event listeners
        window.addEventListener('DOMContentLoaded', () => {
            console.log('App initialized');
        });

        // Expose functions to global scope
        window.toggleLibrary = () => UIController.toggleLibrary();
        window.toggleFloatingCar = () => UIController.toggleFloatingCar();
        window.selectAestheticFromDropdown = (aesthetic) => this.selectAesthetic(aesthetic);
        window.selectAestheticFromCar = (aesthetic) => this.selectAesthetic(aesthetic);
        window.openJoinModal = () => UIController.openJoinModal();
        window.closeJoinModal = () => UIController.closeJoinModal();
        window.createBoard = () => this.createBoard();
        window.joinBoard = () => this.joinBoard();
        window.addComment = () => BoardController.addComment();
        window.copyLink = (inputId) => BoardController.copyLink(inputId);
        window.closeLibrary = () => UIController.closeLibrary();
    },

    // Check for board in URL parameters
    checkForBoardInURL: function() {
        const boardId = Utils.getUrlParameter('board');
        const code = Utils.getUrlParameter('code');
        
        if (boardId) {
            // Load existing board
            this.loadBoard(boardId);
        } else if (code) {
            // Join board with code
            document.getElementById('joinCode').value = code;
            this.joinBoardWithCode(code);
        }
    },

    // Select aesthetic
    selectAesthetic: function(aesthetic) {
        BoardController.selectedAesthetic = aesthetic;
        UIController.openLibraryModal();
    },

    // Create new board
    createBoard: async function() {
        const recipientName = document.getElementById('recipientName').value || 'Someone Special';
        
        try {
            const boardData = await ApiService.createBoard(
                BoardController.selectedAesthetic, 
                recipientName
            );
            
            BoardController.init(boardData, true);
            UIController.closeLibrary();
        } catch (error) {
            alert('Error creating board. Make sure Flask server is running!');
            console.error('Error creating board:', error);
        }
    },

    // Join board with code
    joinBoard: async function() {
        const code = document.getElementById('joinCode').value.toUpperCase();
        await this.joinBoardWithCode(code);
    },

    // Join board with code (internal)
    joinBoardWithCode: async function(code) {
        try {
            const boardData = await ApiService.joinBoard(code);
            
            BoardController.init(boardData, false);
            UIController.closeJoinModal();
        } catch (error) {
            alert('Invalid code! Please check and try again.');
            console.error('Error joining board:', error);
        }
    },

    // Load existing board
    loadBoard: async function(boardId) {
        try {
            const boardData = await ApiService.getBoard(boardId);
            const isCreator = this.checkIfCreator(boardData);
            
            BoardController.init(boardData, isCreator);
        } catch (error) {
            console.error('Error loading board:', error);
            alert('Unable to load board. Please check the URL.');
        }
    },

    // Check if user is creator of the board
    checkIfCreator: function(boardData) {
        // This would typically check against stored user session or tokens
        // For now, we'll assume creator is viewing via view link
        return window.location.pathname.includes('/board/') && 
               !window.location.pathname.includes('/join');
    }
};

// Initialize the application
App.init();