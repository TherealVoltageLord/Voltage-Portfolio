const modeToggle = document.querySelector('.mode-toggle');
const body = document.body;
const sections = document.querySelectorAll('.scroll-animation');
const reviewForm = document.getElementById('review-form');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupScrollAnimations();
    loadTestimonials();
    setupSmoothScrolling();
});

// Theme Management
function initializeTheme() {
    const savedMode = localStorage.getItem('mode');
    if (savedMode) {
        body.classList.add(savedMode);
        updateModeToggleIcon(savedMode);
    }
}

function updateModeToggleIcon(mode) {
    modeToggle.innerHTML = mode === 'light-mode' 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
}

modeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLightMode = body.classList.contains('light-mode');
    const mode = isLightMode ? 'light-mode' : 'dark-mode';
    updateModeToggleIcon(mode);
    localStorage.setItem('mode', mode);
});

// Scroll Animations
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach((section) => observer.observe(section));
}

// Smooth Scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

// Typewriter Effect
function typewriterEffect(element, text, speed = 50) {
    let i = 0;
    let isDeleting = false;
    
    function type() {
        const currentText = text.substring(0, i);
        element.textContent = currentText;
        
        if (!isDeleting && i === text.length) {
            setTimeout(() => (isDeleting = true), 4000);
        } else if (isDeleting && i === 0) {
            setTimeout(() => (isDeleting = false), 2000);
        }
        
        i += isDeleting ? -1 : 1;
        setTimeout(type, isDeleting ? speed / 2 : speed);
    }
    
    type();
}

// Testimonials Management
async function loadTestimonials() {
    try {
        const response = await fetch('test.json');
        if (!response.ok) throw new Error('Failed to load testimonials');
        
        const data = await response.json();
        const { intro, testimonials } = data;
        
        displayTestimonials(intro, testimonials);
    } catch (error) {
        console.error('Error loading testimonials:', error);
        displayTestimonials(
            "Here's what people say about working with me:",
            getDefaultTestimonials()
        );
    }
}

function getDefaultTestimonials() {
    return [
        {
            text: "Voltage Lord delivered an exceptional API solution that perfectly met our requirements.",
            author: "Tech Startup CEO"
        },
        {
            text: "Working with Voltage Lord was a pleasure. He transformed our frontend into a modern interface.",
            author: "Product Manager"
        }
    ];
}

function displayTestimonials(intro, testimonials) {
    const testimonialIntro = document.getElementById('testimonial-intro');
    typewriterEffect(testimonialIntro, intro);
    
    const carousel = document.getElementById('testimonial-carousel');
    carousel.innerHTML = testimonials.map(testimonial => `
        <div class="testimonial-card">
            <p>${testimonial.text}</p>
            <span>- ${testimonial.author}</span>
        </div>
    `).join('');

    setupCarouselNavigation(testimonials.length);
}

function setupCarouselNavigation(totalTestimonials) {
    let currentIndex = 0;
    const carousel = document.getElementById('testimonial-carousel');
    
    function showTestimonial(index) {
        carousel.style.transform = `translateX(-${index * 100}%)`;
    }
    
    // Auto-rotate
    let interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalTestimonials;
        showTestimonial(currentIndex);
    }, 8000);
    
    // Navigation controls
    document.querySelector('.left-arrow').addEventListener('click', () => {
        clearInterval(interval);
        currentIndex = (currentIndex - 1 + totalTestimonials) % totalTestimonials;
        showTestimonial(currentIndex);
        interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalTestimonials;
            showTestimonial(currentIndex);
        }, 8000);
    });
    
    document.querySelector('.right-arrow').addEventListener('click', () => {
        clearInterval(interval);
        currentIndex = (currentIndex + 1) % totalTestimonials;
        showTestimonial(currentIndex);
        interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalTestimonials;
            showTestimonial(currentIndex);
        }, 8000);
    });
    
    showTestimonial(currentIndex);
}

// Notification System
function showNotification(message, isError = false) {
    const notification = document.getElementById('custom-notification');
    notification.className = isError ? 'error' : 'success';
    
    // Update notification content
    const icon = notification.querySelector('i');
    const text = notification.querySelector('p');
    icon.className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    text.innerHTML = message || 'Thanks for your review! <i class="fas fa-heart"></i>';
    
    // Show notification
    notification.classList.remove('hidden');
    notification.classList.add('show');
    
    // Hide after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.classList.add('hidden'), 300);
    }, 4000);
}

// Review Form Submission
reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('review-name').value.trim();
    const text = document.getElementById('review-text').value.trim();
    
    if (!name || !text) {
        showNotification('Please fill in all fields', true);
        return;
    }
    
    try {
        const response = await fetch('/api/testimonials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author: name, text })
        });
        
        if (response.ok) {
            showNotification();
            reviewForm.reset();
            // Reload testimonials to show the new one
            loadTestimonials();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to submit review', true);
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification('Network error - please try again', true);
    }
});
