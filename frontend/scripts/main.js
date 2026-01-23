// Main Application
const App = {
    // Initialize application
    init: function () {
        UIController.init();
        this.bindEvents();
        this.checkForBoardInURL();
    },

    // Bind global events
    bindEvents: function () {
        // Global event listeners
        window.addEventListener('DOMContentLoaded', () => {
            console.log('App initialized with strict role permissions');
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
    },

    // Check for board in URL parameters
    checkForBoardInURL: function () {
        const boardId = Utils.getUrlParameter('board');
        const code = Utils.getUrlParameter('code');
        const contribute = Utils.getUrlParameter('contribute');
        const view = Utils.getUrlParameter('view');

        if (boardId) {
            // Load existing board with role detection
            this.loadBoard(boardId);
        } else if (code) {
            // Join board with code - will be contributor
            document.getElementById('joinCode').value = code;
            this.joinBoardWithCode(code);
        } else if (contribute) {
            // Load board for contribution (contributor role)
            this.loadBoardAsContributor(contribute);
        } else if (view) {
            // Load board by view token (viewer role only)
            this.loadBoardAsViewer(view);
        }
    },

    // Select aesthetic
    selectAesthetic: function (aesthetic) {
        BoardController.selectedAesthetic = aesthetic;
        UIController.openLibraryModal();
    },

    // Create new board (becomes creator)
    createBoard: async function () {
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

            // Save creator token to localStorage
            if (boardData.creator_token) {
                localStorage.setItem(`hypewall_creator_${boardData.id}`, boardData.creator_token);
            }

            // Initialize as creator
            BoardController.init(boardData, 'creator');
            UIController.showView('creator');
            UIController.closeLibrary();
        } catch (error) {
            alert('Error creating board. Make sure Flask server is running!');
            console.error('Error creating board:', error);
        }
    },

    // Join board with code (becomes contributor)
    joinBoard: async function () {
        const code = document.getElementById('joinCode').value.toUpperCase();

        if (!code.trim()) {
            alert('Please enter a join code!');
            return;
        }

        await this.joinBoardWithCode(code);
    },

    // Join board with code (internal)
    joinBoardWithCode: async function (code) {
        try {
            const boardData = await ApiService.joinBoard(code);

            // Contributors joining via code are NOT creators
            BoardController.init(boardData, 'contributor');
            UIController.showView('contributor');
            UIController.closeJoinModal();
        } catch (error) {
            alert('Invalid code! Please check and try again.');
            console.error('Error joining board:', error);
        }
    },

    // Load board as contributor
    loadBoardAsContributor: async function (boardId) {
        try {
            const boardData = await ApiService.getBoard(boardId);
            BoardController.init(boardData, 'contributor');
            UIController.showView('contributor');
        } catch (error) {
            console.error('Error loading board as contributor:', error);
            alert('Unable to load board. Please check the URL.');
        }
    },

    // Load board as viewer
    loadBoardAsViewer: async function (viewToken) {
        try {
            const boardData = await ApiService.getBoardByViewToken(viewToken);
            BoardController.init(boardData, 'viewer');
            UIController.showView('viewer');
        } catch (error) {
            console.error('Error loading board as viewer:', error);
            alert('Unable to load board. Please check the URL.');
        }
    },

    // Load existing board (legacy support)
    loadBoard: async function (boardId) {
        try {
            const boardData = await ApiService.getBoard(boardId);

            // Determine Role from URL or localStorage
            const urlParams = new URLSearchParams(window.location.search);
            let role = 'contributor'; // Default

            if (urlParams.has('view')) {
                role = 'viewer';
            } else if (urlParams.has('contribute')) {
                role = 'contributor';
            } else {
                // Check if creator via localStorage
                const storedToken = localStorage.getItem(`hypewall_creator_${boardId}`);
                if (storedToken) {
                    role = 'creator';
                }
            }

            BoardController.init(boardData, role);
            UIController.showView(role);

        } catch (error) {
            console.error('Error loading board:', error);
            alert('Unable to load board. Please check the URL.');
        }
    }
};

// Initialize the application
App.init();