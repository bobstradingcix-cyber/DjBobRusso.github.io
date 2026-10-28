/* DJ Bob Russo — interacciones */
(() => {
    'use strict';

    const root = document.documentElement;
    root.classList.add('js');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    const motionOK = () => !reduced.matches;

    /* ---------- año ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- índice de los hijos con stagger ---------- */
    document.querySelectorAll('[data-stagger]').forEach(group => {
        [...group.children].forEach((child, i) => child.style.setProperty('--i', i));
    });

    document.querySelectorAll('.reveal-lines, .hero-title').forEach(title => {
        [...title.querySelectorAll('.line-inner')].forEach((line, i) => {
            line.style.setProperty('--delay', `${i * 0.09}s`);
        });
    });

    /* ---------- revelados al hacer scroll ---------- */
    const revealTargets = document.querySelectorAll('.reveal-lines, [data-stagger], .fade-up, .hero-title');

    if ('IntersectionObserver' in window) {
        const revealer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                revealer.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

        revealTargets.forEach(el => revealer.observe(el));
    } else {
        revealTargets.forEach(el => el.classList.add('is-in'));
    }

    /* ---------- barra de progreso + estado del header ---------- */
    const header = document.querySelector('.header');
    const progress = document.querySelector('.scroll-progress');
    const marquee = document.querySelector('.marquee-track');
    let lastY = window.scrollY;
    let ticking = false;

    function onScrollFrame() {
        const y = window.scrollY;
        const max = document.body.scrollHeight - window.innerHeight;
        if (progress) root.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
        if (header) header.classList.toggle('is-scrolled', y > 24);

        if (marquee && motionOK()) {
            const velocity = Math.max(-1, Math.min(1, (y - lastY) / 45));
            marquee.style.setProperty('--skew', `${(velocity * -7).toFixed(2)}deg`);
        }
        lastY = y;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScrollFrame);
        }
    }, { passive: true });

    onScrollFrame();

    /* ---------- sección activa en el nav ---------- */
    const navLinks = [...document.querySelectorAll('.nav a')];
    const linked = navLinks
        .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
        .filter(item => item.section);

    if ('IntersectionObserver' in window && linked.length) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                linked.forEach(item => item.link.classList.remove('is-active'));
                const match = linked.find(item => item.section === entry.target);
                if (match) match.link.classList.add('is-active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        linked.forEach(item => spy.observe(item.section));
    }

    /* ---------- foco de luz que sigue al puntero ---------- */
    const spotlight = document.querySelector('.spotlight');

    if (spotlight && finePointer.matches && motionOK()) {
        let sx = 0, sy = 0, raf = 0;

        window.addEventListener('pointermove', e => {
            sx = e.clientX;
            sy = e.clientY;
            if (raf) return;
            raf = requestAnimationFrame(() => {
                spotlight.style.setProperty('--px', `${sx}px`);
                spotlight.style.setProperty('--py', `${sy}px`);
                raf = 0;
            });
        }, { passive: true });
    } else if (spotlight) {
        spotlight.remove();
    }

    /* ---------- brillo dirigido dentro de tarjetas ---------- */
    document.querySelectorAll('.mix-card, .booking-form').forEach(card => {
        card.addEventListener('pointermove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        }, { passive: true });
    });

    /* ---------- botones magnéticos ---------- */
    if (finePointer.matches && motionOK()) {
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('pointermove', e => {
                const rect = el.getBoundingClientRect();
                const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
                const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
                el.style.transform = `translate(${(dx * 12).toFixed(2)}px, ${(dy * 9).toFixed(2)}px)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
    }

    /* ---------- barras de onda decorativas ---------- */
    document.querySelectorAll('.waveform').forEach(wave => {
        const bars = 46;
        for (let i = 0; i < bars; i++) {
            const bar = document.createElement('i');
            const peak = Math.sin((i / bars) * Math.PI);
            const height = 18 + peak * 55 + Math.random() * 24;
            bar.style.setProperty('--h', `${height.toFixed(0)}%`);
            bar.style.setProperty('--d', `${(i * 0.03).toFixed(2)}s`);
            wave.appendChild(bar);
        }
    });

    /* ---------- contadores ---------- */
    const counters = document.querySelectorAll('[data-count]');

    function runCount(el) {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        if (!motionOK() || Number.isNaN(target)) {
            el.textContent = target + suffix;
            return;
        }
        const duration = 1500;
        const start = performance.now();

        (function step(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(step);
        })(start);
    }

    if ('IntersectionObserver' in window) {
        const counter = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                runCount(entry.target);
                counter.unobserve(entry.target);
            });
        }, { threshold: 0.6 });

        counters.forEach(el => counter.observe(el));
    }

    /* ---------- menú móvil ---------- */
    const navToggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', () => {
            const open = mobileNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        });

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- abanico de redes flotante ---------- */
    const fab = document.getElementById('social-fab');
    const fabToggle = fab ? fab.querySelector('.fab-main') : null;

    if (fab) fab.querySelectorAll('.fab-list li').forEach((li, i) => li.style.setProperty('--i', i));

    function setFab(open) {
        if (!fab) return;
        fab.classList.toggle('is-open', open);
        if (!fabToggle) return;
        fabToggle.setAttribute('aria-expanded', String(open));
        fabToggle.setAttribute('aria-label', open ? 'Ocultar mis redes sociales' : 'Ver mis redes sociales');
    }

    if (fabToggle) {
        fabToggle.addEventListener('click', () => setFab(!fab.classList.contains('is-open')));

        document.addEventListener('click', e => {
            if (fab.classList.contains('is-open') && !fab.contains(e.target)) setFab(false);
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') setFab(false);
        });

        fab.querySelectorAll('.fab-item').forEach(link => {
            link.addEventListener('click', () => setFab(false));
        });
    }

    /* ---------- sonido en directo ---------- */
    const soundToggle = document.querySelector('.sound-toggle');
    const scFrame = document.getElementById('sc-hidden');
    const soundLabel = soundToggle ? soundToggle.querySelector('.sound-label') : null;
    let widget = null;

    if (scFrame && typeof SC !== 'undefined' && SC.Widget) {
        widget = SC.Widget(scFrame);
        widget.bind(SC.Widget.Events.PLAY, () => setSound(true));
        widget.bind(SC.Widget.Events.PAUSE, () => setSound(false));
    }

    function setSound(playing) {
        if (!soundToggle) return;
        soundToggle.setAttribute('aria-pressed', String(playing));
        if (soundLabel) soundLabel.textContent = playing ? 'En directo' : 'Suena';
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            if (!widget) {
                window.open('https://soundcloud.com/djbobrusso/dj-bob-russo', '_blank', 'noopener');
                return;
            }
            widget.isPaused(paused => {
                if (paused) widget.play();
                else widget.pause();
                setSound(!paused);
            });
        });
    }

    /* ---------- formulario → WhatsApp ---------- */
    const form = document.querySelector('.booking-form');
    const note = form ? form.querySelector('.form-note') : null;
    const noteDefault = note ? note.innerHTML : '';
    const PHONE = '51902380981';

    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const data = new FormData(form);
            const value = key => (data.get(key) || '').toString().trim();

            const lines = [
                'Hola DJ Bob Russo, quiero cotizar un evento.',
                `Nombre: ${value('nombre')}`,
                `Contacto: ${value('contacto')}`,
                value('fecha') ? `Fecha: ${value('fecha')}` : '',
                value('tipo') ? `Tipo: ${value('tipo')}` : '',
                value('ubicacion') ? `Ubicación: ${value('ubicacion')}` : '',
                value('detalles') ? `Detalles: ${value('detalles')}` : ''
            ].filter(Boolean);

            const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
            const opened = window.open(url, '_blank', 'noopener');
            if (!opened) window.location.href = url;

            if (note) {
                note.classList.add('is-ok');
                note.textContent = 'Solicitud lista: se abrió WhatsApp con tu mensaje.';
                setTimeout(() => {
                    note.classList.remove('is-ok');
                    note.innerHTML = noteDefault;
                }, 7000);
            }
        });
    }
})();
