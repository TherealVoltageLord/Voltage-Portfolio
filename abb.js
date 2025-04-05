// DOM Elements
const reviewForm = document.getElementById('review-form');
const testimonialsContainer = document.getElementById('testimonials-container');
const testimonialIntro = document.getElementById('testimonial-intro');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const modeToggle = document.querySelector('.mode-toggle');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTestimonials();
    setupVoiceControl();
    setupScrollAnimations();
    setupModeToggle();
});

// Notification system
function showNotification(message, isError = false, duration = 3000) {
    notificationMessage.textContent = message;
    notification.className = 'notification show ' + (isError ? 'error' : 'success');
    
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
}

// Load testimonials from test.json
async function loadTestimonials() {
    try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) throw new Error('Failed to load testimonials');
        
        const data = await response.json();
        
        // Set intro text from test.json
        testimonialIntro.textContent = data.intro;
        
        // Render testimonials from test.json
        renderTestimonials(data.testimonials || []);
        
    } catch (error) {
        console.error('Error loading testimonials:', error);
        showNotification('Failed to load testimonials. Please try again later.', true);
        renderTestimonials([]); // Show empty state
    }
}

// Render testimonials to the page
function renderTestimonials(testimonials) {
    testimonialsContainer.innerHTML = testimonials.length ? 
        testimonials.map(testimonial => `
            <div class="testimonial-item">
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
    
    animateTestimonials();
}

// Handle form submission
reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = reviewForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    
    const name = document.getElementById('review-name').value.trim();
    const text = document.getElementById('review-text').value.trim();
    
    // Validation
    if (!name || !text) {
        showNotification('Please fill in all fields', true);
        submitBtn.disabled = false;
        return;
    }
    
    try {
        showNotification('Submitting your review...', false);
        
        const response = await fetch('/api/testimonials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                author: sanitizeInput(name), 
                text: sanitizeInput(text) 
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit review');
        }
        
        showNotification('Thank you for your review!', false);
        reviewForm.reset();
        await loadTestimonials(); // Refresh testimonials
        
    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification(error.message || 'Failed to submit review. Please try again.', true);
    } finally {
        submitBtn.disabled = false;
    }
});

// Animation for testimonials
function animateTestimonials() {
    const items = document.querySelectorAll('.testimonial-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `all 0.5s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 50);
    });
}

// Scroll animations
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animation').forEach(section => {
        observer.observe(section);
    });
}

// Voice control setup
function setupVoiceControl() {
    if (!('webkitSpeechRecognition' in window)) {
        console.log('Voice recognition not supported in this browser');
        return;
    }

    const voiceBtn = document.createElement('button');
    voiceBtn.id = 'voice-btn';
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceBtn.title = 'Click and speak to navigate';
    voiceBtn.setAttribute('aria-label', 'Voice control');
    document.body.appendChild(voiceBtn);
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    voiceBtn.addEventListener('click', () => {
        try {
            recognition.start();
            voiceBtn.classList.add('active');
            showNotification('Listening... Speak now', false, 2000);
        } catch (error) {
            console.error('Voice recognition error:', error);
            showNotification('Error starting voice control', true);
        }
    });
    
    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
    };
    
    recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        voiceBtn.classList.remove('active');
    };
    
    recognition.onend = () => {
        voiceBtn.classList.remove('active');
    };
}

// Voice command handler
function handleVoiceCommand(command) {
    if (command.includes('submit') || command.includes('send')) {
        reviewForm.dispatchEvent(new Event('submit'));
        showNotification('Submitting form...', false);
    } 
    else if (command.includes('reset') || command.includes('clear')) {
        reviewForm.reset();
        showNotification('Form cleared', false);
    }
    else if (command.includes('home') || command.includes('top')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showNotification('Scrolled to top', false, 1000);
    }
    else if (command.includes('testimonials') || command.includes('reviews')) {
        document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' });
        showNotification('Scrolling to testimonials', false, 1000);
    }
    else {
        showNotification(`Heard: "${command}"`, false, 2000);
    }
}

// Dark/light mode toggle
function setupModeToggle() {
    if (!modeToggle) return;
    
    modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const icon = modeToggle.querySelector('i');
        
        if (document.body.classList.contains('light-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}

// Helper function to sanitize input
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
