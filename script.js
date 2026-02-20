document.addEventListener('DOMContentLoaded', () => {
    function getUtmParamsFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            utm_content: params.get('utm_content') || '',
            utm_term: params.get('utm_term') || ''
        };
    }

    function setInputValue(id, value) {
        const field = document.getElementById(id);
        if (field) field.value = value || '';
    }

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
        const currentUtm = getUtmParamsFromUrl();
        const storedFirstTouch = JSON.parse(localStorage.getItem('firstTouchUtm') || 'null');
        const hasCurrentUtm = Object.values(currentUtm).some(Boolean);

        if (!storedFirstTouch && hasCurrentUtm) {
            localStorage.setItem('firstTouchUtm', JSON.stringify(currentUtm));
        }

        const firstTouch = storedFirstTouch || (hasCurrentUtm ? currentUtm : {
            utm_source: '',
            utm_medium: '',
            utm_campaign: '',
            utm_content: '',
            utm_term: ''
        });

        setInputValue('utm_source', currentUtm.utm_source);
        setInputValue('utm_medium', currentUtm.utm_medium);
        setInputValue('utm_campaign', currentUtm.utm_campaign);
        setInputValue('utm_content', currentUtm.utm_content);
        setInputValue('utm_term', currentUtm.utm_term);
        setInputValue('first_touch_utm_source', firstTouch.utm_source);
        setInputValue('first_touch_utm_medium', firstTouch.utm_medium);
        setInputValue('first_touch_utm_campaign', firstTouch.utm_campaign);
        setInputValue('landing_page', window.location.href);
        setInputValue('referrer', document.referrer || 'direct');
        setInputValue('user_agent', navigator.userAgent);

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

                // URL do n8n (Webhook de Produção)
                const webhookUrl = form.getAttribute('action');

                const response = await fetch(webhookUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'generate_lead', {
                            event_category: 'engagement',
                            event_label: 'lead_form',
                            value: 1
                        });
                    }
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
    const stickyBar = document.querySelector('.mobile-sticky-bar');
    
    // Check if user has already accepted cookies
    if (!localStorage.getItem('cookiesAccepted')) {
        // Se NÃO aceitou, esconde a barra de vendas para mostrar o banner
        if (stickyBar) stickyBar.classList.add('hidden');

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
            // Mostrar a barra de vendas
            if (stickyBar) stickyBar.classList.remove('hidden');
        });
    }
});
