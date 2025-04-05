// ===== DOM ELEMENTS =====
const reviewForm = document.getElementById('review-form');
const testimonialsContainer = document.getElementById('testimonials-container');
const testimonialIntro = document.getElementById('testimonial-intro');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const modeToggle = document.querySelector('.mode-toggle');
const voiceBtn = document.createElement('button');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadTestimonials();
    setupVoiceControl();
    setupScrollAnimations();
    setupModeToggle();
    setup3DEffects();
    setupSkillAnimations();
    setupParticles();
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info', duration = 3000) {
    notification.innerHTML = '';
    
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' :
                    type === 'error' ? 'fas fa-exclamation-circle' :
                    'fas fa-info-circle';
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    notification.appendChild(icon);
    notification.appendChild(messageSpan);
    notification.className = `notification show ${type}`;
    
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
    });
}

// ===== TESTIMONIALS =====
async function loadTestimonials() {
    try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) throw new Error('Failed to load testimonials');
        
        const data = await response.json();
        testimonialIntro.textContent = data.intro || "Here's what people say about working with me:";
        renderTestimonials(data.testimonials || []);
        
    } catch (error) {
        console.error('Error loading testimonials:', error);
        showNotification('Failed to load testimonials. Showing sample data.', 'error');
        renderTestimonials(sampleTestimonials);
    }
}

function renderTestimonials(testimonials) {
    testimonialsContainer.innerHTML = testimonials.length ? 
        testimonials.map(testimonial => `
            <div class="testimonial-item scroll-animation">
                <div class="testimonial-content">
                    <p>"${sanitizeInput(testimonial.text)}"</p>
                </div>
                <div class="testimonial-author">
                    <span>- ${sanitizeInput(testimonial.author)}</span>
                    ${testimonial.date ? `<small>${formatDate(testimonial.date)}</small>` : ''}
                </div>
            </div>
        `).join('') : `
            <div class="testimonial-item empty">
                <p>No testimonials yet. Be the first to share your experience!</p>
            </div>
        `;
}

// ===== FORM HANDLING =====
reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = reviewForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    const formData = new FormData(reviewForm);
    const reviewData = {
        author: sanitizeInput(formData.get('name')),
        text: sanitizeInput(formData.get('text'))
    };
    
    try {
        const response = await fetch('/api/testimonials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Submission failed');
        }
        
        showNotification('Review submitted successfully!', 'success');
        reviewForm.reset();
        await loadTestimonials();
        
    } catch (error) {
        console.error('Submission error:', error);
        showNotification(error.message || 'Failed to submit review', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// ===== ANIMATIONS =====
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animation').forEach(el => {
        observer.observe(el);
    });
}

function setupSkillAnimations() {
    const skillBars = document.querySelectorAll('.skill-bar');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const level = entry.target.querySelector('.skill-level');
                level.style.width = level.style.width || '0%';
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));
}

function setup3DEffects() {
    const cards = document.querySelectorAll('.project-card, .upcoming-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 15;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 15;
            card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateY(0) rotateX(0)';
        });
    });
}

// ===== VOICE CONTROL =====
function setupVoiceControl() {
    if (!('webkitSpeechRecognition' in window)) {
        console.log('Voice control not supported');
        return;
    }

    voiceBtn.id = 'voice-btn';
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceBtn.title = 'Voice control';
    document.body.appendChild(voiceBtn);
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    voiceBtn.addEventListener('click', () => {
        voiceBtn.classList.add('active');
        showNotification('Listening... Speak now', 'info', 2000);
        recognition.start();
    });
    
    recognition.onresult = (e) => {
        const command = e.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
    };
    
    recognition.onerror = (e) => {
        showNotification(`Voice error: ${e.error}`, 'error');
        voiceBtn.classList.remove('active');
    };
    
    recognition.onend = () => {
        voiceBtn.classList.remove('active');
    };
}

function handleVoiceCommand(command) {
    const actions = {
        'home': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        'projects': () => document.getElementById('projects').scrollIntoView(),
        'contact': () => document.getElementById('contact').scrollIntoView(),
        'submit': () => reviewForm.requestSubmit(),
        'clear': () => reviewForm.reset(),
        'dark mode': () => document.body.classList.remove('light-mode'),
        'light mode': () => document.body.classList.add('light-mode')
    };
    
    for (const [keyword, action] of Object.entries(actions)) {
        if (command.includes(keyword)) {
            action();
            showNotification(`Executed: ${keyword}`, 'success', 1000);
            return;
        }
    }
    
    showNotification(`Command not recognized: "${command}"`, 'error', 2000);
}

// ===== THEME TOGGLE =====
function setupModeToggle() {
    if (!modeToggle) return;
    
    // Check for saved preference
    const savedMode = localStorage.getItem('colorMode');
    if (savedMode === 'light') document.body.classList.add('light-mode');
    
    modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const icon = modeToggle.querySelector('i');
        
        if (document.body.classList.contains('light-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('colorMode', 'light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('colorMode', 'dark');
        }
    });
}

// ===== PARTICLES BACKGROUND =====
function setupParticles() {
    const canvas = document.getElementById('particles-js');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#9c27b0', '#e91e63', '#2196f3', '#ff9800'];
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
        }
        
        update() {
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            this.x += this.speedX;
            this.y += this.speedY;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function init() {
        for (let i = 0; i < 80; i++) {
            particles.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    
    init();
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ===== UTILITY FUNCTIONS =====
function sanitizeInput(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Sample data for fallback
const sampleTestimonials = [
    {
        author: "Jane Doe",
        text: "Voltage Lord delivered exceptional API development work on time and on budget.",
        date: "2025-03-15"
    },
    {
        author: "John Smith",
        text: "Highly recommend for NodeJS projects. Clear communication and great results.",
        date: "2025-02-28"
    }
];
