/* =============================================
   NexStudy — Main Application Logic
   ============================================= */

import { getAllSubjects, getAllResources } from './data.js';

export function initApp() {
    initNavbar();
    initMobileMenu();
    initSearch();
    initCounters();
    initScrollAnimations();
    initBackToTop();
}

/* ---- Navbar Scroll Effect ---- */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const links = document.getElementById('navLinks');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        links.classList.toggle('active');
    });

    // Close on link click
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            btn.classList.remove('active');
            links.classList.remove('active');
        });
    });
}

/* ---- Global Search ---- */
function initSearch() {
    const input = document.getElementById('globalSearch');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;

    let debounceTimer;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = input.value.trim().toLowerCase();
            if (query.length < 2) {
                results.classList.remove('active');
                results.innerHTML = '';
                return;
            }
            performSearch(query, results);
        }, 300);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim().length >= 2) {
            results.classList.add('active');
        }
    });

    // Close search on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            results.classList.remove('active');
        }
    });
}

function performSearch(query, resultsEl) {
    const allSubjects = getAllSubjects();
    const allResources = getAllResources();

    const matchedSubjects = allSubjects.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query)
    ).slice(0, 4);

    const matchedResources = allResources.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.desc.toLowerCase().includes(query)
    ).slice(0, 4);

    if (matchedSubjects.length === 0 && matchedResources.length === 0) {
        resultsEl.innerHTML = `<div class="search-no-results">No results found for "${query}"</div>`;
        resultsEl.classList.add('active');
        return;
    }

    let html = '';

    if (matchedSubjects.length > 0) {
        matchedSubjects.forEach(subject => {
            html += `
                <a href="year.html?year=${subject.year}#sem-${subject.semester}" class="search-result-item">
                    <div class="search-result-icon">${subject.icon}</div>
                    <div class="search-result-info">
                        <h4>${highlightMatch(subject.name, query)}</h4>
                        <p>${subject.yearName} • ${subject.semesterName} • ${subject.code}</p>
                    </div>
                </a>
            `;
        });
    }

    if (matchedResources.length > 0) {
        matchedResources.forEach(resource => {
            const typeIcon = resource.type === 'notes' ? '📄' :
                             resource.type === 'handwritten' ? '✏️' :
                             resource.type === 'pyq' ? '📝' : '📋';
            html += `
                <a href="subject.html?year=${resource.year}&sem=${resource.semester}&subject=${resource.subjectId}" class="search-result-item">
                    <div class="search-result-icon">${typeIcon}</div>
                    <div class="search-result-info">
                        <h4>${highlightMatch(resource.title, query)}</h4>
                        <p>${resource.subjectName} • ${resource.type.toUpperCase()}</p>
                    </div>
                </a>
            `;
        });
    }

    resultsEl.innerHTML = html;
    resultsEl.classList.add('active');
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<strong style="color: var(--accent-1);">$1</strong>');
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ---- Counter Animation ---- */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = Math.round(eased * target);
        el.textContent = current.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/* ---- Scroll Animations ---- */
function initScrollAnimations() {
    const cards = document.querySelectorAll('.feature-card, .year-card, .step-card, .branch-chip, .semester-card, .resource-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        observer.observe(card);
    });
}

/* ---- Back to Top ---- */
function initBackToTop() {
    // Create back to top button if not exists
    if (!document.querySelector('.back-to-top')) {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
        btn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
    }
}

/* ---- Utility: Get URL parameters ---- */
export function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/* ---- Utility: Ordinal suffix ---- */
export function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
