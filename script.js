
let questions = {};
let solutions = {};

document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    fetch('resume_data.json')
        .then(res => res.json())
        .then(data => {
            questions = data.questions;
            solutions = data.solutions;
            
            // Set Titles (Optional if already static)
            // document.title = data.meta.title;
            // document.querySelector('header h1').textContent = data.meta.title;

            startDiagnostic();
        })
        .catch(err => console.error("Data Load Error:", err));

    document.getElementById('reset-btn').addEventListener('click', startDiagnostic);
});

function startDiagnostic() {
    // Reset UI
    document.getElementById('question-area').classList.remove('hidden');
    document.getElementById('result-area').classList.add('hidden');
    
    // Start with root
    renderQuestion('root');
}

function renderQuestion(questionId) {
    const q = questions[questionId];
    if (!q) {
        console.error("Question not found:", questionId);
        return;
    }

    // Set Text
    const qText = document.getElementById('question-text');
    qText.style.opacity = 0;
    setTimeout(() => {
        qText.textContent = q.text;
        qText.style.opacity = 1;
    }, 200);

    // Render Options
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt.text;
        btn.onclick = () => handleOptionClick(opt);
        container.appendChild(btn);
    });
}

function handleOptionClick(option) {
    if (option.next) {
        // Go to next question
        // Currently just direct link, could add history/animation
        if (questions[option.next]) {
            renderQuestion(option.next);
        } else {
             // Fallback for demo placeholders like 'excel_depth' which might not define questions yet
             // Map them to solutions directly for now if questions are missing in this MVP
             // Or show alert
             console.warn("Next question not implemented in JSON:", option.next);
             const fallbackMap = {
                 'excel_depth': 'excel',
                 'rpa_check': 'rpa',
                 'python_check': 'python',
                 'crm_check': 'crm'
             };
             if (fallbackMap[option.next]) {
                 renderSolution(fallbackMap[option.next]);
             }
        }
    } else if (option.solution) {
        // Show solution
        renderSolution(option.solution);
    }
}

function renderSolution(solutionId) {
    const sol = solutions[solutionId];
    if (!sol) return;

    // Switch Views
    document.getElementById('question-area').classList.add('hidden');
    document.getElementById('result-area').classList.remove('hidden');

    // Populate Content
    document.getElementById('result-title').textContent = sol.title;
    document.getElementById('result-desc').textContent = sol.description;
    
    // Experience (handle newlines)
    document.getElementById('result-exp').innerHTML = sol.experience.replace(/\n/g, '<br>');
}
