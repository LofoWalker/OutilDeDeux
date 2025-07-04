document.addEventListener('DOMContentLoaded', () => {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            if (!data.categories) return;
            renderTabs(data.categories);
            renderQuestions(data.categories[0], 0, data.categories);
        });
});

let QUESTIONS_PER_PAGE = 5;
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
        tabsContainer.appendChild(btn);
    });
}

function renderQuestions(category, idx, categories) {
    currentCategory = category;
    currentCategories = categories;
    const list = document.getElementById('questions-list');
    list.innerHTML = '';
    if (!category.questions || !category.questions.length) {
        list.innerHTML = '<p>Aucune question dans cette catégorie.</p>';
        return;
    }
    const totalQuestions = category.questions.length;
    const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
    const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, totalQuestions);
    const questionsToShow = category.questions.slice(startIdx, endIdx);
    questionsToShow.forEach((q, qIdx) => {
        if (!q.question) return;
        const block = document.createElement('div');
        let diffClass = '';
        const diff = Number(q.difficulte);
        if ([1,2,3,4].includes(diff)) {
            diffClass = ` difficulte-${diff}`;
        }
        block.className = `question-block${diffClass}`;
        const title = document.createElement('div');
        title.className = 'question-title';
        title.textContent = q.question;
        block.appendChild(title);
        // Système de notation étoiles
        const stars = document.createElement('div');
        stars.className = 'star-rating';
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = '★';
            star.dataset.value = i;
            star.addEventListener('click', function() {
                setRating(block, i);
            });
            star.addEventListener('mouseover', function() {
                highlightStars(block, i);
            });
            star.addEventListener('mouseleave', function() {
                resetStars(block);
            });
            stars.appendChild(star);
        }
        block.appendChild(stars);
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
        list.appendChild(block);
    });
    renderPagination(totalPages);
    updateGlobalAverage();
}

// Gestion du système de notation étoiles
function setRating(block, rating) {
    block.dataset.rating = rating;
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
    pagination.style.justifyContent = 'center';
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
    // Récupère toutes les notes visibles sur la page
    const allBlocks = document.querySelectorAll('.question-block');
    let total = 0;
    let count = 0;
    allBlocks.forEach(block => {
        const rating = Number(block.dataset.rating || 0);
        if (rating > 0) {
            total += rating;
            count++;
        }
    });
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
}
