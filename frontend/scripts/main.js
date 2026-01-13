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
        window.postMessage = () => BoardController.postMessage();
        window.copyLink = (inputId) => BoardController.copyLink(inputId);
        window.closeLibrary = () => UIController.closeLibrary();
        window.navigateToViewPage = () => BoardController.navigateToViewPage();
        window.returnToBoard = () => ViewController.returnToBoard();
    },

    // Check for board in URL parameters
    checkForBoardInURL: function() {
        const boardId = Utils.getUrlParameter('board');
        const code = Utils.getUrlParameter('code');
        const contribute = Utils.getUrlParameter('contribute');
        const view = Utils.getUrlParameter('view');
        
        if (boardId) {
            // Load existing board
            this.loadBoard(boardId);
        } else if (code) {
            // Join board with code
            document.getElementById('joinCode').value = code;
            this.joinBoardWithCode(code);
        } else if (contribute) {
            // Load board for contribution (board page)
            this.loadBoard(contribute);
        } else if (view) {
            // Load board by view token (view page only)
            this.loadBoardByViewToken(view);
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
        
        if (!recipientName.trim()) {
            alert('Please enter a recipient name!');
            return;
        }
        
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
        
        if (!code.trim()) {
            alert('Please enter a join code!');
            return;
        }
        
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

    // Load existing board (for board page)
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

    // Load board by view token (for view page only)
    loadBoardByViewToken: async function(viewToken) {
        try {
            const boardData = await ApiService.getBoardByViewToken(viewToken);
            
            // Initialize view controller for view page only
            ViewController.init(boardData);
        } catch (error) {
            console.error('Error loading board by view token:', error);
            alert('Unable to load board. Please check the URL.');
        }
    },

    // Check if user is creator of the board
    checkIfCreator: function(boardData) {
        // Check if user accessed via contributor link (has board ID in URL)
        const contribute = Utils.getUrlParameter('contribute');
        return contribute === boardData.id;
    }
};

// Initialize the application
App.init();