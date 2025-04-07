document.addEventListener("DOMContentLoaded", function () {
  // Page loader
  const loader = document.querySelector('.page-loader');
  
  // Hide loader after page loads
  window.addEventListener('load', function() {
    setTimeout(function() {
      loader.classList.add('hidden');
      // Add animation class to content after loading
      document.querySelector('.dashboard-container').classList.add('animate__fadeIn');
    }, 800);
  });

  // Theme toggle functionality
  const themeToggleBtn = document.getElementById('toggle-theme');
  const body = document.body;
  
  // Check for saved theme preference or use the default dark mode
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  // Apply the saved theme
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }
  
  // Toggle theme when button is clicked
  themeToggleBtn.addEventListener('click', function() {
    body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    if (body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');
  const sidebar = document.querySelector('.sidebar');
  
  menuToggle.addEventListener('click', function() {
    menuToggle.classList.toggle('active');
    navList.classList.toggle('active');
    sidebar.classList.toggle('active');
  });

  // Responsive iframe wrapper
  const iframes = document.querySelectorAll("iframe");
  iframes.forEach((iframe) => {
    // If iframe isn't already wrapped
    if (!iframe.parentNode.classList.contains('video-wrapper')) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("video-wrapper");
      iframe.parentNode.insertBefore(wrapper, iframe);
      wrapper.appendChild(iframe);
    }
  });

  // Scroll animations
  const scrollElements = document.querySelectorAll('.scroll-reveal');
  
  const elementInView = (el, percentageScroll = 100) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= 
      ((window.innerHeight || document.documentElement.clientHeight) * (percentageScroll/100))
    );
  };
  
  const displayScrollElement = (element) => {
    element.classList.add('active');
  };
  
  const hideScrollElement = (element) => {
    element.classList.remove('active');
  };
  
  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 85)) {
        displayScrollElement(el);
      } else {
        hideScrollElement(el);
      }
    });
  };
  
  // Initialize elements that are already in view on page load
  handleScrollAnimation();
  
  // Add scroll event listener
  window.addEventListener('scroll', () => {
    handleScrollAnimation();
  });
  
  // Add animation when content is updated
  const addContentAnimations = () => {
    const contentSections = document.querySelectorAll('.roadmap-content h2, .roadmap-content h3');
    contentSections.forEach((section, index) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      section.style.transitionDelay = `${index * 0.1}s`;
      
      setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }, 100);
    });
  };
  
  // Run content animations
  addContentAnimations();
  
  console.log("Dashboard loaded successfully with animations");
});