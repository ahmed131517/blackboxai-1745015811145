document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        currentQuiz: {
            title: 'Untitled Quiz',
            questions: [],
            currentQuestionIndex: 0
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
        btn.addEventListener('click', (e) => {
            const action = getToolbarAction(btn);
            handleToolbarAction(action);
        });
    });

    function getToolbarAction(btn) {
        const icon = btn.querySelector('i');
        if (icon) {
            if (icon.classList.contains('fa-file')) return 'new';
            if (icon.classList.contains('fa-folder-open')) return 'open';
            if (icon.classList.contains('fa-save')) return 'save';
            if (icon.classList.contains('fa-undo')) return 'undo';
            if (icon.classList.contains('fa-redo')) return 'redo';
            if (icon.classList.contains('fa-spell-check')) return 'spellcheck';
            // Text formatting
            if (icon.classList.contains('fa-bold')) return 'bold';
            if (icon.classList.contains('fa-italic')) return 'italic';
            if (icon.classList.contains('fa-underline')) return 'underline';
            // Media
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
                }
                break;
            case 'save':
                saveQuiz();
                break;
            case 'open':
                // Simulate file open dialog
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.quiz';
                input.click();
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
            // Insert media placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'media-placeholder p-2 bg-gray-100 rounded inline-block';
            placeholder.innerHTML = `<i class="fas fa-${type}"></i> ${type} asset`;
            document.querySelector('textarea').value += `\n[${type.toUpperCase()}: ${url}]\n`;
        }
    }

    // Question type handling
    const questionTypes = document.querySelectorAll('.sidebar-item');
    questionTypes.forEach(type => {
        type.addEventListener('click', () => {
            const questionType = type.textContent.trim();
            changeQuestionType(questionType);
        });
    });

    function changeQuestionType(type) {
        const editor = document.querySelector('.flex-1.p-4');
        // Save current question state before changing
        saveCurrentQuestion();
        
        // Update UI based on question type
        switch (type) {
            case 'Multiple Choice':
                setupMultipleChoice();
                break;
            case 'True/False':
                setupTrueFalse();
                break;
            // Add more question types here
        }
    }

    function setupMultipleChoice() {
        // Current UI is already set up for multiple choice
        resetEditor();
    }

    function setupTrueFalse() {
        const optionsContainer = document.querySelector('.space-y-2');
        optionsContainer.innerHTML = `
            <div class="flex items-center gap-2">
                <input type="radio" name="answer" value="true">
                <span>True</span>
            </div>
            <div class="flex items-center gap-2">
                <input type="radio" name="answer" value="false">
                <span>False</span>
            </div>
        `;
    }

    // Add Option button
    const addOptionBtn = document.querySelector('button:contains("Add Option")');
    if (addOptionBtn) {
        addOptionBtn.addEventListener('click', () => {
            const optionsContainer = addOptionBtn.parentElement;
            const optionCount = optionsContainer.querySelectorAll('input[type="radio"]').length + 1;
            const newOption = document.createElement('div');
            newOption.className = 'flex items-center gap-2';
            newOption.innerHTML = `
                <input type="radio" name="answer">
                <input type="text" class="flex-1 border rounded p-1" placeholder="Option ${optionCount}">
                <button class="delete-option text-red-500"><i class="fas fa-times"></i></button>
            `;
            optionsContainer.insertBefore(newOption, addOptionBtn);

            // Add delete handler
            newOption.querySelector('.delete-option').addEventListener('click', () => {
                newOption.remove();
            });
        });
    }

    // Helper functions
    function resetEditor() {
        document.querySelector('textarea').value = '';
        document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
        document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
        updateFooter();
    }

    function saveQuiz() {
        saveCurrentQuestion();
        // Simulate save functionality
        const saveIcon = document.querySelector('.fa-save').parentElement;
        saveIcon.classList.add('text-green-500');
        setTimeout(() => saveIcon.classList.remove('text-green-500'), 1000);
    }

    function saveCurrentQuestion() {
        const questionText = document.querySelector('textarea').value;
        const options = Array.from(document.querySelectorAll('input[type="text"]')).map(input => input.value);
        const correctAnswer = document.querySelector('input[type="radio"]:checked')?.value;
        
        if (questionText || options.some(opt => opt)) {
            state.currentQuiz.questions[state.currentQuiz.currentQuestionIndex] = {
                text: questionText,
                options,
                correctAnswer
            };
        }
    }

    function updateFooter() {
        const footerTitle = document.querySelector('.footer div:first-child');
        const footerPagination = document.querySelector('.footer div:last-child');
        if (footerTitle && footerPagination) {
            footerTitle.textContent = state.currentQuiz.title;
            footerPagination.textContent = `Question ${state.currentQuiz.currentQuestionIndex + 1} of ${Math.max(1, state.currentQuiz.questions.length)}`;
        }
    }

    function handleTabChange(tabName) {
        // This function was not defined in the plan, so it is left empty.
    }

    // Initialize
    updateFooter();
});