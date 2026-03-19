class Navbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
        const prefix = isRoot ? '' : '';
        const isAdmin = this.hasAttribute('is-admin');

        this.innerHTML = `
            <nav class="navbar ${isAdmin ? 'scrolled' : ''}" id="navbar">
                <div class="nav-container">
                    <a href="${prefix}index.html" class="nav-logo">
                        <span class="logo-icon">📚</span>
                        <span class="logo-text">Nex<span class="logo-highlight">Study</span></span>
                    </a>
                    ${isAdmin ? '' : `
                    <div class="nav-links" id="navLinks">
                        <a href="${isRoot ? '#' : 'index.html'}" class="nav-link">Home</a>
                        <a href="${isRoot ? '#years' : 'index.html#years'}" class="nav-link">Years</a>
                        <a href="${isRoot ? '#contact' : 'index.html#contact'}" class="nav-link">Contact</a>
                    </div>
                    `}
                    <div class="nav-actions">
                        ${isAdmin ? `
                        <span style="font-size:0.85rem; color:var(--text-muted);">Admin Panel</span>
                        ` : `
                        <div class="search-box" id="searchBox">
                            <input type="text" placeholder="Search subjects, notes..." id="globalSearch" autocomplete="off">
                            <button class="search-btn" id="searchBtn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            </button>
                            <div class="search-results" id="searchResults"></div>
                        </div>
                        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
                            <span></span><span></span><span></span>
                        </button>
                        `}
                    </div>
                </div>
            </nav>
        `;

        if (!isAdmin) {
            this.highlightActiveLink();
            this.loadAuthUI();
            this.setupLinkEvents();
        }
    }

    setupLinkEvents() {
        window.addEventListener('hashchange', () => this.highlightActiveLink());
        
        const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
        const links = this.querySelectorAll('.nav-link');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Smooth scroll for same-page anchors
                if (isRoot && (href.startsWith('#') || href === 'index.html')) {
                    e.preventDefault();
                    const targetId = href.startsWith('#') ? href.substring(1) : 'hero';
                    const target = document.getElementById(targetId) || document.body;
                    
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        if (href.startsWith('#')) {
                            window.history.pushState(null, null, href);
                        } else {
                            window.history.pushState(null, null, window.location.pathname);
                        }
                        this.highlightActiveLink();
                        
                        // Close mobile menu if open
                        const mobileMenu = document.getElementById('navLinks');
                        const mobileBtn = document.getElementById('mobileMenuBtn');
                        if (mobileMenu && mobileMenu.classList.contains('active')) {
                            mobileMenu.classList.remove('active');
                            mobileBtn.classList.remove('active');
                        }
                    }
                }
            });
        });
    }

    highlightActiveLink() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        const links = this.querySelectorAll('.nav-link');
        
        links.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            // Check if link matches either path or hash
            const isHomeLink = href === '#' || href === 'index.html';
            const isHomePage = (currentPath.endsWith('index.html') || currentPath === '/') && !currentHash;
            
            let isMatch = false;
            if (isHomeLink && isHomePage) {
                isMatch = true;
            } else if (currentHash && href.includes(currentHash)) {
                isMatch = true;
            }

            if (isMatch) {
                link.classList.add('active');
            }
        });

        // Default to Home if on root with no hash
        if (!currentHash && (currentPath.endsWith('index.html') || currentPath === '/')) {
            const homeLink = this.querySelector('a[href$="index.html"]:not([href*="#"])');
            if (homeLink) homeLink.classList.add('active');
        }
    }

    async loadAuthUI() {
        try {
            const { supabase } = await import('../../supabase-config.js');
            const { data: { session } } = await supabase.auth.getSession();
            
            const searchBox = this.querySelector('.search-box');
            if (!searchBox) return;

            const authDiv = document.createElement('div');
            authDiv.className = 'nav-auth';

            if (session) {
                authDiv.innerHTML = `
                    <div class="user-avatar" id="navAvatar" title="Logged in as ${session.user.email} (Click to logout)">
                        ${session.user.email.charAt(0).toUpperCase()}
                    </div>
                `;
                authDiv.querySelector('#navAvatar').addEventListener('click', async () => {
                    if(confirm('Log out?')) {
                        await supabase.auth.signOut();
                        window.location.replace('index.html');
                    }
                });
            } else {
                authDiv.innerHTML = `
                    <a href="login.html" class="btn btn-primary" style="padding: 6px 14px; font-size: 0.8rem;">Sign In</a>
                `;
            }
            searchBox.parentNode.insertBefore(authDiv, searchBox.nextSibling);
        } catch (e) {
            console.error('Navbar Auth UI Error:', e);
        }
    }
}

customElements.define('app-navbar', Navbar);
