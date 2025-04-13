// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', function() {
  // Page loader
  const pageLoader = document.querySelector('.page-loader');
  if (pageLoader) {
      setTimeout(() => {
          pageLoader.style.opacity = '0';
          setTimeout(() => {
              pageLoader.style.display = 'none';
          }, 500);
      }, 1000);
  }

  // Toggle sidebar on mobile
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
          sidebar.classList.toggle('active');
          menuToggle.classList.toggle('active');
      });
  }

  // Toggle theme (dark/light mode)
  const themeToggle = document.getElementById('toggle-theme');
  const body = document.body;
  
  if (themeToggle) {
      themeToggle.addEventListener('click', () => {
          body.classList.toggle('dark-mode');
          body.classList.toggle('light-mode');
          
          // Save theme preference to localStorage
          const isDarkMode = body.classList.contains('dark-mode');
          localStorage.setItem('darkMode', isDarkMode);
      });
      
      // Check for saved theme preference
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
          if (savedDarkMode === 'true') {
              body.classList.add('dark-mode');
              body.classList.remove('light-mode');
          } else {
              body.classList.add('light-mode');
              body.classList.remove('dark-mode');
          }
      }
  }

  // Animate elements when they come into view
  const scrollRevealItems = document.querySelectorAll('.scroll-reveal');
  
  function checkScroll() {
      scrollRevealItems.forEach(item => {
          const itemTop = item.getBoundingClientRect().top;
          const windowHeight = window.innerHeight;
          
          if (itemTop < windowHeight - 100) {
              item.classList.add('revealed');
          }
      });
  }
  
  // Run on initial load
  checkScroll();
  
  // Run on scroll
  window.addEventListener('scroll', checkScroll);

  // Quiz generation functionality
  const generateQuizButton = document.getElementById('generate-quiz');
  if (generateQuizButton) {
      generateQuizButton.addEventListener('click', function() {
          // Get the subject from the roadmap title
          const subject = document.querySelector('.saved-roadmap h2').textContent;
          
          // Show loading state
          generateQuizButton.textContent = 'Generating Quiz...';
          generateQuizButton.disabled = true;
          
          // Send request to generate quiz
          fetch('/generate-quiz', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ subject: subject })
          })
          .then(response => response.json())
          .then(data => {
              if (data.error) {
                  alert('Error generating quiz: ' + data.error);
                  generateQuizButton.textContent = 'Generate Quiz';
                  generateQuizButton.disabled = false;
              } else {
                  // Store quiz data in localStorage for the quiz page to use
                  localStorage.setItem('quizData', JSON.stringify(data.quiz));
                  localStorage.setItem('quizSubject', subject);
                  
                  // Redirect to the quiz page
                  window.location.href = '/quiz?subject=' + encodeURIComponent(subject);
              }
          })
          .catch(error => {
              console.error('Error:', error);
              alert('Failed to generate quiz. Please try again.');
              generateQuizButton.textContent = 'Generate Quiz';
              generateQuizButton.disabled = false;
          });
      });
  }
});