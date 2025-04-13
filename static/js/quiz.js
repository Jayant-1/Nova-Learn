// quiz.js - to be saved in static/js/quiz.js

document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-quiz');
    const questionsContainer = document.getElementById('quiz-questions');
    const scoreDisplay = document.getElementById('quiz-score');
    
    // Get the subject from the page title or URL
    const subject = document.title.split(' - ')[0].replace('Quiz: ', '') || 
                   new URLSearchParams(window.location.search).get('subject');
    
    let quizData = null;
    
    // Function to fetch quiz questions from the API
    async function fetchQuiz() {
        try {
            const response = await fetch('/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subject: subject })
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch quiz data');
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return data.quiz;
        } catch (error) {
            questionsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading quiz: ${error.message}</p>
                    <a href="/dashboard" class="back-button">Back to Dashboard</a>
                </div>`;
            submitButton.disabled = true;
            return null;
        }
    }
    
    // Function to render the quiz questions
    function renderQuiz(quiz) {
        if (!quiz || !quiz.mcqs || quiz.mcqs.length === 0) {
            questionsContainer.innerHTML = '<div class="error-message">No questions available</div>';
            submitButton.disabled = true;
            return;
        }
        
        quizData = quiz;
        let questionsHTML = '';
        
        quiz.mcqs.forEach((question, index) => {
            const optionsHTML = Object.entries(question.options).map(([key, value]) => `
                <div class="option">
                    <input type="radio" id="q${index}_${key}" name="q${index}" value="${key}">
                    <label for="q${index}_${key}">${key.toUpperCase()}) ${value}</label>
                </div>
            `).join('');
            
            questionsHTML += `
                <div class="question" id="question-${index}" data-correct="${question.correct}">
                    <div class="question-header">
                        <h3>Question ${index + 1}</h3>
                        <span class="difficulty">${question.difficulty}</span>
                    </div>
                    <div class="question-text">${question.mcq}</div>
                    <div class="options">
                        ${optionsHTML}
                    </div>
                    <div class="explanation hidden">${question.explanation}</div>
                </div>
            `;
        });
        
        questionsContainer.innerHTML = questionsHTML;
        scoreDisplay.innerHTML = '<h3>Answer all questions and submit to see your score</h3>';
        submitButton.disabled = false;
    }
    
    // Function to score the quiz
    function scoreQuiz() {
        if (!quizData || !quizData.mcqs) return;
        
        let score = 0;
        let totalQuestions = quizData.mcqs.length;
        
        quizData.mcqs.forEach((question, index) => {
            const questionElement = document.getElementById(`question-${index}`);
            const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
            const explanationElement = questionElement.querySelector('.explanation');
            
            explanationElement.classList.remove('hidden');
            
            if (!selectedOption) {
                questionElement.classList.add('unanswered');
                return;
            }
            
            if (selectedOption.value === question.correct) {
                score++;
                questionElement.classList.add('correct');
            } else {
                questionElement.classList.add('incorrect');
            }
        });
        
        // Display score
        const percentage = Math.round((score / totalQuestions) * 100);
        scoreDisplay.innerHTML = `
            <h3>Your Score: ${score}/${totalQuestions} (${percentage}%)</h3>
            <p>${getScoreMessage(percentage)}</p>
        `;
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Quiz Completed';
    }
    
    // Get a message based on score percentage
    function getScoreMessage(percentage) {
        if (percentage >= 90) return "Excellent! You've mastered this subject!";
        if (percentage >= 75) return "Great job! You have a solid understanding.";
        if (percentage >= 60) return "Good work! Keep studying to improve further.";
        if (percentage >= 40) return "Not bad, but there's room for improvement.";
        return "Keep studying! You'll get better with practice.";
    }
    
    // Event listener for submit button
    submitButton.addEventListener('click', scoreQuiz);
    
    // Initialize the quiz
    fetchQuiz().then(renderQuiz);
});