document.addEventListener("DOMContentLoaded", function() {
  function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  }
  
  document.querySelectorAll("nav button").forEach(button => {
    button.addEventListener("click", function() {
      const targetId = this.getAttribute("onclick").match(/'([^']+)'/)[1];
      scrollToSection(targetId);
    });
  });
  
  const intro = document.getElementById("intro");
  const content = document.getElementById("content");
  
  setTimeout(() => {
    intro.style.opacity = "0";
    setTimeout(() => {
      intro.style.display = "none";
      content.classList.remove("hidden");
    }, 500);
  }, 5000);
  
  const carousel = document.querySelector(".carousel");
  let index = 0;
  
  function slideImages() {
    index++;
    if (index >= carousel.children.length) {
      index = 0;
    }
    carousel.style.transform = `translateX(${-index * 100}%)`;
  }
  
  setInterval(slideImages, 3000);
  
  window.openLink = function(url) {
    window.open(url, "_blank");
  };
});
