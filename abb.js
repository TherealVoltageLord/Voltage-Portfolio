function typewriterEffect(element, text, speed = 100) {
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
    
    const delay = isDeleting ? speed / 2 : speed;
    
    i += isDeleting ? -1 : 1;
    
    setTimeout(type, delay);
  }
  
  type();
}

async function loadTestimonials() {
  try {
    const response = await fetch('test.json');
    const data = await response.json();
    const { intro, testimonials } = data;
    
    const testimonialIntro = document.getElementById('testimonial-intro');
    typewriterEffect(testimonialIntro, intro);
    
    const testimonialCarousel = document.getElementById('testimonial-carousel');
    testimonialCarousel.innerHTML = testimonials.map((testimonial) => `
      <div class="testimonial-card">
        <p>${testimonial.text}</p>
        <span>- ${testimonial.author}</span>
      </div>
    `).join('');
    
    let currentIndex = 0;
    const totalTestimonials = testimonials.length;
    
    function showTestimonial(index) {
      const offset = -index * 100;
      testimonialCarousel.style.transform = `translateX(${offset}%)`;
    }
    
    let autoScrollInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalTestimonials;
      showTestimonial(currentIndex);
    }, 8000);
    
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    
    leftArrow.addEventListener('click', () => {
      clearInterval(autoScrollInterval); 
      currentIndex = (currentIndex - 1 + totalTestimonials) % totalTestimonials;
      showTestimonial(currentIndex);
      autoScrollInterval = setInterval(() => { 
        currentIndex = (currentIndex + 1) % totalTestimonials;
        showTestimonial(currentIndex);
      }, 8000);
    });
    
    rightArrow.addEventListener('click', () => {
      clearInterval(autoScrollInterval); 
      currentIndex = (currentIndex + 1) % totalTestimonials;
      showTestimonial(currentIndex);
      autoScrollInterval = setInterval(() => { 
        currentIndex = (currentIndex + 1) % totalTestimonials;
        showTestimonial(currentIndex);
      }, 8000);
    });
    
    showTestimonial(currentIndex);
  } catch (error) {
    console.error('Error loading testimonials:', error);
  }
}

loadTestimonials();
const modeToggle = document.querySelector('.mode-toggle');
const body = document.body;

const savedMode = localStorage.getItem('mode');
if (savedMode) {
  body.classList.add(savedMode);
  modeToggle.innerHTML = savedMode === 'light-mode' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

modeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  const isLightMode = body.classList.contains('light-mode');
  modeToggle.innerHTML = isLightMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('mode', isLightMode ? 'light-mode' : 'dark-mode');
});

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
