/* ============================================================
   KAYEROSS CAN FOUNDATION — interactions
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Init AOS (scroll animations) ----
    if (window.AOS) {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 60,
            disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        });
    }

    // ---- Sticky nav shadow on scroll ----
    const nav = document.getElementById('nav');
    const onScroll = () => {
        if (window.scrollY > 16) nav.classList.add('is-scrolled');
        else nav.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- Mobile nav toggle ----
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
    });

    // Close mobile nav when a link is clicked
    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            if (links.classList.contains('is-open')) {
                links.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // ---- Volunteer form (no backend — friendly local handler) ----
    const form = document.getElementById('volunteerForm');
    const feedback = document.getElementById('formFeedback');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = form.name.value.trim();
        const phone = form.phone.value.trim();
        const message = form.message.value.trim();

        if (!name || !phone || !message) {
            feedback.textContent = 'Please fill in all fields so we can reach you.';
            feedback.style.color = 'var(--pink-deep)';
            return;
        }

        feedback.textContent = `Thank you, ${name.split(' ')[0]} — we'll be in touch soon.`;
        feedback.style.color = 'var(--pink-primary)';
        form.reset();
    });

    // ---- Subtle parallax for hero parrots ----
    const parrots = document.querySelectorAll('.parrot');
    if (parrots.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('mousemove', e => {
            const x = (e.clientX / window.innerWidth - 0.5) * 14;
            const y = (e.clientY / window.innerHeight - 0.5) * 14;
            parrots.forEach((p, i) => {
                const depth = (i + 1) * 0.5;
                p.style.translate = `${x * depth}px ${y * depth}px`;
            });
        }, { passive: true });
    }
});
