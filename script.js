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

    // ---- Team member side panel ----
    const TEAM_BIOS = {
        kritie: {
            name: 'Dr. Kritie Pasrichaa',
            role: 'Founder & Chairman',
            initials: 'KP',
            image: 'kritieImage2.jpg',
            bio: [
                "Dr. Kritie founded Kayeross Can Foundation after years of walking alongside families through cancer, chronic illness, and end-of-life journeys — and seeing again and again that what people needed most was not money or paperwork, but a kind, knowledgeable voice they could trust.",
                "A trained palliative care professional and a fierce advocate for dignity in healthcare, she believes that compassion is medicine in its own right. Under her leadership the Foundation has grown into a quiet but steady presence for families across India who have nowhere else to turn.",
                "She still personally answers many of the calls that come in, because she believes every patient deserves to be heard — fully, gently, and without rush."
            ]
        },
        ravichandran: {
            name: 'Dr. N. Ravichandran',
            role: 'Guide & Mentor',
            initials: 'NR',
            image: 'Names/Ravi.jpg',
            bio: [
                "Dr. Ravichandran is the steady, senior voice the Foundation turns to when the path forward is unclear. With decades of experience in medicine and patient advocacy, he offers strategic guidance, clinical perspective, and a deep moral compass to every part of our work.",
                "He has long believed that palliative care is the truest test of a healthcare system's humanity, and he mentors our young team with unwavering patience.",
                "His role is quiet but profound — he asks the hard questions, slows hasty decisions, and reminds everyone that the patient is always the answer."
            ]
        },
        manas: {
            name: 'Dr. Manas Singh',
            role: 'Co-founder',
            initials: 'MS',
            image: 'Names/Manas.jpg',
            bio: [
                "Dr. Manas co-founded the Foundation alongside Dr. Kritie, drawn to the idea that the most fragile moments of a person's life deserve the most attentive care.",
                "He brings clinical depth, operational rigour, and a builder's mindset to a space that often runs on goodwill alone. From mapping out the first call lines to forging relationships with hospitals and volunteers, his fingerprints are on much of how the Foundation actually runs day to day.",
                "For Dr. Manas, this work is deeply personal — and his commitment is to make sure no one is ever turned away."
            ]
        },
        sushil: {
            name: 'Dr (Sqn Ldr) Sushil Garg',
            role: 'Clinical Head',
            initials: 'SG',
            image: 'Names/Sushil.jpg',
            bio: [
                "Dr. Sushil is the clinical heart of our advisory work. When a family is wrestling with a complex diagnosis or a difficult treatment decision, his measured, compassionate guidance helps cut through the fear and find clarity.",
                "With years of frontline experience in patient care, he reviews cases that come through our help line and ensures the medical guidance we offer is current, accurate, and genuinely useful — never sterile, always human.",
                "He believes a good clinician listens twice as long as they speak."
            ]
        },
        vivek: {
            name: 'Mr. Vivek Chaturvedi',
            role: 'Content Validator',
            initials: 'VC',
            image: 'Names/Vivek.jpg',
            bio: [
                "Vivek ensures that every piece of medical and educational material we share with families meets a high bar of accuracy and compassion. From explainer notes to outreach copy, nothing reaches a patient or caregiver until it has passed through his careful eye.",
                "With a background in healthcare communication, he is unwilling to let a single sentence go out that could mislead, alarm, or talk down to a patient.",
                "His standards are exacting — and that is precisely why families can trust what they read from us."
            ]
        },
        parika: {
            name: 'Parika Wadhwa',
            role: 'Operations Head',
            initials: 'PW',
            image: 'Names/Parika.jpg',
            bio: [
                "Parika keeps the Foundation running. From scheduling volunteer rotations to coordinating responses with doctors, families, and partner organisations, she is the calm centre of an often emotionally heavy operation.",
                "She believes that compassion at scale only works if the systems behind it work — and she has built quiet, reliable processes that ensure no caller is forgotten and no need is left unanswered.",
                "If something needs doing, Parika has usually already done it."
            ]
        },
        mehak: {
            name: 'Mehak Preet Singh',
            role: 'Treasurer',
            initials: 'MPS',
            image: 'Names/Mahak.jpg',
            bio: [
                "Mehak is the steward of the Foundation's finances. Every rupee we receive — whether from a donor or a grant — is accounted for, audited, and applied directly to patient support, and that discipline is hers.",
                "She believes that financial transparency is not just compliance — it is a moral covenant with every donor and every family we serve.",
                "Her care, precision, and uncompromising integrity are the reason every contribution truly reaches another patient."
            ]
        },
        navdeep: {
            name: 'Navdeep Singh',
            role: 'Marketing Head',
            initials: 'NS',
            image: 'Names/Navdeep.jpg',
            bio: [
                "Navdeep leads how the Foundation's voice reaches the people who need it most. From awareness campaigns to outreach in underserved regions, his work ensures that someone, somewhere — at the moment they most need help — actually knows we exist.",
                "He approaches marketing not as advertising but as bridge-building: between a struggling family and a free phone line that can change their week, their month, their last chapter.",
                "He measures success not in clicks but in calls answered."
            ]
        },
        avdesh: {
            name: 'Avdesh Sharma',
            role: 'Chartered Accountant',
            initials: 'AS',
            image: 'Names/Avdhesh.jpg',
            bio: [
                "Avdesh oversees the Foundation's audit, compliance, and statutory health. As a chartered accountant with a steady hand, he ensures that we operate to the highest standards of financial governance — and that every donor's trust is never taken for granted.",
                "His work happens behind the scenes, but it is the reason the Foundation can stand tall and accept new partnerships, grants, and goodwill with full transparency.",
                "He believes that good books are the quiet foundation on which every act of compassion ultimately rests."
            ]
        },
        mayank: {
            name: 'Mayank Verma',
            role: 'Engineer & Creative Head',
            initials: 'MV',
            bio: [
                "Mayank shapes both the Foundation's technical backbone and its creative identity — from the website you are reading right now, to the design language, to the systems that route a caller to the right kind of support.",
                "He believes good engineering for a non-profit is invisible: things that just work, kindly, when someone is having the hardest day of their life.",
                "His care for craft and detail is matched only by his belief that compassion deserves great design."
            ]
        },
        dipanshu: {
            name: 'Dipanshu Verma',
            role: 'Engineer',
            initials: 'DV',
            image: 'Names/Dipanshu.jpg',
            bio: [
                "Dipanshu helps build and maintain the technology that makes the Foundation responsive and reliable. He works on quietly important things — uptime, data hygiene, integrations — that families never see, but that are the difference between a call answered and a call missed.",
                "He approaches every line of code with the awareness that on the other side of it is a real person, in a real moment, hoping for help."
            ]
        }
    };

    const teamPanel = document.getElementById('teamPanel');
    if (teamPanel) {
        const panelImg = document.getElementById('teamPanelImage');
        const panelAvatar = document.getElementById('teamPanelAvatar');
        const panelAvatarSpan = panelAvatar.querySelector('span');
        const panelName = document.getElementById('teamPanelName');
        const panelRole = document.getElementById('teamPanelRole');
        const panelBio = document.getElementById('teamPanelBio');
        let lastTrigger = null;

        const openTeamPanel = (id, trigger) => {
            const data = TEAM_BIOS[id];
            if (!data) return;
            lastTrigger = trigger || null;

            panelName.textContent = data.name;
            panelRole.textContent = data.role;
            panelBio.innerHTML = data.bio.map(p => `<p>${p}</p>`).join('');

            if (data.image) {
                panelImg.src = data.image;
                panelImg.alt = data.name;
                panelImg.hidden = false;
                panelAvatar.hidden = true;
            } else {
                panelImg.removeAttribute('src');
                panelImg.alt = '';
                panelImg.hidden = true;
                panelAvatarSpan.textContent = data.initials || '';
                panelAvatar.hidden = false;
            }

            teamPanel.hidden = false;
            teamPanel.setAttribute('aria-hidden', 'false');
            // force reflow so transition runs
            void teamPanel.offsetWidth;
            teamPanel.classList.add('is-open');
            document.body.classList.add('team-panel-open');

            setTimeout(() => {
                teamPanel.querySelector('.team-panel__close')?.focus();
            }, 120);
        };

        const closeTeamPanel = () => {
            teamPanel.classList.remove('is-open');
            teamPanel.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('team-panel-open');
            setTimeout(() => {
                teamPanel.hidden = true;
                lastTrigger?.focus();
                lastTrigger = null;
            }, 380);
        };

        document.querySelectorAll('.team-card[data-member]').forEach(card => {
            card.addEventListener('click', () => openTeamPanel(card.dataset.member, card));
        });
        teamPanel.querySelectorAll('[data-team-close]').forEach(el => {
            el.addEventListener('click', closeTeamPanel);
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && teamPanel.classList.contains('is-open')) {
                closeTeamPanel();
            }
        });
    }

    // ---- Donate (UPI deep link) ----
    const donateAmounts = document.getElementById('donateAmounts');
    if (donateAmounts) {
        const VPA = '9971117952@ybl';
        const PAYEE = 'Kayeross Can Foundation';
        const payBtn = document.getElementById('donatePayBtn');
        const payLabel = document.getElementById('donatePayLabel');
        const customWrap = document.getElementById('donateCustomWrap');
        const customInput = document.getElementById('donateCustom');
        const vpaCopy = document.getElementById('donateVpaCopy');
        const vpaValue = document.getElementById('donateVpa');

        const buildUpiUrl = (amount) => {
            const params = new URLSearchParams({
                pa: VPA,
                pn: PAYEE,
                cu: 'INR',
                tn: 'Donation to Kayeross Can Foundation'
            });
            if (amount && Number(amount) > 0) params.set('am', String(amount));
            return `upi://pay?${params.toString()}`;
        };

        const formatINR = (n) => '₹' + Number(n).toLocaleString('en-IN');

        const setAmount = (amount) => {
            const isCustom = amount === 'custom';
            customWrap.hidden = !isCustom;
            const value = isCustom ? Number(customInput.value || 0) : Number(amount);
            payBtn.href = buildUpiUrl(value);
            if (isCustom && !value) {
                payLabel.textContent = 'Pay with UPI';
            } else if (value) {
                payLabel.textContent = `Pay ${formatINR(value)} with UPI`;
            } else {
                payLabel.textContent = 'Pay with UPI';
            }
        };

        donateAmounts.querySelectorAll('.donate-amount').forEach(btn => {
            btn.addEventListener('click', () => {
                donateAmounts.querySelectorAll('.donate-amount').forEach(b => b.classList.remove('is-selected'));
                btn.classList.add('is-selected');
                setAmount(btn.dataset.amount);
                if (btn.dataset.amount === 'custom') {
                    setTimeout(() => customInput.focus(), 50);
                }
            });
        });

        customInput.addEventListener('input', () => {
            setAmount('custom');
        });

        // Initialise with the pre-selected ₹501
        const preselected = donateAmounts.querySelector('.donate-amount.is-selected');
        if (preselected) setAmount(preselected.dataset.amount);

        // Copy VPA
        vpaCopy.addEventListener('click', async () => {
            const text = vpaValue.textContent.trim();
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                const r = document.createRange();
                r.selectNodeContents(vpaValue);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(r);
                document.execCommand('copy');
                sel.removeAllRanges();
            }
            const original = vpaCopy.querySelector('span').textContent;
            vpaCopy.classList.add('is-copied');
            vpaCopy.querySelector('span').textContent = 'Copied!';
            setTimeout(() => {
                vpaCopy.classList.remove('is-copied');
                vpaCopy.querySelector('span').textContent = original;
            }, 1600);
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
