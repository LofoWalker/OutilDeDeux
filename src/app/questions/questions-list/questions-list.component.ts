import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeneralNotesComponent } from '../../general-notes/general-notes.component';
import { ResetStorageComponent } from '../../reset-storage/reset-storage.component';
import { QuestionsData } from '../questions/questions.types';
import { QuestionsService } from '../questions/questions.service';

@Component({
  selector: 'questions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, GeneralNotesComponent, ResetStorageComponent],
  templateUrl: './questions-list.component.html',
  styleUrl: './questions-list.component.sass'
})
export class QuestionsListComponent implements OnInit, OnChanges {
  @Input() questionsData!: QuestionsData;
  @Input() getDifficulteLabel: (diff: number) => string = () => '';
  @Input() generalNotesVisible: boolean = true;

  comments: { [id: string]: string } = {};
  ratings: { [id: string]: number } = {};

  generalNotes: string = '';

  page = 1;
  pageSize = 5;
  totalQuestions = 0;
  pagedQuestions: any[] = [];
  currentCategory: any = null;

  constructor(private questionsService: QuestionsService) {}

  ngOnInit() {
    this.addIdsToQuestions();
    this.loadFromLocalStorage();
    this.loadGeneralNotes();
    this.updatePagination();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['questionsData'] && this.questionsData) {
      this.addIdsToQuestions();
      this.page = 1;
      this.updatePagination();
    }
  }

  private addIdsToQuestions() {
    this.questionsData.categories.forEach((cat) => {
      cat.questions.forEach((q) => {
        // Génère un id stable basé sur le texte de la question (hash simple base36)
        const base = `${cat.nom}::${q.question}`;
        let hash = 0;
        for (let i = 0; i < base.length; i++) {
          hash = ((hash << 5) - hash) + base.charCodeAt(i);
          hash |= 0;
        }
        (q as any).id = 'q_' + Math.abs(hash).toString(36);
      });
    });
  }

  setRating(id: string, rating: number) {
    this.ratings[id] = rating;
    this.saveToLocalStorage();
  }

  onCommentChange(id: string) {
    this.saveToLocalStorage();
  }

  getSortedQuestions(questions: any[]) {
    return questions.slice().sort((a, b) => a.difficulte - b.difficulte);
  }

  updatePagination() {
    // On ne pagine qu'une catégorie à la fois (la première si plusieurs)
    this.currentCategory = this.questionsData.categories[0];
    if (!this.currentCategory) {
      this.pagedQuestions = [];
      this.totalQuestions = 0;
      return;
    }
    const sorted = this.getSortedQuestions(this.currentCategory.questions);
    this.totalQuestions = sorted.length;
    const start = (this.page - 1) * this.pageSize;
    this.pagedQuestions = sorted.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    this.page = page;
    this.updatePagination();
  }

  private saveToLocalStorage() {
    // Utilise toutes les questions du JSON d'origine
    const allQuestionsData = this.questionsService.getQuestions();
    const allQuestions = allQuestionsData.categories.flatMap((cat: any) =>
      cat.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        categorie: cat.nom,
        difficulte: q.difficulte
      }))
    );
    const questionById: { [id: string]: any } = {};
    for (const q of allQuestions) {
      questionById[q.id] = q;
    }
    // Charger les réponses existantes
    const existingRaw = localStorage.getItem('questions-answers');
    let existing: any[] = [];
    if (existingRaw) {
      try { existing = JSON.parse(existingRaw); } catch {}
    }
    const existingById: { [id: string]: any } = {};
    for (const ans of existing) {
      existingById[ans.id] = ans;
    }
    const currentData = Object.keys(this.ratings).map(id => ({
      id,
      question: questionById[id]?.question || '',
      categorie: questionById[id]?.categorie || '',
      difficulte: questionById[id]?.difficulte || '',
      note: this.ratings[id],
      comment: this.comments[id] || ''
    }));
    // Mettre à jour ou ajouter les réponses courantes
    for (const q of currentData) {
      existingById[q.id] = q;
    }
    // Sauvegarder toutes les réponses (anciennes + nouvelles)
    localStorage.setItem('questions-answers', JSON.stringify(Object.values(existingById)));
  }

  private loadFromLocalStorage() {
    const data = localStorage.getItem('questions-answers');
    if (data) {
      const arr = JSON.parse(data);
      for (const entry of arr) {
        this.ratings[entry.id] = entry.note; // Correction ici
        this.comments[entry.id] = entry.comment;
      }
    }
  }

  saveGeneralNotes() {
    localStorage.setItem('general-notes', this.generalNotes);
  }

  loadGeneralNotes() {
    const notes = localStorage.getItem('general-notes');
    if (notes !== null) {
      this.generalNotes = notes;
    }
  }

  onResetStorage() {
    localStorage.removeItem('questions-answers');
    localStorage.removeItem('general-notes');
    location.reload();
  }

  get totalPages(): number {
    return Math.ceil(this.totalQuestions / this.pageSize);
  }

  getCategoryAverage(cat: any): number | undefined {
    if (!cat || !cat.questions) return undefined;
    const notes = cat.questions
      .map((q: any) => this.ratings[q.id])
      .filter((n: number | undefined) => typeof n === 'number');
    if (!notes.length) return undefined;
    return notes.reduce((a: number, b: number) => a + b, 0) / notes.length;
  }

  getGlobalAverage(): number | undefined {
    const allQuestions = this.questionsData.categories.flatMap((cat: any) => cat.questions);
    const notes = allQuestions
      .map((q: any) => this.ratings[q.id])
      .filter((n: number | undefined) => typeof n === 'number');
    if (!notes.length) return undefined;
    return notes.reduce((a: number, b: number) => a + b, 0) / notes.length;
  }

  getGlobalAverageFromStorage(): number | undefined {
    const data = localStorage.getItem('questions-answers');
    if (!data) return undefined;
    const arr = JSON.parse(data);
    const notes = arr
      .map((entry: any) => entry.note)
      .filter((n: number | undefined) => typeof n === 'number');
    if (!notes.length) return undefined;
    return notes.reduce((a: number, b: number) => a + b, 0) / notes.length;
  }
}
