// API Service
const ApiService = {
    API_URL: CONSTANTS.API_URL,

    // Create a new board
    createBoard: async function(aesthetic, recipientName) {
        try {
            const response = await fetch(`${this.API_URL}/boards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    aesthetic: aesthetic, 
                    recipient_name: recipientName 
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating board:', error);
            throw error;
        }
    },

    // Join board by code
    joinBoard: async function(code) {
        try {
            const response = await fetch(`${this.API_URL}/boards/code/${code.toUpperCase()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error joining board:', error);
            throw error;
        }
    },

    // Get board by ID
    getBoard: async function(boardId) {
        try {
            const response = await fetch(`${this.API_URL}/boards/${boardId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting board:', error);
            throw error;
        }
    },

    // Get board by view token (for view page)
    getBoardByViewToken: async function(viewToken) {
        try {
            const response = await fetch(`${this.API_URL}/boards/view/${viewToken}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting board by view token:', error);
            throw error;
        }
    },

    // Add comment to board
    addComment: async function(boardId, commentData) {
        try {
            const response = await fetch(`${this.API_URL}/boards/${boardId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    // Get all comments for a board
    getComments: async function(boardId) {
        try {
            const response = await fetch(`${this.API_URL}/boards/${boardId}/comments`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting comments:', error);
            throw error;
        }
    },

    // Delete a comment
    deleteComment: async function(boardId, commentId) {
        try {
            const response = await fetch(`${this.API_URL}/boards/${boardId}/comments/${commentId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }
};