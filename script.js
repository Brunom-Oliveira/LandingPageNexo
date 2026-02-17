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

    // Form Validation & Submission Handling
    const form = document.getElementById('leadForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const phone = phoneInput.value.replace(/\D/g, '');
            if (phone.length < 10) {
                alert('Por favor, insira um número de WhatsApp válido com DDD.');
                phoneInput.focus();
                return;
            }
            
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            try {
                btn.innerHTML = 'Enviando...';
                btn.disabled = true;

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                const response = await fetch("http://161.97.125.138:5678/webhook/lead-nexo", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('Solicitação enviada com sucesso! Em breve entraremos em contato.');
                    form.reset();
                } else {
                    alert('Ocorreu um erro ao enviar. Por favor, tente novamente ou chame no WhatsApp.');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Ocorreu um erro de conexão. Por favor, tente novamente.');
            } finally {
                btn.innerHTML = originalText;
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
});
