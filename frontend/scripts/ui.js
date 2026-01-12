// UI Controller
const UIController = {
    // UI Elements
    elements: {
        libraryDropdown: null,
        floatingCardCar: null,
        libraryModal: null,
        joinModal: null,
        landingPage: null,
        boardPage: null,
        floatingCards: null,
        colorPicker: null
    },

    // Initialize UI
    init: function() {
        this.cacheElements();
        this.setupEventListeners();
        this.renderAesthetics();
        this.createFloatingCards();
    },

    // Cache DOM elements
    cacheElements: function() {
        this.elements.libraryDropdown = document.getElementById('libraryDropdown');
        this.elements.floatingCardCar = document.getElementById('floatingCardCar');
        this.elements.libraryModal = document.getElementById('libraryModal');
        this.elements.joinModal = document.getElementById('joinModal');
        this.elements.landingPage = document.getElementById('landing');
        this.elements.boardPage = document.getElementById('boardPage');
        this.elements.floatingCards = document.getElementById('floatingCards');
        this.elements.colorPicker = document.getElementById('colorPicker');
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            this.handleClickOutside(e);
        });

        // Add mouse parallax effect
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
    },

    // Handle click outside dropdowns
    handleClickOutside: function(e) {
        const navDropdown = this.elements.libraryDropdown;
        const floatingCar = this.elements.floatingCardCar;
        const libraryBtn = document.querySelector('.btn-library');
        const ctaContainer = document.querySelector('.cta-container');
        
        if (!navDropdown.contains(e.target) && !libraryBtn.contains(e.target)) {
            navDropdown.classList.remove('active');
        }
        
        if (!floatingCar.contains(e.target) && !ctaContainer.contains(e.target)) {
            floatingCar.classList.remove('active');
        }
    },

    // Handle mouse move for parallax
    handleMouseMove: function(e) {
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

    // Create floating cards background
    createFloatingCards: function() {
        if (!this.elements.floatingCards) return;
        
        const numCards = 15;
        this.elements.floatingCards.innerHTML = '';

        for (let i = 0; i < numCards; i++) {
            const card = document.createElement('div');
            card.className = 'floating-card';
            
            const design = DESIGN_CARDS[Math.floor(Math.random() * DESIGN_CARDS.length)];
            card.style.background = design.bg;
            
            // Random horizontal position
            card.style.left = Math.random() * 100 + '%';
            
            // Random animation duration
            const duration = 15 + Math.random() * 10;
            card.style.animationDuration = duration + 's';
            
            // Random delay
            card.style.animationDelay = Math.random() * 5 + 's';
            
            // Random size variation
            const scale = 0.8 + Math.random() * 0.4;
            card.style.transform = `scale(${scale})`;
            
            this.elements.floatingCards.appendChild(card);
        }
    },

    // Render aesthetics in dropdown and car
    renderAesthetics: function() {
        this.renderDropdownAesthetics();
        this.renderCarAesthetics();
    },

    // Render aesthetics in dropdown
    renderDropdownAesthetics: function() {
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
    renderCarAesthetics: function() {
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
    toggleLibrary: function() {
        this.elements.libraryDropdown.classList.toggle('active');
        this.elements.floatingCardCar.classList.remove('active');
    },

    // Toggle floating card car
    toggleFloatingCar: function() {
        this.elements.floatingCardCar.classList.toggle('active');
        this.elements.libraryDropdown.classList.remove('active');
    },

    // Open library modal
    openLibraryModal: function() {
        this.elements.libraryModal.classList.add('active');
        setTimeout(() => {
            document.getElementById('recipientName').focus();
        }, 100);
    },

    // Close library modal
    closeLibrary: function() {
        this.elements.libraryModal.classList.remove('active');
        document.getElementById('recipientName').value = '';
    },

    // Open join modal
    openJoinModal: function() {
        this.elements.joinModal.classList.add('active');
    },

    // Close join modal
    closeJoinModal: function() {
        this.elements.joinModal.classList.remove('active');
    },

    // Show board page
    showBoardPage: function() {
        this.elements.landingPage.style.display = 'none';
        this.elements.boardPage.classList.add('active');
    },

    // Show landing page
    showLandingPage: function() {
        this.elements.landingPage.style.display = 'flex';
        this.elements.boardPage.classList.remove('active');
    },

    // Setup color picker
    setupColorPicker: function(aesthetic) {
        if (!this.elements.colorPicker) return;
        
        const colors = BoardController.aestheticColors[aesthetic] || BoardController.aestheticColors['professional'];
        this.elements.colorPicker.innerHTML = '';
        
        colors.forEach((color, i) => {
            const div = document.createElement('div');
            div.className = 'color-option' + (i === 0 ? ' selected' : '');
            div.style.backgroundColor = color;
            div.onclick = () => BoardController.selectColor(color, div);
            this.elements.colorPicker.appendChild(div);
        });
    }
};