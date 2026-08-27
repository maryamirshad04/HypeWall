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

// ─── Media helpers (uploads → data URLs) ─────────────────────────
const MediaUtils = {
    MAX_AUDIO_BYTES: 4 * 1024 * 1024, // 4MB
    MAX_GIF_BYTES: 3 * 1024 * 1024,   // 3MB (GIFs can't be recompressed client-side)

    // Read any file as a data URL
    fileToDataUrl: function (file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // Downscale + compress a still image; GIFs are passed through (with size cap)
    // so their animation is preserved.
    imageToDataUrl: async function (file) {
        if (file.type === 'image/gif') {
            if (file.size > this.MAX_GIF_BYTES) {
                throw new Error('GIF is too large (max 3MB). Try a smaller one!');
            }
            return this.fileToDataUrl(file);
        }

        const rawUrl = await this.fileToDataUrl(file);
        const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Could not read that image.'));
            image.src = rawUrl;
        });

        const MAX_DIM = 1600;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
            const scale = MAX_DIM / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg', 0.82);
    },

    audioToDataUrl: async function (file) {
        if (file.size > this.MAX_AUDIO_BYTES) {
            throw new Error('Audio is too large (max 4MB). Try a shorter clip!');
        }
        return this.fileToDataUrl(file);
    }
};

// Constants
const CONSTANTS = {
    API_URL: '/api',
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
// Cottagecore palette: sage, cream, moss, honey, terracotta, clay
const DESIGN_CARDS = [
    { bg: 'linear-gradient(135deg, #9caf88 0%, #6b8e5a 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #f5edda 0%, #d9c8a8 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #d9a441 0%, #b9873e 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #c47e5a 0%, #a05f3f 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #b6cf9d 0%, #8fb573 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #e9dfc8 0%, #c9b490 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #7a9668 0%, #4c6b41 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #e4b57c 0%, #c99a5f 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #f0e6d0 0%, #dcc9a3 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #8a6d4f 0%, #6d4c33 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #aec99a 0%, #d9c8a8 100%)', type: 'gradient' },
    { bg: 'linear-gradient(135deg, #f6efe0 0%, #e0d3b4 100%)', type: 'gradient' },
];