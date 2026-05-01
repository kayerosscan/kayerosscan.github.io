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

    // ---- Modal helpers (generic) ----
    const openModal = (modal) => {
        if (!modal) return;
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const focusTarget = modal.querySelector('.wizard__panel.is-active input:not([type=hidden]):not([type=checkbox]), .wizard__panel.is-active select, .wizard__panel.is-active textarea')
                || modal.querySelector('.modal__close');
            focusTarget?.focus();
        }, 120);
    };
    const closeModal = (modal) => {
        if (!modal) return;
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
        trigger.addEventListener('click', e => {
            e.preventDefault();
            openModal(document.getElementById(trigger.dataset.modalOpen));
        });
    });
    document.querySelectorAll('[data-modal-close]').forEach(trigger => {
        trigger.addEventListener('click', () => closeModal(trigger.closest('.modal')));
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal:not([hidden])').forEach(closeModal);
        }
    });

    // ---- Patient registration wizard ----
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        const panels = Array.from(regForm.querySelectorAll('.wizard__panel'));
        const stepIndicators = document.querySelectorAll('#wizardSteps .wizard__step');
        const fill = document.getElementById('wizardFill');
        const counter = document.getElementById('wizardCounter');
        const label = document.getElementById('wizardLabel');
        const prevBtn = document.getElementById('wizardPrev');
        const nextBtn = document.getElementById('wizardNext');
        const submitBtn = document.getElementById('wizardSubmit');
        const feedback = document.getElementById('registerFeedback');
        const successPanel = document.getElementById('registerSuccess');
        const modalBody = document.getElementById('modalBody');

        const STEP_LABELS = [
            'Patient Demographics',
            'Person filling this form',
            'Medical Information',
            'Support needs',
            'Documents',
            'Consent'
        ];
        const TOTAL = panels.length;
        let current = 0;

        const showStep = (idx) => {
            current = idx;
            panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
            stepIndicators.forEach((s, i) => {
                s.classList.toggle('is-active', i === idx);
                s.classList.toggle('is-complete', i < idx);
            });
            fill.style.width = `${((idx + 1) / TOTAL) * 100}%`;
            counter.textContent = `Step ${idx + 1} of ${TOTAL}`;
            label.textContent = `Step ${idx + 1} of ${TOTAL} · ${STEP_LABELS[idx]}`;
            prevBtn.disabled = idx === 0;
            nextBtn.hidden = idx === TOTAL - 1;
            submitBtn.hidden = idx !== TOTAL - 1;
            feedback.textContent = '';
            modalBody.scrollTop = 0;
            // Focus first input on the new panel
            setTimeout(() => {
                const first = panels[idx].querySelector('input:not([type=hidden]):not([type=checkbox]), select, textarea');
                first?.focus({ preventScroll: true });
            }, 50);
        };

        const validatePanel = (panel) => {
            const required = panel.querySelectorAll('[required]');
            for (const f of required) {
                if ((f.type === 'checkbox' && !f.checked) || (f.type !== 'checkbox' && !f.value.trim())) {
                    feedback.textContent = 'Please complete all required fields before continuing.';
                    feedback.style.color = '#D32F2F';
                    f.focus();
                    return false;
                }
            }
            return true;
        };

        nextBtn.addEventListener('click', () => {
            if (!validatePanel(panels[current])) return;
            if (current < TOTAL - 1) showStep(current + 1);
        });
        prevBtn.addEventListener('click', () => {
            if (current > 0) showStep(current - 1);
        });

        // Prevent Enter key from submitting form mid-wizard; advance to next step instead
        regForm.addEventListener('submit', e => e.preventDefault());
        regForm.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (current < TOTAL - 1) nextBtn.click();
            }
        });

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
        submitBtn.addEventListener('click', async () => {
            if (!validatePanel(panels[TOTAL - 1])) return;

            let total = 0;
            fileInputs.forEach(inp => Array.from(inp.files).forEach(f => total += f.size));
            if (total > MAX_BYTES) {
                feedback.textContent = 'Total file size exceeds 10 MB. Please reduce attachments and try again.';
                feedback.style.color = '#D32F2F';
                return;
            }

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
                    document.getElementById('modalFooter').hidden = true;
                    document.querySelector('#registerModal .wizard__progress').hidden = true;
                    successPanel.hidden = false;
                } else {
                    throw new Error(json.message || `Submission failed (HTTP ${res.status})`);
                }
            } catch (err) {
                feedback.textContent = `Sorry — we couldn't submit your registration. ${err.message} Please call us directly at 9971117952.`;
                feedback.style.color = '#D32F2F';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Registration';
            }
        });

        // Initialize wizard at step 1
        showStep(0);
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
