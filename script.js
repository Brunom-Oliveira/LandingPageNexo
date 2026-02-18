document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Apply fade-up to key elements
    const animatedElements = document.querySelectorAll('.hero-content, .visual-card, .problem-card, .solution-content, .condition-item, .pricing-card, .guarantee-box, .cta-container');
    
    animatedElements.forEach((el, index) => {
        el.classList.add('fade-up');
        // Add staggered delays for grid items
        if (el.classList.contains('problem-card')) el.classList.add(`delay-${(index % 3) * 100}`);
        if (el.classList.contains('condition-item')) el.classList.add(`delay-${(index % 4) * 100}`);
        if (el.classList.contains('pricing-card')) el.classList.add(`delay-${(index % 2) * 200}`);
        observer.observe(el);
    });

    // Form Phone Mask (Brazilian Format)
    const phoneInput = document.getElementById('whatsapp');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }


    // Toast Notification Function
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
        
        toast.innerHTML = `
            <i class="ph-fill ${icon} toast-icon"></i>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Trigger reflow
        toast.offsetHeight;
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // Form Validation & Submission Handling
    const form = document.getElementById('leadForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const phone = phoneInput.value.replace(/\D/g, '');
            if (phone.length < 10) {
                showToast('Por favor, insira um WhatsApp válido com DDD.', 'error');
                phoneInput.focus();
                return;
            }
            
            const btn = form.querySelector('button[type="submit"]');
            
            try {
                // Loading State
                btn.classList.add('loading');
                btn.disabled = true;

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                // URL do n8n (Substitua pela sua URL real do Webhook de Produção)
                const N8N_WEBHOOK_URL = "https://n8n.nexodigital.club/webhook/lead"; 

                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showToast('Recebemos sua aplicação! Fique de olho no WhatsApp.', 'success');
                    form.reset();
                } else {
                    showToast('Erro ao enviar. Tente novamente ou chame no WhatsApp.', 'error');
                }
            } catch (error) {
                console.error('Erro:', error);
                showToast('Erro de conexão. Verifique sua internet.', 'error');
            } finally {
                // Reset State
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        });
    }

    // Smooth Scroll for specific anchor links (fallback/enhancement)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all others
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
            });
            
            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Cookie Banner Logic
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    
    // Check if user has already accepted cookies
    if (!localStorage.getItem('cookiesAccepted')) {
        // Show banner after 2 seconds
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 2000);
    }
    
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            // Save preference
            localStorage.setItem('cookiesAccepted', 'true');
            // Hide banner
            cookieBanner.classList.remove('show');
        });
    }
});
