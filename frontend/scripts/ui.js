// UI Controller - COMPLETE WORKING VERSION
const UIController = {
    // UI Elements
    elements: {},

    // Initialize UI
    init: function () {
        this.cacheElements();
        this.setupEventListeners();
        this.renderAesthetics();
        this.createFloatingCards();
        this.verifyDOM();
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
            floatingCards: document.getElementById('floatingCards'),
            // View page elements
            viewRecipientName: document.getElementById('viewRecipientName'),
            commentsGrid: document.getElementById('commentsGrid'),
            emptyState: document.getElementById('emptyState')
        };
        
        console.log('🔍 DOM Elements cached:', {
            viewPage: !!this.elements.viewPage,
            viewRecipientName: !!this.elements.viewRecipientName,
            commentsGrid: !!this.elements.commentsGrid,
            emptyState: !!this.elements.emptyState
        });
    },

    // Verify DOM structure
    verifyDOM: function () {
        console.log('🔍 Verifying DOM structure...');
        
        const viewPage = this.elements.viewPage;
        if (viewPage) {
            console.log('✅ View page found, checking content...');
            
            const hasViewHeader = viewPage.querySelector('.view-header');
            const hasCommentsGrid = viewPage.querySelector('.comments-grid');
            const hasCommentsContainer = viewPage.querySelector('.comments-container');
            
            console.log('📋 View page structure:', {
                hasViewHeader: !!hasViewHeader,
                hasCommentsGrid: !!hasCommentsGrid,
                hasCommentsContainer: !!hasCommentsContainer,
                innerHTMLLength: viewPage.innerHTML.length
            });
            
            if (!hasCommentsGrid || !hasCommentsContainer) {
                console.warn('⚠️ View page missing required elements!');
                console.log('First 300 chars of view page:', viewPage.innerHTML.substring(0, 300));
            }
        } else {
            console.error('❌ View page element not found in DOM!');
        }
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
        this.elements.libraryDropdown.classList.toggle('active');
        this.elements.floatingCardCar.classList.remove('active');
    },

    // Toggle floating card car
    toggleFloatingCar: function () {
        this.elements.floatingCardCar.classList.toggle('active');
        this.elements.libraryDropdown.classList.remove('active');
    },

    // Open library modal
    openLibraryModal: function () {
        this.elements.libraryModal.classList.add('active');
        setTimeout(() => {
            document.getElementById('recipientName').focus();
        }, 100);
    },

    // Close library modal
    closeLibrary: function () {
        this.elements.libraryModal.classList.remove('active');
        document.getElementById('recipientName').value = '';
    },

    // Open join modal
    openJoinModal: function () {
        this.elements.joinModal.classList.add('active');
    },

    // Close join modal
    closeJoinModal: function () {
        this.elements.joinModal.classList.remove('active');
    },

    // Show view page (comments only) - CRITICAL FIXED VERSION
    showViewPage: function () {
        console.log('🎬 UIController.showViewPage() called');
        
        // 1. Hide everything else first
        this.hideAllOtherPages();
        
        // 2. Ensure view page elements exist
        this.ensureViewPageElements();
        
        // 3. Show view page
        const viewPage = this.elements.viewPage;
        if (viewPage) {
            viewPage.style.display = 'block';
            viewPage.classList.add('active');
            console.log('✅ View page displayed');
            
            // Force DOM update
            viewPage.offsetHeight;
            
            // Verify elements are accessible
            setTimeout(() => {
                this.verifyViewPageAccessible();
            }, 50);
        } else {
            console.error('❌ View page element not found!');
        }
    },

    // Hide all other pages
    hideAllOtherPages: function () {
        // Hide landing page
        if (this.elements.landingPage) {
            this.elements.landingPage.style.display = 'none';
        }
        
        // Hide board page
        if (this.elements.boardPage) {
            this.elements.boardPage.style.display = 'none';
            this.elements.boardPage.classList.remove('active');
        }
        
        // Hide all modals and dropdowns
        this.hideAllDropdownsAndModals();
    },

    // Hide all dropdowns and modals
    hideAllDropdownsAndModals: function () {
        // Hide dropdowns
        if (this.elements.libraryDropdown) {
            this.elements.libraryDropdown.classList.remove('active');
            this.elements.libraryDropdown.style.display = 'none';
        }
        if (this.elements.floatingCardCar) {
            this.elements.floatingCardCar.classList.remove('active');
            this.elements.floatingCardCar.style.display = 'none';
        }
        
        // Hide modals
        if (this.elements.libraryModal) {
            this.elements.libraryModal.classList.remove('active');
        }
        if (this.elements.joinModal) {
            this.elements.joinModal.classList.remove('active');
        }
    },

    // Ensure view page has correct elements
    ensureViewPageElements: function () {
        const viewPage = this.elements.viewPage;
        if (!viewPage) return;
        
        // Check if view page has the correct structure
        const commentsGrid = viewPage.querySelector('#commentsGrid');
        const viewRecipientName = viewPage.querySelector('#viewRecipientName');
        
        if (!commentsGrid || !viewRecipientName) {
            console.warn('⚠️ View page missing elements, checking HTML...');
            
            // Check if wrong content is present
            const currentHTML = viewPage.innerHTML;
            if (currentHTML.includes('view-button') || 
                currentHTML.includes('car-button') || 
                currentHTML.includes('dropdown-item')) {
                
                console.error('❌ WRONG CONTENT: View page has library elements! Fixing...');
                
                // Inject correct HTML
                viewPage.innerHTML = `
                    <div class="view-header">
                        <h1>Messages for <span id="viewRecipientName"></span></h1>
                        <p class="view-subtitle">All the love and appreciation in one place</p>
                        <button class="btn-back-to-board" onclick="returnToBoard()">← Back to Board</button>
                    </div>

                    <div class="comments-container">
                        <div class="comments-grid" id="commentsGrid">
                            <!-- Comments will be loaded here -->
                        </div>

                        <div class="empty-state" id="emptyState">
                            <h3>No messages yet</h3>
                            <p>Be the first to send some love!</p>
                        </div>
                    </div>
                `;
                
                // Update cached elements
                this.elements.viewRecipientName = document.getElementById('viewRecipientName');
                this.elements.commentsGrid = document.getElementById('commentsGrid');
                this.elements.emptyState = document.getElementById('emptyState');
                
                console.log('✅ View page HTML fixed and elements re-cached');
            }
        }
    },

    // Verify view page elements are accessible
    verifyViewPageAccessible: function () {
        console.log('🔍 Verifying view page accessibility...');
        
        const elements = {
            viewRecipientName: document.getElementById('viewRecipientName'),
            commentsGrid: document.getElementById('commentsGrid'),
            emptyState: document.getElementById('emptyState')
        };
        
        console.log('✅ View page elements found:', {
            viewRecipientName: !!elements.viewRecipientName,
            commentsGrid: !!elements.commentsGrid,
            emptyState: !!elements.emptyState
        });
        
        // Update cached elements
        this.elements.viewRecipientName = elements.viewRecipientName;
        this.elements.commentsGrid = elements.commentsGrid;
        this.elements.emptyState = elements.emptyState;
    },

    // Show board page (form and links)
    showBoardPage: function () {
        console.log('📄 Showing board page...');
        
        // Hide everything
        this.hideAllOtherPages();
        
        // Show board page
        if (this.elements.boardPage) {
            this.elements.boardPage.style.display = 'block';
            this.elements.boardPage.classList.add('active');
        }
        
        // Show dropdowns again
        this.showDropdowns();
    },

    // Show landing page
    showLandingPage: function () {
        // Hide everything
        this.hideAllOtherPages();
        
        // Show landing page
        if (this.elements.landingPage) {
            this.elements.landingPage.style.display = 'flex';
        }
        
        // Show dropdowns again
        this.showDropdowns();
    },

    // Show dropdowns (for landing page)
    showDropdowns: function () {
        if (this.elements.libraryDropdown) {
            this.elements.libraryDropdown.style.display = '';
        }
        if (this.elements.floatingCardCar) {
            this.elements.floatingCardCar.style.display = '';
        }
    },

    // Emergency fix function (run in console if needed)
    emergencyFix: function () {
        console.log('🚨 Applying emergency UI fix...');
        
        // Clear any wrong content in view page
        const viewPage = document.getElementById('viewPage');
        if (viewPage) {
            viewPage.innerHTML = `
                <div class="view-header">
                    <h1>Messages for <span id="viewRecipientName"></span></h1>
                    <p class="view-subtitle">All the love and appreciation in one place</p>
                    <button class="btn-back-to-board" onclick="returnToBoard()">← Back to Board</button>
                </div>

                <div class="comments-container">
                    <div class="comments-grid" id="commentsGrid">
                        <!-- Comments will be loaded here -->
                    </div>

                    <div class="empty-state" id="emptyState">
                        <h3>No messages yet</h3>
                        <p>Be the first to send some love!</p>
                    </div>
                </div>
            `;
            console.log('✅ View page HTML reset');
        }
        
        // Re-cache elements
        this.cacheElements();
        console.log('✅ Elements re-cached');
    }
};

// Make available globally for debugging
window.UIController = UIController;