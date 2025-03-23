// Fetch Testimonials from test.json
async function loadTestimonials() {
  try {
    const response = await fetch('test.json');
    const testimonials = await response.json();
    const testimonialCarousel = document.getElementById('testimonial-carousel');
    
    testimonialCarousel.innerHTML = testimonials.map((testimonial, index) => `
      <div class="testimonial-card" style="transform: translateX(${index * 100}%);">
        <p>${testimonial.text}</p>
        <span>- ${testimonial.author}</span>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading testimonials:', error);
  }
}

let currentIndex = 0;

function autoScrollTestimonials() {
  setInterval(() => {
    const testimonialCarousel = document.getElementById('testimonial-carousel');
    currentIndex = (currentIndex + 1) % testimonialCarousel.children.length;
    testimonialCarousel.style.transform = `translateX(-${currentIndex * 100}%)`;
  }, 2000);
}

loadTestimonials().then(autoScrollTestimonials);

// Dark/Light Mode Toggle
const modeToggle = document.querySelector('.mode-toggle');
const body = document.body;

// Load saved mode from localStorage
const savedMode = localStorage.getItem('mode');
if (savedMode) {
  body.classList.add(savedMode);
  modeToggle.innerHTML = savedMode === 'light-mode' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Toggle mode
modeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  const isLightMode = body.classList.contains('light-mode');
  modeToggle.innerHTML = isLightMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('mode', isLightMode ? 'light-mode' : 'dark-mode');
});

// Scroll Animations
const sections = document.querySelectorAll('.scroll-animation');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

sections.forEach((section) => {
  observer.observe(section);
});
