function updateQuestionsPerPageAndRender() {
    QUESTIONS_PER_PAGE = calculateQuestionsPerPage();
    currentPage = 1;
    if (currentCategory && currentCategories) {
        renderQuestions(currentCategory, 0, currentCategories);
    }
}

// Utilitaire pour créer un bouton d'onglet
function createTabButton(cat, idx, categories) {
    const btn = document.createElement('button');
    btn.className = 'tab' + (idx === 0 ? ' active' : '');
    btn.textContent = cat.nom || `Catégorie ${idx + 1}`;
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        btn.classList.add('active');
        currentPage = 1;
        renderQuestions(cat, idx, categories);
    });
    return btn;
}

// Utilitaire pour créer un bloc question
function createQuestionBlock(q, qIdx, category, idx) {
    const block = document.createElement('div');
    let diffClass = '';
    const diff = Number(q.difficulte);
    if ([1, 2, 3, 4].includes(diff)) {
        diffClass = ` difficulte-${diff}`;
    }
    block.className = `question-block${diffClass}`;
    const questionKey = (category.nom || idx) + '_' + (q.id !== undefined ? q.id : qIdx);
    block.dataset.ratingKey = questionKey;
    // Titre
    const title = document.createElement('div');
    title.className = 'question-title';
    title.textContent = q.question;
    block.appendChild(title);
    // Étoiles
    block.appendChild(createStarRating(block, questionKey));
    // Réponses
    if (q.reponses && q.reponses.length) {
        const rep = document.createElement('ul');
        rep.className = 'reponses';
        q.reponses.forEach(r => {
            const li = document.createElement('li');
            li.textContent = r;
            rep.appendChild(li);
        });
        block.appendChild(rep);
    }
    // Commentaire
    block.appendChild(createCommentSection(q, qIdx, category, idx));
    return block;
}

// Utilitaire pour créer le système d'étoiles
function createStarRating(block, questionKey) {
    const stars = document.createElement('div');
    stars.className = 'star-rating';
    let savedRating = Number(localStorage.getItem('rating_' + questionKey) || 0);
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star' + (i <= savedRating ? ' filled' : '');
        star.textContent = '★';
        star.dataset.value = i;
        star.addEventListener('click', function () {
            setRating(block, i);
        });
        star.addEventListener('mouseover', function () {
            updateStars(block, i);
        });
        star.addEventListener('mouseleave', function () {
            updateStars(block, block.dataset.rating || savedRating);
        });
        stars.appendChild(star);
    }
    if (savedRating) block.dataset.rating = savedRating;
    return stars;
}

// Utilitaire pour créer la section commentaire
function createCommentSection(q, qIdx, category, idx) {
    const commentSection = document.createElement('div');
    commentSection.className = 'comment-section';
    const commentLabel = document.createElement('label');
    commentLabel.className = 'comment-label';
    commentLabel.textContent = 'Commentaire :';
    commentLabel.setAttribute('for', `comment-input-${q.id || qIdx}`);
    const commentInput = document.createElement('textarea');
    commentInput.className = 'comment-input';
    commentInput.id = `comment-input-${q.id || qIdx}`;
    commentInput.placeholder = 'Ajoutez un commentaire...';
    commentInput.value = getSavedComment(q.id !== undefined ? q.id : qIdx, category.nom || idx);
    commentInput.addEventListener('input', function () {
        saveComment(q.id !== undefined ? q.id : qIdx, commentInput.value, category.nom || idx);
    });
    commentSection.appendChild(commentLabel);
    commentSection.appendChild(commentInput);
    return commentSection;
}

// Refactorisation de renderTabs
function renderTabs(categories) {
    const tabsContainer = document.getElementById('categories-tabs');
    tabsContainer.innerHTML = '';
    const tabsRow = document.createElement('div');
    tabsRow.style.display = 'flex';
    tabsRow.style.justifyContent = 'center';
    tabsRow.style.gap = '0.5rem';
    tabsRow.style.flexWrap = 'wrap';
    categories.forEach((cat, idx) => {
        tabsRow.appendChild(createTabButton(cat, idx, categories));
    });
    tabsContainer.appendChild(tabsRow);
}

// Refactorisation de renderQuestions
function renderQuestions(category, idx, categories) {
    currentCategory = category;
    currentCategories = categories;
    const list = document.getElementById('questions-list');
    list.innerHTML = '';

    // Filtrage
    let filteredQuestions = category.questions;
    if (window.currentDifficultyFilter) {
        filteredQuestions = filteredQuestions.filter(q => Number(q.difficulte) === window.currentDifficultyFilter);
    }
    // Tri par difficulté croissante
    filteredQuestions = filteredQuestions.slice().sort((a, b) => Number(a.difficulte) - Number(b.difficulte));

    if (!filteredQuestions.length) {
        list.innerHTML += '<p>Aucune question dans cette catégorie.</p>';
        renderPagination(1);
        updateGlobalAverage();
        return;
    }
    const totalQuestions = filteredQuestions.length;
    const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
    const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, totalQuestions);
    const questionsToShow = filteredQuestions.slice(startIdx, endIdx);
    questionsToShow.forEach((q, qIdx) => {
        list.appendChild(createQuestionBlock(q, qIdx, category, idx));
    });
    renderPagination(totalPages);
    updateGlobalAverage();
}

function renderPagination(totalPages) {
    const list = document.getElementById('questions-list');
    let pagination = document.getElementById('pagination');
    if (pagination) pagination.remove();
    if (totalPages <= 1) return;
    pagination = document.createElement('div');
    pagination.id = 'pagination';
    pagination.style.display = 'flex';
    pagination.style.gap = '0.5rem';
    pagination.style.marginTop = '2rem';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        btn.addEventListener('click', () => {
            currentPage = i;
            renderQuestions(currentCategory, 0, currentCategories);
        });
        pagination.appendChild(btn);
    }
    list.appendChild(pagination);
}


function showAverageCircle(avg) {
    let circle = document.getElementById('average-circle');
    if (!circle) {
        circle = document.createElement('div');
        circle.id = 'average-circle';
        document.body.appendChild(circle);
    }
    circle.textContent = avg.toFixed(2);

    // Ajout du bouton de reset si non présent
    let resetBtn = document.getElementById('reset-results-btn');
    if (!resetBtn) {
        resetBtn = document.createElement('button');
        resetBtn.id = 'reset-results-btn';
        resetBtn.title = 'Réinitialiser les notes';
        resetBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
        resetBtn.addEventListener('click', function () {
            if (!confirm('Êtes-vous sûr de vouloir tout réinitialiser ? Cette action supprimera toutes vos notes et commentaires.')) return;
            // Supprime toutes les notes, commentaires et appréciations générales du localStorage
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('rating_') || key.startsWith('comment_'))) keysToRemove.push(key);
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            localStorage.removeItem('general_notes');
            // Recharge la page
            location.reload();
        });
        document.body.appendChild(resetBtn);
    }
}


function showSummary(categories) {
    const summaryPanel = document.getElementById('summary-panel');
    summaryPanel.innerHTML = '';
    let report = window.generateReport(categories);
    if (!report.length) {
        summaryPanel.innerHTML = '<p>Aucune réponse enregistrée.</p>';
        summaryPanel.style.display = 'block';
        return;
    }
    // Regrouper par catégorie
    const grouped = {};
    report.forEach(item => {
        if (!grouped[item.categorie]) grouped[item.categorie] = [];
        grouped[item.categorie].push(item);
    });
    // Ajout du bouton Copier
    summaryPanel.innerHTML = '';
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copier le résumé';
    copyBtn.className = 'copy-summary-btn';
    copyBtn.style.marginBottom = '1rem';
    copyBtn.style.float = 'right';
    copyBtn.addEventListener('click', function () {
        // Génère le texte à copier
        let text = '';
        for (const cat in grouped) {
            text += 'Catégorie : ' + cat + '\n';
            grouped[cat].forEach(q => {
                text += '- ' + q.question + '\n  Note : ' + q.note;
                const commentKey = 'comment_' + cat + '_' + (q.id !== undefined ? q.id : '');
                const comment = localStorage.getItem(commentKey) || '';
                if (comment) text += '\n  Commentaire : ' + comment;
                text += '\n';
            });
            text += '\n';
        }
        navigator.clipboard.writeText(text.trim());
        copyBtn.textContent = 'Copié !';
        setTimeout(() => { copyBtn.textContent = 'Copier le résumé'; }, 1200);
    });
    summaryPanel.appendChild(copyBtn);
    for (const cat in grouped) {
        const catDiv = document.createElement('div');
        catDiv.className = 'summary-category';
        const catTitle = document.createElement('h3');
        catTitle.textContent = cat;
        catDiv.appendChild(catTitle);
        grouped[cat].forEach(q => {
            const qDiv = document.createElement('div');
            qDiv.className = 'summary-question';
            const qText = document.createElement('div');
            qText.textContent = q.question;
            const qNote = document.createElement('div');
            qNote.innerHTML = '<b>Note :</b> ' + q.note;
            qDiv.appendChild(qText);
            qDiv.appendChild(qNote);
            // Affiche le commentaire après la note, si présent
            const commentKey = 'comment_' + cat + '_' + (q.id !== undefined ? q.id : '');
            const comment = localStorage.getItem(commentKey) || '';
            if (comment) {
                const qComment = document.createElement('div');
                qComment.innerHTML = '<b>Commentaire :</b> ' + comment;
                qDiv.appendChild(qComment);
            }
            catDiv.appendChild(qDiv);
        });
        summaryPanel.appendChild(catDiv);
    }
    // Ajout de l'appréciation générale
    const general = localStorage.getItem('general_notes') || '';
    if (general) {
        const genDiv = document.createElement('div');
        genDiv.className = 'summary-category';
        const genTitle = document.createElement('h3');
        genTitle.textContent = 'Appréciation générales';
        genDiv.appendChild(genTitle);
        const genText = document.createElement('div');
        genText.textContent = general;
        genDiv.appendChild(genText);
        summaryPanel.appendChild(genDiv);
    }
    summaryPanel.style.display = 'block';
}
