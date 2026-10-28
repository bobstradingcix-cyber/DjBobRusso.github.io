const cursor = document.querySelector('.cursor');
const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const mobileLinks = document.querySelectorAll('.mobile-nav a');
const yearEl = document.getElementById('year');
const fadeElements = document.querySelectorAll('.fade-in');
const form = document.querySelector('.booking-form');

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

navToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
    });
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

fadeElements.forEach(el => {
    observer.observe(el);
});

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const button = form.querySelector('.btn-primary');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<span>Solicitud enviada</span><i class="ti ti-check"></i>';
        button.style.pointerEvents = 'none';
        
        setTimeout(() => {
            form.reset();
            button.innerHTML = originalText;
            button.style.pointerEvents = 'auto';
            alert('¡Gracias! Tu solicitud de booking ha sido enviada. Te responderé lo antes posible.');
        }, 1000);
    });
}
