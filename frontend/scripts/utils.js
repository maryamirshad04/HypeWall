// Utility functions
const Utils = {
    // Copy text to clipboard
    copyToClipboard: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    },

    // Generate random ID
    generateId: function() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Format date
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Validate email
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Get URL parameters
    getUrlParameter: function(name) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
};

// Constants
const CONSTANTS = {
    API_URL: 'http://localhost:5000/api',
    AESTHETICS: ['professional', 'dark-academia', 'cottage-core', 'tech-neon', 'retro-90s'],
    AESTHETIC_NAMES: {
        'professional': 'Professional Minimalist',
        'dark-academia': 'Dark Academia',
        'cottage-core': 'Cottage Core',
        'tech-neon': 'Tech Neon',
        'retro-90s': '90s Retro'
    },
    AESTHETIC_DESCRIPTIONS: {
        'professional': 'Clean, crisp, corporate chic',
        'dark-academia': 'Moody, scholarly vibes',
        'cottage-core': 'Soft, dreamy, pastoral',
        'tech-neon': 'Cyberpunk energy',
        'retro-90s': 'Totally radical throwback'
    }
};

// Design card images for floating background
const DESIGN_CARDS = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', type: 'gradient' },
];