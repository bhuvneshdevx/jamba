class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
        const prefix = isRoot ? '' : '';

        this.innerHTML = `
            <footer class="footer" id="contact">
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-brand">
                            <a href="${prefix}index.html" class="nav-logo">
                                <span class="logo-icon">📚</span>
                                <span class="logo-text">Nex<span class="logo-highlight">Study</span></span>
                            </a>
                            <p>Your complete engineering study companion. Access quality resources anytime, anywhere.</p>
                            <div class="footer-socials">
                                <a href="https://github.com/bhuvneshdevx" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                                </a>
                                <a href="https://www.linkedin.com/in/bhuvnesh2485/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                                <a href="mailto:bhuvnesh.devx@gmail.com" aria-label="Email">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                </a>
                            </div>
                        </div>
                        <div class="footer-links-group">
                            <h4>Quick Links</h4>
                            <a href="${prefix}year.html?year=1">First Year</a>
                            <a href="${prefix}year.html?year=2">Second Year</a>
                            <a href="${prefix}year.html?year=3">Third Year</a>
                            <a href="${prefix}year.html?year=4">Fourth Year</a>
                        </div>
                        <div class="footer-links-group">
                            <h4>Resources</h4>
                            <a href="#">Lecture Notes</a>
                            <a href="#">Handwritten Notes</a>
                            <a href="#">Previous Year Papers</a>
                            <a href="#">Syllabus</a>
                        </div>
                        <div class="footer-links-group">
                            <h4>Support</h4>
                            <a href="mailto:bhuvnesh.devx@gmail.com">Contact Us</a>
                            <a href="#">Contribute Notes</a>
                            <a href="#">Help Center</a>
                            <a href="#">FAQ</a>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2026 NexStudy. Made with ❤️ for Engineering Students.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('app-footer', Footer);
