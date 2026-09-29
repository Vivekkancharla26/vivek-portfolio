/* ============================================================
   VIVEK KANCHARLA PORTFOLIO — Main JS (v2)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ── AOS Init ────────────────────────────────────────── */
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 550,
            once: true,
            easing: 'ease-out-cubic',
            offset: 60
        });
    }

    /* ── Theme Toggle ──────────────────────────────────── */
    const themeBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('vk-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('vk-theme', next);
        });
    }

    /* ── Mobile Menu ──────────────────────────────────── */
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            menuBtn.querySelector('i').className = mobileMenu.classList.contains('open')
                ? 'fa-solid fa-xmark'
                : 'fa-solid fa-bars';
        });

        // Close on link click
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                menuBtn.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }

    /* ── Scroll Progress Bar ──────────────────────────── */
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            // Guard against divide-by-zero when page content is shorter than the viewport
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = pct + '%';
        }, { passive: true });
    }

    /* ── Mail Icon → Open Email Client ───────────────── */
    // Works whether the icon is a plain <i>/<span> or already an <a> tag.
    // Just set data-email="you@example.com" on the icon/element in your HTML,
    // e.g. <a id="mail-icon" data-email="vivek@example.com"><i class="fa-solid fa-envelope"></i></a>
    const mailIcon = document.getElementById('mail-icon');
    if (mailIcon) {
        mailIcon.addEventListener('click', (e) => {
            const email = mailIcon.dataset.email || 'your.email@example.com';
            const subject = encodeURIComponent('Portfolio Contact');
            e.preventDefault();
            window.location.href = `mailto:${email}?subject=${subject}`;
        });
    }

    /* ── Navbar Active on Scroll ─────────────────────── */
    const sections = document.querySelectorAll('section[id]');
    const navPills = document.querySelectorAll('.nav-pill, .mobile-nav-link');

    function updateNav() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navPills.forEach(pill => {
                    pill.classList.remove('active');
                    if (pill.getAttribute('href') === '#' + id) {
                        pill.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', updateNav, { passive: true });

    /* ── Back to Top ─────────────────────────────────── */
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ── Animated Stat Counters ──────────────────────── */
    function animateCounter(el) {
        const target = parseInt(el.dataset.count);
        const duration = 1400;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current) + '+';
        }, 16);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.stat-number-v2[data-count]').forEach(el => {
        counterObserver.observe(el);
    });

    /* ── Contact Form ────────────────────────────────── */
    const form = document.getElementById('contact-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('contact-name')?.value.trim();
            const email = document.getElementById('contact-email')?.value.trim();
            const subject = document.getElementById('contact-subject')?.value.trim() || 'New Portfolio Contact';
            const message = document.getElementById('contact-message')?.value.trim();

            if (!name || !email || !message) return;

            const btn = form.querySelector('button[type="submit"]');
            const statusText = form.querySelector('.text-center.text-secondary.mt-2.mb-0');
            
            if (btn) {
                btn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin ms-2"></i>';
                btn.disabled = true;
            }
            if (statusText) {
                statusText.innerHTML = '<i class="fa-solid fa-shield-halved me-1 text-accent"></i> Sending your message securely...';
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        subject,
                        message
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    if (btn) {
                        btn.innerHTML = 'Message Sent <i class="fa-solid fa-check ms-2"></i>';
                        btn.classList.add('btn-success');
                        btn.classList.remove('btn-primary-v2');
                    }
                    if (statusText) {
                        statusText.innerHTML = '<i class="fa-solid fa-circle-check me-1 text-success"></i> Thanks for reaching out. I\'ll get back to you soon.';
                        // Optional aria-live
                        statusText.setAttribute('aria-live', 'polite');
                    }
                    form.reset();
                    
                    // Reset button and status text after 5 seconds
                    setTimeout(() => {
                        if (btn) {
                            btn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane ms-2"></i>';
                            btn.classList.remove('btn-success');
                            btn.classList.add('btn-primary-v2');
                            btn.disabled = false;
                        }
                        if (statusText) {
                            statusText.innerHTML = '<i class="fa-solid fa-clock me-1 text-accent"></i> Usually responds within 24 hours';
                        }
                    }, 5000);
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
            } catch (err) {
                console.error('Contact form error:', err);
                if (btn) {
                    btn.innerHTML = 'Try Again <i class="fa-solid fa-rotate-right ms-2"></i>';
                    btn.disabled = false;
                }
                if (statusText) {
                    statusText.innerHTML = '<i class="fa-solid fa-circle-xmark me-1 text-danger"></i> Something went wrong. Please try again or email me directly.';
                    statusText.setAttribute('aria-live', 'assertive');
                }
                
                setTimeout(() => {
                    if (btn) {
                        btn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane ms-2"></i>';
                    }
                    if (statusText) {
                        statusText.innerHTML = '<i class="fa-solid fa-clock me-1 text-accent"></i> Usually responds within 24 hours';
                    }
                }, 5000);
            }
        });
    }

    /* ── Smooth Scroll for Anchor Links ──────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return; // avoid invalid-selector crash on bare "#"
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ── GSAP Hero Entry ─────────────────────────────── */
    if (typeof gsap !== 'undefined') {
        gsap.from('.navbar-glass', { y: -60, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 });
        gsap.from('.hero-title-v2', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.3 });
        gsap.from('.hero-tech-row', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.5 });
        gsap.from('.hero-desc-v2', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.6 });
        gsap.from('.hero-btns-v2', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.75 });
        gsap.from('.hero-photo-wrapper', { scale: 0.9, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 });
    }

});
