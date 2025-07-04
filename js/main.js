document.addEventListener('DOMContentLoaded', () => {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            if (!data.categories) return;
            renderTabs(data.categories);
            renderQuestions(data.categories[0], 0, data.categories);
        });
    // Ajout gestionnaire pour le bouton Résumé
    const summaryBtn = document.getElementById('show-summary-btn');
    const summaryPanel = document.getElementById('summary-panel');
    let summaryVisible = false;
    summaryBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (summaryPanel.style.display === 'block') {
            summaryPanel.style.display = 'none';
            summaryVisible = false;
        } else {
            fetch('questions.json')
                .then(response => response.json())
                .then(data => {
                    if (!data.categories) return;
                    showSummary(data.categories);
                    summaryVisible = true;
                });
        }
    });
    // Ferme le résumé si on clique ailleurs
    document.addEventListener('click', function(e) {
        if (summaryVisible && summaryPanel.style.display === 'block') {
            if (!summaryPanel.contains(e.target) && e.target !== summaryBtn) {
                summaryPanel.style.display = 'none';
                summaryVisible = false;
            }
        }
    });
    // Gestion de la zone de notes générales
    const generalNotes = document.getElementById('general-notes');
    const generalNotesSaved = document.getElementById('general-notes-saved');
    // Charger la note générale si présente
    generalNotes.value = localStorage.getItem('general_notes') || '';
    generalNotes.addEventListener('input', function () {
        localStorage.setItem('general_notes', generalNotes.value);
        generalNotesSaved.style.display = 'inline';
        setTimeout(() => { generalNotesSaved.style.display = 'none'; }, 1200);
    });
    generalNotesSaved.style.display = 'none';
});

let QUESTIONS_PER_PAGE = 10;
let currentPage = 1;
let currentCategory = null;
let currentCategories = null;

function updateQuestionsPerPageAndRender() {
    QUESTIONS_PER_PAGE = calculateQuestionsPerPage();
    currentPage = 1;
    if (currentCategory && currentCategories) {
        renderQuestions(currentCategory, 0, currentCategories);
    }
}

function renderTabs(categories) {
    const tabsContainer = document.getElementById('categories-tabs');
    tabsContainer.innerHTML = '';
    // Conteneur des onglets
    const tabsRow = document.createElement('div');
    tabsRow.style.display = 'flex';
    tabsRow.style.justifyContent = 'center';
    tabsRow.style.gap = '0.5rem';
    tabsRow.style.flexWrap = 'wrap';
    categories.forEach((cat, idx) => {
        const btn = document.createElement('button');
        btn.className = 'tab' + (idx === 0 ? ' active' : '');
        btn.textContent = cat.nom || `Catégorie ${idx + 1}`;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            btn.classList.add('active');
            currentPage = 1;
            renderQuestions(cat, idx, categories);
        });
        tabsRow.appendChild(btn);
    });
    tabsContainer.appendChild(tabsRow);
}

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
        if (!q.question) return;
        const block = document.createElement('div');
        let diffClass = '';
        const diff = Number(q.difficulte);
        if ([1,2,3,4].includes(diff)) {
            diffClass = ` difficulte-${diff}`;
        }
        block.className = `question-block${diffClass}`;
        // Clé structurée : nomCatégorie_id ou nomCatégorie_index
        const questionKey = (category.nom || idx) + '_' + (q.id !== undefined ? q.id : qIdx);
        block.dataset.ratingKey = questionKey;
        const title = document.createElement('div');
        title.className = 'question-title';
        title.textContent = q.question;
        block.appendChild(title);
        // Système de notation étoiles
        const stars = document.createElement('div');
        stars.className = 'star-rating';
        let savedRating = Number(localStorage.getItem('rating_' + questionKey) || 0);
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i <= savedRating ? ' filled' : '');
            star.textContent = '★';
            star.dataset.value = i;
            star.addEventListener('click', function() {
                setRating(block, i);
            });
            star.addEventListener('mouseover', function() {
                updateStars(block, i);
            });
            star.addEventListener('mouseleave', function() {
                updateStars(block, block.dataset.rating || savedRating);
            });
            stars.appendChild(star);
        }
        block.appendChild(stars);
        if (savedRating) block.dataset.rating = savedRating;
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
        // Section commentaire
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

        const commentSaved = document.createElement('span');
        commentSaved.className = 'comment-saved';
        commentSaved.textContent = 'Commentaire enregistré !';

        commentInput.addEventListener('input', function () {
            saveComment(q.id !== undefined ? q.id : qIdx, commentInput.value, category.nom || idx);
            commentSaved.style.display = 'inline';
            setTimeout(() => { commentSaved.style.display = 'none'; }, 1200);
        });

        commentSection.appendChild(commentLabel);
        commentSection.appendChild(commentInput);
        commentSection.appendChild(commentSaved);
        block.appendChild(commentSection);

        list.appendChild(block);
    });
    renderPagination(totalPages);
    updateGlobalAverage();
}

// Gestion du système de notation étoiles
function setRating(block, rating) {
    block.dataset.rating = rating;
    // Utilise une clé structurée : rating_{categorie}_{id} ou rating_{categorie}_{index}
    const questionKey = block.dataset.ratingKey;
    if (questionKey) {
        localStorage.setItem('rating_' + questionKey, rating);
    }
    updateStars(block, rating);
    updateGlobalAverage();
}
function highlightStars(block, rating) {
    updateStars(block, rating);
}
function resetStars(block) {
    const rating = block.dataset.rating || 0;
    updateStars(block, rating);
}
function updateStars(block, rating) {
    const stars = block.querySelectorAll('.star');
    stars.forEach((star, idx) => {
        if (idx < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
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

function updateGlobalAverage() {
    // Récupère toutes les notes du localStorage (toutes catégories confondues)
    let total = 0;
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('rating_')) {
            const val = Number(localStorage.getItem(key));
            if (!isNaN(val) && val > 0) {
                total += val;
                count++;
            }
        }
    }
    const avg = count ? (total / count) : 0;
    showAverageCircle(avg);
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
        resetBtn.addEventListener('click', function() {
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

// Gestion du stockage local pour les commentaires
function saveComment(id, value, cat) {
    if (id === undefined || cat === undefined) return;
    localStorage.setItem('comment_' + cat + '_' + id, value);
}
function getSavedComment(id, cat) {
    if (id === undefined || cat === undefined) return '';
    return localStorage.getItem('comment_' + cat + '_' + id) || '';
}

window.currentDifficultyFilter = null;
function setDifficultyFilter(dif) {}

// Génération d'un rapport JS (exemple à placer dans la console ou une fonction dédiée)
window.generateReport = function(categories) {
    const report = [];
    categories.forEach((cat, idx) => {
        cat.questions.forEach((q, qIdx) => {
            const key = (cat.nom || idx) + '_' + (q.id !== undefined ? q.id : qIdx);
            const rating = localStorage.getItem('rating_' + key);
            if (rating !== null) {
                report.push({
                    categorie: cat.nom || idx,
                    id: q.id !== undefined ? q.id : qIdx,
                    question: q.question,
                    note: Number(rating)
                });
            }
        });
    });
    return report;
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
    copyBtn.addEventListener('click', function() {
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
