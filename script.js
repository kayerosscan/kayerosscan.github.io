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

    // ---- Patient registration form ----
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        // Pain level live value
        const painSlider = document.getElementById('painLevel');
        const painValue = document.getElementById('painLevelValue');
        painSlider.addEventListener('input', () => { painValue.textContent = painSlider.value; });

        // "Others" textarea toggle
        const othersToggle = document.getElementById('needsOthersToggle');
        const othersWrap = document.getElementById('needsOthersWrap');
        othersToggle.addEventListener('change', () => {
            othersWrap.hidden = !othersToggle.checked;
            if (othersToggle.checked) document.getElementById('needsOthers').focus();
        });

        // File size live check (10MB limit)
        const MAX_BYTES = 10 * 1024 * 1024;
        const fileInputs = regForm.querySelectorAll('.file-input');
        const sizeInfo = document.getElementById('fileSizeInfo');
        const updateSize = () => {
            let total = 0;
            fileInputs.forEach(inp => {
                Array.from(inp.files).forEach(f => total += f.size);
            });
            const mb = (total / (1024 * 1024)).toFixed(2);
            sizeInfo.textContent = `Total selected: ${mb} MB`;
            sizeInfo.classList.toggle('is-warning', total > MAX_BYTES);
        };
        fileInputs.forEach(inp => inp.addEventListener('change', updateSize));

        // Submit
        const feedback = document.getElementById('registerFeedback');
        const submitBtn = regForm.querySelector('.register-form__submit');
        const successPanel = document.getElementById('registerSuccess');

        regForm.addEventListener('submit', async e => {
            e.preventDefault();
            feedback.textContent = '';
            feedback.style.color = '';

            // Required-field check
            const required = regForm.querySelectorAll('[required]');
            for (const f of required) {
                if (!f.value || (f.type === 'checkbox' && !f.checked)) {
                    feedback.textContent = 'Please fill in all required fields and tick both consent boxes.';
                    feedback.style.color = '#D32F2F';
                    f.focus();
                    return;
                }
            }

            // File size guard
            let total = 0;
            fileInputs.forEach(inp => Array.from(inp.files).forEach(f => total += f.size));
            if (total > MAX_BYTES) {
                feedback.textContent = 'Total file size exceeds 10 MB. Please reduce attachments and try again.';
                feedback.style.color = '#D32F2F';
                return;
            }

            // Submit to Web3Forms
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting…';
            feedback.textContent = '';

            try {
                const formData = new FormData(regForm);
                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                const json = await res.json().catch(() => ({}));

                if (res.ok && json.success) {
                    regForm.hidden = true;
                    successPanel.hidden = false;
                    successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    throw new Error(json.message || `Submission failed (HTTP ${res.status})`);
                }
            } catch (err) {
                feedback.textContent = `Sorry — we couldn't submit your registration. ${err.message}. Please call us directly at 9971117952.`;
                feedback.style.color = '#D32F2F';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Registration';
            }
        });
    }

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
