// UI Controller - FIXED VERSION
const UIController = {
    // UI Elements
    elements: {},

    // Initialize UI
    init: function () {
        this.cacheElements();
        this.setupEventListeners();
        this.renderAesthetics();
        this.createFloatingCards();
        console.log('UI Controller initialized');
    },

    // Cache DOM elements
    cacheElements: function () {
        this.elements = {
            libraryDropdown: document.getElementById('libraryDropdown'),
            floatingCardCar: document.getElementById('floatingCardCar'),
            libraryModal: document.getElementById('libraryModal'),
            joinModal: document.getElementById('joinModal'),
            landingPage: document.getElementById('landing'),
            boardPage: document.getElementById('boardPage'),
            viewPage: document.getElementById('viewPage'),
            floatingCards: document.getElementById('floatingCards')
        };
        console.log('Cached elements:', Object.keys(this.elements));
    },

    // Setup event listeners
    setupEventListeners: function () {
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            this.handleClickOutside(e);
        });

        // Add mouse parallax effect
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    },

    // Handle click outside dropdowns
    handleClickOutside: function (e) {
        const navDropdown = this.elements.libraryDropdown;
        const floatingCar = this.elements.floatingCardCar;
        const libraryBtn = document.querySelector('.btn-library');
        const ctaContainer = document.querySelector('.cta-container');

        if (navDropdown && libraryBtn && !navDropdown.contains(e.target) && !libraryBtn.contains(e.target)) {
            navDropdown.classList.remove('active');
        }

        if (floatingCar && ctaContainer && !floatingCar.contains(e.target) && !ctaContainer.contains(e.target)) {
            floatingCar.classList.remove('active');
        }
    },

    // Handle mouse move for parallax
    handleMouseMove: function (e) {
        const cards = document.querySelectorAll('.floating-card');
        if (!cards.length) return;

        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        cards.forEach((card, index) => {
            const speed = (index % 3 + 1) * 10;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            card.style.transform += ` translate(${x}px, ${y}px)`;
        });
    },

    // Close all modals
    closeAllModals: function() {
        this.closeLibrary();
        this.closeJoinModal();
    },

    // Create floating cards background
    createFloatingCards: function () {
        if (!this.elements.floatingCards) return;

        const numCards = 15;
        this.elements.floatingCards.innerHTML = '';

        for (let i = 0; i < numCards; i++) {
            const card = document.createElement('div');
            card.className = 'floating-card';

            const design = DESIGN_CARDS[Math.floor(Math.random() * DESIGN_CARDS.length)];
            card.style.background = design.bg;

            card.style.left = Math.random() * 100 + '%';
            const duration = 15 + Math.random() * 10;
            card.style.animationDuration = duration + 's';
            card.style.animationDelay = Math.random() * 5 + 's';
            const scale = 0.8 + Math.random() * 0.4;
            card.style.transform = `scale(${scale})`;

            this.elements.floatingCards.appendChild(card);
        }
    },

    // Render aesthetics in dropdown and car ONLY
    renderAesthetics: function () {
        this.renderDropdownAesthetics();
        this.renderCarAesthetics();
    },

    // Render aesthetics in dropdown
    renderDropdownAesthetics: function () {
        const dropdown = this.elements.libraryDropdown;
        if (!dropdown) return;

        dropdown.innerHTML = CONSTANTS.AESTHETICS.map(aesthetic => `
            <div class="dropdown-item" data-aesthetic="${aesthetic}" onclick="selectAestheticFromDropdown('${aesthetic}')">
                <div class="dropdown-icon">
                    <img src="images/${aesthetic}.jpeg" style="width: 42px; height: 42px;" alt="${CONSTANTS.AESTHETIC_NAMES[aesthetic]}">
                </div>
                <div class="dropdown-text">
                    <h4>${CONSTANTS.AESTHETIC_NAMES[aesthetic]}</h4>
                    <p>${CONSTANTS.AESTHETIC_DESCRIPTIONS[aesthetic]}</p>
                </div>
            </div>
        `).join('');
    },

    // Render aesthetics in car layout
    renderCarAesthetics: function () {
        const car = this.elements.floatingCardCar;
        if (!car) return;

        const firstThree = CONSTANTS.AESTHETICS.slice(0, 3);
        const lastTwo = CONSTANTS.AESTHETICS.slice(3);

        const carLayout = `
            <div class="car-layout">
                ${firstThree.map(aesthetic => `
                    <div class="car-button" data-aesthetic="${aesthetic}" onclick="selectAestheticFromCar('${aesthetic}')">
                        <div class="car-icon">
                            <img src="images/${aesthetic}.jpeg" style="width: 42px; height: 42px;" alt="${CONSTANTS.AESTHETIC_NAMES[aesthetic]}">
                        </div>
                        <div class="car-text">
                            <h4>${CONSTANTS.AESTHETIC_NAMES[aesthetic]}</h4>
                            <p>${CONSTANTS.AESTHETIC_DESCRIPTIONS[aesthetic].split(',')[0]}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="car-row-2">
                ${lastTwo.map(aesthetic => `
                    <div class="car-button" data-aesthetic="${aesthetic}" onclick="selectAestheticFromCar('${aesthetic}')">
                        <div class="car-icon">
                            <img src="images/${aesthetic}.jpeg" style="width: 42px; height: 42px;" alt="${CONSTANTS.AESTHETIC_NAMES[aesthetic]}">
                        </div>
                        <div class="car-text">
                            <h4>${CONSTANTS.AESTHETIC_NAMES[aesthetic]}</h4>
                            <p>${CONSTANTS.AESTHETIC_DESCRIPTIONS[aesthetic].split(',')[0]}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        car.innerHTML = carLayout;
    },

    // Toggle library dropdown
    toggleLibrary: function () {
        if (this.elements.libraryDropdown) {
            this.elements.libraryDropdown.classList.toggle('active');
        }
        if (this.elements.floatingCardCar) {
            this.elements.floatingCardCar.classList.remove('active');
        }
    },

    // Toggle floating card car
    toggleFloatingCar: function () {
        if (this.elements.floatingCardCar) {
            this.elements.floatingCardCar.classList.toggle('active');
        }
        if (this.elements.libraryDropdown) {
            this.elements.libraryDropdown.classList.remove('active');
        }
    },

    // Open library modal
    openLibraryModal: function () {
        if (this.elements.libraryModal) {
            this.elements.libraryModal.classList.add('active');
        }
        setTimeout(() => {
            const recipientName = document.getElementById('recipientName');
            if (recipientName) recipientName.focus();
        }, 100);
    },

    // Close library modal
    closeLibrary: function () {
        if (this.elements.libraryModal) {
            this.elements.libraryModal.classList.remove('active');
        }
        const recipientName = document.getElementById('recipientName');
        if (recipientName) recipientName.value = '';
    },

    // Open join modal
    openJoinModal: function () {
        if (this.elements.joinModal) {
            this.elements.joinModal.classList.add('active');
            setTimeout(() => {
                const joinCode = document.getElementById('joinCode');
                if (joinCode) joinCode.focus();
            }, 100);
        }
    },

    // Close join modal
    closeJoinModal: function () {
        if (this.elements.joinModal) {
            this.elements.joinModal.classList.remove('active');
        }
        const joinCode = document.getElementById('joinCode');
        if (joinCode) joinCode.value = '';
    },

    // Show board page
    showBoardPage: function() {
        // Hide all pages
        if (this.elements.landingPage) {
            this.elements.landingPage.style.display = 'none';
        }
        
        if (this.elements.viewPage) {
            this.elements.viewPage.style.display = 'none';
            this.elements.viewPage.classList.remove('active');
        }
        
        // Show board page
        if (this.elements.boardPage) {
            this.elements.boardPage.style.display = 'block';
            this.elements.boardPage.classList.add('active');
        }
    },

    // Show view page
    showViewPage: function() {
        // Hide all pages
        if (this.elements.landingPage) {
            this.elements.landingPage.style.display = 'none';
        }
        
        if (this.elements.boardPage) {
            this.elements.boardPage.style.display = 'none';
            this.elements.boardPage.classList.remove('active');
        }
        
        // Show view page
        if (this.elements.viewPage) {
            this.elements.viewPage.style.display = 'block';
            this.elements.viewPage.classList.add('active');
        }
    },

    // Show landing page
    showLandingPage: function() {
        if (this.elements.landingPage) {
            this.elements.landingPage.style.display = 'flex';
        }
        
        // Hide other pages
        if (this.elements.boardPage) {
            this.elements.boardPage.style.display = 'none';
            this.elements.boardPage.classList.remove('active');
        }
        
        if (this.elements.viewPage) {
            this.elements.viewPage.style.display = 'none';
            this.elements.viewPage.classList.remove('active');
        }
    }
};

// ==========================================
// Expose UI functions to global scope
// ==========================================
window.toggleLibrary = () => UIController.toggleLibrary();
window.toggleFloatingCar = () => UIController.toggleFloatingCar();
window.selectAestheticFromDropdown = (aesthetic) => App.selectAesthetic(aesthetic);
window.selectAestheticFromCar = (aesthetic) => App.selectAesthetic(aesthetic);
window.openJoinModal = () => UIController.openJoinModal();
window.closeJoinModal = () => UIController.closeJoinModal();
window.closeLibrary = () => UIController.closeLibrary();