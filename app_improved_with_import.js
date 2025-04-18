document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        currentQuiz: {
            title: 'Untitled Quiz',
            questions: [],
            currentQuestionIndex: 0,
            currentQuestionType: 'Multiple Choice'
        },
        currentTab: 'Home'
    };

    // Ribbon tab switching
    const ribbonTabs = document.querySelectorAll('.ribbon-tab');
    ribbonTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            ribbonTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.currentTab = tab.textContent;
            handleTabChange(state.currentTab);
        });
    });

    // Toolbar button functionality
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    toolbarButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = getToolbarAction(btn);
            handleToolbarAction(action);
        });
    });

    // Import DOC/PDF file input and handling
    const importFileBtn = document.getElementById('importFileBtn');
    const fileInput = document.getElementById('fileInput');
    importFileBtn.addEventListener('click', () => {
        fileInput.click();
    });
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const text = await extractTextFromFile(file);
            if (text) {
                generateQuizFromText(text);
            } else {
                alert('Failed to extract text from the file.');
            }
        }
        fileInput.value = '';
    });

    async function extractTextFromFile(file) {
        // For demo, only extract text from plain text files or simulate extraction
        // Real implementation would use libraries like pdf.js or docx.js
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Simulate text extraction by returning the file content as text
                resolve(reader.result);
            };
            reader.onerror = () => {
                resolve(null);
            };
            reader.readAsText(file);
        });
    }

    function generateQuizFromText(text) {
        // Simulate AI quiz generation by splitting text into sentences and creating questions
        const sentences = text.split(/(?<=[.?!])\s+/);
        state.currentQuiz.questions = sentences.map((sentence, idx) => ({
            text: sentence,
            type: 'Multiple Choice',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A'
        }));
        state.currentQuiz.currentQuestionIndex = 0;
        state.currentQuiz.title = 'AI Generated Quiz';
        loadQuestion(0);
        updateFooter();
        alert('Quiz generated from file content.');
    }

    function loadQuestion(index) {
        if (index < 0 || index >= state.currentQuiz.questions.length) return;
        const question = state.currentQuiz.questions[index];
        state.currentQuiz.currentQuestionIndex = index;
        document.getElementById('questionText').value = question.text;
        changeQuestionType(question.type);
        const answerChoices = document.getElementById('answerChoices');
        if (question.type === 'Multiple Choice') {
            const optionInputs = answerChoices.querySelectorAll('input[type="text"]');
            optionInputs.forEach((input, idx) => {
                input.value = question.options[idx] || '';
            });
            const radios = answerChoices.querySelectorAll('input[type="radio"]');
            radios.forEach((radio, idx) => {
                radio.checked = question.correctAnswer === question.options[idx];
            });
        }
    }

    function getToolbarAction(btn) {
        const icon = btn.querySelector('i');
        if (icon) {
            if (icon.classList.contains('fa-file')) return 'new';
            if (icon.classList.contains('fa-folder-open')) return 'open';
            if (icon.classList.contains('fa-save')) return 'save';
            if (icon.classList.contains('fa-undo')) return 'undo';
            if (icon.classList.contains('fa-redo')) return 'redo';
            if (icon.classList.contains('fa-spell-check')) return 'spellcheck';
            if (icon.classList.contains('fa-bold')) return 'bold';
            if (icon.classList.contains('fa-italic')) return 'italic';
            if (icon.classList.contains('fa-underline')) return 'underline';
            if (icon.classList.contains('fa-image')) return 'image';
            if (icon.classList.contains('fa-volume-up')) return 'audio';
            if (icon.classList.contains('fa-video')) return 'video';
            if (icon.classList.contains('fa-link')) return 'link';
        }
        return null;
    }

    function handleToolbarAction(action) {
        switch (action) {
            case 'new':
                if (confirm('Create new quiz? Unsaved changes will be lost.')) {
                    resetEditor();
                    state.currentQuiz = {
                        title: 'Untitled Quiz',
                        questions: [],
                        currentQuestionIndex: 0,
                        currentQuestionType: 'Multiple Choice'
                    };
                    updateFooter();
                }
                break;
            case 'save':
                saveQuiz();
                break;
            case 'open':
                alert('Open functionality is not implemented yet.');
                break;
            case 'bold':
            case 'italic':
            case 'underline':
                document.execCommand(action, false, null);
                break;
            case 'image':
            case 'audio':
            case 'video':
            case 'link':
                handleMediaInsert(action);
                break;
        }
    }

    function handleMediaInsert(type) {
        const url = prompt(`Enter ${type} URL:`);
        if (url) {
            const textarea = document.getElementById('questionText');
            textarea.value += `\n[${type.toUpperCase()}: ${url}]\n`;
        }
    }

    // Question type handling
    const questionTypes = document.querySelectorAll('.sidebar-item');
    questionTypes.forEach(type => {
        type.addEventListener('click', () => {
            const questionType = type.getAttribute('data-type');
            changeQuestionType(questionType);
        });
    });

    function changeQuestionType(type) {
        saveCurrentQuestion();
        state.currentQuiz.currentQuestionType = type;
        const answerChoices = document.getElementById('answerChoices');
        answerChoices.innerHTML = '';
        switch (type) {
            case 'Multiple Choice':
                setupMultipleChoice();
                break;
            case 'True/False':
                setupTrueFalse();
                break;
            default:
                setupDefaultAnswerInput();
                break;
        }
        updateFooter();
    }

    function setupMultipleChoice() {
        const answerChoices = document.getElementById('answerChoices');
        for (let i = 1; i <= 2; i++) {
            const optionDiv = createOption(i);
            answerChoices.appendChild(optionDiv);
        }
        addAddOptionButton();
    }

    function setupTrueFalse() {
        const answerChoices = document.getElementById('answerChoices');
        ['True', 'False'].forEach((val, idx) => {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-3';
            div.innerHTML = `
                <input type="radio" name="answer" class="cursor-pointer w-5 h-5" value="${val.toLowerCase()}" />
                <span>${val}</span>
            `;
            answerChoices.appendChild(div);
        });
    }

    function setupDefaultAnswerInput() {
        const answerChoices = document.getElementById('answerChoices');
        const textarea = document.createElement('textarea');
        textarea.className = 'w-full p-2 border border-gray-300 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500';
        textarea.rows = 4;
        textarea.placeholder = 'Enter answer here...';
        answerChoices.appendChild(textarea);
    }

    function createOption(index) {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-3';
        div.innerHTML = `
            <input type="radio" name="answer" class="cursor-pointer w-5 h-5" />
            <input type="text" class="flex-1 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Option ${index}" />
            <button class="delete-option text-red-500 ml-2" aria-label="Delete Option"><i class="fas fa-times"></i></button>
        `;
        div.querySelector('.delete-option').addEventListener('click', () => {
            div.remove();
            updateOptionPlaceholders();
        });
        return div;
    }

    function addAddOptionButton() {
        const answerChoices = document.getElementById('answerChoices');
        const addOptionBtn = document.createElement('button');
        addOptionBtn.id = 'addOptionBtn';
        addOptionBtn.className = 'mt-2 text-blue-600 hover:underline flex items-center gap-1';
        addOptionBtn.setAttribute('aria-label', 'Add Option');
        addOptionBtn.innerHTML = '<i class="fas fa-plus"></i> Add Option';
        addOptionBtn.addEventListener('click', () => {
            const optionCount = answerChoices.querySelectorAll('input[type="text"]').length + 1;
            const newOption = createOption(optionCount);
            answerChoices.insertBefore(newOption, addOptionBtn);
        });
        answerChoices.appendChild(addOptionBtn);
    }

    function updateOptionPlaceholders() {
        const options = document.querySelectorAll('#answerChoices input[type="text"]');
        options.forEach((input, idx) => {
            input.placeholder = `Option ${idx + 1}`;
        });
    }

    // Add Option button event delegation (in case of dynamic buttons)
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'addOptionBtn') {
            const answerChoices = document.getElementById('answerChoices');
            const optionCount = answerChoices.querySelectorAll('input[type="text"]').length + 1;
            const newOption = createOption(optionCount);
            answerChoices.insertBefore(newOption, e.target);
        }
    });

    // Helper functions
    function resetEditor() {
        document.getElementById('questionText').value = '';
        const answerChoices = document.getElementById('answerChoices');
        answerChoices.innerHTML = '';
        setupMultipleChoice();
        updateFooter();
    }

    function saveQuiz() {
        saveCurrentQuestion();
        alert('Quiz saved! (Functionality to be implemented)');
    }

    function saveCurrentQuestion() {
        const questionText = document.getElementById('questionText').value.trim();
        const questionType = state.currentQuiz.currentQuestionType;
        let options = [];
        let correctAnswer = null;

        if (questionType === 'Multiple Choice') {
            const optionInputs = document.querySelectorAll('#answerChoices input[type="text"]');
            options = Array.from(optionInputs).map(input => input.value.trim()).filter(val => val !== '');
            const checkedRadio = document.querySelector('#answerChoices input[type="radio"]:checked');
            if (checkedRadio) {
                const index = Array.from(document.querySelectorAll('#answerChoices input[type="radio"]')).indexOf(checkedRadio);
                correctAnswer = options[index];
            }
        } else if (questionType === 'True/False') {
            options = ['True', 'False'];
            const checkedRadio = document.querySelector('#answerChoices input[type="radio"]:checked');
            if (checkedRadio) {
                correctAnswer = checkedRadio.value;
            }
        } else {
            const textarea = document.querySelector('#answerChoices textarea');
            if (textarea) {
                options = [textarea.value.trim()];
            }
        }

        if (questionText === '') {
            alert('Question text cannot be empty.');
            return;
        }
        if (options.length === 0) {
            alert('Please provide at least one answer option.');
            return;
        }

        state.currentQuiz.questions[state.currentQuiz.currentQuestionIndex] = {
            text: questionText,
            type: questionType,
            options,
            correctAnswer
        };
    }

    function updateFooter() {
        const footerTitle = document.getElementById('quizTitle');
        const footerPagination = document.getElementById('questionCount');
        footerTitle.textContent = state.currentQuiz.title;
        footerPagination.textContent = `Question ${state.currentQuiz.currentQuestionIndex + 1} of ${Math.max(1, state.currentQuiz.questions.length)}`;
    }

    function handleTabChange(tabName) {
        switch (tabName) {
            case 'Home':
                // Show editor
                document.querySelector('main').style.display = 'flex';
                break;
            case 'Preview':
                previewQuiz();
                break;
            case 'Publish':
                publishQuiz();
                break;
            default:
                document.querySelector('main').style.display = 'flex';
                break;
        }
    }

    function previewQuiz() {
        saveCurrentQuestion();
        const previewWindow = window.open('', '_blank', 'width=600,height=400,scrollbars=yes');
        if (!previewWindow) {
            alert('Popup blocked! Please allow popups for preview.');
            return;
        }
        const quiz = state.currentQuiz;
        let html = `<h2>${quiz.title}</h2>`;
        quiz.questions.forEach((q, idx) => {
            html += `<div><strong>Q${idx + 1}:</strong> ${q.text}</div>`;
            if (q.type === 'Multiple Choice' || q.type === 'True/False') {
                html += '<ul>';
                q.options.forEach(opt => {
                    html += `<li>${opt}</li>`;
                });
                html += '</ul>';
            } else {
                html += `<p>${q.options[0]}</p>`;
            }
        });
        previewWindow.document.body.innerHTML = html;
    }

    function publishQuiz() {
        saveCurrentQuestion();
        alert('Publish functionality is not implemented yet.');
    }

    // Initialize
    resetEditor();
    updateFooter();
});
