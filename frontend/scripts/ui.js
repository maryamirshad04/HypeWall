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
        this.spawnConfetti();
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
            floatingCards: document.getElementById('floatingCards'),
            infoPage: document.getElementById('infoPage')
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

    // Constantly falling confetti inside the hero banner
    spawnConfetti: function () {
        const layer = document.getElementById('confettiLayer');
        if (!layer) return;

        const colors = ['#1fb6d4', '#ff3d7f', '#7c5cff', '#ffffff', '#111111', '#ff6b35'];
        const pieces = 45;
        layer.innerHTML = '';

        for (let i = 0; i < pieces; i++) {
            const piece = document.createElement('span');
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDuration = (4 + Math.random() * 6) + 's';
            piece.style.animationDelay = (-Math.random() * 10) + 's';
            piece.style.width = (6 + Math.random() * 7) + 'px';
            piece.style.height = (9 + Math.random() * 8) + 'px';
            if (Math.random() > 0.5) piece.style.borderRadius = '50%';
            layer.appendChild(piece);
        }
    },

    // Render aesthetics in dropdown, car, and create modal
    renderAesthetics: function () {
        this.renderDropdownAesthetics();
        this.renderCarAesthetics();
        this.renderModalThemes();
    },

    // Render the theme picker inside the create-board modal
    renderModalThemes: function () {
        const grid = document.getElementById('modalThemeGrid');
        if (!grid) return;

        const selected = (typeof BoardController !== 'undefined' && BoardController.selectedAesthetic) || 'professional';
        grid.innerHTML = CONSTANTS.AESTHETICS.map(aesthetic => `
            <div class="modal-theme ${aesthetic === selected ? 'selected' : ''}" data-aesthetic="${aesthetic}" onclick="pickModalTheme('${aesthetic}')">
                <img src="images/${aesthetic}.jpeg" alt="${CONSTANTS.AESTHETIC_NAMES[aesthetic]}">
                <span>${CONSTANTS.AESTHETIC_NAMES[aesthetic]}</span>
            </div>
        `).join('');
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
    // Show which vibe the clicked tile picked (label only, not a chooser)
    updateModalVibeLabel: function () {
        const el = document.getElementById('modalThemeName');
        if (!el) return;
        const key = (typeof BoardController !== 'undefined' && BoardController.selectedAesthetic) || 'professional';
        el.textContent = CONSTANTS.AESTHETIC_NAMES[key] || '';
    },

    openLibraryModal: function () {
        this.updateModalVibeLabel();
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

    // ─── Info pages (About / Contact / Privacy) ─────────────────
    INFO_PAGES: {
        about: {
            kicker: 'how this whole thing started',
            title: 'about us.',
            body: `
                <p>So there was this class. And there was this professor who was, genuinely, <strong>that</strong> good. The kind who makes an 8am lecture feel like a plot twist.</p>
                <p>The semester was wrapping up and we wanted to do something nice. Obviously: a kudos board. Everyone signs it, everyone says something lovely, she cries a little, we cry a little, beautiful.</p>
                <p>Then we saw the price tag.</p>
                <p>Look, we still made her one. She deserved it. But paying actual money just to let people type &ldquo;you changed my life&rdquo; into a box? That felt <em>icky</em>. Appreciation should not have a checkout page.</p>
                <p>Cut to winter break. Vaniya, doing absolutely nothing productive, went &ldquo;wait&hellip; we could just build this ourselves.&rdquo; She pitched it to her friend Maryam. They laughed. It was a joke. It was <em>such</em> a joke.</p>
                <p>And then, somehow, they were building it. Over the entire winter vacation. Hunched over laptops, cracking up at 2am, breaking things, fixing things, breaking them again, arguing about the exact shade of yellow. It was hectic. It was chaos. It was, honestly, the most fun either of them had all break.</p>
                <p>So that is HypeWall. Free, forever, because hyping up the people you love should never have cost anything in the first place.</p>`
        },
        contact: {
            kicker: 'talk to us, we are right here',
            title: 'contact us.',
            body: `
                <p>Oh, you have <em>ideas</em>? You looked at this and thought &ldquo;cute, but what if it did this other thing too&rdquo;? Tell us.</p>
                <p>Oh, you think a certain page is ugly? Bold. Correct, possibly. Tell us.</p>
                <p>Oh, you found a bug? Something clicked and then simply&hellip; did not click back? Please tell us, we will go fix it immediately and pretend it never happened.</p>
                <p>Oh, you just want to say hi and show us a board you made? That is our favourite email to get, actually.</p>
                <p>Whatever it is, it lands in the same inbox:</p>
                <p class="contact-email"><a href="mailto:vaniyaejaz@gmail.com">vaniyaejaz@gmail.com</a></p>
                <p class="info-footnote">No fancy domain yet. We are working on it. Baby steps.</p>`
        },
        privacy: {
            kicker: 'the serious page, kept short',
            title: 'privacy.',
            body: `
                <p>Short version: your board is yours. We are not doing anything weird with it.</p>
                <p><strong>No accounts.</strong> We never asked for your name, your email, or your birthday. We do not have them. We cannot lose them.</p>
                <p><strong>No tracking, no ads, no data selling.</strong> There is no analytics pixel watching you pick a colour. Nobody is buying your feelings.</p>
                <p><strong>Your links are unlisted.</strong> Boards are reached through long, random, basically unguessable links. Nobody stumbles onto yours by accident, and nothing is listed in a public directory.</p>
                <p><strong>Everything travels encrypted.</strong> The connection is HTTPS, and your board data sits in an encrypted database.</p>
                <p><strong>We are not reading your boards.</strong> Your messages, GIFs and voice notes are stored for exactly one reason: to show them on the board they were posted to. That is the whole job.</p>
                <p class="info-footnote">Being straight with you: we run the servers, so in a strictly technical sense the data is not sealed off from us the way end-to-end encryption would seal it. We just have zero interest in your messages. Please do not use HypeWall to store passwords or anything genuinely sensitive.</p>`
        }
    },

    openInfoPage: function(key, fromHistory) {
        const page = this.INFO_PAGES[key];
        if (!page || !this.elements.infoPage) return;

        // Give each info page its own address so it is a real, shareable page
        if (!fromHistory) {
            history.pushState({ infoPage: key }, '', '?page=' + key);
        }
        document.title = 'HypeWall - ' + page.title.replace('.', '');

        document.getElementById('infoKicker').textContent = page.kicker;
        document.getElementById('infoTitle').textContent = page.title;
        document.getElementById('infoBody').innerHTML = page.body;

        if (this.elements.landingPage) this.elements.landingPage.style.display = 'none';
        if (this.elements.boardPage) { this.elements.boardPage.style.display = 'none'; this.elements.boardPage.classList.remove('active'); }
        if (this.elements.viewPage) { this.elements.viewPage.style.display = 'none'; this.elements.viewPage.classList.remove('active'); }
        this.elements.infoPage.style.display = 'block';
        window.scrollTo(0, 0);
    },

    closeInfoPage: function(fromHistory) {
        if (this.elements.infoPage) this.elements.infoPage.style.display = 'none';
        if (!fromHistory) {
            history.pushState({}, '', window.location.pathname);
        }
        document.title = 'HypeWall - Create Aesthetic Appreciation Boards Online';
        this.showLandingPage();
        window.scrollTo(0, 0);
    },

    // Show board page
    showBoardPage: function() {
        // Hide all pages
        if (this.elements.infoPage) {
            this.elements.infoPage.style.display = 'none';
        }
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
        if (this.elements.infoPage) {
            this.elements.infoPage.style.display = 'none';
        }
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
        if (this.elements.infoPage) {
            this.elements.infoPage.style.display = 'none';
        }
        if (this.elements.landingPage) {
            this.elements.landingPage.style.display = 'block';
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
window.openCreateModal = () => {
    UIController.renderModalThemes();
    UIController.openLibraryModal();
};
window.openInfoPage = (key) => UIController.openInfoPage(key);

// Back / forward buttons move between the info pages and the landing page
window.addEventListener('popstate', (e) => {
    const key = (e.state && e.state.infoPage) || null;
    if (key) {
        UIController.openInfoPage(key, true);
    } else {
        UIController.closeInfoPage(true);
    }
});
window.closeInfoPage = () => UIController.closeInfoPage();
window.pickModalTheme = (aesthetic) => {
    if (typeof BoardController !== 'undefined') {
        BoardController.selectedAesthetic = aesthetic;
    }
    UIController.renderModalThemes();
};
window.closeJoinModal = () => UIController.closeJoinModal();
window.closeLibrary = () => UIController.closeLibrary();