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
                        <a href="${prefix}index.html" class="nav-link">Home</a>
                        <a href="${prefix}index.html#years" class="nav-link">Years</a>
                        <a href="${prefix}index.html#features" class="nav-link">Features</a>
                        <a href="${prefix}index.html#branches" class="nav-link">Branches</a>
                        <a href="${prefix}index.html#contact" class="nav-link">Contact</a>
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
        }
    }

    highlightActiveLink() {
        const currentPath = window.location.pathname;
        const links = this.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === 'index.html' && (currentPath.endsWith('index.html') || currentPath === '/')) {
                link.classList.add('active');
            }
        });
    }
}

customElements.define('app-navbar', Navbar);
